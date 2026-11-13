import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {openBrowser, getCompositions, renderMedia} from '@remotion/renderer';
import {renderPlan} from './render-plan.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);
const E = JSON.parse(fs.readFileSync('episode.json', 'utf8'));
if (!E.demo && !E.productionReady) throw Error('Complete the storyboard and set productionReady:true');
const plan = renderPlan(E);
const muted = process.env.MUTED === '1';
if (muted && !process.env.OUTPUT_NAME) throw Error('Muted renders require a new OUTPUT_NAME');
const output = path.resolve('output', process.env.OUTPUT_NAME || E.outputName || 'final.mp4');
if (fs.existsSync(output)) throw Error('Output exists; choose a new OUTPUT_NAME');
if (!muted && !fs.existsSync(path.join('public', E.audio))) throw Error('Missing mixed audio');
const parallel = Number(process.env.SEGMENT_PARALLEL || 2);
if (!Number.isInteger(parallel) || parallel < 1 || parallel > 4) throw Error('SEGMENT_PARALLEL must be 1..4');
const onlyArg = process.argv.find(x => x.startsWith('--only='));
const only = onlyArg ? onlyArg.slice(7).split(',') : null;
if (only?.some(id => !plan.shots.some(s => s.id === id))) throw Error('Unknown --only shot ID');

function executable(name) {
  const supplied = process.env[`${name.toUpperCase()}_PATH`];
  if (supplied) return supplied;
  const base = path.resolve('node_modules/@remotion');
  for (const dir of fs.existsSync(base) ? fs.readdirSync(base).filter(n => n.startsWith('compositor-')) : []) {
    const candidate = path.join(base, dir, name + (process.platform === 'win32' ? '.exe' : ''));
    if (fs.existsSync(candidate)) return candidate;
  }
  return name;
}
const ffmpeg = executable('ffmpeg'), ffprobe = executable('ffprobe');
function run(command, args) {
  const result = spawnSync(command, args, {encoding: 'utf8', maxBuffer: 8 * 1024 * 1024});
  if (result.error || result.status !== 0) throw Error(result.error?.message || result.stderr);
  return result.stdout;
}
const opts = {...(process.env.CHROME_PATH ? {browserExecutable: process.env.CHROME_PATH} : {}), chromiumOptions: {gl: process.env.REMOTION_GL || 'angle'}};
const renderSettings = {codec: 'h264', crf: 18, imageFormat: 'jpeg', jpegQuality: 95, pixelFormat: 'yuv420p', colorSpace: 'bt709', muted: true, concurrency: 1};
const digest = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const hash = crypto.createHash('sha256');
function hashPath(file) {
  if (!fs.existsSync(file)) return;
  if (fs.statSync(file).isDirectory()) for (const name of fs.readdirSync(file).sort()) hashPath(path.join(file, name));
  else {hash.update(path.relative(root, file)); hash.update('\0'); hash.update(digest(file));}
}
for (const name of ['src', 'public', 'scripts', 'episode.json', 'package.json', 'package-lock.json', 'tsconfig.json']) hashPath(path.resolve(name));
hash.update(JSON.stringify({opts, renderSettings, node: process.version, ffmpegVersion: run(ffmpeg, ['-version']).split('\n')[0]}));
if (opts.browserExecutable) hashPath(path.resolve(opts.browserExecutable));
const sourceHash = hash.digest('hex');
const dir = path.resolve('output/segments', sourceHash);
fs.mkdirSync(dir, {recursive: true}); fs.mkdirSync('qa', {recursive: true});
const manifestPath = path.join(dir, 'manifest.json');
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : {sourceHash, shots: {}};
function reusable(shot) {
  const row = manifest.shots[shot.id], file = path.join(dir, `${shot.id}.mp4`);
  return row && row.startFrame === shot.startFrame && row.endFrame === shot.endFrame && fs.existsSync(file) && digest(file) === row.sha256;
}
const serveUrl = await bundle({entryPoint: path.resolve('src/index.tsx'), publicDir: path.resolve('public'), outDir: path.resolve('build')});
const browser = await openBrowser('chrome', opts);
try {
  const composition = (await getCompositions(serveUrl, {...opts, puppeteerInstance: browser})).find(c => c.id === 'Episode');
  if (!composition || composition.durationInFrames !== plan.total) throw Error('Composition/frame plan mismatch');
  const queue = plan.shots.filter(s => (!only || only.includes(s.id)) && !reusable(s));
  await Promise.all(Array.from({length: parallel}, async () => {
    while (queue.length) {
      const shot = queue.shift(); if (!shot) break;
      const file = path.join(dir, `${shot.id}.mp4`);
      console.log(`START ${shot.id} ${shot.startFrame}-${shot.endFrame}`);
      await renderMedia({serveUrl, composition, frameRange: [shot.startFrame, shot.endFrame], outputLocation: file, ...renderSettings, ...opts, puppeteerInstance: browser, overwrite: true});
      const probe = JSON.parse(run(ffprobe, ['-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_frames', '-of', 'json', file]));
      if (Number(probe.streams[0]?.nb_read_frames) !== shot.frames) throw Error(`Segment frame count mismatch: ${shot.id}`);
      manifest.shots[shot.id] = {...shot, file: `${shot.id}.mp4`, sha256: digest(file)};
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      console.log(`DONE ${shot.id}`);
    }
  }));
} finally {await browser.close({silent: true});}
const missing = plan.shots.filter(s => !reusable(s));
if (missing.length) {console.log(`PARTIAL: ${missing.map(s => s.id).join(', ')} remaining; no final assembled`); process.exit(0);}
// Use safe relative filenames so spaces/quotes in the project path do not enter concat syntax.
const list = path.join(dir, 'list.txt');
fs.writeFileSync(list, plan.shots.map(s => `file '${s.id}.mp4'`).join('\n'));
const picture = path.join(dir, 'picture.mp4');
run(ffmpeg, ['-hide_banner', '-y', '-f', 'concat', '-safe', '1', '-i', list, '-c', 'copy', picture]);
const args = ['-hide_banner', '-n', '-i', picture];
if (muted) args.push('-map', '0:v:0', '-c:v', 'copy', '-an');
else args.push('-i', path.resolve('public', E.audio), '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2', '-t', String(E.duration));
run(ffmpeg, [...args, '-movflags', '+faststart', output]);
const meta = JSON.parse(run(ffprobe, ['-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_frames', '-of', 'json', output]));
if (Number(meta.streams[0]?.nb_read_frames) !== plan.total) throw Error('Assembled frame count mismatch');
fs.writeFileSync('qa/render-segments.json', JSON.stringify({file: output, sha256: digest(output), sourceHash, frames: plan.total, fps: E.fps, muted, sourceAudio: muted ? null : E.audio, continuousPlayback: false, humanListening: false, independentReview: false}, null, 2));
console.log(`ASSEMBLED ${plan.total} frames: ${output}`);
