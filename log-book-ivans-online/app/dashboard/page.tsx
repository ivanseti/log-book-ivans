'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

type Entry = { id: string; user_id: string; activity_date: string; start_time: string; end_time: string; title: string; category: string; description: string | null; created_at: string };
const today = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const dateLabel = (s:string) => new Date(`${s}T00:00:00`).toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'});
const minutes = (a:string,b:string) => { const [ah,am]=a.split(':').map(Number),[bh,bm]=b.split(':').map(Number); let n=bh*60+bm-(ah*60+am); return n<0?n+1440:n; };
const durationLabel = (n:number) => `${Math.floor(n/60)}j ${n%60}m`;
const escapeCSV = (v:unknown) => `"${String(v??'').replace(/"/g,'""')}"`;

export default function Dashboard() {
  const router=useRouter();
  const [userEmail,setUserEmail]=useState('');
  const [entries,setEntries]=useState<Entry[]>([]);
  const [loading,setLoading]=useState(true);
  const [notice,setNotice]=useState('');
  const [filter,setFilter]=useState('');
  const [editing,setEditing]=useState<string|null>(null);
  const [now,setNow]=useState(new Date());
  const [form,setForm]=useState({activity_date:today(),start_time:'08:00',end_time:'09:00',title:'',category:'Pekerjaan',description:''});
  const [busy,setBusy]=useState(false);

  async function refresh() {
    if(!supabase) { setNotice('Konfigurasi Supabase belum lengkap. Periksa environment variables.'); setLoading(false); return; }
    const {data:{session}}=await supabase.auth.getSession();
    if(!session){router.replace('/login');return;}
    setUserEmail(session.user.email||'');
    const {data,error}=await supabase.from('activities').select('*').order('activity_date',{ascending:false}).order('start_time',{ascending:false});
    if(error)setNotice(error.message); else setEntries((data||[]) as Entry[]);
    setLoading(false);
  }
  useEffect(()=>{refresh();const timer=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(timer);},[]);
  const visible=useMemo(()=>entries.filter(e=>!filter||e.activity_date===filter),[entries,filter]);
  const totalMinutes=entries.reduce((sum,e)=>sum+minutes(e.start_time,e.end_time),0);
  const todayCount=entries.filter(e=>e.activity_date===today()).length;
  const activeDays=new Set(entries.map(e=>e.activity_date)).size;
  function setField(k:keyof typeof form,v:string){setForm(old=>({...old,[k]:v}));}
  async function save(e:FormEvent){
    e.preventDefault();if(!supabase)return;
    if(form.start_time===form.end_time){setNotice('Jam mulai dan selesai tidak boleh sama.');return;}
    setBusy(true);setNotice('');
    const payload={activity_date:form.activity_date,start_time:form.start_time,end_time:form.end_time,title:form.title.trim(),category:form.category.trim(),description:form.description.trim()||null};
    const result=editing
      ? await supabase.from('activities').update(payload).eq('id',editing)
      : await supabase.from('activities').insert(payload);
    setBusy(false);
    if(result.error){setNotice(result.error.message);return;}
    setForm({activity_date:today(),start_time:'08:00',end_time:'09:00',title:'',category:'Pekerjaan',description:''});setEditing(null);setNotice('Kegiatan berhasil disimpan.');await refresh();
  }
  function editEntry(e:Entry){setEditing(e.id);setForm({activity_date:e.activity_date,start_time:e.start_time.slice(0,5),end_time:e.end_time.slice(0,5),title:e.title,category:e.category,description:e.description||''});window.scrollTo({top:0,behavior:'smooth'});}
  async function deleteEntry(id:string){if(!supabase||!confirm('Hapus catatan kegiatan ini?'))return;const {error}=await supabase.from('activities').delete().eq('id',id);if(error)setNotice(error.message);else{setNotice('Catatan dihapus.');await refresh();}}
  async function logout(){await supabase?.auth.signOut();router.push('/');router.refresh();}
  function downloadCSV(){
    if(!entries.length){setNotice('Belum ada data untuk diunduh.');return;}
    const rows=[['Tanggal','Jam mulai','Jam selesai','Kegiatan','Kategori','Deskripsi','Durasi'],...entries.map(e=>[e.activity_date,e.start_time,e.end_time,e.title,e.category,e.description||'',durationLabel(minutes(e.start_time,e.end_time))])];
    const csv='\ufeff'+rows.map(r=>r.map(escapeCSV).join(';')).join('\r\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));const a=document.createElement('a');a.href=url;a.download='Log-book-IvanS.csv';a.click();URL.revokeObjectURL(url);
  }
  return <main className="dashboard-shell">
    <aside className="sidebar"><a href="/" className="brand"><span className="brand-icon">I</span><span>Log book IvanS</span></a><div className="side-caption">MENU UTAMA</div><div className="side-link active">▦ <span>Dashboard</span></div><div className="side-link">▤ <span>Catatan kegiatan</span></div><div className="side-bottom">Personal Logbook<br/>Akses pribadi</div></aside>
    <section className="dash-main">
      <header className="dash-header"><div><div className="eyebrow">RUANG AKTIVITAS PRIBADI</div><h1>Dashboard</h1><p className="muted">Login sebagai {userEmail||'pengguna'}</p></div><div className="header-actions"><button className="button button-light" onClick={downloadCSV}>↓ Unduh CSV</button><button className="button button-light" onClick={()=>window.print()}>Cetak / PDF</button><button className="button button-outline" onClick={logout}>Keluar</button></div></header>
      <div className="stat-grid"><article className="stat-card"><span>Total kegiatan</span><strong>{entries.length}</strong><small>Seluruh catatan</small></article><article className="stat-card"><span>Kegiatan hari ini</span><strong>{todayCount}</strong><small>{dateLabel(today())}</small></article><article className="stat-card"><span>Total durasi</span><strong>{(totalMinutes/60).toFixed(1)}j</strong><small>Akumulasi durasi</small></article><article className="stat-card"><span>Hari aktif</span><strong>{activeDays}</strong><small>Hari dengan catatan</small></article></div>
      <section className="clock-card"><div><div className="eyebrow light-eyebrow">WAKTU SAAT INI</div><div className="clock-date">{now.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div><div className="clock-time">{now.toLocaleTimeString('id-ID')}</div></div><div className="clock-mark">◷</div></section>
      <section className="panel form-panel"><div className="panel-heading"><div><div className="eyebrow">DOKUMENTASI</div><h2>{editing?'Edit kegiatan':'Tambah kegiatan'}</h2></div><span className="pill">Catatan pribadi</span></div>
        <form onSubmit={save} className="activity-form">
          <label>Tanggal kegiatan<input type="date" value={form.activity_date} onChange={e=>setField('activity_date',e.target.value)} required/></label>
          <label>Kategori<input value={form.category} onChange={e=>setField('category',e.target.value)} required placeholder="Pekerjaan, belajar, pribadi"/></label>
          <label>Jam mulai<input type="time" value={form.start_time} onChange={e=>setField('start_time',e.target.value)} required/></label>
          <label>Jam selesai<input type="time" value={form.end_time} onChange={e=>setField('end_time',e.target.value)} required/></label>
          <label className="span-two">Nama kegiatan<input value={form.title} onChange={e=>setField('title',e.target.value)} required placeholder="Contoh: Menyusun laporan harian"/></label>
          <label className="span-two">Deskripsi / hasil kegiatan<textarea value={form.description} onChange={e=>setField('description',e.target.value)} rows={3} placeholder="Tuliskan aktivitas, hasil, atau catatan penting..."/></label>
          <div className="form-buttons span-two"><button className="button button-primary" disabled={busy}>{busy?'Menyimpan...':editing?'Simpan perubahan':'Simpan kegiatan'}</button>{editing&&<button type="button" className="button button-light" onClick={()=>{setEditing(null);setForm({activity_date:today(),start_time:'08:00',end_time:'09:00',title:'',category:'Pekerjaan',description:''})}}>Batal edit</button>}</div>
        </form>
        {notice&&<div className="notice">{notice}</div>}
      </section>
      <section className="panel history-panel"><div className="panel-heading"><div><div className="eyebrow">ARSIP AKTIVITAS</div><h2>Riwayat kegiatan</h2></div><input className="filter-input" type="date" value={filter} onChange={e=>setFilter(e.target.value)} aria-label="Filter tanggal"/></div>
        {loading?<p className="muted">Memuat data...</p>:visible.length===0?<div className="empty-state">Belum ada kegiatan pada pilihan tanggal ini.</div>:<div className="table-scroll"><table><thead><tr><th>Tanggal</th><th>Waktu</th><th>Kegiatan</th><th>Kategori</th><th>Durasi</th><th className="no-print">Aksi</th></tr></thead><tbody>{visible.map(e=><tr key={e.id}><td>{dateLabel(e.activity_date)}</td><td>{e.start_time.slice(0,5)}–{e.end_time.slice(0,5)}</td><td><b>{e.title}</b><div className="description-cell">{e.description}</div></td><td><span className="pill">{e.category}</span></td><td>{durationLabel(minutes(e.start_time,e.end_time))}</td><td className="actions-cell no-print"><button onClick={()=>editEntry(e)}>Edit</button><button className="delete-action" onClick={()=>deleteEntry(e.id)}>Hapus</button></td></tr>)}</tbody></table></div>}
      </section>
      <p className="privacy-note">Data kegiatan tersimpan di Supabase dan dilindungi Row Level Security. Setiap akun hanya dapat membaca dan mengelola catatannya sendiri.</p>
    </section>
  </main>;
}
