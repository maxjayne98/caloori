'use client';
import { useMemo } from 'react';

// Original collectible-style pixel characters: each seed picks one trait from every list.
const BACKGROUNDS = ['#ffd6e0', '#cdeffd', '#d9f7d6', '#fff1c1', '#e6dcff', '#ffe0cc', '#d6f5f0'];
const SKINS = ['#f6d2b6', '#e8b48f', '#c98c64', '#9a6644', '#6b4630', '#b8e0a8', '#c9c2f5'];
const HAIR_COLORS = ['#2b2b2b', '#6b3e26', '#d9a441', '#e2574c', '#4f7cf0', '#a35cf0', '#f5f5f5'];
const HAIRS = ['none', 'mohawk', 'cap', 'beanie', 'bob', 'spiky', 'bun'] as const;
const EYES = ['dots', 'shades', '3d', 'wink', 'visor'] as const;
const MOUTHS = ['smile', 'flat', 'open', 'smirk'] as const;
const EXTRAS = ['none', 'earring', 'blush', 'freckles'] as const;

function hash(seed: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

type Pixel = [x: number, y: number, color: string];

function draw(seed: string): { background: string; pixels: Pixel[] } {
  const pick = <T,>(list: readonly T[], salt: string) => list[hash(seed + salt) % list.length];
  const background = pick(BACKGROUNDS, 'bg');
  const skin = pick(SKINS, 'skin');
  const hairColor = pick(HAIR_COLORS, 'hair-color');
  const hair = pick(HAIRS, 'hair');
  const eyes = pick(EYES, 'eyes');
  const mouth = pick(MOUTHS, 'mouth');
  const extra = pick(EXTRAS, 'extra');
  const ink = '#2b2b2b';
  const pixels: Pixel[] = [];
  const rect = (x0: number, y0: number, x1: number, y1: number, color: string) => {
    for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) pixels.push([x, y, color]);
  };

  // Head, ears and neck on a 12×12 grid.
  rect(3, 3, 8, 9, skin);
  rect(2, 5, 2, 6, skin);
  rect(9, 5, 9, 6, skin);
  rect(5, 10, 6, 11, skin);
  rect(3, 11, 8, 11, hairColor === '#f5f5f5' ? '#9aa0a6' : hairColor);

  if (hair === 'mohawk') rect(5, 0, 6, 3, hairColor);
  if (hair === 'cap') {
    rect(3, 1, 8, 3, hairColor);
    rect(8, 3, 10, 3, hairColor);
  }
  if (hair === 'beanie') {
    rect(3, 1, 8, 3, hairColor);
    rect(5, 0, 6, 0, hairColor);
  }
  if (hair === 'bob') {
    rect(2, 2, 9, 3, hairColor);
    rect(2, 4, 2, 8, hairColor);
    rect(9, 4, 9, 8, hairColor);
  }
  if (hair === 'spiky') {
    rect(3, 2, 8, 3, hairColor);
    [3, 5, 7].forEach((x) => pixels.push([x, 1, hairColor]));
  }
  if (hair === 'bun') {
    rect(3, 2, 8, 3, hairColor);
    rect(5, 0, 6, 1, hairColor);
  }

  if (eyes === 'dots') {
    pixels.push([4, 5, ink], [7, 5, ink]);
  }
  if (eyes === 'wink') {
    pixels.push([4, 5, ink]);
    rect(6, 5, 7, 5, ink);
  }
  if (eyes === 'shades') {
    rect(3, 5, 8, 5, ink);
    rect(4, 6, 4, 6, ink);
    rect(7, 6, 7, 6, ink);
    pixels.push([4, 5, '#ffffff'], [7, 5, '#ffffff']);
  }
  if (eyes === '3d') {
    rect(3, 5, 8, 5, '#f5f5f5');
    rect(4, 5, 4, 6, '#e2574c');
    rect(7, 5, 7, 6, '#4f7cf0');
  }
  if (eyes === 'visor') rect(3, 5, 8, 5, '#41c9b4');

  if (mouth === 'smile') {
    pixels.push([4, 7, ink], [7, 7, ink]);
    rect(5, 8, 6, 8, ink);
  }
  if (mouth === 'flat') rect(5, 8, 6, 8, ink);
  if (mouth === 'open') {
    rect(5, 7, 6, 8, ink);
    pixels.push([5, 8, '#e2574c']);
  }
  if (mouth === 'smirk') {
    rect(5, 8, 6, 8, ink);
    pixels.push([7, 7, ink]);
  }

  if (extra === 'earring') pixels.push([9, 7, '#f2c14e']);
  if (extra === 'blush') pixels.push([3, 7, '#f08aa0'], [8, 7, '#f08aa0']);
  if (extra === 'freckles') pixels.push([3, 6, '#b06a4a'], [8, 6, '#b06a4a']);

  return { background, pixels };
}

/** Pixel character avatar that fills its (round) container. */
export function PixelAvatar({ seed }: { seed: string }) {
  const { background, pixels } = useMemo(() => draw(seed), [seed]);
  return (
    <svg
      className="pixel-avatar"
      viewBox="-1 -1 14 14"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect x="-1" y="-1" width="14" height="14" fill={background} />
      {pixels.map(([x, y, color], i) => (
        <rect key={i} x={x} y={y} width="1" height="1" fill={color} />
      ))}
    </svg>
  );
}
