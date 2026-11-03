import argparse,json,math,wave,array,hashlib,random,re
from pathlib import Path
from _common import load,ffmpeg,dump,probe
SR=48000

def normalize(source,target,filter_prefix=''):
    af=filter_prefix+(',' if filter_prefix else '')+'loudnorm=I=-14:TP=-1.2:LRA=8:print_format=json'
    first=ffmpeg(['-i',source,'-vn','-af',af,'-c:a','pcm_s16le','-f','null','-'])
    matches=re.findall(r'\{\s*"input_i"[\s\S]*?\}',first.stderr)
    if not matches:raise RuntimeError('FFmpeg loudnorm did not return measured statistics')
    m=json.loads(matches[-1])
    if m['input_i']=='-inf':raise RuntimeError('Source audio is silent; production narration cannot be empty')
    second=filter_prefix+(',' if filter_prefix else '')+f"loudnorm=I=-14:TP=-1.2:LRA=8:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true:print_format=json"
    ffmpeg(['-y','-i',source,'-vn','-af',second,'-ar',SR,'-ac',2,'-c:a','pcm_s16le',target]);return m

def read_pcm(path,n):
    with wave.open(str(path),'rb') as w:
        if (w.getframerate(),w.getnchannels(),w.getsampwidth())!=(SR,2,2):raise RuntimeError('Expected 48k stereo 16-bit PCM')
        data=array.array('h',w.readframes(w.getnframes()))
    import sys
    if sys.byteorder!='little':data.byteswap()
    data.extend([0]*max(0,n*2-len(data)));return data[:n*2]

def write_pcm(path,data):
    import sys
    if sys.byteorder!='little':data.byteswap()
    with wave.open(str(path),'wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes(data.tobytes())

def synthesize(cues,duration,gain_db=0,seed=20261103):
    n=round(duration*SR);out=array.array('f',[0])*(n*2);rng=random.Random(seed)
    for cue in cues:
        at=float(cue['at'])
        if at<.18:raise ValueError('SFX at the start is disabled; move the cue to its semantic landing event')
        kind=cue['kind'];dur={'whoosh':.24,'charge':.28,'hop':.12,'land':.14}.get(kind,.19);start=round(at*SR);amp=10**((cue.get('db',-16)+gain_db)/20);freq=cue.get('frequency',523.25);filtered=0
        for i in range(round(dur*SR)):
            t=i/SR;idx=start+i
            if idx>=n:break
            if kind=='whoosh':filtered=.72*filtered+.28*rng.uniform(-1,1);v=filtered*math.sin(math.pi*t/dur)**2
            elif kind=='charge':v=math.sin(2*math.pi*(200*t+650*t*t))*math.sin(math.pi*t/dur)**2*.7
            elif kind in ['hop','land']:v=math.sin(2*math.pi*((210 if kind=='hop' else 140)*t-230*t*t))*math.exp(-t/.035)
            else:v=(math.sin(2*math.pi*freq*t)+.23*math.sin(2*math.pi*2*freq*t)+.08*math.sin(2*math.pi*3*freq*t))/1.31*math.exp(-t/.068)
            v*=amp*min(1,t/.004)*min(1,(dur-t)/.016);out[idx*2]+=v;out[idx*2+1]+=v
    return out

def compress_pcm(data):
    # Shared stereo envelope, 1ms blocks, 5ms attack / 120ms release.
    # Local waveform processing works with minimal FFmpeg builds lacking acompressor.
    result=array.array('h');g=1.0;hop=48*2
    for start in range(0,len(data),hop):
        block=data[start:start+hop];peak=max((abs(v)/32768 for v in block),default=0)
        target=(.30*(peak/.30)**(1/2.2))/peak if peak>.30 else 1
        decay=math.exp(-.001/(.005 if target<g else .12));g=decay*g+(1-decay)*target
        result.extend(round(max(-.999,min(.999,v/32768*g*1.25))*32767) for v in block)
    return result

def main():
    p=argparse.ArgumentParser();p.add_argument('--project',required=True);p.add_argument('--sfx-gain-db',type=float,default=0);a=p.parse_args();root,e=load(a.project)
    if not e.get('narration'):raise SystemExit('No narration provided. For the demo use npm run demo:audio.')
    source=root/e['narration'];dest=root/'public/audio';dest.mkdir(parents=True,exist_ok=True);(root/'qa').mkdir(exist_ok=True)
    if abs(float(probe(source)['format']['duration'])-e['duration'])>.1:raise RuntimeError('Narration duration differs from episode. Update the timeline; do not silently truncate or pad narration.')
    n=round(e['duration']*SR)
    ffmpeg(['-y','-i',source,'-ar',SR,'-ac',2,'-c:a','pcm_s16le',dest/'narration-decoded.wav'])
    decoded=read_pcm(dest/'narration-decoded.wav',n);write_pcm(dest/'narration-compressed.wav',compress_pcm(decoded))
    voice_stats=normalize(dest/'narration-compressed.wav',dest/'narration-levelled.wav')
    voice=read_pcm(dest/'narration-levelled.wav',n);sfx=synthesize(e['sfx'],e['duration'],a.sfx_gain_db);solo=array.array('h',(round(max(-.999,min(.999,x))*32767) for x in sfx));write_pcm(dest/'sfx-solo.wav',solo)
    peak=max((abs(voice[i]/32768+sfx[i]) for i in range(n*2)),default=0);gain=min(1,.97/max(1e-8,peak));mix=array.array('h',(round((voice[i]/32768+sfx[i])*gain*32767) for i in range(n*2)));write_pcm(dest/'pre-master.wav',mix)
    mix_stats=normalize(dest/'pre-master.wav',root/'public'/e['audio']);dump(root/'qa/cues.json',e['sfx']);dump(root/'qa/audio-report.json',{'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'duration':e['duration'],'speedChanged':False,'pitchChanged':False,'voiceStats':voice_stats,'preMasterStats':mix_stats,'cues':len(e['sfx']),'sfxGainDb':a.sfx_gain_db,'preMasterPeak':peak,'headroomGain':gain,'humanListening':False,'encodedAudioMeasured':False})
    print(json.dumps({'audio':e['audio'],'cues':len(e['sfx']),'humanListening':False},ensure_ascii=True))
if __name__=='__main__':main()
