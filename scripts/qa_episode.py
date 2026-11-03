import argparse,json,math,re,hashlib
from pathlib import Path
from _common import load,probe,ffmpeg,dump,executable

def validate(e):
    errors=[];warnings=[]
    if (e.get('width'),e.get('height'),e.get('fps'))!=(1920,1080,30):errors.append('Current template supports 1920x1080 at 30fps only')
    duration=e['duration'];last=0;ids=set()
    for s in e['shots']:
        if s['id'] in ids:errors.append('Duplicate shot id: '+s['id'])
        ids.add(s['id'])
        if abs(s['start']-last)>1/e['fps']+.0001 or s['end']<=s['start']:errors.append('Non-contiguous or invalid shot: '+s['id'])
        last=s['end']
        for it in s.get('items',[]):
            if it.get('dropAt',0)+1.12>s['end']-s['start']:warnings.append('Drop may not settle before shot end: '+s['id'])
    if not e['shots'] or abs(last-duration)>1/e['fps']+.0001:errors.append('Shots do not cover full duration')
    last=-1
    for c in e['captions']:
        if c['start']<last-.001 or c['end']<=c['start'] or c['end']>duration+.001:errors.append('Caption timing overlaps or out of range: '+c['text'])
        if len(c['text'])>26:warnings.append('Long caption; review at mobile size: '+c['text'])
        last=c['end']
    if not e['captions']:errors.append('No captions configured')
    if not e['chapters'] or e['chapters'][0]['at']!=0:errors.append('First chapter must start at 0')
    starts=[c['at'] for c in e['chapters']]
    if starts!=sorted(set(starts)) or any(x<0 or x>=duration for x in starts):errors.append('Invalid chapter order or range')
    for cue in e['sfx']:
        if not .18<=cue['at']<duration:errors.append('Invalid SFX time: '+str(cue['at']))
    changes=sorted(e['wardrobe'],key=lambda x:x['start'])
    for i,c in enumerate(changes):
        if c['start']<3.35 or c['start']+4.2>duration:errors.append('Wardrobe does not fit: '+str(c['start']))
        if i and c['start']<changes[i-1]['start']+4.2:errors.append('Overlapping wardrobe changes')
        if any(c['start']<s['start']+1.15 and c['start']+4.2>s['start']-.95 for s in e['shots'][1:]):warnings.append('Wardrobe overlaps a card hop: '+str(c['start']))
    if not e.get('demo') and not e.get('productionReady'):errors.append('Production storyboard not ready')
    return errors,warnings

def srt(captions):
    def fmt(v):
        n=round(v*1000);h,n=divmod(n,3600000);m,n=divmod(n,60000);s,n=divmod(n,1000);return f'{h:02}:{m:02}:{s:02},{n:03}'
    return '\n\n'.join(f"{i+1}\n{fmt(c['start'])} --> {fmt(c['end'])}\n{c['text']}" for i,c in enumerate(captions))+'\n'

def main():
    p=argparse.ArgumentParser();p.add_argument('--project',required=True);p.add_argument('--video',default='output/final.mp4');p.add_argument('--decode',action='store_true');a=p.parse_args();root,e=load(a.project);errors,warnings=validate(e)
    report={'configurationErrors':errors,'warnings':warnings,'demo':e.get('demo'),'metadataChecked':False,'fullDecode':False,'encodedAudioMeasured':False,'stillsInspected':False,'continuousPlayback':False,'humanListening':False,'independentReview':False}
    (root/'output').mkdir(exist_ok=True);(root/'output/subtitles.srt').write_text(srt(e['captions']),encoding='utf-8')
    video=root/a.video
    if video.exists():
        meta=probe(video);v=next(s for s in meta['streams'] if s['codec_type']=='video');aud=next((s for s in meta['streams'] if s['codec_type']=='audio'),None);expected=math.ceil(e['duration']*e['fps']);frames=int(v.get('nb_frames',0))
        report.update(metadataChecked=True,videoSha256=hashlib.sha256(video.read_bytes()).hexdigest(),video={'width':v['width'],'height':v['height'],'frames':frames,'expectedFrames':expected,'fps':v.get('avg_frame_rate'),'duration':meta['format']['duration'],'audio':bool(aud),'pixelFormat':v.get('pix_fmt')})
        if (v['width'],v['height'])!=(1920,1080) or frames!=expected or not aud:errors.append('Encoded dimensions/frame count/audio do not match episode')
        if v.get('avg_frame_rate')!='30/1' or v.get('codec_name')!='h264':errors.append('Expected H.264 at constant 30fps')
        if abs(float(meta['format']['duration'])-e['duration'])>1/e['fps']+1024/48000+.001:errors.append('Encoded duration differs beyond frame/AAC boundary tolerance')
        if aud and (aud.get('codec_name')!='aac' or int(aud.get('sample_rate',0))!=48000 or aud.get('channels')!=2):errors.append('Expected 48k stereo AAC audio')
        if v.get('pix_fmt')!='yuv420p':errors.append('Unexpected pixel format')
        if a.decode:
            ffmpeg(['-v','error','-i',video,'-c:v','rawvideo','-c:a','pcm_s16le','-f','null','-']);report['fullDecode']=True
        if aud:
            r=ffmpeg(['-i',video,'-vn','-af','loudnorm=I=-14:TP=-1.2:LRA=8:print_format=json','-c:a','pcm_s16le','-f','null','-']);m=re.findall(r'\{\s*"input_i"[\s\S]*?\}',r.stderr)
            if m:
                metrics=json.loads(m[-1]);report.update(encodedAudioMeasured=True,encodedLoudness=metrics)
                if metrics['input_tp'] not in ['-inf','inf'] and float(metrics['input_tp'])>-.8:warnings.append('Encoded true peak is above -0.8 dBTP; review headroom')
    else:errors.append('Final encoded file missing')
    report['toolPaths']={'ffmpeg':executable('ffmpeg'),'ffprobe':executable('ffprobe')}
    dump(root/'qa/evidence.json',report);print(json.dumps(report,ensure_ascii=True,indent=2));return 1 if errors else 0
if __name__=='__main__':raise SystemExit(main())
