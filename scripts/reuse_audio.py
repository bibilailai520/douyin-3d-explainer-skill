"""Copy a prior AAC mix into a revised picture, checking packet hashes and timing."""
import argparse,hashlib,json,subprocess
from pathlib import Path
from fractions import Fraction
from _common import probe,ffmpeg,executable,dump

def packets(file,kind):
    data=json.loads(subprocess.check_output([executable('ffprobe'),'-v','error',
        '-select_streams',kind+':0','-show_packets','-show_streams',
        '-show_data_hash','sha256','-show_entries','packet=pts,dts,duration,data_hash:stream=time_base,codec_name',
        '-of','json',str(file)],text=True,encoding='utf8'))
    rows=data.get('packets',[])
    if not rows or any(not r.get('data_hash') for r in rows):raise RuntimeError('Packet hashes are unavailable; audio identity was not checked.')
    return data['streams'][0]['time_base'],[(r.get('pts'),r.get('dts'),r.get('duration'),r['data_hash']) for r in rows]

def main():
    p=argparse.ArgumentParser();p.add_argument('--picture',required=True);p.add_argument('--audio-from',required=True);p.add_argument('--out',required=True);p.add_argument('--report');a=p.parse_args()
    picture=Path(a.picture).resolve();source=Path(a.audio_from).resolve();out=Path(a.out).resolve()
    if not picture.is_file() or not source.is_file():raise SystemExit('Picture or previous encoded video missing.')
    if out.exists() or out in [picture,source]:raise SystemExit('Choose a new output file; originals are preserved.')
    vm=probe(picture);am=probe(source);vs=next(s for s in vm['streams'] if s['codec_type']=='video');aud=next(s for s in am['streams'] if s['codec_type']=='audio')
    if aud['codec_name']!='aac':raise SystemExit('This helper preserves a prior AAC mix; other formats need a separate encoding decision.')
    duration=float(vs.get('duration',vm['format']['duration']));ad=float(aud.get('duration',am['format']['duration']))
    tolerance=1/float(Fraction(vs.get('avg_frame_rate','30/1')))+1024/int(aud.get('sample_rate',48000))+.001
    if abs(duration-ad)>tolerance:raise SystemExit('Picture and previous audio differ in duration; retime intentionally before reuse.')
    original_audio=packets(source,'a');original_picture=packets(picture,'v')
    out.parent.mkdir(parents=True,exist_ok=True)
    # Preserve encoder boundary packets; trimming at video duration can drop AAC tail packets.
    ffmpeg(['-n','-i',picture,'-i',source,'-map','0:v:0','-map','1:a:0','-c','copy','-movflags','+faststart',out])
    audio_ok=original_audio==packets(out,'a');video_ok=original_picture==packets(out,'v')
    report={'file':str(out),'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),
        'audioSource':str(source),'pictureSource':str(picture),'audioBytesAndTimestampsUnchanged':audio_ok,
        'pictureBytesAndTimestampsUnchanged':video_ok,'audioPacketCount':len(original_audio[1]),
        'encodedAudioMeasured':False,'measurementBasis':'Attach the previous version measurement if audio identity passes.',
        'continuousPlayback':False,'humanListening':False,'independentReview':False}
    dump(Path(a.report) if a.report else out.with_suffix('.audio-reuse.json'),report)
    print(json.dumps(report,ensure_ascii=True,indent=2))
    return 0 if audio_ok and video_ok else 1
if __name__=='__main__':raise SystemExit(main())
