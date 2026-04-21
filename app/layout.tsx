import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EasyVendor - Build Your Store',
  description: 'Create and manage your online food store',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
