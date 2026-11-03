import json, platform, shutil, subprocess, os, sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from _common import executable

def main():
    result={'python':platform.python_version(),'platform':platform.platform(),'tools':{},'asrInstalled':False}
    import importlib.util
    result['asrInstalled']=importlib.util.find_spec('faster_whisper') is not None
    for name in ['node','npm','ffmpeg','ffprobe']:
        try:
            cmd=executable(name) if name.startswith('ff') else shutil.which(name)
            if not cmd: raise RuntimeError('not on PATH')
            args=[cmd,'-version' if name.startswith('ff') else '--version']
            r=subprocess.run(args,capture_output=True,text=True,encoding='utf-8',errors='replace',timeout=15,shell=(os.name=='nt' and str(cmd).endswith('.cmd')))
            result['tools'][name]={'ok':r.returncode==0,'version':(r.stdout or r.stderr).splitlines()[0]}
        except Exception as e:result['tools'][name]={'ok':False,'error':str(e)}
    result['chromeOverrideExists']=not os.environ.get('CHROME_PATH') or Path(os.environ['CHROME_PATH']).is_file()
    result['readyForCore']=all(t['ok'] for t in result['tools'].values()) and tuple(map(int,platform.python_version_tuple()[:2]))>=(3,10)
    if result['tools'].get('node',{}).get('ok'):
        result['readyForCore'] &= int(result['tools']['node']['version'].lstrip('v').split('.')[0])>=20
    print(json.dumps(result,ensure_ascii=True,indent=2))
    return 0 if result['readyForCore'] else 1
if __name__=='__main__':raise SystemExit(main())
