import React,{useLayoutEffect,useRef} from 'react';
import * as THREE from 'three';
import {createUserRobot} from './robot.js';
import {E,clamp} from './config';
import {entrancePose,jumpAt,wardrobeAt,locomotionAt,ease} from './motion';
import {paletteVars} from './palette';
export const IP={x:135,y:300,w:390,h:500};
export function Robot({t}:{t:number}){
 const canvas=useRef<HTMLCanvasElement>(null),rt=useRef<any>(null),bubble=useRef<HTMLDivElement>(null),flash=useRef<HTMLDivElement>(null),wardrobe=wardrobeAt(t),jump=jumpAt(t),motion=locomotionAt(t),entryX=-500*(1-ease((t-.35)/2.4)),x=IP.x+entryX+(jump?.x||0)+motion.x,y=IP.y+motion.y,message=E.bubbles.find((b:any)=>t>=b.start&&t<b.end);
 useLayoutEffect(()=>{rt.current=createUserRobot(canvas.current!,THREE);return()=>rt.current?.dispose()},[]);
 useLayoutEffect(()=>{if(!rt.current)return;const s=E.shots.find((s:any)=>t>=s.start&&t<s.end)||E.shots[0],l=t-s.start;let clip=l>3.5?'idle':(s.action||'idle'),ct=l>3.5?t:l,expr=s.expr||'smile',blend=clamp(l/.35),prev='idle';if(t<2.75){clip='walk';ct=Math.max(0,t-.35);blend=clamp((t-.35)/.15)}else if(t<3.35){clip='idle';ct=t;prev='walk';blend=ease((t-2.75)/.6)}if(motion.active){clip=motion.clip;ct=motion.local;blend=motion.blend}if(jump){clip='jump';ct=jump.local;blend=jump.blend;expr='laugh'}if(wardrobe.phase>=0){clip='morph';ct=wardrobe.phase;blend=1;expr=ct>2.1?'laugh':'wow'}
 const k=motion.lie,tilt=28+entrancePose(Math.min(t,4.15),0).rx,el=(90-tilt)*Math.PI/180*(1-k)+.8*k,az=-3*Math.PI/180+.85*k,dist=9.2-.9*k,targetY=1.3-.95*k,targetZ=-.35*k,c=rt.current.camera;c.fov=31;c.position.set(Math.sin(az)*Math.cos(el)*dist,targetY+Math.sin(el)*dist,targetZ+Math.cos(az)*Math.cos(el)*dist);c.lookAt(0,targetY,targetZ);c.updateProjectionMatrix();rt.current.state.gazeLift=.78*(1-k);rt.current.robot.rotation.y=t<3.35?1.25*(1-ease((t-2.5)/.85)):motion.yaw;const p=rt.current.render(t,clip,ct,expr,prev,t,blend,1,wardrobe);
 if(bubble.current&&p){const headX=x+(p.topX??p.x)*IP.w/440,headY=y+Math.min(p.y,p.topY??p.y)*IP.h/560,left=Math.max(12,Math.min(440,headX-150));bubble.current.style.left=`${left}px`;bubble.current.style.top=`${Math.max(132,headY-85)}px`;bubble.current.style.setProperty('--tip',`${Math.max(24,Math.min(276,headX-left))}px`)}if(flash.current)flash.current.style.opacity=String(Math.min(.75,p?.flash||0));
 },[t]);
 return <><canvas ref={canvas} data-ip width={440} height={560} style={{position:'absolute',left:x,top:y,width:IP.w,height:IP.h,zIndex:80}}/><div ref={flash} className="morph-flash" style={{left:x-20,top:y+10,width:IP.w+40,height:IP.h-20}}/>{message&&<div ref={bubble} data-ip-bubble className="ip-bubble" style={{...paletteVars(t),opacity:Math.min(clamp((t-message.start)/.25),clamp((message.end-t)/.25))}}><b>{message.icon}</b><span>{message.text}</span></div>}</>
}
