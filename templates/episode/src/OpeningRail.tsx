import React from 'react';
import {Matrix4, MathUtils} from 'three';
import {entrancePose} from './motion';
import {BOARD} from './rail-geometry';

// All boards are laid out before the opening pullback. Apply one camera delta
// to the rail, retaining the original first board's approved camera pose.
const centre={x:BOARD.x+BOARD.w/2,y:BOARD.y+BOARD.h/2};
const perspective=new Matrix4();
perspective.elements[11]=-1/BOARD.perspective;
const rotationX=(d:number)=>new Matrix4().makeRotationX(MathUtils.degToRad(d));
const rotationY=(d:number)=>new Matrix4().makeRotationY(MathUtils.degToRad(d));
const rotationZ=(d:number)=>new Matrix4().makeRotationZ(MathUtils.degToRad(d));
const baseline=perspective.clone().multiply(rotationX(BOARD.rx)).multiply(rotationY(BOARD.ry));
const baselineInverse=baseline.clone().invert();

export function openingRailMatrix(t:number){
  if(t>=4.15)return 'none';
  const p=entrancePose(t,0);
  const camera=perspective.clone()
    .multiply(rotationX(BOARD.rx+p.rx)).multiply(rotationY(BOARD.ry))
    .multiply(rotationZ(p.rz))
    .multiply(new Matrix4().makeScale(p.scale,p.scale,1));
  const matrix=new Matrix4().makeTranslation(p.x,p.y,0)
    .multiply(new Matrix4().makeTranslation(centre.x,centre.y,0))
    .multiply(camera).multiply(baselineInverse)
    .multiply(new Matrix4().makeTranslation(-centre.x,-centre.y,0));
  return `matrix3d(${matrix.elements.join(',')})`;
}

export function OpeningRail({t,children}:{t:number;children:React.ReactNode}){
  return <div className="opening-rail" style={{position:'absolute',inset:0,
    transformOrigin:'0 0',transform:openingRailMatrix(t),
    transformStyle:t<4.15?'preserve-3d':'flat'}}>{children}</div>;
}
