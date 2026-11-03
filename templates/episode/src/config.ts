import episode from '../episode.json';
export const E: any = episode;
export const FPS = E.fps;
export const clamp = (v:number)=>Math.max(0,Math.min(1,v));
