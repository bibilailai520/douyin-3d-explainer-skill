export function renderPlan(episode) {
  if (!(Number.isFinite(episode.duration) && episode.duration > 0 && Number.isInteger(episode.fps) && episode.fps > 0)) throw Error('Invalid duration or fps');
  if (!episode.shots?.length) throw Error('No shots');
  const total = Math.ceil(episode.duration * episode.fps), ids = new Set();
  let next = 0, seconds = 0;
  const shots = episode.shots.map((shot, i) => {
    if (!/^[a-zA-Z0-9_-]+$/.test(shot.id) || ids.has(shot.id)) throw Error('Shot IDs must be unique safe filenames');
    ids.add(shot.id);
    if (Math.abs(shot.start - seconds) > 1e-7 || !(shot.end > shot.start)) throw Error(`Non-contiguous shot ${shot.id}`);
    // First frame belonging to [start,end) is ceil(start*fps), including fractional final frames.
    const start = Math.max(0, Math.ceil(shot.start * episode.fps - 1e-7));
    const end = i === episode.shots.length - 1 ? total : Math.ceil(shot.end * episode.fps - 1e-7);
    if (start !== next || end <= start || end > total) throw Error(`Invalid frame range ${shot.id}`);
    next = end; seconds = shot.end;
    return {id: shot.id, startFrame: start, endFrame: end - 1, frames: end - start};
  });
  if (next !== total || Math.abs(seconds - episode.duration) > 1e-7) throw Error('Shots do not cover duration');
  return {total, shots};
}
