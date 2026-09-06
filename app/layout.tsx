import type { Metadata } from 'next';
import './globals.css'; // Global styles
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'Prayatna Mathematics - Premier Coaching Platform',
  description: 'Premier coaching platform for Class 11 & 12 Board, JEE, CUET & NDA Mathematics preparation.',

  verification: {
    google: '-K4r9xIH0kYDPDT_dFg0QOgxfgnT12qgRCgeusw8Wdo',
  },

  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo.svg', type: 'image/svg+xml' },
      { url: '/icon.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [
      { url: '/icon.png', sizes: '192x192' },
    ],
  },

  openGraph: {
    title: 'Prayatna Mathematics - Premier Coaching Platform',
    description: 'Premier coaching platform for Class 11 & 12 Board, JEE, CUET & NDA Mathematics preparation.',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'Prayatna Mathematics Official Logo',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Prayatna Mathematics - Premier Coaching Platform',
    description: 'Premier coaching platform for Class 11 & 12 Board, JEE, CUET & NDA Mathematics preparation.',
    images: ['/logo.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
