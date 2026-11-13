import assert from 'node:assert/strict';
import {renderPlan} from './render-plan.mjs';
const episode = {fps: 30, duration: 2.01, shots: [{id: 'one', start: 0, end: .515}, {id: 'two', start: .515, end: 2.01}]};
const plan = renderPlan(episode);
assert.equal(plan.total, 61);
assert.deepEqual(plan.shots.map(s => [s.startFrame, s.endFrame]), [[0, 15], [16, 60]]);
assert.equal(plan.shots.reduce((n, s) => n + s.frames, 0), 61);
for (const shots of [
  [{id: 'one', start: .1, end: 2.01}],
  [{id: 'one', start: 0, end: 1}, {id: 'one', start: 1, end: 2.01}],
  [{id: '../escape', start: 0, end: 2.01}],
  [{id: 'one', start: 0, end: 1}, {id: 'two', start: .9, end: 2.01}],
  [{id: 'one', start: 0, end: 1}],
]) assert.throws(() => renderPlan({...episode, shots}));
console.log('Render plan: fractional duration, exact coverage, gaps, overlaps, IDs passed');
