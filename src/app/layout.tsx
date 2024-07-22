import { validateRequest } from '@/lib/auth';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import 'react-toastify/dist/ReactToastify.css';
import { logout_action } from './(auth)/_actions';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { Suspense } from 'react';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Tennis Trainer',
  description: 'Tennis coach training and drill tracking',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = await validateRequest();
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body>
        <Toaster />
        <header className="flex justify-between items-center py-2 px-3">
          <div className="text-3xl lowercase">Tennis Trainer</div>
          {user && (
            <form action={logout_action}>
              <button>logout</button>
            </form>
          )}
        </header>
        <main className="container mx-auto">{children}</main>
      </body>
    </html>
  );
}
