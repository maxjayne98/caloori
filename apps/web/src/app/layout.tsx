import type { Metadata, Viewport } from 'next';
import { AppearanceProvider } from '@/providers/appearance-provider';
import './globals.css';
import '../styles/login.css';
import '../styles/select.css';
export const metadata: Metadata = {
  title: 'Nourish — Your daily nutrition',
  description: 'A little more mindful. Your simple daily nutrition companion.',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Nourish', statusBarStyle: 'default' },
  icons: { apple: '/icons/apple-touch-icon.png', icon: '/icons/icon-192.png' },
};
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f5f7' },
    { media: '(prefers-color-scheme: dark)', color: '#18181c' },
  ],
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppearanceProvider>{children}</AppearanceProvider>
      </body>
    </html>
  );
}
