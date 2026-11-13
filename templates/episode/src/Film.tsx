import React,{useLayoutEffect,useRef,useState} from 'react';
import {AbsoluteFill,Audio,Img,staticFile,useCurrentFrame,delayRender,continueRender,cancelRender,getInputProps} from 'remotion';
import {E,clamp} from './config';
import {Scene} from './Scenes';
import {Robot} from './Robot';
import {trackAt,ease} from './motion';
import {OpeningRail} from './OpeningRail';
import {railPose,boardTransform,projectBoard} from './rail-geometry';
import {paletteVars,backgroundAt} from './palette';
import {captionEmphasis} from './functional-palette';
import {Background} from './Background';
import {ChapterProgress} from './ChapterProgress';
import './style.css';import './chapter-quiet.css';import './header-brand.css';import './rail-layout.css';import './readability.css';import './functional-palette.css';import './latest-material.css';
function Depth(){return <>{Array.from({length:32},(_,i)=>{const d=(31-i)*1.6+.8,top=Math.max(0,1-d/8),bottom=Math.max(0,(d-39)/12),inset=-14+4*top*top+5*bottom*bottom,l=67+12*(1-d/51);return <div className="board-stratum" key={i} style={{inset,transform:`translate3d(${d*.18}px,${d*.4}px,${-d}px)`,background:`linear-gradient(115deg,color-mix(in srgb,var(--edge),white ${19+14*(1-d/51)}%),var(--edge) 55%,color-mix(in srgb,var(--deep),#243B53 ${8+10*d/51}%))`}}/>})}<div className="board-sheen"/></>}
function BoardShadow({p}:{p:ReturnType<typeof railPose>}){
  return <div className="board-move" style={{transform:boardTransform(p,true)}}><div className="board-shadow"/></div>;
}
function Board({shot,t,index,track}:{shot:any;t:number;index:number;track:number}){
  const delta=track-index,p=railPose(delta),local=Math.max(0,Math.min(t-shot.start,shot.end-shot.start-1/E.fps)),visible=Math.abs(delta)<.95;
  return <div data-board={shot.id} className="board-move" style={{...paletteVars(shot.start),transform:boardTransform(p),zIndex:index+1,transformStyle:'preserve-3d'}}>
    <div className="board"><Depth/><div className="board-face"><div className="board-kicker">{shot.kicker}</div><div className="board-title" style={{opacity:t>=shot.start?1:0}}>{shot.title}</div><div className="scene-content" style={{opacity:t>=shot.start?clamp((.8-Math.abs(delta))/.4):0}}>{visible&&<Scene shot={shot} l={local}/>}</div></div></div>
  </div>;
}
function Rail({t,track}:{t:number;track:number}){
  const boards=E.shots.map((shot:any,index:number)=>({shot,index,p:railPose(track-index),corners:projectBoard(track-index)})).filter(({index,corners}:any)=>t<4.15?index<2:Math.abs(track-index)<1.5&&Math.min(...corners.map((v:any)=>v.x))<2010&&Math.max(...corners.map((v:any)=>v.x))>-90);
  return <div className="board-stage">
    <div className="rail-layer rail-shadows"><OpeningRail t={t}>{boards.map(({shot,p}:any)=><BoardShadow key={shot.id} p={p}/>)}</OpeningRail></div>
    <div className="rail-layer rail-boards"><OpeningRail t={t}>{boards.map(({shot,index}:any)=><Board key={shot.id} shot={shot} index={index} t={t} track={track}/>)}</OpeningRail></div>
  </div>;
}
function AccountBrand(){if(E.brand?.showLogo===false)return null;return <div className="account-brand" aria-label="账号机器人Logo"><Img src={staticFile('brand/account-robot.png')}/></div>}
function Caption({t}:{t:number}){const c=E.captions.find((c:any)=>t>=c.start&&t<c.end);if(!c)return null;const words=[...new Set([...E.keywords,...Object.keys(c.emphasis||{})])].sort((a:string,b:string)=>b.length-a.length).map((s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')),re=words.length?new RegExp(`(${words.join('|')})`,'g'):null,parts=re?c.text.split(re):[c.text];return <div data-caption className="caption" style={{fontSize:E.subtitleSize||60}}><div>{parts.map((s:string,i:number)=><span key={i} style={{color:re&&i%2?captionEmphasis(s,c.text,c.emphasis):'white'}}>{s}</span>)}</div></div>}
export function Film(){const t=useCurrentFrame()/E.fps,track=trackAt(t),[font]=useState(()=>delayRender('Load Chinese font')),props=getInputProps();useLayoutEffect(()=>{fetch(staticFile('fonts/NotoSansSC.ttf')).then(r=>{if(!r.ok)throw Error('missing-font');return r.arrayBuffer()}).then(buf=>new FontFace('Episode Noto',buf,{weight:'100 900'}).load()).then(f=>{(document.fonts as any).add(f);continueRender(font)}).catch(err=>{if(String(err).includes('missing-font')){console.warn('Using system Chinese font; run fetch-font.mjs for stable font');continueRender(font)}else cancelRender(err)})},[font]);return <AbsoluteFill style={{...paletteVars(t),background:`linear-gradient(135deg,#f8fafde0,#f8fafda8),${backgroundAt(t)}`}}><Background t={t}/><AccountBrand/><ChapterProgress t={t}/><Rail t={t} track={track}/><Robot t={t}/><Caption t={t}/>{props.safeGuide&&<><div className="safe-right">平台右侧UI保护区</div><div className="safe-bottom">底部控件保护区</div></>}<Audio src={staticFile(E.audio)}/></AbsoluteFill>}
