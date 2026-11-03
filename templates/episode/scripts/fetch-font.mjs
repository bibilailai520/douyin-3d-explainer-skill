import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
fs.mkdirSync(path.join(root,'public/fonts'),{recursive:true});
for(const [remote,local] of [['NotoSansSC%5Bwght%5D.ttf','NotoSansSC.ttf'],['OFL.txt','OFL.txt']]){
 const url='https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/'+remote,r=await fetch(url);if(!r.ok)throw Error(`${r.status}: ${url}`);const data=Buffer.from(await r.arrayBuffer());if(local.endsWith('.ttf')&&data.length<100000)throw Error('Unexpected font response');fs.writeFileSync(path.join(root,'public/fonts',local),data);console.log(local,data.length,crypto.createHash('sha256').update(data).digest('hex'));
}
