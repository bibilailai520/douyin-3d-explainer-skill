import React, {useLayoutEffect, useRef} from 'react';

export function Background({t}: {t: number}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const g = canvas.current!.getContext('2d')!;
    g.clearRect(0, 0, 1920, 1080);
    g.strokeStyle = '#93a9c5';
    g.lineWidth = 1;
    for (let i = -2; i < 30; i++) {
      const x = i * 76 + (t * 6) % 76;
      g.globalAlpha = i % 4 === 0 ? .23 : .10;
      g.beginPath(); g.moveTo(x, -20); g.lineTo(x + 4 * Math.sin(t * .25), 1100); g.stroke();
    }
    for (let i = -2; i < 18; i++) {
      const y = i * 76 + (t * 2.3) % 76;
      g.globalAlpha = i % 4 === 0 ? .23 : .10;
      g.beginPath(); g.moveTo(-20, y); g.lineTo(1940, y + 3 * Math.sin(t * .2)); g.stroke();
    }
    g.globalAlpha = 1;
  }, [t]);
  return <canvas ref={canvas} width={1920} height={1080} className="background-canvas"/>;
}
