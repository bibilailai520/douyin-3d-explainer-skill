import argparse,json,re,hashlib,zipfile
from pathlib import Path

SKIP={'node_modules','.git','__pycache__','build','output','renders','qa-local','dist','.venv'}
def files(root):
    result=[]
    for path in root.rglob('*'):
        rel=path.relative_to(root)
        if not path.is_file() or any(p in SKIP for p in rel.parts) or path.suffix in ['.pyc','.log','.tmp']:continue
        if path.name.startswith('.env') or path.suffix.lower() in ['.mp3','.mp4','.wav','.ttf','.woff','.woff2']:continue
        result.append((rel.as_posix(),path))
    return sorted(result)

def skill_version(text):
    head=text.split('---',2)[1]
    match=re.search(r"^\s*version:\s*[\"']?([0-9]+\.[0-9]+\.[0-9]+)",head,re.M)
    if not match:raise ValueError('Skill version missing')
    return match.group(1)

def workbuddy_frontmatter(text):
    end=text.index('\n---',4)+4;body=text[end:]
    return '''---
name: douyin-3d-explainer
display_name: 抖音3D机器人科普视频
display_name_en: Douyin 3D Explainer
description: 将中文定稿和配音制作成浅色动态网格、立体厚板、3D机器人、语义动效、章节进度与字幕音效的横版科普视频，并按本期要求生成IP互动封面。
description_zh: 文案与配音转横版科普视频，保留账号机器人、卡片、字幕和封面风格。
description_en: Create landscape explainers with a 3D robot, light grid, dimensional boards, semantic motion, chapter progress, captions, sound effects and interactive-IP covers.
version: __SKILL_VERSION__
author: bibilailai520
examples_zh:
  - 用我的定稿和配音，按账号3D机器人风格完成横版科普视频。
  - 调整机器人的变装、走动、转圈和跳卡动作，并检查音效与字幕。
examples_en:
  - Create a landscape explainer from my final script and narration.
---'''.replace('__SKILL_VERSION__',skill_version(text))+body

def main():
    p=argparse.ArgumentParser();p.add_argument('--out',default='dist');a=p.parse_args();root=Path(__file__).resolve().parent.parent;dest=Path(a.out).resolve();dest.mkdir(parents=True,exist_ok=True);name=root.name;output=dest/(name+'-workbuddy.zip');entries=files(root);manifest=[]
    with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED,compresslevel=8) as z:
        for rel,path in entries:
            content=path.read_bytes()
            if rel=='SKILL.md':content=workbuddy_frontmatter(content.decode('utf-8')).encode('utf-8')
            z.writestr(name+'/'+rel,content);manifest.append({'path':rel,'bytes':len(content),'sha256':hashlib.sha256(content).hexdigest()})
        z.writestr(name+'/package-manifest.json',json.dumps({'target':'WorkBuddy','version':skill_version((root/'SKILL.md').read_text(encoding='utf8')),'files':manifest},ensure_ascii=False,indent=2))
    digest=hashlib.sha256(output.read_bytes()).hexdigest()
    version=skill_version((root/'SKILL.md').read_text(encoding='utf8'))
    versioned=dest/(name+'-workbuddy-v'+version+'.zip')
    versioned.write_bytes(output.read_bytes())
    for archive in [output,versioned]:
        (dest/(archive.name+'.sha256')).write_text(digest+'  '+archive.name+'\n',encoding='utf-8',newline='\n')
    print(json.dumps({'zip':str(output),'versionedZip':str(versioned),'version':version,'files':len(entries),'bytes':output.stat().st_size,'sha256':digest},ensure_ascii=True))
if __name__=='__main__':main()
