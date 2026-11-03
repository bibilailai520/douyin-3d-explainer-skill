import argparse,re,difflib,json,hashlib
from pathlib import Path
from _common import load,dump

def normalized(text):
    return ''.join(c.lower() for c in text if c.isalnum())

def compare_script(script,words):
    expected=normalized(script);heard='';anchors=[]
    for w in words:
        token=normalized(w['text']);count=len(token)
        for i,c in enumerate(token):
            heard+=c;anchors.append({'start':w['start']+(w['end']-w['start'])*i/max(1,count),'end':w['start']+(w['end']-w['start'])*(i+1)/max(1,count)})
    matcher=difflib.SequenceMatcher(None,expected,heard,autojunk=False);matches=sum(b.size for b in matcher.get_matching_blocks())
    differences=[{'kind':op,'script':expected[i:j],'heard':heard[k:l],'audioStart':anchors[k]['start'] if k<len(anchors) else None,'audioEnd':anchors[l-1]['end'] if l else None} for op,i,j,k,l in matcher.get_opcodes() if op!='equal']
    return {'scriptChars':len(expected),'asrChars':len(heard),'scriptCoverage':matches/max(1,len(expected)),'differences':differences,'requiresReview':bool(differences),'method':'local ASR word timestamps plus normalized character comparison; word-internal character times are estimates'}

def propose_captions(segments,max_chars=22):
    captions=[]
    for seg in segments:
        chunks=[];current=[]
        for w in seg['words']:
            if current and len(''.join(x['text'] for x in current)+w['text'])>max_chars:
                chunks.append(current);current=[]
            current.append(w)
            if re.search(r'[。！？；]$',w['text']):chunks.append(current);current=[]
        if current:chunks.append(current)
        if not chunks and seg['text'].strip():
            captions.append({'start':seg['start'],'end':seg['end'],'text':seg['text'].strip(),'review':True})
        for chunk in chunks:
            text=''.join(w['text'] for w in chunk).strip()
            if text:captions.append({'start':chunk[0]['start'],'end':chunk[-1]['end'],'text':text,'review':True})
    for i,c in enumerate(captions[:-1]):c['end']=min(c['end'],captions[i+1]['start'])
    return captions

def main():
    p=argparse.ArgumentParser();p.add_argument('--project',required=True);p.add_argument('--model',required=True,help='Existing local faster-whisper model directory');args=p.parse_args();root,e=load(args.project)
    model_path=Path(args.model).resolve()
    if not model_path.is_dir():raise SystemExit('Provide an existing local model directory; this script does not silently download or upload audio.')
    source=(root/e['narration']).resolve()
    from faster_whisper import WhisperModel
    model=WhisperModel(str(model_path),device='cpu',compute_type='int8',local_files_only=True)
    segments,_=model.transcribe(str(source),language='zh',word_timestamps=True,beam_size=5,vad_filter=True,condition_on_previous_text=False)
    raw=[]
    for s in segments:raw.append({'start':s.start,'end':s.end,'text':s.text,'words':[{'text':w.word,'start':w.start,'end':w.end} for w in s.words or []]})
    script=(root/'input/script.md').read_text(encoding='utf-8')
    # Input should be the spoken text, not scene/voice instructions; strip headings but retain the original file.
    body='\n'.join(x for x in script.splitlines() if not x.lstrip().startswith(('#','>','---')))
    report=compare_script(body,[w for s in raw for w in s['words']]);report.update(sourceSha256=hashlib.sha256(source.read_bytes()).hexdigest(),humanListening=False)
    dump(root/'qa/asr.json',raw);dump(root/'qa/alignment.json',report);dump(root/'qa/captions-proposed.json',propose_captions(raw))
    print(json.dumps({'segments':len(raw),'scriptCoverage':report['scriptCoverage'],'requiresReview':report['requiresReview'],'episodeModified':False},ensure_ascii=True))
if __name__=='__main__':main()
