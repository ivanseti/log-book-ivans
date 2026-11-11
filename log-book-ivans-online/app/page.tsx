'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    supabase?.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
  }, []);
  return <main className="landing">
    <nav className="landing-nav"><div className="brand"><span className="brand-icon">I</span> Log book IvanS</div><Link className="button button-ghost" href="/login">{signedIn ? 'Buka dashboard' : 'Login'}</Link></nav>
    <section className="hero">
      <div className="eyebrow">PERSONAL ACTIVITY JOURNAL</div>
      <h1>Setiap kegiatan,<br/><span>tercatat dengan rapi.</span></h1>
      <p className="hero-copy">Dokumentasikan aktivitas harian, pantau waktu, dan simpan riwayat kegiatan dalam satu tempat.</p>
      <div className="hero-actions"><Link className="button button-primary" href="/login">Masuk ke Log book <span>→</span></Link><a className="text-link" href="#fitur">Lihat fitur</a></div>
      <div className="hero-foot"><span>●</span> Dashboard pribadi · Riwayat online · Laporan siap cetak</div>
    </section>
    <section className="feature-grid" id="fitur">
      <article className="feature"><div className="feature-icon">◷</div><h3>Catatan waktu</h3><p>Catat tanggal, jam mulai, jam selesai, dan durasi kegiatan.</p></article>
      <article className="feature"><div className="feature-icon">▤</div><h3>Riwayat tersimpan</h3><p>Data tersimpan di database online dan dapat dibuka setelah login.</p></article>
      <article className="feature"><div className="feature-icon">↓</div><h3>Unduh & cetak</h3><p>Ekspor kegiatan ke CSV atau cetak laporan menjadi PDF.</p></article>
    </section>
    <footer className="landing-footer">© {new Date().getFullYear()} Log book IvanS · Portal catatan kegiatan pribadi</footer>
  </main>;
}
