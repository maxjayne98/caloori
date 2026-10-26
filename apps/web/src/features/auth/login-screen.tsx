'use client';
import { Button } from '@nourish/ui';
import { ArrowUpRight, LockKeyhole } from 'lucide-react';

function NourishCompanion() {
  return (
    <div className="login-art" aria-hidden="true">
      <div className="companion-orbit orbit-one" />
      <div className="companion-orbit orbit-two" />
      <span className="companion-spark spark-one">✦</span>
      <span className="companion-spark spark-two">✦</span>
      <svg className="nourish-companion" viewBox="0 0 280 260" fill="none">
        <defs>
          <linearGradient
            id="heart-glaze"
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
            fill="url(#heart-glaze)"
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
function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.23c1.89-1.74 2.99-4.3 2.99-7.36Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.96-.9 6.61-2.41l-3.23-2.51c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.41 13.92a6 6 0 0 1 0-3.84V7.49H3.07a10 10 0 0 0 0 9.02l3.34-2.59Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.96c1.47 0 2.79.5 3.82 1.5l2.86-2.86A9.58 9.58 0 0 0 12 2a10 10 0 0 0-8.93 5.49l3.34 2.59C7.2 7.72 9.4 5.96 12 5.96Z"
      />
    </svg>
  );
}
export function LoginScreen({
  ready,
  busy,
  checking,
  message,
  onGoogle,
  onPreview,
}: {
  ready: boolean;
  busy: boolean;
  checking: boolean;
  message: string;
  onGoogle: () => void;
  onPreview?: () => void;
}) {
  return (
    <main className="app login-page">
      <header className="login-header">
        <div className="brand">
          <span>♥</span>nourish
        </div>
        <span className="login-header-note">A little more you.</span>
      </header>
      <div className="login-content">
        <NourishCompanion />
        <section className="login-copy">
          <p className="login-eyebrow">SMALL STEPS. GOOD THINGS.</p>
          <h1>
            Make room
            <br />
            for you.
          </h1>
          <p>
            Your food, your movement, your progress.
            <br />
            One happy little place.
          </p>
        </section>
        <section className="login-actions" aria-label="Sign in">
          <Button
            variant="unstyled"
            className="google-signin"
            disabled={!ready || busy || checking}
            onClick={onGoogle}
          >
            <GoogleMark />
            <span>
              {checking
                ? 'Getting things ready…'
                : busy
                  ? 'Connecting to Google…'
                  : 'Continue with Google'}
            </span>
            <ArrowUpRight size={18} aria-hidden="true" />
          </Button>
          <p className="login-account-note">New here? Your account is created automatically.</p>
          {message && (
            <p className="login-message" role="alert">
              {message}
            </p>
          )}
          {!ready && !checking && (
            <p className="login-setup-note">
              Google sign-in will be available once the secure connection is set up.
            </p>
          )}
          {onPreview && (
            <Button variant="unstyled" className="login-preview" onClick={onPreview}>
              Explore the local preview <ArrowUpRight size={14} aria-hidden="true" />
            </Button>
          )}
        </section>
      </div>
      <footer className="login-footer">
        <LockKeyhole size={14} aria-hidden="true" />
        <span>Your space. Your pace.</span>
      </footer>
    </main>
  );
}
