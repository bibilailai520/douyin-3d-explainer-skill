import React,{useLayoutEffect,useRef} from 'react';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {clamp} from './config';
import {ease} from './motion';
import {TONE} from './functional-palette';

const BLUE=TONE.blue,GREEN=TONE.mint,GOLD=TONE.amber;
const v=(x:number,y:number,z:number)=>new THREE.Vector3(x,y,z);
type Curve=THREE.CatmullRomCurve3;
function progress(t:number,a:number,b:number){return ease((t-a)/(b-a))}

function build(canvas:HTMLCanvasElement,mode:'intro'|'cost'){
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,preserveDrawingBuffer:true});
 renderer.setSize(1100,430,false);renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
 const scene=new THREE.Scene(),halfW=6.8,halfH=halfW*430/1100;
 const camera=new THREE.OrthographicCamera(-halfW,halfW,halfH,-halfH,.1,60);camera.position.set(0,9.0,13);camera.lookAt(0,.5,0);camera.zoom=mode==='cost'?1.10:1.03;camera.updateProjectionMatrix();
 scene.add(new THREE.HemisphereLight('#ffffff','#b2c0cf',2.0));
 const sun=new THREE.DirectionalLight('#fffaf2',2.8);sun.position.set(-4,10,6);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-8;sun.shadow.camera.right=8;sun.shadow.camera.top=6;sun.shadow.camera.bottom=-6;sun.shadow.radius=3;sun.shadow.bias=-.001;sun.shadow.normalBias=.02;scene.add(sun);
 const fill=new THREE.DirectionalLight('#b9dcff',1.0);fill.position.set(5,5,-5);scene.add(fill);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(22,16),new THREE.ShadowMaterial({opacity:.14}));floor.rotation.x=-Math.PI/2;floor.position.y=-.04;floor.receiveShadow=true;scene.add(floor);
 const mat=(color:string,metalness=.08)=>new THREE.MeshPhysicalMaterial({color,roughness:.39,metalness,clearcoat:.55});
 function box(parent:THREE.Group,w:number,h:number,d:number,color:string,x=0,y=0,z=0,r=.06){const m=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,3,Math.min(r,w/4,h/4,d/4)),mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
 function group(x=0,y=0,z=0){const g=new THREE.Group();g.position.set(x,y,z);scene.add(g);return g}
 function texture(kind:'doc'|'coin'){
  const c=document.createElement('canvas');c.width=256;c.height=kind==='doc'?320:256;const g=c.getContext('2d')!;
  if(kind==='doc'){
   g.fillStyle=TONE.paper;g.fillRect(0,0,256,320);g.fillStyle='#d4e8fc';g.beginPath();g.moveTo(200,0);g.lineTo(256,56);g.lineTo(200,56);g.closePath();g.fill();
   g.strokeStyle=BLUE;g.lineWidth=12;g.lineCap='round';g.beginPath();g.moveTo(40,83);g.lineTo(165,83);g.moveTo(40,125);g.lineTo(205,125);g.moveTo(40,166);g.lineTo(182,166);g.stroke();
   [BLUE,'#91BBDD',BLUE,BLUE].forEach((color,i)=>{g.fillStyle=color;g.fillRect(42+(i%2)*28,225+Math.floor(i/2)*28,19,19)});
  }else{g.clearRect(0,0,256,256);g.fillStyle='#f8d989';g.beginPath();g.arc(128,128,124,0,Math.PI*2);g.fill();g.strokeStyle='#c28c34';g.lineWidth=8;g.beginPath();g.arc(128,128,105,0,Math.PI*2);g.stroke();g.fillStyle='#a8782f';g.font='bold 165px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText('¥',128,141)}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
 }
 const docTexture=texture('doc'),coinTexture=texture('coin');
 function documentCard(x:number,z:number,scale=1){const g=group(x,0,z);box(g,1.06,1.32,.13,'#9bbfe4',0,.81,0);box(g,.99,1.25,.12,TONE.paper,-.015,.84,.045);const face=new THREE.Mesh(new THREE.PlaneGeometry(.87,1.11),new THREE.MeshBasicMaterial({map:docTexture}));face.position.set(-.015,.84,.112);g.add(face);g.scale.setScalar(scale);g.rotation.y=-.08;return g}
 function stateBlock(){const g=group();for(let i=0;i<4;i++)box(g,.22,.22,.22,i%2?GREEN:'#70D6C0',(i%2-.5)*.25,Math.floor(i/2)*.25,0,.035);return g}
 function gear(parent:THREE.Group,color:string,x:number,y:number,z:number,r=.42){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);const ring=new THREE.Mesh(new THREE.TorusGeometry(r*.68,r*.28,12,32),mat(color,.20));ring.castShadow=true;g.add(ring);for(let i=0;i<12;i++){const a=i*Math.PI/6;const tooth=box(g,.15,.22,.13,color,Math.cos(a)*r,Math.sin(a)*r,0,.02);tooth.rotation.z=a-Math.PI/2}const hub=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,.15,18),mat('#eaf3fc',.25));hub.rotation.x=Math.PI/2;hub.position.z=.02;g.add(hub);return g}
 function engine(x:number,z:number,color:string,scale=1){const g=group(x,0,z);box(g,2.03,.18,1.28,color,0,.09,0);box(g,1.86,1.15,1.08,TONE.paper,0,.72,0);box(g,1.58,.91,.10,'#DFE9F0',0,.75,.58);const rotor=gear(g,color,-.2,.8,.68,.38);const small=gear(g,'#afc4d9',.48,.52,.68,.22);const leds:THREE.Mesh[]=[];for(let i=0;i<3;i++){const m=box(g,.13,.065,.08,'#d3dfe9',-.53+i*.25,1.34,.41,.02);leds.push(m)}box(g,.025,.35,.68,'#7c94ac',-.95,.70,0,.006);box(g,.025,.35,.68,'#7c94ac',.95,.70,0,.006);g.scale.setScalar(scale);return {g,rotor,small,leds,color}}
 function spin(e:ReturnType<typeof engine>,angle:number,active:boolean){e.rotor.rotation.z=-angle;e.small.rotation.z=angle*1.5;e.leds.forEach((m,i)=>{const on=active&&(Math.sin(angle*1.3-i*1.7)>-.3);const mm=m.material as THREE.MeshPhysicalMaterial;mm.color.set(on?e.color:'#cfdae5');mm.emissive.set(on?e.color:'#000');mm.emissiveIntensity=on?.28:0})}
 function cache(x:number,z:number){const g=group(x,0,z);box(g,1.94,.17,1.40,GREEN,0,.085,0);for(const a of [-.83,.83])box(g,.12,1.05,1.15,'#C8E9DF',a,.67,-.03);box(g,1.87,.12,1.32,'#DEF3EC',0,1.24,0);const blocks:THREE.Mesh[]=[];for(let i=0;i<6;i++){const b=box(g,.34,.29,.38,i%2?GREEN:'#70D6C0',-.51+(i%3)*.51,.39+Math.floor(i/3)*.43,.30,.045);blocks.push(b)}box(g,.93,.08,.07,'#fff',0,.92,.70,.02);return {g,blocks}}
 function answer(color:string,x:number,z:number){const g=group(x,0,z);box(g,1.50,.89,.14,color,0,.83,0,.13);box(g,1.39,.80,.13,TONE.paper,-.02,.86,.07,.13);const tail=new THREE.Mesh(new THREE.ConeGeometry(.17,.26,3),mat(color));tail.rotation.z=Math.PI;tail.position.set(-.43,.34,.01);g.add(tail);const dots:THREE.Mesh[]=[];for(let i=0;i<3;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(.07,12,10),mat(color));m.position.set(-.33+i*.33,.89,.17);g.add(m);dots.push(m)}return {g,dots,x,z}}
 function coin(){const g=group();const disc=new THREE.Mesh(new THREE.CylinderGeometry(.30,.30,.105,32),mat(GOLD,.35));disc.rotation.x=Math.PI/2;disc.castShadow=true;g.add(disc);const face=new THREE.Mesh(new THREE.CircleGeometry(.265,32),new THREE.MeshBasicMaterial({map:coinTexture}));face.position.z=.06;g.add(face);return g}
 function wallet(x:number,z:number,scale=1){const g=group(x,0,z);box(g,1.63,.92,.63,'#cda26d',0,.58,0,.12);box(g,1.53,.71,.11,'#dfb786',-.01,.64,.35,.11);box(g,.55,.25,.13,'#b78d59',.52,.67,.44,.045);const button=new THREE.Mesh(new THREE.SphereGeometry(.055,12,10),mat('#f4d68b',.4));button.position.set(.62,.67,.53);g.add(button);box(g,1.25,.065,.27,'#806340',0,1.07,-.04,.02);g.scale.setScalar(scale);return g}
 function route(points:number[][],color:string,arrows=true){const curve=new THREE.CatmullRomCurve3(points.map(p=>v(p[0],p[1],p[2])),false,'catmullrom',.18);const line=new THREE.Mesh(new THREE.TubeGeometry(curve,54,.047,8,false),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.88}));scene.add(line);if(arrows)for(const p of [.32,.78]){const a=new THREE.Mesh(new THREE.ConeGeometry(.145,.30,3),new THREE.MeshBasicMaterial({color}));a.position.copy(curve.getPointAt(p));a.position.y+=.015;a.quaternion.setFromUnitVectors(v(0,1,0),curve.getTangentAt(p).normalize());scene.add(a)}return curve}
 function travel(object:THREE.Group,curve:Curve,p:number,height=.75){object.position.copy(curve.getPointAt(clamp(p)));object.position.y=height+.08*Math.sin(Math.PI*clamp(p));object.rotation.y=-.08+.11*Math.sin(Math.PI*clamp(p));}
 const labels:{text:string;color:string;at:THREE.Vector3}[]=[];
 let update:(t:number)=>void;
 if(mode==='intro'){
  const slow=engine(-1.55,-2.10,GOLD,.94),mem=cache(-1.55,2.40),gen=engine(2.42,0,BLUE,.89);
  const source=documentCard(-5.18,0,1.08);source.position.y=.08;
  const a=documentCard(-5.18,0,.74),b=documentCard(-5.18,0,.74),repeat=documentCard(-5.18,0,.74),slowState=stateBlock(),fastState=stateBlock(),again=stateBlock();
  const slowPath=route([[-5.1,.12,0],[-3.7,.12,-2.1],[-1.55,.12,-2.1]],GOLD),fastPath=route([[-5.1,.12,0],[-3.7,.12,2.40],[-1.55,.12,2.40]],GREEN);
  const slowOut=route([[-.50,.12,-2.1],[.50,.12,-1.65],[1.55,.12,0]],GOLD),fastOut=route([[-.50,.12,2.40],[.50,.12,1.65],[1.55,.12,0]],GREEN);
  route([[3.3,.12,0],[4.20,.12,-1.05],[5.22,.12,-1.05]],GOLD);route([[3.3,.12,0],[4.2,.12,1.05],[5.22,.12,1.05]],GREEN);
  const outSlow=answer(GOLD,5.22,-1.05),outFast=answer(GREEN,5.22,1.05),bag=wallet(.55,2.55,.65),pay=coin();
  labels.push({text:'同一份资料',color:TONE.blueInk,at:v(-5.18,-.20,.35)},{text:'重算',color:TONE.amberInk,at:v(-1.55,1.90,-2.10)},{text:'缓存',color:TONE.mintInk,at:v(-1.55,1.65,2.40)},{text:'生成',color:TONE.blueInk,at:v(2.42,1.90,0)});
  update=t=>{
   const slowRun=t>.7&&t<4.0||t>6.35&&t<9.1;
   const angle=6*Math.min(Math.max(0,t-.7),3.3)+6*Math.min(Math.max(0,t-6.35),2.75);spin(slow,angle,slowRun);spin(gen,5*t,t>2.25&&t<3.03||t>4.30&&t<5.1||t>7.35&&t<8.3);
   a.visible=t>=.20&&t<1.35;travel(a,slowPath,progress(t,.20,1.35),.26);a.scale.setScalar(.74);
   b.visible=t>=.20&&t<1.20;travel(b,fastPath,progress(t,.20,1.20),.26);b.scale.setScalar(.74);
   repeat.visible=t>=5.8&&t<6.95;travel(repeat,slowPath,progress(t,5.8,6.95),.26);repeat.scale.setScalar(.74);
   slowState.visible=t>=3.85&&t<4.48;travel(slowState,slowOut,progress(t,3.85,4.48),.72);slowState.rotation.y=t*.4;
   fastState.visible=t>=1.35&&t<2.42;travel(fastState,fastOut,progress(t,1.35,2.42),.72);fastState.rotation.y=t*.4;
   again.visible=t>=6.45&&t<7.45;travel(again,fastOut,progress(t,6.45,7.45),.72);again.rotation.y=t*.4;
   for(const [o,at] of [[outFast,3.03],[outSlow,5.10]] as const){const p=progress(t,at-.30,at);o.g.visible=t>=at-.30;o.g.scale.setScalar(Math.max(.001,p));o.g.position.x=3.6+(o.x-3.6)*p;o.g.position.y=.11*Math.sin(p*Math.PI);o.dots.forEach((d,i)=>d.scale.setScalar(1+.10*Math.sin(t*3.0-i)))}
   const pulse=Math.max(Math.exp(-Math.pow((t-2.15)/.28,2)),Math.exp(-Math.pow((t-6.45)/.28,2)),Math.exp(-Math.pow((t-9.38)/.30,2)));mem.blocks.forEach((m,i)=>{m.scale.setScalar(1+.10*pulse);const a=m.material as THREE.MeshPhysicalMaterial;a.emissive.set(GREEN);a.emissiveIntensity=.08+.28*pulse});
   const bp=progress(t,5.46,5.85)*(1-progress(t,8.15,8.55));bag.visible=bp>.001;bag.scale.setScalar(.65*Math.max(.001,bp));
   pay.visible=t>=5.95&&t<6.95;const pp=progress(t,5.95,6.95);pay.position.set(.55+(-1.55-.55)*pp,.88+.7*Math.sin(pp*Math.PI),2.55+(-2.1-2.55)*pp);pay.rotation.y=Math.PI*3*pp;pay.scale.setScalar(.72*(1-.95*progress(t,6.75,6.95)));
  };
 }else{
  const machine=engine(0,0,GOLD,1.42),file=documentCard(-4.65,0,1.0),bag=wallet(4.65,0,1.1),coins=[coin(),coin(),coin()];
  const plate=group(-4.65,0,0);box(plate,1.65,.16,1.2,'#bed5ec',0,.08,0);for(let i=0;i<3;i++)box(plate,1.14,.045,.87,'#eaf3fc',i*.045,.2+i*.05,-.08,.015);
  const input=route([[-4.65,.12,0],[-2.8,.12,0],[-1.28,.12,0]],BLUE),returnPath=route([[1.30,.12,.2],[.7,.12,1.8],[-2.9,.12,1.85],[-4.65,.12,0]],BLUE);
  route([[4.1,.12,-.15],[2.4,.12,-.15],[1.25,.12,-.15]],GOLD);
  const battery=group(0,0,2.45);box(battery,2.07,.27,.75,'#d2dce7',0,.135,0);box(battery,.12,.11,.35,'#b4c3d3',1.08,.14,0,.025);const cells:THREE.Mesh[]=[];for(let i=0;i<3;i++)cells.push(box(battery,.50,.12,.52,GREEN,-.63+i*.63,.33,0,.035));
  labels.push({text:'同一份资料',color:TONE.blueInk,at:v(-4.65,-.12,.45)},{text:'计算',color:TONE.amberInk,at:v(0,2.24,0)},{text:'费用',color:TONE.amberInk,at:v(4.65,-.15,.35)});
  const cycles=[{start:-.15,arrive:.45,finish:1.45,end:2},{start:2,arrive:2.60,finish:3.60,end:4.15},{start:4.15,arrive:4.75,finish:5.60,end:6.22}];
  update=t=>{
   let active=cycles.find(c=>t>=c.start&&t<c.end);file.visible=true;
   if(active){if(t<active.arrive){travel(file,input,progress(t,active.start,active.arrive),.30)}else if(t<active.finish){const p=progress(t,active.arrive,active.finish);file.position.set(-1.30+1.65*p,.3,0);file.rotation.y=-.08;file.visible=p<.65}else{file.visible=true;travel(file,returnPath,progress(t,active.finish,active.end),.30)}}else{file.position.set(-4.65,.30,0);file.rotation.y=-.08}
   const spinAngle=cycles.reduce((sum,c)=>sum+8*Math.max(0,Math.min(t-c.arrive,c.finish-c.arrive)),0);spin(machine,spinAngle,cycles.some(c=>t>=c.arrive&&t<c.finish));
   for(let i=0;i<3;i++){const c=cycles[i],p=progress(t,c.arrive,c.finish),m=coins[i];m.visible=t<c.finish;m.position.set(4.35+i*.28+(1.22-4.35-i*.28)*p,1.28+i*.08+.55*Math.sin(p*Math.PI),.10-.10*p);m.rotation.y=3*Math.PI*p;m.scale.setScalar(1-.94*progress(t,c.finish-.18,c.finish));const material=cells[i].material as THREE.MeshPhysicalMaterial;material.color.copy(new THREE.Color(GREEN)).lerp(new THREE.Color('#dfe6ed'),p);cells[i].scale.y=1-.75*p;}
  };
 }
 return {renderer,scene,camera,labels,update,dispose:()=>{scene.traverse(o=>{const m=o as THREE.Mesh;m.geometry?.dispose();if(m.material)for(const a of Array.isArray(m.material)?m.material:[m.material]){(a as any).map?.dispose();a.dispose()}});docTexture.dispose();coinTexture.dispose();renderer.dispose();renderer.forceContextLoss()}};
}

