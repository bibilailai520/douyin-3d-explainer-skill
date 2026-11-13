import {Matrix4, Vector3, MathUtils} from 'three';

// Equal rigid boards on one plane. A single wheel rotation brings each shot
// to the fixed reading position; no card has an independent scale or camera.
export const BOARD={x:400,y:166,w:1190,h:670,rx:28,ry:-3,perspective:8000};
export const READING_SCALE=1.12;
export const IP_LAYOUT={x:55,y:300,w:390,h:500};
export const ORBIT={radius:6000,step:.248};
export const PITCH=ORBIT.radius*Math.sin(ORBIT.step);
export const CENTRE={x:BOARD.x+BOARD.w/2,y:BOARD.y+BOARD.h/2};
const perspective=new Matrix4();perspective.elements[11]=-1/BOARD.perspective;
const plane=new Matrix4().makeRotationX(MathUtils.degToRad(BOARD.rx))
  .multiply(new Matrix4().makeRotationY(MathUtils.degToRad(BOARD.ry)));
export const PLANE_PROJECTOR=new Matrix4().makeTranslation(CENTRE.x,CENTRE.y,0)
  .multiply(perspective).multiply(plane)
  .multiply(new Matrix4().makeScale(READING_SCALE,READING_SCALE,READING_SCALE));
export function orbitMatrix(delta:number){
  return new Matrix4().makeTranslation(0,ORBIT.radius,0)
    .multiply(new Matrix4().makeRotationZ(delta*ORBIT.step))
    .multiply(new Matrix4().makeTranslation(0,-ORBIT.radius,0));
}
export function railPose(delta:number){
  const angle=delta*ORBIT.step;
  return {delta,angle,x:ORBIT.radius*Math.sin(angle),y:ORBIT.radius*(1-Math.cos(angle)),
    scale:1,rx:BOARD.rx,ry:BOARD.ry,rz:MathUtils.radToDeg(angle)};
}
export function boardMatrix(p:ReturnType<typeof railPose>,shadow=false){
  const m=PLANE_PROJECTOR.clone();
  // One fixed light direction in the common world, not one light per card.
  if(shadow)m.multiply(new Matrix4().makeTranslation(28,35,-70));
  return m.multiply(orbitMatrix(p.delta))
    .multiply(new Matrix4().makeTranslation(-BOARD.w/2,-BOARD.h/2,0));
}
export function boardTransform(p:ReturnType<typeof railPose>,shadow=false){
  return `matrix3d(${boardMatrix(p,shadow).elements.join(',')})`;
}
export function projectBoard(delta:number){
  const m=boardMatrix(railPose(delta));
  return [[0,0],[BOARD.w,0],[BOARD.w,BOARD.h],[0,BOARD.h]].map(([x,y])=>{
    const v=new Vector3(x,y,2).applyMatrix4(m);return {x:v.x,y:v.y};
  });
}
export const PROJECTED_PIVOT=new Vector3(0,ORBIT.radius,0).applyMatrix4(PLANE_PROJECTOR);
export function incomingEdgeAt(progress:number,y=650){
  const [_,a,b]=projectBoard(progress-1);
  return a.x+(b.x-a.x)*(y-a.y)/(b.y-a.y);
}
const jumpCentreX=IP_LAYOUT.x+IP_LAYOUT.w/2+72*Math.sin(Math.PI*.95/2.1);
let lo=0,hi=1;
for(let i=0;i<48;i++){const mid=(lo+hi)/2;if(incomingEdgeAt(mid)<jumpCentreX)lo=mid;else hi=mid}
export const CROSS_PROGRESS=(lo+hi)/2;
export const CROSSING={progress:CROSS_PROGRESS,x:jumpCentreX,y:650,edge:incomingEdgeAt(CROSS_PROGRESS)};
