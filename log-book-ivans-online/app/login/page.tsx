'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login'|'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function submit(e: FormEvent) {
    e.preventDefault(); setMessage('');
    if (!supabase) { setMessage('Konfigurasi Supabase belum diisi. Ikuti README untuk menyiapkan environment variables.'); return; }
    setBusy(true);
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (result.error) { setMessage(result.error.message); return; }
    if (mode === 'signup' && !result.data.session) {
      setMessage('Akun dibuat. Periksa email untuk konfirmasi, lalu login.');
      return;
    }
    router.push('/dashboard'); router.refresh();
  }
  return <main className="auth-shell"><div className="auth-card">
    <Link href="/" className="back-link">← Kembali ke beranda</Link>
    <div className="brand auth-brand"><span className="brand-icon">I</span> Log book IvanS</div>
    <div className="eyebrow">AREA PRIBADI</div>
    <h1>{mode === 'login' ? 'Selamat datang' : 'Buat akun'}</h1>
    <p className="muted">{mode === 'login' ? 'Login untuk membuka dashboard dan catatan kegiatan.' : 'Daftarkan akun untuk mulai menggunakan Log book IvanS.'}</p>
    <form onSubmit={submit}>
      <label className="field-label">Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="nama@email.com" autoComplete="email" /></label>
      <label className="field-label">Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} placeholder="Minimal 6 karakter" autoComplete={mode==='login'?'current-password':'new-password'} /></label>
      {message && <div className="notice">{message}</div>}
      <button className="button button-primary full" disabled={busy}>{busy ? 'Memproses...' : mode==='login' ? 'Login' : 'Daftar akun'}</button>
    </form>
    <p className="switch-mode">{mode==='login'?'Belum punya akun?':'Sudah punya akun?'} <button onClick={()=>{setMode(mode==='login'?'signup':'login');setMessage('')}}>{mode==='login'?'Daftar di sini':'Login'}</button></p>
    <p className="small-note">Catatan kegiatan hanya dapat diakses oleh pengguna yang sudah login dan hanya pemilik data yang dapat mengelolanya.</p>
  </div></main>;
}
