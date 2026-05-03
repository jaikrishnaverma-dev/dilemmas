import './globals.css';
import { AuthProvider } from '@/modules/auth/AuthContext';

export const metadata = {
  title: 'Dilemmas — Your side deserves to be heard. ⚖️',
  description: 'Submit real-life dilemmas anonymously. Your side deserves to be heard.',
  keywords: 'verdict, opinion, judge, indian gen z, dilemma, anonymous, hinglish',
  openGraph: {
    title: 'Dilemmas',
    description: 'Your side deserves to be heard.',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0f',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
