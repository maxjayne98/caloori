'use client';

import { Bike, Dumbbell } from 'lucide-react';

export function Icon({ type }) {
  if (type === 'Strength') return <Dumbbell aria-hidden="true" strokeWidth={1.7} />;
  if (type === 'Bike') return <Bike aria-hidden="true" strokeWidth={1.7} />;
  if (type === 'Padel')
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <g transform="rotate(35 12 12)">
          <path d="M6.5 7.5C6.5 4 8.5 2 12 2s5.5 2 5.5 5.5V10c0 3-2 5-5.5 5s-5.5-2-5.5-5V7.5Z" />
          <path d="M10.5 15v6h3v-6m-3 4h3" />
          {[
            [10, 6],
            [14, 6],
            [10, 9],
            [14, 9],
            [12, 12],
          ].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={0.7} fill="currentColor" stroke="none" />
          ))}
        </g>
      </svg>
    );
  if (type === 'Elliptical')
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="18" cy="17" r="4" />
        <path d="M2 23h21M4 18h6m-2 3h6M8 15l3-11H9m5 11 4-12h-2" />
        <path d="m9 18 9-1m-5 4 5-4" />
      </svg>
    );
  const paths = {
    Running: 'M15 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM12 8l-3 5 5 3-2 6m-3-9-3 5H2m10-10 4 4h5M8 7l4 1',
    Bookmark: 'M6 3h12v18l-6-4-6 4V3Z',
    Chevron: 'm9 5 7 7-7 7',
    Activity: 'M3 12h4l3-8 4 16 3-8h4',
    Strength: 'M6 6v12M3 9v6m15-9v12m3-9v6M6 12h12',
    Bike: 'M8 16a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm16 0a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 16l5-9 5 9H4m5-9h8l3 9M8 4h4m3 0h3',
    Treadmill:
      'M4 17h15a2 2 0 0 1 0 4H4a2 2 0 0 1 0-4Zm11 0 3-11M14 4h6v3h-6V4Zm3 5h-4l-2 3M6 19h.01M18 19h.01',
    Elliptical:
      'M15 19a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM3 21h18M8 18l5-3M5 17h5M8 17l2-13M14 15l3-12M8 3h3m4-1h3',
    Padel: 'M9 15C5 11 7 5 11 3c4-2 9 1 9 5 0 5-3 9-7 9l-4-2Zm1 1-6 6-2-2 6-6m-3 4 2 2',
    Barcode: 'M3 7V3h4m10 0h4v4M3 17v4h4m10 0h4v-4M6 7v10m3-10v10m3-10v10m3-10v10m3-10v10',
    Image: 'M4 3h16v18H4V3Zm0 13 5-5 4 4 3-3 4 4M9 7h.01',
    Sun: 'M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
    Lunch: 'M4 10h16a8 8 0 0 1-16 0ZM12 4v3m-5-2 1 2m9-2-1 2',
    Moon: 'M20 15A8 8 0 0 1 9 4a8 8 0 1 0 11 11Z',
    Snack: 'M7 8h10l2 12H5L7 8ZM9 8V6a3 3 0 0 1 6 0v2',
    Today:
      'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM3 9h18M8 1v4m8-4v4M8 14h3m-3 3h7',
    Food: 'M7 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3ZM7 3v18m4-13h6m-6 4h5',
    Progress: 'M4 4v16h16M8 14l4-4 4 2 4-6',
    Add: 'M12 5v14M5 12h14',
    Grip: 'M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01',
    Trash: 'M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6m4-6v6',
    Edit: 'm14 5 5 5M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15Z',
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={true}
    >
      <path d={paths[type]} />
      {type === 'Padel' &&
        [
          [12, 6],
          [16, 7],
          [10, 9],
          [14, 10],
          [17, 11],
          [11, 13],
          [14, 14],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={0.6} fill="currentColor" stroke="none" />
        ))}
    </svg>
  );
}
