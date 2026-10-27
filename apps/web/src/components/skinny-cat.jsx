'use client';

/** A thin, hungry black-and-white cat: the gentle "you might be under-eating" mascot. */
export function SkinnyCat({ size = 34 }) {
  const fur = '#2b2b2f';
  const white = '#f4f4f6';
  const rib = '#5a5a62';
  const pink = '#ffb3c1';
  return (
    // Reuses the chubby cat's idle animations (breathing, blinking, tail, ears, head).
    <svg
      className="chubby-cat skinny-cat"
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-hidden="true"
    >
      {/* Thin tail drooping on the floor */}
      <path
        className="cat-tail"
        d="M24 36c5 1 9 0 10-3"
        fill="none"
        stroke={fur}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* Narrow body with a white chest and faint ribs */}
      <g className="cat-body">
        <ellipse cx="20" cy="28" rx="5.6" ry="8.6" fill={fur} />
        <ellipse cx="20" cy="29" rx="2.8" ry="6.4" fill={white} />
        <path
          d="M15.4 25.4q1.3.6 2.2.2M15.1 28q1.4.5 2.4.1M15.4 30.6q1.3.4 2.2 0M24.6 25.4q-1.3.6-2.2.2M24.9 28q-1.4.5-2.4.1M24.6 30.6q-1.3.4-2.2 0"
          fill="none"
          stroke={rib}
          strokeWidth="0.6"
          strokeLinecap="round"
        />
      </g>
      {/* Long skinny legs with white socks */}
      <path d="M17.4 34.5v3.2M22.6 34.5v3.2" stroke={fur} strokeWidth="1.8" strokeLinecap="round" />
      <ellipse cx="17.4" cy="38.1" rx="1.5" ry="0.9" fill={white} />
      <ellipse cx="22.6" cy="38.1" rx="1.5" ry="0.9" fill={white} />
      {/* Small head on a thin neck, ears drooping sadly */}
      <g className="cat-head">
        <path d="M18.6 19.5v2.5M21.4 19.5v2.5" stroke={fur} strokeWidth="1.8" />
        <g className="cat-ear cat-ear-left">
          <path d="M12.6 11.4 11.4 5.2l5.4 3.2Z" fill={fur} />
          <path d="M13.3 9.6 12.7 6.8l2.4 1.6Z" fill={pink} />
        </g>
        <g className="cat-ear cat-ear-right">
          <path d="M27.4 11.4 28.6 5.2l-5.4 3.2Z" fill={fur} />
          <path d="M26.7 9.6 27.3 6.8l-2.4 1.6Z" fill={pink} />
        </g>
        <ellipse cx="20" cy="13.6" rx="7.4" ry="6.8" fill={fur} />
        {/* Tuxedo blaze and muzzle */}
        <path d="M20 9.2q-2.6 4.4-3.8 7.6q3.8 3.6 7.6 0q-1.2-3.2-3.8-7.6Z" fill={white} />
        {/* Big pleading eyes with sad brows */}
        <g className="cat-eyes">
          <circle cx="16.8" cy="13.4" r="1.9" fill="#f2d14c" />
          <circle cx="23.2" cy="13.4" r="1.9" fill="#f2d14c" />
          <circle cx="16.8" cy="13.7" r="1.15" fill="#111" />
          <circle cx="23.2" cy="13.7" r="1.15" fill="#111" />
          <circle cx="17.3" cy="13.1" r="0.45" fill="#fff" />
          <circle cx="23.7" cy="13.1" r="0.45" fill="#fff" />
        </g>
        <path
          d="M14.9 10.6l2.8.9M25.1 10.6l-2.8.9"
          stroke={white}
          strokeWidth="0.7"
          strokeLinecap="round"
        />
        <path d="M19.2 16.4h1.6l-.8.9Z" fill={pink} />
        <path
          d="M18.6 18.6q1.4-.9 2.8 0"
          fill="none"
          stroke="#111"
          strokeWidth="0.6"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
