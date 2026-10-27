'use client';

/** A round, lazy orange cat lounging after a big meal: the gentle "a bit over today" mascot. */
export function ChubbyCat({ size = 34 }) {
  const fur = '#ff8a1f';
  const stripe = '#c75400';
  const cream = '#ffe1bf';
  const pink = '#ffb3a1';
  const ink = '#4a2a12';
  return (
    <svg className="chubby-cat" width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      {/* Tail curling up beside the body */}
      <path
        className="cat-tail"
        d="M31 34c7 0 8-9 3-10"
        fill="none"
        stroke={fur}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      {/* Wide, slumped body with a full belly; breathes slowly */}
      <g className="cat-body">
        <ellipse cx="20" cy="29.5" rx="14" ry="9.3" fill={fur} />
        <ellipse cx="20" cy="31" rx="8" ry="6.6" fill={cream} />
        <path
          d="M7 27l3 .6M6.6 30.6l3.2.2M7.4 34l2.8-.5M33 27l-3 .6M33.4 30.6l-3.2.2M32.6 34l-2.8-.5"
          stroke={stripe}
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </g>
      {/* Paws splayed out in front */}
      <ellipse cx="13.5" cy="37.6" rx="3.6" ry="1.8" fill={cream} />
      <ellipse cx="26.5" cy="37.6" rx="3.6" ry="1.8" fill={cream} />
      {/* Head with ears and face tilts gently */}
      <g className="cat-head">
        <g className="cat-ear cat-ear-left">
          <path d="M11.2 12 12.2 3.8l6 5.2Z" fill={fur} />
          <path d="M13 9.6 13.5 6l2.6 2.4Z" fill={pink} />
        </g>
        <g className="cat-ear cat-ear-right">
          <path d="M28.8 12 27.8 3.8l-6 5.2Z" fill={fur} />
          <path d="M27 9.6 26.5 6l-2.6 2.4Z" fill={pink} />
        </g>
        <ellipse cx="20" cy="16" rx="10" ry="9" fill={fur} />
        {/* Bold forehead and cheek stripes */}
        <path
          d="M20 7.4v3M17.2 8l.8 2.6M22.8 8l-.8 2.6M10.6 16.2l2.4.4M10.8 18.8l2.2-.2M29.4 16.2l-2.4.4M29.2 18.8l-2.2-.2"
          stroke={stripe}
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        {/* Lazy half-lidded eyes; the whole group still blinks */}
        <g className="cat-eyes">
          <ellipse
            cx="16.4"
            cy="15.4"
            rx="2.6"
            ry="2.4"
            fill="#fff"
            stroke={ink}
            strokeWidth="0.6"
          />
          <ellipse
            cx="23.6"
            cy="15.4"
            rx="2.6"
            ry="2.4"
            fill="#fff"
            stroke={ink}
            strokeWidth="0.6"
          />
          <circle cx="16.8" cy="16.3" r="1.1" fill={ink} />
          <circle cx="23.2" cy="16.3" r="1.1" fill={ink} />
          {/* Heavy upper lids cover the top half of each eye */}
          <path d="M13.5 15.4a2.9 2.7 0 0 1 5.8 0Z" fill={fur} />
          <path d="M20.7 15.4a2.9 2.7 0 0 1 5.8 0Z" fill={fur} />
          <path
            d="M13.6 15.4h5.6M20.8 15.4h5.6"
            stroke={ink}
            strokeWidth="0.8"
            strokeLinecap="round"
          />
        </g>
        {/* Puffy muzzle, little nose and a content, flat mouth */}
        <ellipse cx="18.3" cy="20" rx="2.5" ry="1.9" fill={cream} />
        <ellipse cx="21.7" cy="20" rx="2.5" ry="1.9" fill={cream} />
        <path d="M19 18.3h2l-1 1.1Z" fill="#ff7f8f" />
        <path
          d="M18.2 21.4q1.8.8 3.6 0"
          fill="none"
          stroke={ink}
          strokeWidth="0.8"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
