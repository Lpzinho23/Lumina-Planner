import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeContextProvider } from '@/context/ThemeContext';
import { CssBaseline } from '@mui/material';
import AppShell from '@/components/AppShell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Lumina Planner — Finanças no celular',
    template: '%s | Lumina Planner',
  },
  description: 'Aplicação mobile para controle financeiro pessoal.',
  applicationName: 'Lumina Planner',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Lumina Planner',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-maskable.svg', type: 'image/svg+xml', sizes: '512x512' },
    ],
    apple: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#7c3aed',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ThemeContextProvider>
            <AuthProvider>
                <CssBaseline />
                <AppShell>
                    {children}
                </AppShell>
            </AuthProvider>
        </ThemeContextProvider>
      </body>
    </html>
  );
}