'use client';

/** A round orange cat sitting contentedly: the gentle "a bit over today" mascot. */
export function ChubbyCat({ size = 34 }) {
  const fur = '#ff8a1f';
  const stripe = '#e0660b';
  const cream = '#ffe1bf';
  const pink = '#ffb3a1';
  const ink = '#4a2a12';
  return (
    <svg className="chubby-cat" width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      {/* Tail curling up beside the body */}
      <path
        className="cat-tail"
        d="M30 34c7 0 8-9 3-10"
        fill="none"
        stroke={fur}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      {/* Body, belly, paws and side stripes breathe together */}
      <g className="cat-body">
        <ellipse cx="20" cy="28.5" rx="12.5" ry="10" fill={fur} />
        <ellipse cx="20" cy="30.5" rx="7" ry="6.5" fill={cream} />
        <path
          d="M8.6 26.5l2.6.8M8.4 30.2l2.8.3M31.4 26.5l-2.6.8M31.6 30.2l-2.8.3"
          stroke={stripe}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </g>
      <ellipse cx="15.5" cy="37.3" rx="3.2" ry="1.9" fill={cream} />
      <ellipse cx="24.5" cy="37.3" rx="3.2" ry="1.9" fill={cream} />
      {/* Head with ears and face tilts gently */}
      <g className="cat-head">
        <g className="cat-ear cat-ear-left">
          <path d="M11.5 11 12.5 2.8l6 5.2Z" fill={fur} />
          <path d="M13.3 8.6 13.8 5l2.6 2.4Z" fill={pink} />
        </g>
        <g className="cat-ear cat-ear-right">
          <path d="M28.5 11 27.5 2.8l-6 5.2Z" fill={fur} />
          <path d="M26.7 8.6 26.2 5l-2.6 2.4Z" fill={pink} />
        </g>
        <circle cx="20" cy="15" r="9.2" fill={fur} />
        <path
          d="M20 6.6v2.8M17.4 7.2l.7 2.4M22.6 7.2l-.7 2.4"
          stroke={stripe}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {/* Big round open eyes with sparkles; they blink now and then */}
        <g className="cat-eyes">
          <circle cx="16.6" cy="14.6" r="1.9" fill={ink} />
          <circle cx="23.4" cy="14.6" r="1.9" fill={ink} />
          <circle cx="17.2" cy="13.9" r="0.65" fill="#fff" />
          <circle cx="24" cy="13.9" r="0.65" fill="#fff" />
        </g>
        <path d="M19 17.4h2l-1 1.1Z" fill="#ff7f8f" />
        <path
          d="M20 18.5q-.6 1.2-1.8.8M20 18.5q.6 1.2 1.8.8"
          fill="none"
          stroke={ink}
          strokeWidth="0.9"
          strokeLinecap="round"
        />
        <circle cx="14.6" cy="18.2" r="1.3" fill={pink} opacity="0.8" />
        <circle cx="25.4" cy="18.2" r="1.3" fill={pink} opacity="0.8" />
      </g>
    </svg>
  );
}
