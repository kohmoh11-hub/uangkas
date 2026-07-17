import React, { useState, useRef } from 'react';
import { Student, CashPayment, ZarkasiPayment, TransactionLog, Announcement } from '../types';
import { ACADEMIC_MONTHS } from '../data';
import {
  User, Calendar, DollarSign, CheckCircle2, Clock,
  Printer, Megaphone, FileText, TrendingUp, AlertCircle, ArrowLeft, ChevronRight, HelpCircle
} from 'lucide-react';

interface GuardianDashboardProps {
  studentId: string;
  students: Student[];
  cashPayments: CashPayment[];
  zarkasiPayments: ZarkasiPayment[];
  logs: TransactionLog[];
  announcements: Announcement[];
  onLogout: () => void;
}

export default function GuardianDashboard({
  studentId,
  students,
  cashPayments,
  zarkasiPayments,
  logs,
  announcements,
  onLogout
}: GuardianDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'announcements' | 'receipt'>('overview');
  
  const student = students.find(s => s.id === studentId);
  if (!student) {
    return (
      <div className="p-8 text-center bg-white rounded-lg shadow">
        <p className="text-red-600 font-bold">Error: Data Santri tidak ditemukan.</p>
        <button onClick={onLogout} className="mt-4 bg-emerald-700 text-white px-4 py-2 rounded">Kembali</button>
      </div>
    );
  }

  // Payments logic
  const cashPay = cashPayments.find(p => p.studentId === studentId);
  const paidMonthsCount = cashPay ? Object.values(cashPay.months).filter(Boolean).length : 0;
  const CASH_MONTHLY_RATE = 5000;
  const totalCashPaid = paidMonthsCount * CASH_MONTHLY_RATE;
  const totalCashExpected = 60000;
  const cashDebt = totalCashExpected - totalCashPaid;

  const zarkasiPay = zarkasiPayments.find(p => p.studentId === studentId);
  const zarkasiPaid = zarkasiPay ? zarkasiPay.amountPaid : 0;
  const ZARKASI_TARGET = 750000;
  const zarkasiDebt = ZARKASI_TARGET - zarkasiPaid;
  const zarkasiPct = Math.round((zarkasiPaid / ZARKASI_TARGET) * 100);

  // Filter logs for this specific student
  const studentLogs = logs.filter(l => l.studentName.toLowerCase() === student.name.toLowerCase());

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" id="guardian-dashboard-root">
      
      {/* Top Main Navbar */}
      <header className="bg-brand-green text-white border-b-4 border-slate-900 print:hidden">
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-brand-orange text-slate-950 font-black border-2 border-slate-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none text-sm uppercase tracking-widest">
              MIQ
            </div>
            <div>
              <h1 className="text-base font-black tracking-widest uppercase text-white">Portal Wali Santri Kelas 6C</h1>
              <p className="text-xs text-brand-orange font-bold uppercase tracking-wider mt-0.5">MI Qudsiyyah Kudus • Rosidul Mohtaz, M.Pd</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-xs font-black bg-brand-green-hover px-3.5 py-2 border-2 border-slate-950 text-brand-orange uppercase tracking-widest rounded-none">
              Hak Akses: <strong className="text-white font-black">Hanya Melihat</strong>
            </span>
            <button
              onClick={onLogout}
              className="bg-brand-orange hover:bg-brand-orange-hover text-slate-950 hover:text-white border-2 border-slate-950 font-black px-4 py-2 rounded-none text-xs uppercase tracking-widest transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            >
              Keluar Portal
            </button>
          </div>
        </div>
      </header>

      {/* Main Student Info Header */}
      <section className="bg-white border-b-3 border-slate-900 py-6 px-4 print:hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-brand-orange text-slate-950 border-3 border-slate-900 flex items-center justify-center font-black text-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none uppercase">
              {student.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-950 uppercase tracking-wider">{student.name}</h2>
              <p className="text-xs text-slate-600 font-bold uppercase tracking-wide mt-1">
                NISN: <span className="font-mono text-slate-950 font-black bg-slate-100 px-1 border border-slate-200">{student.nisn}</span> • Orang Tua: <span className="text-slate-950 font-black">{student.parentName}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-3 border-slate-900 p-1 bg-slate-100 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <button
              onClick={() => setActiveSubTab('overview')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-all rounded-none ${
                activeSubTab === 'overview' ? 'bg-brand-green text-white border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              Laporan Keuangan
            </button>
            <button
              onClick={() => setActiveSubTab('announcements')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-all rounded-none ${
                activeSubTab === 'announcements' ? 'bg-brand-green text-white border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              Pengumuman Kelas ({announcements.length})
            </button>
            <button
              onClick={() => setActiveSubTab('receipt')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-all rounded-none ${
                activeSubTab === 'receipt' ? 'bg-brand-green text-white border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              Cetak Kuitansi Resmi
            </button>
          </div>
        </div>
      </section>

      {/* Main Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6">
        
        {/* ----------------- SUB TAB 1: OVERVIEW ----------------- */}
        {activeSubTab === 'overview' && (
          <div className="space-y-6 print:hidden">
            {/* Warning Read Only Alert */}
            <div className="bg-blue-50 border-3 border-slate-900 p-4 rounded-none flex items-start space-x-3 text-slate-950 shadow-[4px_4px_0px_0px_#f97316]">
              <AlertCircle className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed font-semibold">
                <p className="font-black uppercase tracking-wider text-brand-green text-sm">Informasi Akun Wali Santri (Read-Only)</p>
                <p className="mt-1">
                  Anda berada dalam mode <strong>Pemantauan Wali Santri</strong>. Anda hanya dapat melihat status pembayaran dan mencetak kuitansi. Jika terdapat selisih pencatatan atau kesalahan input, harap hubungi Wali Kelas 6C <strong className="font-black underline text-brand-green">Bapak Rosidul Mohtaz, M.Pd</strong> untuk penyesuaian data.
                </p>
              </div>
            </div>

            {/* Split Progress Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Uang Kas Card */}
              <div className="bg-white rounded-none border-3 border-slate-900 shadow-[4px_4px_0px_0px_#0B4619] p-6 space-y-4">
                <div className="flex justify-between items-start pb-3 border-b-2 border-slate-200">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-brand-green" />
                    <h3 className="font-black text-slate-950 uppercase tracking-wider text-sm">Status Uang Kas Kelas</h3>
                  </div>
                  <span className="text-xs font-black text-white bg-brand-green border-2 border-slate-950 px-2 py-1 rounded-none uppercase tracking-wider shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                    Rp 5.000 / Bulan
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-50 p-3 rounded-none border-2 border-slate-900">
                    <span className="block text-[10px] text-slate-500 font-black uppercase tracking-wider">Target Setahun</span>
                    <span className="text-xs font-black text-slate-950">{formatCurrency(totalCashExpected)}</span>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-none border-2 border-slate-900">
                    <span className="block text-[10px] text-brand-green font-black uppercase tracking-wider">Telah Dibayar</span>
                    <span className="text-xs font-black text-brand-green">{formatCurrency(totalCashPaid)}</span>
                  </div>
                  <div className="bg-rose-50 p-3 rounded-none border-2 border-slate-900">
                    <span className="block text-[10px] text-rose-600 font-black uppercase tracking-wider">Sisa Tagihan</span>
                    <span className="text-xs font-black text-rose-700">{formatCurrency(cashDebt)}</span>
                  </div>
                </div>

                {/* Grid of Months showing checklist */}
                <div className="space-y-3">
                  <span className="block text-xs font-black text-slate-950 uppercase tracking-wider">Peta Iuran Bulanan Putra Anda (Juli 2026 - Juni 2027)</span>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {ACADEMIC_MONTHS.map((month) => {
                      const isPaid = cashPay?.months[month] || false;
                      return (
                        <div
                          key={month}
                          className={`p-2 rounded-none border-2 text-center flex flex-col items-center justify-center transition-all ${
                            isPaid
                              ? 'bg-brand-green/10 border-brand-green text-slate-950 shadow-[1px_1px_0px_0px_#0B4619]'
                              : 'bg-slate-50 border-slate-300 text-slate-400'
                          }`}
                        >
                          <span className="text-[10px] font-black uppercase tracking-wider">{month}</span>
                          <div className="mt-1">
                            {isPaid ? (
                              <CheckCircle2 className="w-4 h-4 text-brand-green" />
                            ) : (
                              <Clock className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-widest mt-1">
                            {isPaid ? 'Lunas' : 'Belum'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Zarkasi Contribution Card */}
              <div className="bg-white rounded-none border-3 border-slate-900 shadow-[4px_4px_0px_0px_rgba(249,115,22,1)] p-6 space-y-4">
                <div className="flex justify-between items-start pb-3 border-b-2 border-slate-200">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-brand-orange" />
                    <h3 className="font-black text-slate-950 uppercase tracking-wider text-sm">Status Iuran Zarkasi Kelas 6</h3>
                  </div>
                  <span className="text-xs font-black text-slate-950 bg-brand-orange border-2 border-slate-950 px-2 py-1 rounded-none uppercase tracking-wider shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                    Wajib Kelas 6
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-50 p-3 rounded-none border-2 border-slate-900">
                    <span className="block text-[10px] text-slate-500 font-black uppercase tracking-wider">Total Kewajiban</span>
                    <span className="text-xs font-black text-slate-950">{formatCurrency(ZARKASI_TARGET)}</span>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-none border-2 border-slate-900">
                    <span className="block text-[10px] text-brand-orange font-black uppercase tracking-wider">Telah Dibayar</span>
                    <span className="text-xs font-black text-slate-950">{formatCurrency(zarkasiPaid)}</span>
                  </div>
                  <div className="bg-rose-50 p-3 rounded-none border-2 border-slate-900">
                    <span className="block text-[10px] text-rose-600 font-black uppercase tracking-wider">Sisa Piutang</span>
                    <span className="text-xs font-black text-rose-700">{formatCurrency(zarkasiDebt)}</span>
                  </div>
                </div>

                {/* Progress bar container */}
                <div className="space-y-3.5 pt-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-black text-slate-950 uppercase tracking-wider">Persentase Kelunasan Zarkasi</span>
                    <span className="font-black text-brand-green uppercase tracking-wide bg-brand-green/10 border border-brand-green px-1.5 py-0.5">{zarkasiPct}% Lunas</span>
                  </div>
                  <div className="w-full bg-slate-100 h-4 rounded-none border-2 border-slate-900 overflow-hidden shadow-inner">
                    <div
                      className={`h-full transition-all duration-500 ${
                        zarkasiPaid >= ZARKASI_TARGET ? 'bg-brand-green' : 'bg-brand-orange'
                      }`}
                      style={{ width: `${zarkasiPct}%` }}
                    ></div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-none border-2 border-slate-900 text-slate-950 text-xs leading-relaxed space-y-1.5 font-semibold">
                    <div className="flex justify-between">
                      <span className="uppercase tracking-wider">Status Pembayaran:</span>
                      <strong className={`font-black uppercase tracking-wide ${
                        zarkasiPaid >= ZARKASI_TARGET ? 'text-brand-green' : 'text-brand-orange'
                      }`}>
                        {zarkasiPaid >= ZARKASI_TARGET ? 'LUNAS SEPENUHNYA' : zarkasiPaid > 0 ? 'BELUM LUNAS (DICICIL)' : 'BELUM BAYAR'}
                      </strong>
                    </div>
                    {zarkasiPaid < ZARKASI_TARGET && (
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                        Kekurangan sebesar <strong className="text-rose-600 font-black">{formatCurrency(zarkasiDebt)}</strong> dapat diangsur secara tunai dengan menemui Wali Kelas di madrasah.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Riwayat Mutasi Keuangan */}
            <div className="bg-white rounded-none border-3 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] overflow-hidden">
              <div className="p-4 bg-slate-100 border-b-2 border-slate-900 flex items-center space-x-2">
                <FileText className="w-4.5 h-4.5 text-slate-950" />
                <h3 className="font-black text-xs text-slate-950 uppercase tracking-widest">Catatan Mutasi Setoran Putra Anda</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-550 border-b-2 border-slate-900 text-slate-950 text-[10px] font-black uppercase tracking-widest">
                      <th className="py-3 px-4 border-r border-slate-200">Tanggal Pembayaran</th>
                      <th className="py-3 px-4 border-r border-slate-200">Kategori Iuran</th>
                      <th className="py-3 px-4 border-r border-slate-200">Keterangan / Deskripsi Transaksi</th>
                      <th className="py-3 px-4 text-right border-r border-slate-200">Jumlah Setoran</th>
                      <th className="py-3 px-4">Operator Pencatat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-slate-100 text-xs font-bold text-slate-900">
                    {studentLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px] border-r border-slate-100">
                          {new Date(log.date).toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-4 border-r border-slate-100">
                          <span className={`px-2 py-1 border border-slate-900 rounded-none text-[9px] font-black uppercase tracking-wider ${
                            log.type === 'Uang Kas' ? 'bg-brand-green/20 text-brand-green' : 'bg-brand-orange/20 text-slate-950'
                          }`}>
                            {log.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 italic border-r border-slate-100">{log.description}</td>
                        <td className="py-3 px-4 text-right font-black text-slate-950 border-r border-slate-100">{formatCurrency(log.amount)}</td>
                        <td className="py-3 px-4 text-slate-600 font-extrabold uppercase tracking-wide">{log.operator}</td>
                      </tr>
                    ))}
                    {studentLogs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-slate-500 text-xs font-bold uppercase tracking-wider">
                          Belum ada transaksi pembayaran yang tercatat untuk putra Anda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- SUB TAB 2: ANNOUNCEMENTS ----------------- */}
        {activeSubTab === 'announcements' && (
          <div className="space-y-5 print:hidden">
            <h3 className="font-black text-sm text-slate-950 uppercase tracking-widest border-b-2 border-slate-950 pb-1 inline-block">Pengumuman & Informasi Terbaru</h3>
            {announcements.map((ann) => (
              <div key={ann.id} className="bg-white p-6 rounded-none border-3 border-slate-900 shadow-[4px_4px_0px_0px_#0B4619] space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="bg-brand-orange text-slate-950 text-[9px] font-black border border-slate-900 px-2 py-0.5 uppercase tracking-widest rounded-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">INFO KELAS</span>
                  <span className="text-slate-500 text-[10px] font-bold font-mono">{new Date(ann.date).toLocaleString('id-ID')}</span>
                </div>
                <h4 className="text-base font-black text-slate-950 uppercase tracking-wider">{ann.title}</h4>
                <p className="text-xs text-slate-700 leading-relaxed font-semibold whitespace-pre-wrap">{ann.content}</p>
                <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  <span>Wali Kelas 6C: <strong className="font-black text-brand-green underline">{ann.author}</strong></span>
                  <span>MI Qudsiyyah Kudus</span>
                </div>
              </div>
            ))}
            {announcements.length === 0 && (
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider text-center py-12 bg-white rounded-none border-3 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                Belum ada pengumuman kelas saat ini.
              </p>
            )}
          </div>
        )}

        {/* ----------------- SUB TAB 3: RECEIPT (PRINT PREVIEW) ----------------- */}
        {activeSubTab === 'receipt' && (
          <div className="space-y-4">
            {/* Control Panel (Hidden when printing) */}
            <div className="bg-slate-100 p-4 border-3 border-slate-900 rounded-none flex justify-between items-center print:hidden shadow-[4px_4px_0px_0px_#f97316]">
              <span className="text-xs text-slate-800 font-bold uppercase tracking-wider">
                Cetak kuitansi resmi sebagai PDF atau cetak langsung ke printer fisik.
              </span>
              <button
                onClick={handlePrint}
                className="bg-brand-orange hover:bg-brand-orange-hover text-slate-950 hover:text-white font-black text-xs py-2.5 px-4 border-2 border-slate-950 rounded-none flex items-center space-x-1.5 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none uppercase tracking-widest"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Simpan PDF</span>
              </button>
            </div>

            {/* Official Receipt Box */}
            <div className="bg-white border-4 border-slate-900 rounded-none p-8 max-w-2xl mx-auto shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative print:border-none print:shadow-none print:p-0 font-sans">
              {/* Header */}
              <div className="text-center pb-6 border-b-4 border-double border-slate-900">
                <h3 className="text-xs font-black tracking-widest text-slate-500 uppercase">KUITANSI PEMBAYARAN RESMI</h3>
                <h1 className="text-xl font-black text-slate-950 uppercase tracking-widest mt-1">MADRASAH IBTIDAIYAH QUDSIYYAH</h1>
                <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mt-0.5">KUDUS, JAWA TENGAH, INDONESIA</p>
                <p className="text-xs font-black text-brand-green mt-2 tracking-widest bg-brand-green/10 border border-brand-green inline-block px-3 py-1 uppercase">REKAPITULASI KEUANGAN KELAS 6C</p>
              </div>

              {/* Invoice meta info */}
              <div className="grid grid-cols-2 gap-4 py-6 border-b-2 border-slate-900 text-xs">
                <div className="space-y-1 text-slate-950">
                  <p className="text-slate-500 font-black uppercase text-[10px] tracking-wider">Identitas Santri</p>
                  <p className="font-black uppercase text-sm tracking-wide text-brand-green">{student.name}</p>
                  <p className="font-bold">NISN: <span className="font-mono">{student.nisn}</span></p>
                  <p className="font-bold">Wali Santri: {student.parentName}</p>
                </div>
                <div className="space-y-1 text-right text-slate-950">
                  <p className="text-slate-500 font-black uppercase text-[10px] tracking-wider">Sistem Informasi Madrasah</p>
                  <p className="font-black uppercase text-slate-950">Wali Kelas: Rosidul Mohtaz, M.Pd</p>
                  <p className="font-bold uppercase tracking-wider text-[11px]">Tahun Ajaran: 2026/2027</p>
                  <p className="text-slate-500 font-mono text-[9px] uppercase tracking-wider mt-1">SISTEM-ID: MIQ-6C-{student.id}</p>
                </div>
              </div>

              {/* Table details */}
              <div className="py-6 space-y-4">
                <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider border-l-3 border-brand-orange pl-2">Rincian Status Pembayaran</h4>
                
                <table className="w-full text-xs text-left border-collapse border-2 border-slate-950">
                  <thead>
                    <tr className="border-b-2 border-slate-950 bg-slate-100 text-slate-950 font-black uppercase text-[10px] tracking-widest">
                      <th className="py-2.5 px-3 border-r border-slate-950">Jenis Kewajiban</th>
                      <th className="py-2.5 px-3 text-right border-r border-slate-950">Target Kewajiban</th>
                      <th className="py-2.5 px-3 text-right border-r border-slate-950">Jumlah Terbayar</th>
                      <th className="py-2.5 px-3 text-right border-r border-slate-950">Sisa Tagihan</th>
                      <th className="py-2.5 px-3 text-center">Persentase</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-slate-950 text-slate-900 font-bold">
                    <tr>
                      <td className="py-3 px-3 border-r border-slate-950">
                        <p className="font-black text-slate-950 uppercase tracking-wide">Uang Kas Kelas 6C</p>
                        <p className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5">Terbayar {paidMonthsCount} dari 12 Bulan (Rp 5.000/bln)</p>
                      </td>
                      <td className="py-3 px-3 text-right border-r border-slate-950">{formatCurrency(totalCashExpected)}</td>
                      <td className="py-3 px-3 text-right text-brand-green font-black border-r border-slate-950">{formatCurrency(totalCashPaid)}</td>
                      <td className="py-3 px-3 text-right text-rose-600 font-black border-r border-slate-950">{formatCurrency(cashDebt)}</td>
                      <td className="py-3 px-3 text-center">{Math.round((totalCashPaid/totalCashExpected)*100)}%</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 border-r border-slate-950">
                        <p className="font-black text-slate-950 uppercase tracking-wide">Iuran Zarkasi Kelas 6</p>
                        <p className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5">Iuran Wajib Akhir Jenjang Kelas 6</p>
                      </td>
                      <td className="py-3 px-3 text-right border-r border-slate-950">{formatCurrency(ZARKASI_TARGET)}</td>
                      <td className="py-3 px-3 text-right text-brand-green font-black border-r border-slate-950">{formatCurrency(zarkasiPaid)}</td>
                      <td className="py-3 px-3 text-right text-rose-600 font-black border-r border-slate-950">{formatCurrency(zarkasiDebt)}</td>
                      <td className="py-3 px-3 text-center">{zarkasiPct}%</td>
                    </tr>
                    <tr className="border-t-2 border-slate-950 bg-slate-50 font-black text-slate-950 uppercase tracking-wider">
                      <td className="py-3.5 px-3 border-r border-slate-950 text-sm">JUMLAH REKAP</td>
                      <td className="py-3.5 px-3 text-right border-r border-slate-950 text-sm">{formatCurrency(totalCashExpected + ZARKASI_TARGET)}</td>
                      <td className="py-3.5 px-3 text-right text-brand-green border-r border-slate-950 text-sm">{formatCurrency(totalCashPaid + zarkasiPaid)}</td>
                      <td className="py-3.5 px-3 text-right text-rose-700 border-r border-slate-950 text-sm">{formatCurrency(cashDebt + zarkasiDebt)}</td>
                      <td className="py-3.5 px-3 text-center text-sm">
                        {Math.round(((totalCashPaid + zarkasiPaid) / (totalCashExpected + ZARKASI_TARGET)) * 100)}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Note / Disclaimer */}
              <div className="bg-slate-50 p-4 border-2 border-slate-900 text-[10px] text-slate-700 font-semibold leading-relaxed uppercase tracking-wider rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <p className="font-black text-slate-950 mb-0.5">Catatan Penting:</p>
                <p className="font-normal lowercase">Dokumen ini diunduh secara mandiri oleh wali santri sebagai bukti rekapitulasi pembayaran resmi yang terdata pada basis data Wali Kelas 6C MI Qudsiyyah. Segala bentuk penyelarasan data rill kas wajib menyertakan bukti fisik kuitansi manual.</p>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-4 pt-10 text-xs">
                <div className="text-center space-y-3 flex flex-col items-center">
                  <p className="text-slate-500 font-black uppercase tracking-wider text-[10px]">Verifikasi Digital</p>
                  <div className="w-20 h-20 bg-slate-100 flex items-center justify-center border-2 border-slate-950 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {/* Simulated QR Code via micro grid */}
                    <div className="grid grid-cols-4 gap-1 p-2">
                      <div className="w-3 h-3 bg-slate-950"></div>
                      <div className="w-3 h-3 bg-slate-950"></div>
                      <div className="w-3 h-3 bg-slate-200"></div>
                      <div className="w-3 h-3 bg-slate-950"></div>
                      <div className="w-3 h-3 bg-slate-200"></div>
                      <div className="w-3 h-3 bg-slate-950"></div>
                      <div className="w-3 h-3 bg-slate-950"></div>
                      <div className="w-3 h-3 bg-slate-200"></div>
                      <div className="w-3 h-3 bg-slate-950"></div>
                      <div className="w-3 h-3 bg-slate-200"></div>
                      <div className="w-3 h-3 bg-slate-950"></div>
                      <div className="w-3 h-3 bg-slate-950"></div>
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-500 font-mono font-black uppercase tracking-widest">TERKUNCI & VALID</p>
                </div>
                <div className="text-center flex flex-col justify-between h-full pt-1">
                  <p className="text-slate-700 font-black uppercase tracking-wider">Kudus, {new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                  <div className="mt-8">
                    <p className="font-black text-slate-950 underline uppercase tracking-wider text-xs decoration-2">ROSIDUL MOHTAZ, M.Pd</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Wali Kelas 6C MI Qudsiyyah</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
