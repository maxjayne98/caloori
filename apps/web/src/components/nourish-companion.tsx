'use client';
import { useId } from 'react';
export function NourishCompanion() {
  const glazeId = useId();
  return (
    <div className="login-art" aria-hidden="true">
      <div className="companion-orbit orbit-one" />
      <div className="companion-orbit orbit-two" />
      <span className="companion-spark spark-one">✦</span>
      <span className="companion-spark spark-two">✦</span>
      <svg className="nourish-companion" viewBox="0 0 280 260" fill="none">
        <defs>
          <linearGradient
            id={glazeId}
            x1="80"
            y1="50"
            x2="200"
            y2="220"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity=".38" />
            <stop offset=".5" stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="black" stopOpacity=".12" />
          </linearGradient>
        </defs>
        <ellipse
          className="companion-shadow"
          cx="140"
          cy="235"
          rx="61"
          ry="9"
          fill="currentColor"
          opacity=".09"
        />
        <g className="companion-body">
          <path
            d="M140 211C125 201 48 153 48 99C48 49 110 30 140 73C170 30 232 49 232 99C232 153 155 201 140 211Z"
            fill="currentColor"
          />
          <path
            d="M140 211C125 201 48 153 48 99C48 49 110 30 140 73C170 30 232 49 232 99C232 153 155 201 140 211Z"
            fill={`url(#${glazeId})`}
          />
          <path
            d="M72 93C75 77 89 70 103 73"
            stroke="white"
            strokeOpacity=".5"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <g className="companion-eyes" stroke="#462434" strokeWidth="7" strokeLinecap="round">
            <path d="M115 117V124M166 117V124" />
          </g>
          <path
            d="M128 142C135 151 146 151 153 142"
            stroke="#462434"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <ellipse cx="100" cy="138" rx="11" ry="6" fill="white" opacity=".25" />
          <ellipse cx="181" cy="138" rx="11" ry="6" fill="white" opacity=".25" />
        </g>
      </svg>
      <div className="companion-note">
        <span /> A little better, every day
      </div>
    </div>
  );
}
