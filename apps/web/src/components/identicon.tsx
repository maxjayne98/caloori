'use client';
import { useMemo } from 'react';

// FNV-1a: small, stable string hash so the same seed always draws the same pattern.
function hash(seed: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** GitHub-style 5×5 mirrored block avatar drawn in the theme accent. */
export function Identicon({ seed, size = 24 }: { seed: string; size?: number }) {
  const cells = useMemo(() => {
    const bits = hash(seed || 'nourish');
    const filled: [number, number][] = [];
    // 15 bits decide the left three columns; the right two mirror them.
    for (let col = 0; col < 3; col++)
      for (let row = 0; row < 5; row++)
        if ((bits >> (col * 5 + row)) & 1) {
          filled.push([col, row]);
          if (col < 2) filled.push([4 - col, row]);
        }
    return filled.length ? filled : [[2, 2] as [number, number]];
  }, [seed]);
  return (
    <svg
      className="identicon"
      width={size}
      height={size}
      viewBox="0 0 5 5"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" />
      ))}
    </svg>
  );
}
