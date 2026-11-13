export type Chapter = {at: number; text: string};

export function chapterStateAt(chapters: Chapter[], duration: number, t: number) {
  if (!chapters.length) return null;
  let index = 0;
  for (let i = 1; i < chapters.length; i++) {
    if (t >= chapters[i].at) index = i;
  }
  const progress = chapters.map((chapter, i) => {
    const end = chapters[i + 1]?.at ?? duration;
    return Math.max(0, Math.min(1, (t - chapter.at) / (end - chapter.at)));
  });
  return {index, chapter: chapters[index], total: chapters.length, progress};
}
