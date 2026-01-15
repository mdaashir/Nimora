import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'Nimora - Student Portal',
    template: '%s | Nimora',
  },
  description:
    'Nimora - Modern Student Portal for PSG Tech. Track attendance, view CGPA, check timetables, and more.',
  keywords: [
    'nimora',
    'student portal',
    'psg tech',
    'ecampus',
    'attendance',
    'cgpa',
    'timetable',
  ],
  authors: [{ name: 'mdaashir' }],
  creator: 'mdaashir',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    title: 'Nimora - Student Portal',
    description: 'Modern Student Portal for PSG Tech',
    siteName: 'Nimora',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
