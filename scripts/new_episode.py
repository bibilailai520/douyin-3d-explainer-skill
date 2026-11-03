import argparse,json,shutil,hashlib
from pathlib import Path
from _common import probe,dump

def main():
    a=argparse.ArgumentParser();a.add_argument('--out',required=True);a.add_argument('--title',default='新一期科普');a.add_argument('--script');a.add_argument('--voice');a.add_argument('--demo',action='store_true');args=a.parse_args()
    out=Path(args.out).resolve();skill=Path(__file__).resolve().parent.parent
    if out.exists():raise SystemExit('Target already exists; choose a new directory to preserve prior work.')
    if not args.demo and (not args.script or not args.voice):raise SystemExit('Production scaffolding requires --script and --voice; use --demo only for environment testing.')
    script=Path(args.script).resolve() if args.script else None;voice=Path(args.voice).resolve() if args.voice else None
    if script and not script.is_file():raise SystemExit('Script file missing')
    if voice and not voice.is_file():raise SystemExit('Voice file missing')
    meta=probe(voice) if voice else None
    duration=float(meta['format']['duration']) if meta else 24
    if duration<=0:raise SystemExit('Voice duration must be positive')
    shutil.copytree(skill/'templates/episode',out,ignore=shutil.ignore_patterns('node_modules','build','output','qa','*.wav','*.mp3','*.ttf'))
    for name in ['input','public/audio','public/fonts','qa','output']:(out/name).mkdir(parents=True,exist_ok=True)
    config=json.loads((out/'episode.json').read_text(encoding='utf-8'));config['title']=args.title if not args.demo else config['title']
    if voice:
        dst=out/'input'/('voice'+voice.suffix.lower());shutil.copy2(voice,dst);shutil.copy2(script,out/'input/script.md')
        scale=duration/config['duration'];config.update(demo=False,productionReady=False,duration=duration,narration=dst.relative_to(out).as_posix(),seed=hashlib.sha256(script.read_bytes()+voice.read_bytes()).hexdigest()[:16])
        # Skeleton time positions only. Actual voice anchors must replace them before productionReady.
        for row in config['shots']:
            row['start']*=scale;row['end']*=scale;row['title']='请按本期配音重做语义镜头';row['kicker']='未完成的分镜骨架';row['takeaway']='请替换为本期结论'
            for item in row.get('items',[]):item['dropAt']=item.get('dropAt',0)*scale
        for row in config['chapters']:row['at']*=scale;row['text']='待定章节'
        config.update(captions=[],sfx=[],wardrobe=[],motions=[],bubbles=[],keywords=[])
        dump(out/'qa/input.json',{'sourceSha256':hashlib.sha256(voice.read_bytes()).hexdigest(),'duration':duration,'scriptSha256':hashlib.sha256(script.read_bytes()).hexdigest(),'scriptAligned':False,'voiceProcessed':False})
    dump(out/'episode.json',config)
    (out/'SHOTBOOK.md').write_text('# 分镜工作单\n\n|镜头|配音起止/锚点|语义关系|对象与动作|相机/转场|IP|音效|字幕保护|来源|\n|---|---|---|---|---|---|---|---|---|\n',encoding='utf-8')
    print(json.dumps({'project':str(out),'demo':args.demo,'duration':duration,'next':'npm install; npm run browser:ensure; edit episode.json and src/Scenes.tsx'},ensure_ascii=True))
if __name__=='__main__':main()
