import json, os, shutil, subprocess
from pathlib import Path

def executable(name):
    value=os.environ.get(name.upper()+'_PATH') or shutil.which(name)
    if value and Path(value).is_file(): return str(value)
    raise RuntimeError(f'{name} not found. Put it on PATH or set {name.upper()}_PATH.')

def probe(path):
    return json.loads(subprocess.check_output([executable('ffprobe'),'-v','error','-show_format','-show_streams','-of','json',str(path)],text=True,encoding='utf-8'))

def load(project):
    p=Path(project).resolve()
    return p,json.loads((p/'episode.json').read_text(encoding='utf-8'))

def dump(path,data):
    path=Path(path);path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

def ffmpeg(args):
    result=subprocess.run([executable('ffmpeg'),'-hide_banner','-nostats',*map(str,args)],stdout=subprocess.PIPE,stderr=subprocess.PIPE,encoding='utf-8',errors='replace')
    if result.returncode:raise RuntimeError('FFmpeg failed: '+result.stderr[-3500:])
    return result
