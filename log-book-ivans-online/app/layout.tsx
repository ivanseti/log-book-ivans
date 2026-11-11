import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Log book IvanS',
  description: 'Catatan kegiatan harian pribadi IvanS',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
