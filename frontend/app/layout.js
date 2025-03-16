'use client';

import { Providers } from '@/components/Providers';
import './globals.css';
import { Inter, Poppins, Heebo, Rubik } from 'next/font/google';
import ParticleBackground from '@/components/ui/ParticleBackground';
import { metadata } from './metadata';

// הגדרת הפונטים
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

const heebo = Heebo({
  weight: ['400', '500', '600', '700'],
  subsets: ['hebrew', 'latin'],
  variable: '--font-heebo',
  display: 'swap',
});

const rubik = Rubik({
  weight: ['400', '500', '600', '700'],
  subsets: ['hebrew', 'latin'],
  variable: '--font-rubik',
  display: 'swap',
});

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl" className={`${inter.variable} ${poppins.variable} ${heebo.variable} ${rubik.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="min-h-screen bg-bg-primary text-text-primary">
        <Providers>
          <ParticleBackground />
          <main className="relative z-10">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
