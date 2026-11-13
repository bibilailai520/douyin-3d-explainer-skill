import React from 'react';
import {E} from './config';
import {paletteAt} from './palette';
import {chapterStateAt} from './chapter-state';
import './chapter-progress.css';

export function ChapterProgress({t}: {t: number}) {
  const state = chapterStateAt(E.chapters, E.duration, t);
  if (!state) return null;
  const {index, chapter, total, progress} = state;
  return <div className="episode-chapter-progress" data-current-chapter={index + 1}>
    <div className="episode-chapter-heading">
      <span className="episode-chapter-name" style={{color: paletteAt(chapter.at).ink}}>{chapter.text}</span>
      <span className="episode-chapter-count"><b style={{color: paletteAt(chapter.at).ink}}>{String(index + 1).padStart(2, '0')}</b><span>/</span>{String(total).padStart(2, '0')}</span>
    </div>
    <div className="episode-chapter-segments" style={{gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))`}}>
      {E.chapters.map((item: any, i: number) => <div key={item.at} className={`episode-chapter-segment${i === index ? ' is-current' : ''}${i < index ? ' is-complete' : ''}`}>
        <div style={{width: `${progress[i] * 100}%`, background: paletteAt(item.at).ink, opacity: i < index ? .55 : 1}}/>
      </div>)}
    </div>
  </div>;
}
