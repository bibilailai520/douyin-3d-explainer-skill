import {E} from './config';
export const TONE={glacier:'#E6F2F8',paper:'#FBFCFE',ink:'#243B53',blue:'#4F90CE',mint:'#24A995',amber:'#DB9A39',blueInk:'#326B9A',mintInk:'#146F65',amberInk:'#8C5D20',captionBlue:'#D5EDFF',captionMint:'#BDFFE9',captionAmber:'#FFE7BB'} as const;
const colors:any={cost:TONE.captionAmber,reuse:TONE.captionMint,shared:TONE.captionBlue};
export function captionEmphasis(word:string,sentence:string,override?:Record<string,string>){
  const explicit=override?.[word];if(explicit)return colors[explicit]||explicit;
  const roles=(E as any).highlightRoles||{};
  for(const role of ['cost','reuse','shared'])if(roles[role]?.includes(word))return colors[role];
  if(/不用.*(重算|算)|减少.*重复|复用|省/.test(sentence)&&/重复计算|从头算|复用/.test(word))return TONE.captionMint;
  if(/账单|重复计算|从头算|消耗/.test(word))return TONE.captionAmber;
  if(/缓存|复用|命中/.test(word))return /失效|回收|过了时间/.test(sentence)?TONE.captionAmber:TONE.captionMint;
  return TONE.captionBlue;
}