export function CacheSemantic3D({l,mode}:{l:number;mode:'intro'|'cost'}){
 const canvas=useRef<HTMLCanvasElement>(null),runtime=useRef<ReturnType<typeof build>|null>(null),labels=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{runtime.current=build(canvas.current!,mode);return()=>{runtime.current?.dispose();runtime.current=null}},[mode]);
 useLayoutEffect(()=>{const r=runtime.current;if(!r)return;r.update(l);r.renderer.render(r.scene,r.camera);const nodes=labels.current!.children;for(let i=0;i<r.labels.length;i++){const label=r.labels[i],p=label.at.clone().project(r.camera),node=nodes[i] as HTMLElement;node.style.left=`${(p.x+1)*550}px`;node.style.top=`${(1-p.y)*215}px`;node.style.color=label.color;}},[l,mode]);
 const words=mode==='intro'?['同一份资料','重算',l>=9.38?'缓存命中':'缓存','生成']:['同一份资料','计算','费用'];
 return <><canvas ref={canvas} width={1100} height={430} className="semantic-3d"/><div ref={labels} className="semantic-labels">{words.map(x=><span key={x}>{x}</span>)}</div></>;
}

export function SemanticIntro({l}:{l:number}){return <CacheSemantic3D l={l} mode="intro"/>}
export function SemanticMiss({l}:{l:number}){return <CacheSemantic3D l={l} mode="cost"/>}
