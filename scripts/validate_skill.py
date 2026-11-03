import argparse,json,re,zipfile,hashlib
from pathlib import Path
from package_skill import files

def validate(root):
    issues=[];all_files=files(root);names={x for x,_ in all_files};text=(root/'SKILL.md').read_text(encoding='utf-8')
    if not text.startswith('---\nname: douyin-3d-explainer\n'):issues.append('Invalid skill frontmatter')
    for rel in re.findall(r'\]\(([^)]+)\)',text):
        if not re.match(r'https?://',rel) and not (root/rel).is_file():issues.append('Missing reference '+rel)
    required=['assets/cover-template.png','assets/robot-classic.png','templates/episode/src/robot.js','templates/episode/package.json','templates/episode/episode.json']
    for rel in required:
        if rel not in names:issues.append('Missing runtime asset '+rel)
    secrets=re.compile(r'(?:gh[pousr]_[A-Za-z0-9]{25,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9]{25,}|-----BEGIN (?:RSA |OPENSSH )?PRIVATE KEY-----)')
    for rel,path in all_files:
        if path.suffix in ['.py','.mjs','.js','.tsx','.ts','.json','.md','.css','.txt']:
            t=path.read_text(encoding='utf-8')
            # Exclude the scanner's own illustrative patterns; no real credentials should match.
            if rel!='scripts/validate_skill.py' and secrets.search(t):issues.append('Possible secret '+rel)
            if re.search(r'[CD]:[/\\](?:Users|项目|CodexData|软件)[/\\]',t):issues.append('Author-machine absolute dependency '+rel)
    return issues,len(all_files)

def main():
    p=argparse.ArgumentParser();p.add_argument('--zip');a=p.parse_args();root=Path(__file__).resolve().parent.parent;issues,count=validate(root)
    if a.zip:
        with zipfile.ZipFile(a.zip) as z:
            entries=z.namelist();tops={x.split('/')[0] for x in entries}
            if tops!={root.name}:issues.append('ZIP must have one skill directory at root')
            body=z.read(root.name+'/SKILL.md').decode('utf-8');head=body.split('---',2)[1]
            for field in ['name','display_name','display_name_en','description','description_zh','description_en','version','author']:
                if not re.search(r'^'+field+r':\s*\S',head,re.M):issues.append('Missing WorkBuddy field '+field)
            manifest=json.loads(z.read(root.name+'/package-manifest.json'))
            for row in manifest['files']:
                if hashlib.sha256(z.read(root.name+'/'+row['path'])).hexdigest()!=row['sha256']:issues.append('ZIP hash mismatch '+row['path'])
    print(json.dumps({'ok':not issues,'files':count,'issues':issues},ensure_ascii=True,indent=2));return 1 if issues else 0
if __name__=='__main__':raise SystemExit(main())
