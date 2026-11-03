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

def workbuddy_frontmatter(text):
    end=text.index('\n---',4)+4;body=text[end:]
    return '''---
name: douyin-3d-explainer
display_name: 抖音3D机器人科普视频
display_name_en: Douyin 3D Explainer
description: 将中文定稿和配音制作成亮色立体卡片、3D机器人变装、语义动效、字幕音效的横版科普视频，并生成账号模板封面。
description_zh: 文案与配音转横版科普视频，保留账号机器人、卡片、字幕和封面风格。
description_en: Create narrated landscape explainers with 3D robot wardrobe, semantic motion, captions, sound effects and template covers.
version: 1.0.0
author: bibilailai520
examples_zh:
  - 用我的定稿和配音，按账号3D机器人风格完成横版科普视频。
  - 调整机器人的变装、走动、转圈和跳卡动作，并检查音效与字幕。
examples_en:
  - Create a landscape explainer from my final script and narration.
---'''+body

def main():
    p=argparse.ArgumentParser();p.add_argument('--out',default='dist');a=p.parse_args();root=Path(__file__).resolve().parent.parent;dest=Path(a.out).resolve();dest.mkdir(parents=True,exist_ok=True);name=root.name;output=dest/(name+'-workbuddy.zip');entries=files(root);manifest=[]
    with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED,compresslevel=8) as z:
        for rel,path in entries:
            content=path.read_bytes()
            if rel=='SKILL.md':content=workbuddy_frontmatter(content.decode('utf-8')).encode('utf-8')
            z.writestr(name+'/'+rel,content);manifest.append({'path':rel,'bytes':len(content),'sha256':hashlib.sha256(content).hexdigest()})
        z.writestr(name+'/package-manifest.json',json.dumps({'target':'WorkBuddy','version':'1.0.0','files':manifest},ensure_ascii=False,indent=2))
    digest=hashlib.sha256(output.read_bytes()).hexdigest();(dest/(output.name+'.sha256')).write_text(digest+'  '+output.name+'\n',encoding='utf-8');print(json.dumps({'zip':str(output),'files':len(entries),'bytes':output.stat().st_size,'sha256':digest},ensure_ascii=True))
if __name__=='__main__':main()
