import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {openBrowser,getCompositions,renderStill,renderMedia} from '@remotion/renderer';
const root=path.dirname(fileURLToPath(import.meta.url));process.chdir(root);
const E=JSON.parse(fs.readFileSync('episode.json','utf8')),mode=process.argv[2]||'stills';
if(mode==='full'&&!E.demo&&!E.productionReady)throw Error('Finish the episode-specific storyboard and set productionReady:true before final render.');
if(!fs.existsSync(path.join('public',E.audio)))throw Error('Missing mixed audio. Run the skill mix_audio.py, or npm run demo:audio for the demo.');
fs.mkdirSync('qa/stills',{recursive:true});fs.mkdirSync('output',{recursive:true});
const opts={...(process.env.CHROME_PATH?{browserExecutable:process.env.CHROME_PATH}:{}),chromiumOptions:{gl:process.env.REMOTION_GL||'angle'}},inputProps={safeGuide:process.env.SAFE_GUIDE==='1'};
const serveUrl=await bundle({entryPoint:path.resolve('src/index.tsx'),publicDir:path.resolve('public'),outDir:path.resolve('build')});
const browser=await openBrowser('chrome',opts);
try{const cs=await getCompositions(serveUrl,{...opts,puppeteerInstance:browser,inputProps}),composition=cs.find(c=>c.id==='Episode');if(!composition)throw Error('Episode composition missing');
 if(mode==='stills'){const times=(process.env.TIMES||[0,1.5,3.9,...E.shots.map(s=>(s.start+s.end)/2),...E.wardrobe.map(c=>c.start+3),E.duration-1/E.fps].join(',')).split(',').map(Number);for(const t of [...new Set(times)].filter(t=>Number.isFinite(t)&&t>=0&&t<E.duration)){await renderStill({serveUrl,composition,frame:Math.min(composition.durationInFrames-1,Math.round(t*E.fps)),inputProps,output:path.resolve(`qa/stills/t-${t.toFixed(3)}.png`),imageFormat:'png',...opts,puppeteerInstance:browser,overwrite:true});console.log('Still',t)}}
 else{const opening=mode==='opening',end=Math.min(composition.durationInFrames,Math.ceil(15*E.fps)),output=path.resolve('output',opening?'opening-preview.mp4':'final.mp4');let last=-1;await renderMedia({serveUrl,composition,inputProps,...(opening?{frameRange:[0,end-1]}:{}),outputLocation:output,codec:'h264',crf:18,imageFormat:'jpeg',jpegQuality:95,pixelFormat:'yuv420p',colorSpace:'bt709',audioCodec:'aac',sampleRate:48000,audioBitrate:'192k',concurrency:Number(process.env.RENDER_CONCURRENCY||1),...opts,puppeteerInstance:browser,overwrite:true,onProgress:({progress})=>{const p=Math.floor(progress*20)*5;if(p!==last){last=p;console.log('Render',p+'%')}}});const sha=crypto.createHash('sha256').update(fs.readFileSync(output)).digest('hex');fs.writeFileSync('qa/render.json',JSON.stringify({file:output,sha256:sha,frames:opening?end:composition.durationInFrames,fps:E.fps,demo:E.demo,sourceAudio:E.audio,continuousPlayback:false,humanListening:false,independentReview:false},null,2));console.log(output)}
}finally{await browser.close({silent:true})}
