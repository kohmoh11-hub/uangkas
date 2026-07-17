import React, { useState } from 'react';
import { Student, CashPayment, ZarkasiPayment, TransactionLog, Announcement } from '../types';
import { ACADEMIC_MONTHS } from '../data';
import {
  Users, DollarSign, CheckCircle, Clock, Calendar,
  Search, Plus, Trash2, Edit2, AlertCircle, Megaphone,
  PlusCircle, RefreshCw, FileText, Check, ChevronDown, Award
} from 'lucide-react';

interface TeacherDashboardProps {
  students: Student[];
  cashPayments: CashPayment[];
  zarkasiPayments: ZarkasiPayment[];
  logs: TransactionLog[];
  announcements: Announcement[];
  onAddStudent: (name: string, nisn: string, parentName: string) => void;
  onEditStudent: (id: string, name: string, nisn: string, parentName: string) => void;
  onDeleteStudent: (id: string) => void;
  onToggleCash: (studentId: string, month: string) => void;
  onPayYearlyCash: (studentId: string) => void;
  onUpdateZarkasi: (studentId: string, amount: number, isInstallment: boolean) => void;
  onAddAnnouncement: (title: string, content: string) => void;
  onDeleteAnnouncement: (id: string) => void;
  onLogout: () => void;
}

export default function TeacherDashboard({
  students,
  cashPayments,
  zarkasiPayments,
  logs,
  announcements,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onToggleCash,
  onPayYearlyCash,
  onUpdateZarkasi,
  onAddAnnouncement,
  onDeleteAnnouncement,
  onLogout
}: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'cash' | 'zarkasi' | 'students' | 'announcements' | 'logs'>('summary');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Student modal/form states
  const [isStudentFormOpen, setIsStudentFormOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState('');
  const [studentNisn, setStudentNisn] = useState('');
  const [studentParent, setStudentParent] = useState('');

  // Zarkasi payment modal/form states
  const [isZarkasiModalOpen, setIsZarkasiModalOpen] = useState(false);
  const [selectedZarkasiStudentId, setSelectedZarkasiStudentId] = useState('');
  const [zarkasiAmount, setZarkasiAmount] = useState<number>(0);
  const [zarkasiType, setZarkasiType] = useState<'lunas' | 'installment'>('installment');

  // Announcement form states
  const [isAnnFormOpen, setIsAnnFormOpen] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');

  // Financial calculations
  const totalStudents = students.length;
  
  // Class cash (Uang Kas) calculations
  const CASH_MONTHLY_RATE = 5000;
  const CASH_YEARLY_RATE = 60000;
  
  let totalCashCollected = 0;
  cashPayments.forEach((p) => {
    const paidMonthsCount = Object.values(p.months).filter(Boolean).length;
    totalCashCollected += paidMonthsCount * CASH_MONTHLY_RATE;
  });
  const totalExpectedCash = totalStudents * CASH_YEARLY_RATE;
  const cashProgressPercentage = totalExpectedCash > 0 ? Math.round((totalCashCollected / totalExpectedCash) * 100) : 0;

  // Zarkasi calculations
  const ZARKASI_TARGET = 750000;
  let totalZarkasiCollected = 0;
  zarkasiPayments.forEach((p) => {
    totalZarkasiCollected += p.amountPaid;
  });
  const totalExpectedZarkasi = totalStudents * ZARKASI_TARGET;
  const zarkasiProgressPercentage = totalExpectedZarkasi > 0 ? Math.round((totalZarkasiCollected / totalExpectedZarkasi) * 100) : 0;

  // Filter students
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.nisn.includes(searchQuery)
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const handleOpenStudentForm = (student?: Student) => {
    if (student) {
      setEditingStudentId(student.id);
      setStudentName(student.name);
      setStudentNisn(student.nisn);
      setStudentParent(student.parentName);
    } else {
      setEditingStudentId(null);
      setStudentName('');
      setStudentNisn('');
      setStudentParent('');
    }
    setIsStudentFormOpen(true);
  };

  const handleStudentFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentNisn || !studentParent) {
      alert('Mohon isi semua kolom!');
      return;
    }
    if (editingStudentId) {
      onEditStudent(editingStudentId, studentName, studentNisn, studentParent);
    } else {
      onAddStudent(studentName, studentNisn, studentParent);
    }
    setIsStudentFormOpen(false);
  };

  const handleOpenZarkasiModal = (studentId: string) => {
    setSelectedZarkasiStudentId(studentId);
    const existing = zarkasiPayments.find(p => p.studentId === studentId);
    const remaining = ZARKASI_TARGET - (existing?.amountPaid || 0);
    setZarkasiAmount(remaining);
    setZarkasiType('installment');
    setIsZarkasiModalOpen(true);
  };

  const handleZarkasiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedZarkasiStudentId) return;
    
    const existing = zarkasiPayments.find(p => p.studentId === selectedZarkasiStudentId);
    const currentPaid = existing?.amountPaid || 0;
    const remaining = ZARKASI_TARGET - currentPaid;

    let finalAmount = zarkasiAmount;
    if (zarkasiType === 'lunas') {
      finalAmount = remaining;
    }

    if (finalAmount <= 0) {
      alert('Jumlah angsuran harus lebih dari Rp 0!');
      return;
    }

    if (finalAmount > remaining) {
      alert(`Jumlah pembayaran (${formatCurrency(finalAmount)}) melebihi sisa kekurangan (${formatCurrency(remaining)})!`);
      return;
    }

    onUpdateZarkasi(selectedZarkasiStudentId, finalAmount, zarkasiType === 'installment');
    setIsZarkasiModalOpen(false);
  };

  const handleAnnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) {
      alert('Harap isi judul dan konten pengumuman!');
      return;
    }
    onAddAnnouncement(annTitle, annContent);
    setAnnTitle('');
    setAnnContent('');
    setIsAnnFormOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans" id="teacher-dashboard-layout">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-950 text-white flex flex-col justify-between shrink-0 border-r-4 border-slate-900">
        <div>
          {/* Header */}
          <div className="p-6 border-b-2 border-slate-900">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-brand-orange text-slate-950 border-2 border-slate-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none font-black tracking-wider text-xs">
                6C
              </div>
              <div>
                <h2 className="font-black text-sm tracking-wider uppercase">MI Qudsiyyah</h2>
                <p className="text-[11px] text-brand-orange font-bold uppercase tracking-wider">Portal Wali Kelas</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t-2 border-slate-900/60">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Wali Kelas:</p>
              <p className="text-xs font-black text-white uppercase tracking-wider">ROSIDUL MOHTAZ, M.Pd</p>
            </div>
          </div>

          {/* Nav List */}
          <nav className="p-4 space-y-2.5">
            <button
              onClick={() => setActiveTab('summary')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all border-2 border-slate-950 ${
                activeTab === 'summary'
                  ? 'bg-brand-orange text-slate-950 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                  : 'hover:bg-slate-900 text-slate-300'
              }`}
            >
              <Award className="w-4 h-4 shrink-0" />
              <span>Ringkasan</span>
            </button>
            <button
              onClick={() => setActiveTab('cash')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all border-2 border-slate-950 ${
                activeTab === 'cash'
                  ? 'bg-brand-orange text-slate-950 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                  : 'hover:bg-slate-900 text-slate-300'
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Uang Kas Kelas</span>
            </button>
            <button
              onClick={() => setActiveTab('zarkasi')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all border-2 border-slate-950 ${
                activeTab === 'zarkasi'
                  ? 'bg-brand-orange text-slate-950 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                  : 'hover:bg-slate-900 text-slate-300'
              }`}
            >
              <DollarSign className="w-4 h-4 shrink-0" />
              <span>Iuran Zarkasi</span>
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all border-2 border-slate-950 ${
                activeTab === 'students'
                  ? 'bg-brand-orange text-slate-950 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                  : 'hover:bg-slate-900 text-slate-300'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Daftar Santri</span>
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all border-2 border-slate-950 ${
                activeTab === 'announcements'
                  ? 'bg-brand-orange text-slate-950 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                  : 'hover:bg-slate-900 text-slate-300'
              }`}
            >
              <Megaphone className="w-4 h-4 shrink-0" />
              <span>Pengumuman Kelas</span>
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all border-2 border-slate-950 ${
                activeTab === 'logs'
                  ? 'bg-brand-orange text-slate-950 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                  : 'hover:bg-slate-900 text-slate-300'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>Riwayat Transaksi</span>
            </button>
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 border-slate-900 bg-slate-950 text-center">
          <div className="flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3">
            <span>Akses: Guru (Akses Penuh)</span>
          </div>
          <button
            onClick={onLogout}
            className="w-full bg-brand-orange hover:bg-brand-orange-hover text-slate-950 hover:text-white font-black py-2.5 px-3 border-2 border-slate-950 rounded-none text-xs uppercase tracking-widest transition-all shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] active:translate-y-[1px]"
          >
            Keluar Portal
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* Top bar with quick Search and Screen Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-slate-950 pb-4 mb-8 gap-4">
          <div>
            <span className="text-[10px] font-black text-slate-950 bg-brand-orange border-2 border-slate-950 px-3 py-1 uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              Halaman Kerja Guru
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-slate-950 mt-2.5 uppercase tracking-wide">
              {activeTab === 'summary' && 'Ringkasan & Keuangan'}
              {activeTab === 'cash' && 'Manajemen Uang Kas Kelas'}
              {activeTab === 'zarkasi' && 'Manajemen Iuran Zarkasi'}
              {activeTab === 'students' && 'Data Santri Kelas 6C'}
              {activeTab === 'announcements' && 'Pengumuman / Pengeras Suara'}
              {activeTab === 'logs' && 'Log Audit Transaksi'}
            </h1>
          </div>

          {/* Quick search (applicable in many tabs) */}
          {['cash', 'zarkasi', 'students', 'logs'].includes(activeTab) && (
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-950 absolute left-3 top-3.5 stroke-[3]" />
              <input
                type="text"
                placeholder="CARI NAMA ATAU NISN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-3 border-slate-950 bg-white px-4 py-2.5 pl-10 text-xs font-bold text-slate-950 placeholder-slate-500 uppercase tracking-wider focus:outline-none focus:ring-0 focus:border-brand-orange shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>
          )}
        </div>

        {/* --------------------- TAB 1: SUMMARY --------------------- */}
        {activeTab === 'summary' && (
          <div className="space-y-8" id="summary-section">
            {/* Visual KPI Banner */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Total Siswa */}
              <div className="bg-white p-5 border-4 border-slate-950 shadow-[4px_4px_0px_0px_rgba(30,58,138,1)] flex items-center space-x-4">
                <div className="p-3 bg-blue-100 text-slate-950 border-2 border-slate-950 shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Users className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">Total Santri 6C</p>
                  <p className="text-2xl font-black text-slate-950 uppercase tracking-tight">{totalStudents} Santri</p>
                </div>
              </div>

              {/* Card 2: Total Kas */}
              <div className="bg-white p-5 border-4 border-slate-950 shadow-[4px_4px_0px_0px_#0B4619] flex items-center space-x-4">
                <div className="p-3 bg-emerald-100 text-slate-950 border-2 border-slate-950 shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Calendar className="w-6 h-6 stroke-[3]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">Kas Terkumpul</p>
                  <p className="text-lg font-black text-slate-950 truncate">{formatCurrency(totalCashCollected)}</p>
                  <div className="flex items-center space-x-1.5 mt-1">
                    <div className="w-full bg-slate-200 border-2 border-slate-950 h-3 overflow-hidden">
                      <div className="bg-brand-green h-full" style={{ width: `${cashProgressPercentage}%` }}></div>
                    </div>
                    <span className="text-[11px] text-slate-950 font-black">{cashProgressPercentage}%</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Total Zarkasi */}
              <div className="bg-white p-5 border-4 border-slate-950 shadow-[4px_4px_0px_0px_rgba(249,115,22,1)] flex items-center space-x-4">
                <div className="p-3 bg-brand-orange/20 text-slate-950 border-2 border-slate-950 shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <DollarSign className="w-6 h-6 stroke-[3]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">Zarkasi Terkumpul</p>
                  <p className="text-lg font-black text-slate-950 truncate">{formatCurrency(totalZarkasiCollected)}</p>
                  <div className="flex items-center space-x-1.5 mt-1">
                    <div className="w-full bg-slate-200 border-2 border-slate-950 h-3 overflow-hidden">
                      <div className="bg-brand-orange h-full" style={{ width: `${zarkasiProgressPercentage}%` }}></div>
                    </div>
                    <span className="text-[11px] text-slate-950 font-black">{zarkasiProgressPercentage}%</span>
                  </div>
                </div>
              </div>

              {/* Card 4: Sisa Piutang Kelas */}
              <div className="bg-white p-5 border-4 border-slate-950 shadow-[4px_4px_0px_0px_#ef4444] flex items-center space-x-4">
                <div className="p-3 bg-red-100 text-slate-950 border-2 border-slate-950 shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Clock className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">Total Kekurangan</p>
                  <p className="text-lg font-black text-slate-950">
                    {formatCurrency((totalExpectedCash - totalCashCollected) + (totalExpectedZarkasi - totalZarkasiCollected))}
                  </p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Kas + Zarkasi Kelas 6C</p>
                </div>
              </div>
            </div>

            {/* Split Financial Progress Detail */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cash Progress Overview */}
              <div className="bg-white p-6 border-4 border-slate-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-slate-950">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                    <h3 className="font-black text-slate-950 text-xs uppercase tracking-wider">Rekapitulasi Uang Kas</h3>
                  </div>
                  <span className="text-[10px] text-slate-950 bg-emerald-100 border-2 border-slate-950 px-2.5 py-0.5 font-bold uppercase tracking-wider shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                    Rp 5.000 / Bulan
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-xs text-slate-700">
                    <span className="font-bold uppercase tracking-wider">Total Target Setahun (Rp 60.000 × {totalStudents})</span>
                    <span className="font-black text-slate-950">{formatCurrency(totalExpectedCash)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-950 bg-emerald-100 border-2 border-slate-950 p-2.5 font-bold uppercase tracking-wider">
                    <span>Total Kas Masuk</span>
                    <span className="font-black">{formatCurrency(totalCashCollected)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-red-700 bg-red-100 border-2 border-red-950 p-2.5 font-bold uppercase tracking-wider">
                    <span>Total Sisa Kekurangan</span>
                    <span className="font-black">{formatCurrency(totalExpectedCash - totalCashCollected)}</span>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    onClick={() => setActiveTab('cash')}
                    className="w-full text-center bg-brand-green hover:bg-emerald-800 text-white text-xs font-black py-3 border-2 border-slate-950 uppercase tracking-widest transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px]"
                  >
                    Buka Kas Kelas →
                  </button>
                </div>
              </div>

              {/* Zarkasi Progress Overview */}
              <div className="bg-white p-6 border-4 border-slate-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-slate-950">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                    <h3 className="font-black text-slate-950 text-xs uppercase tracking-wider">Rekapitulasi Iuran Zarkasi</h3>
                  </div>
                  <span className="text-[10px] text-slate-950 bg-brand-orange/20 border-2 border-slate-950 px-2.5 py-0.5 font-bold uppercase tracking-wider shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                    Rp 750.000 / Santri
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-xs text-slate-700">
                    <span className="font-bold uppercase tracking-wider">Total Target Kelas (Rp 750.000 × {totalStudents})</span>
                    <span className="font-black text-slate-950">{formatCurrency(totalExpectedZarkasi)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-950 bg-brand-orange/10 border-2 border-slate-950 p-2.5 font-bold uppercase tracking-wider">
                    <span>Total Zarkasi Masuk</span>
                    <span className="font-black">{formatCurrency(totalZarkasiCollected)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-red-700 bg-red-100 border-2 border-red-950 p-2.5 font-bold uppercase tracking-wider">
                    <span>Total Sisa Kekurangan</span>
                    <span className="font-black">{formatCurrency(totalExpectedZarkasi - totalZarkasiCollected)}</span>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    onClick={() => setActiveTab('zarkasi')}
                    className="w-full text-center bg-brand-orange hover:bg-brand-orange-hover text-slate-950 hover:text-white text-xs font-black py-3 border-2 border-slate-950 uppercase tracking-widest transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px]"
                  >
                    Buka Iuran Zarkasi →
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Announcement Preview */}
            <div className="bg-white p-6 border-4 border-slate-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-slate-950">
                <div className="flex items-center space-x-2">
                  <Megaphone className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                  <h3 className="font-black text-slate-950 text-xs uppercase tracking-wider">Pengumuman Terbaru</h3>
                </div>
                <button
                  onClick={() => setActiveTab('announcements')}
                  className="text-xs text-brand-orange hover:text-brand-orange-hover font-black uppercase tracking-wider underline decoration-2 underline-offset-2"
                >
                  Kelola Pengumuman
                </button>
              </div>

              {announcements.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {announcements.slice(0, 2).map((ann) => (
                    <div key={ann.id} className="py-3 first:pt-0 last:pb-0">
                      <h4 className="font-bold text-xs text-slate-800">{ann.title}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{ann.content}</p>
                      <p className="text-[9px] text-slate-400 mt-1">
                        Diposting pada {new Date(ann.date).toLocaleDateString('id-ID')} oleh {ann.author}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">Belum ada pengumuman kelas.</p>
              )}
            </div>
          </div>
        )}

        {/* --------------------- TAB 2: UANG KAS --------------------- */}
        {activeTab === 'cash' && (
          <div className="space-y-6" id="cash-tab-content">
            <div className="bg-brand-orange/15 border-3 border-slate-950 p-4 rounded-none flex items-start space-x-3 text-slate-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <AlertCircle className="w-5 h-5 text-brand-orange shrink-0 mt-0.5 stroke-[2.5]" />
              <div className="text-xs leading-relaxed">
                <p className="font-extrabold uppercase tracking-wider text-slate-950 text-sm">Informasi Aturan Uang Kas Kelas 6C</p>
                <p className="mt-1 font-semibold">
                  Ketentuan iuran Kas Kelas adalah <strong className="font-black">Rp 5.000 / bulan</strong> atau <strong className="font-black">Rp 60.000 / tahun</strong> (12 bulan dari Juli s/d Juni). Centang bulan yang dilunasi siswa. Anda juga dapat menggunakan fitur <span className="bg-brand-orange text-slate-950 px-1.5 py-0.5 border border-slate-950 font-black uppercase tracking-wider text-[10px]">Lunas Setahun</span> untuk langsung mencentang seluruh 12 bulan sekaligus.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-none border-4 border-slate-950 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              <div className="p-4 bg-slate-100 border-b-4 border-slate-950 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-950">Tabel Presensi Pembayaran Kas Kelas 6C</span>
                <span className="text-xs text-white font-black bg-brand-green border-2 border-slate-950 px-3 py-1 uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  Total Terkumpul: {formatCurrency(totalCashCollected)}
                </span>
              </div>

              {/* Scrollable grid Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-white text-[11px] font-black tracking-wider uppercase border-b-2 border-slate-950">
                      <th className="py-3.5 px-4 min-w-[200px] border-r-2 border-slate-900">Nama Santri</th>
                      {ACADEMIC_MONTHS.map(month => (
                        <th key={month} className="py-3.5 px-1 text-center min-w-[55px] text-[10px] border-r-2 border-slate-900">{month}</th>
                      ))}
                      <th className="py-3.5 px-4 text-center min-w-[110px]">Tindakan Cepat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-slate-950 text-xs">
                    {filteredStudents.map((student) => {
                      const pay = cashPayments.find(p => p.studentId === student.id);
                      const paidMonths = pay ? Object.values(pay.months).filter(Boolean).length : 0;
                      const isFullyPaid = paidMonths === 12;

                      return (
                        <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-4 font-bold text-slate-950 border-r-2 border-slate-200">
                            <p className="font-black text-sm uppercase tracking-wide">{student.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">NISN: {student.nisn} • Ortu: {student.parentName}</p>
                            <span className={`inline-block text-[10px] font-black px-2 py-0.5 border-2 border-slate-950 uppercase tracking-wider mt-2 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
                              isFullyPaid ? 'bg-emerald-100 text-slate-950' : 'bg-slate-100 text-slate-700'
                            }`}>
                              Lunas: {paidMonths}/12 Bulan ({formatCurrency(paidMonths * CASH_MONTHLY_RATE)})
                            </span>
                          </td>
                          {ACADEMIC_MONTHS.map((month) => {
                            const isPaid = pay?.months[month] || false;
                            return (
                              <td key={month} className="py-4 px-1 text-center border-r-2 border-slate-200">
                                <button
                                  type="button"
                                  onClick={() => onToggleCash(student.id, month)}
                                  className={`w-7 h-7 border-2 transition-all flex items-center justify-center mx-auto active:translate-y-[1px] ${
                                    isPaid
                                      ? 'bg-brand-green border-slate-950 text-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                                      : 'border-slate-950 hover:bg-slate-100 bg-white'
                                  }`}
                                  title={`${month} - Klik untuk ubah`}
                                >
                                  {isPaid && <Check className="w-4.5 h-4.5 stroke-[4]" />}
                                </button>
                              </td>
                            );
                          })}
                          <td className="py-4 px-4 text-center">
                            {isFullyPaid ? (
                              <span className="text-brand-green font-black text-[11px] uppercase tracking-wider inline-flex items-center space-x-1.5 bg-emerald-100 border-2 border-slate-950 px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <CheckCircle className="w-4 h-4" />
                                <span>Lunas Kas</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onPayYearlyCash(student.id)}
                                className="bg-brand-orange hover:bg-brand-orange-hover text-slate-950 hover:text-white font-black text-[10px] px-3 py-2 border-2 border-slate-950 transition-all uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px]"
                              >
                                Lunas Setahun
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan={ACADEMIC_MONTHS.length + 2} className="text-center p-8 text-slate-500 font-bold uppercase tracking-wider">
                          Santri tidak ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --------------------- TAB 3: IURAN ZARKASI --------------------- */}
        {activeTab === 'zarkasi' && (
          <div className="space-y-6" id="zarkasi-tab-content">
            <div className="bg-emerald-50 border-3 border-slate-950 p-4 rounded-none flex items-start space-x-3 text-slate-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <DollarSign className="w-5 h-5 text-brand-green shrink-0 mt-0.5 stroke-[2.5]" />
              <div className="text-xs leading-relaxed">
                <p className="font-extrabold uppercase tracking-wider text-slate-950 text-sm">Informasi Iuran Zarkasi Kelas 6</p>
                <p className="mt-1 font-semibold">
                  Iuran Zarkasi merupakan iuran wajib Kelas 6 di MI Qudsiyyah sebesar <strong className="font-black">Rp 750.000</strong> per santri. Hanya guru/wali kelas yang dapat menginput cicilan pembayaran ini. Wali santri dapat memantau sisa piutang secara langsung pada login mereka.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-none border-4 border-slate-950 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              <div className="p-4 bg-slate-100 border-b-4 border-slate-950 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-950">Daftar Pembayaran Iuran Zarkasi</span>
                <span className="text-xs text-slate-950 font-black bg-brand-orange border-2 border-slate-950 px-3 py-1 uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  Total Masuk: {formatCurrency(totalZarkasiCollected)}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-white text-xs font-black tracking-wider uppercase border-b-2 border-slate-950">
                      <th className="py-3 px-4">Nama Santri</th>
                      <th className="py-3 px-4 text-right">Target</th>
                      <th className="py-3 px-4 text-right">Telah Dibayar</th>
                      <th className="py-3 px-4 text-right">Kekurangan</th>
                      <th className="py-3 px-4 text-center">Status Keuangan</th>
                      <th className="py-3 px-4 text-center">Aksi / Pencatatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-slate-950 text-xs font-bold">
                    {filteredStudents.map((student) => {
                      const pay = zarkasiPayments.find(p => p.studentId === student.id);
                      const paid = pay ? pay.amountPaid : 0;
                      const debt = ZARKASI_TARGET - paid;
                      const pct = Math.round((paid / ZARKASI_TARGET) * 100);

                      return (
                        <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-4">
                            <p className="font-black text-sm uppercase tracking-wide text-slate-950">{student.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">NISN: {student.nisn} • Wali: {student.parentName}</p>
                          </td>
                          <td className="py-4 px-4 text-right text-slate-600 font-mono">{formatCurrency(ZARKASI_TARGET)}</td>
                          <td className="py-4 px-4 text-right text-brand-green font-black font-mono">{formatCurrency(paid)}</td>
                          <td className="py-4 px-4 text-right text-red-600 font-black font-mono">{formatCurrency(debt)}</td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <span className={`px-2.5 py-1 border-2 border-slate-950 text-[10px] font-black uppercase tracking-wider shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
                                paid >= ZARKASI_TARGET
                                  ? 'bg-emerald-100 text-slate-950'
                                  : paid > 0
                                  ? 'bg-amber-100 text-slate-950'
                                  : 'bg-red-100 text-slate-950'
                              }`}>
                                {paid >= ZARKASI_TARGET ? 'Lunas' : paid > 0 ? `Mengangsur (${pct}%)` : 'Belum Bayar'}
                              </span>
                              <div className="w-24 bg-slate-200 border-2 border-slate-950 h-3 overflow-hidden">
                                <div className={`h-full ${paid >= ZARKASI_TARGET ? 'bg-brand-green' : 'bg-brand-orange'}`} style={{ width: `${pct}%` }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            {paid >= ZARKASI_TARGET ? (
                              <span className="text-brand-green font-black text-[11px] uppercase tracking-wider inline-flex items-center space-x-1.5 bg-emerald-100 border-2 border-slate-950 px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <CheckCircle className="w-4 h-4" />
                                <span>Lunas Zarkasi</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenZarkasiModal(student.id)}
                                className="bg-brand-orange hover:bg-brand-orange-hover text-slate-950 hover:text-white font-black text-[10px] px-3.5 py-2 border-2 border-slate-950 transition-all uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px]"
                              >
                                Input Cicilan
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center p-8 text-slate-500 font-bold uppercase tracking-wider">
                          Santri tidak ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --------------------- TAB 4: DATA SANTRI --------------------- */}
        {activeTab === 'students' && (
          <div className="space-y-6" id="students-tab-content">
            <div className="flex justify-between items-center pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-950">Manajemen data santri aktif Kelas 6C</span>
              <button
                type="button"
                id="btn-add-student"
                onClick={() => handleOpenStudentForm()}
                className="bg-brand-green hover:bg-emerald-800 text-white font-black text-xs px-4 py-2.5 border-2 border-slate-950 rounded-none flex items-center space-x-1.5 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px]"
              >
                <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                <span className="uppercase tracking-widest">Tambah Santri Baru</span>
              </button>
            </div>

            {isStudentFormOpen && (
              <div className="bg-white p-5 border-4 border-slate-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none">
                <h3 className="font-black text-slate-950 text-sm uppercase tracking-wider mb-4 border-b-2 border-slate-950 pb-2">
                  {editingStudentId ? 'Edit Data Santri 6C' : 'Tambah Santri Baru 6C'}
                </h3>
                <form onSubmit={handleStudentFormSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-700 font-extrabold uppercase tracking-wider mb-1">Nama Lengkap Santri</label>
                    <input
                      type="text"
                      placeholder="CONTOH: MUHAMMAD AKHYAR"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full border-3 border-slate-950 bg-white px-3 py-2 text-xs font-bold text-slate-950 placeholder-slate-400 uppercase tracking-wider focus:outline-none focus:border-brand-orange"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-700 font-extrabold uppercase tracking-wider mb-1">NISN (10 Digit)</label>
                    <input
                      type="text"
                      placeholder="CONTOH: 0123456021"
                      value={studentNisn}
                      onChange={(e) => setStudentNisn(e.target.value)}
                      className="w-full border-3 border-slate-950 bg-white px-3 py-2 text-xs font-bold text-slate-950 placeholder-slate-400 uppercase tracking-wider focus:outline-none focus:border-brand-orange"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-700 font-extrabold uppercase tracking-wider mb-1">Nama Wali Santri / Orang Tua</label>
                    <input
                      type="text"
                      placeholder="CONTOH: H. AHMAD SYAUQI"
                      value={studentParent}
                      onChange={(e) => setStudentParent(e.target.value)}
                      className="w-full border-3 border-slate-950 bg-white px-3 py-2 text-xs font-bold text-slate-950 placeholder-slate-400 uppercase tracking-wider focus:outline-none focus:border-brand-orange"
                    />
                  </div>
                  <div className="md:col-span-3 flex justify-end space-x-3 pt-4 border-t-2 border-slate-950">
                    <button
                      type="button"
                      onClick={() => setIsStudentFormOpen(false)}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-950 font-black text-xs px-4 py-2.5 border-2 border-slate-950 rounded-none uppercase tracking-widest transition-all"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="bg-brand-orange hover:bg-brand-orange-hover text-slate-950 hover:text-white font-black text-xs px-5 py-2.5 border-2 border-slate-950 rounded-none uppercase tracking-widest transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px]"
                    >
                      Simpan Data
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-none border-4 border-slate-950 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-white text-xs font-black tracking-wider uppercase border-b-2 border-slate-950">
                    <th className="py-3 px-4">No.</th>
                    <th className="py-3 px-4">Nama Lengkap Santri</th>
                    <th className="py-3 px-4">NISN</th>
                    <th className="py-3 px-4">Orang Tua / Wali</th>
                    <th className="py-3 px-4 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-200 text-xs font-bold text-slate-950">
                  {filteredStudents.map((student, idx) => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 font-black text-slate-400">{idx + 1}</td>
                      <td className="py-4 px-4 uppercase tracking-wide text-sm font-black">{student.name}</td>
                      <td className="py-4 px-4 font-mono font-medium">{student.nisn}</td>
                      <td className="py-4 px-4 uppercase tracking-wider">{student.parentName}</td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex justify-center space-x-3">
                          <button
                            type="button"
                            onClick={() => handleOpenStudentForm(student)}
                            className="p-1.5 text-slate-950 hover:text-brand-orange border-2 border-transparent hover:border-slate-950 bg-slate-100 hover:bg-white transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,0)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                            title="Edit Data Santri"
                          >
                            <Edit2 className="w-4 h-4 stroke-[2.5]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Hapus data ${student.name} dari Kelas 6C? Semua catatan iuran yang terkait akan ikut dihapus.`)) {
                                onDeleteStudent(student.id);
                              }
                            }}
                            className="p-1.5 text-slate-950 hover:text-red-600 border-2 border-transparent hover:border-slate-950 bg-slate-100 hover:bg-white transition-all shadow-[1px_1px_0px_0px_rgba(0,0,0,0)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                            title="Hapus Santri"
                          >
                            <Trash2 className="w-4 h-4 stroke-[2.5]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center p-8 text-slate-400 text-xs">
                        Belum ada data santri terdaftar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --------------------- TAB 5: ANNOUNCEMENTS --------------------- */}
        {activeTab === 'announcements' && (
          <div className="space-y-6" id="announcements-tab-content">
            <div className="flex justify-between items-center pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-950">Kelola pengumuman digital kelas untuk wali santri</span>
              <button
                type="button"
                onClick={() => setIsAnnFormOpen(!isAnnFormOpen)}
                className="bg-brand-orange hover:bg-brand-orange-hover text-slate-950 hover:text-white font-black text-xs px-4 py-2.5 border-2 border-slate-950 rounded-none flex items-center space-x-1.5 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px]"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span className="uppercase tracking-widest">Buat Pengumuman Baru</span>
              </button>
            </div>

            {isAnnFormOpen && (
              <form onSubmit={handleAnnSubmit} className="bg-white p-5 border-4 border-slate-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none space-y-4">
                <h3 className="font-black text-slate-950 text-sm uppercase tracking-wider border-b-2 border-slate-950 pb-2">Tulis Pengumuman / Pesan Wali Kelas</h3>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">Judul Pengumuman</label>
                  <input
                    type="text"
                    placeholder="CONTOH: PEMBERITAHUAN KEGIATAN PONDOK ROMADHON"
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    className="w-full border-3 border-slate-950 bg-white px-3 py-2 text-xs font-bold text-slate-950 placeholder-slate-400 uppercase tracking-wider focus:outline-none focus:border-brand-orange"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">Isi Pengumuman</label>
                  <textarea
                    rows={4}
                    placeholder="TULIS PESAN LENGKAP ANDA DI SINI..."
                    value={annContent}
                    onChange={(e) => setAnnContent(e.target.value)}
                    className="w-full border-3 border-slate-950 bg-white px-3 py-2 text-xs font-bold text-slate-950 placeholder-slate-400 uppercase tracking-wider focus:outline-none focus:border-brand-orange"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAnnFormOpen(false)}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-950 font-black text-xs px-4 py-2.5 border-2 border-slate-950 rounded-none uppercase tracking-widest transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-brand-green hover:bg-emerald-800 text-white font-black text-xs px-5 py-2.5 border-2 border-slate-950 rounded-none uppercase tracking-widest transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px]"
                  >
                    Siarkan Pengumuman
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-6">
              {announcements.map((ann) => (
                <div key={ann.id} className="bg-white p-6 border-4 border-slate-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none relative overflow-hidden flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="bg-brand-orange/20 text-slate-950 border-2 border-slate-950 text-[10px] font-black px-2.5 py-0.5 uppercase tracking-wider shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">Pemberitahuan</span>
                      <span className="text-slate-500 font-mono text-[10px] font-bold">{new Date(ann.date).toLocaleString('id-ID')}</span>
                    </div>
                    <h3 className="text-base font-black text-slate-950 uppercase tracking-wide">{ann.title}</h3>
                    <p className="text-xs text-slate-850 leading-relaxed whitespace-pre-wrap font-medium">{ann.content}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold">Diposting Oleh: {ann.author}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Hapus pengumuman ini?')) {
                        onDeleteAnnouncement(ann.id);
                      }
                    }}
                    className="p-2 text-slate-950 hover:text-white hover:bg-red-600 border-2 border-slate-950 rounded-none transition-all md:self-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px]"
                    title="Hapus Pengumuman"
                  >
                    <Trash2 className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </div>
              ))}
              {announcements.length === 0 && (
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider text-center py-12 bg-white rounded-none border-4 border-slate-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  Belum ada pengumuman kelas yang diposting.
                </p>
              )}
            </div>
          </div>
        )}

        {/* --------------------- TAB 6: LOGS --------------------- */}
        {activeTab === 'logs' && (
          <div className="space-y-4" id="logs-tab-content">
            <span className="text-xs font-black uppercase tracking-wider text-slate-950">Pencatatan aktivitas keuangan rill oleh Wali Kelas</span>
            <div className="bg-white rounded-none border-4 border-slate-950 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-white text-xs font-black tracking-wider uppercase border-b-2 border-slate-950">
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-4">Nama Santri</th>
                    <th className="py-3 px-4">Jenis Iuran</th>
                    <th className="py-3 px-4">Keterangan</th>
                    <th className="py-3 px-4 text-right">Nominal</th>
                    <th className="py-3 px-4">Operator</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-200 text-xs font-bold text-slate-950">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 font-mono text-[11px] text-slate-500">
                        {new Date(log.date).toLocaleString('id-ID')}
                      </td>
                      <td className="py-4 px-4 uppercase tracking-wide text-sm font-black">{log.studentName}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 border-2 border-slate-950 text-[10px] font-black uppercase tracking-wider shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
                          log.type === 'Uang Kas' ? 'bg-emerald-100 text-slate-950' : 'bg-brand-orange/20 text-slate-950'
                        }`}>
                          {log.type}
                        </span>
                      </td>
                      <td className="py-4 px-4 italic text-slate-600 font-medium">{log.description}</td>
                      <td className="py-4 px-4 text-right font-black font-mono text-slate-950">{formatCurrency(log.amount)}</td>
                      <td className="py-4 px-4 uppercase tracking-wider text-[11px] text-slate-500">{log.operator}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center p-8 text-slate-500 font-bold uppercase tracking-wider">
                        Belum ada riwayat transaksi tercatat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* --------------------- MODAL: INPUT ZARKASI PAYMENT --------------------- */}
      {isZarkasiModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-none border-4 border-slate-950 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md overflow-hidden">
            <div className="p-5 bg-slate-950 text-white flex justify-between items-center">
              <h3 className="font-black text-sm uppercase tracking-widest">Input Angsuran Zarkasi 6C</h3>
              <button
                type="button"
                onClick={() => setIsZarkasiModalOpen(false)}
                className="text-white hover:text-brand-orange text-2xl font-black leading-none"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleZarkasiSubmit} className="p-5 space-y-5">
              <div>
                <span className="block text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Nama Santri</span>
                <span className="text-base font-black text-slate-950 uppercase tracking-wide">
                  {students.find(s => s.id === selectedZarkasiStudentId)?.name || ''}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-100 p-4 border-3 border-slate-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <div>
                  <span className="block text-slate-500 font-extrabold uppercase tracking-wider text-[9px]">Telah Dibayar</span>
                  <span className="font-mono text-sm font-black text-brand-green">
                    {formatCurrency(zarkasiPayments.find(p => p.studentId === selectedZarkasiStudentId)?.amountPaid || 0)}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-500 font-extrabold uppercase tracking-wider text-[9px]">Sisa Tagihan</span>
                  <span className="font-mono text-sm font-black text-red-600">
                    {formatCurrency(ZARKASI_TARGET - (zarkasiPayments.find(p => p.studentId === selectedZarkasiStudentId)?.amountPaid || 0))}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">Pilihan Pembayaran</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setZarkasiType('installment')}
                    className={`py-3 px-3 text-xs font-black uppercase tracking-widest border-2 text-center transition-all ${
                      zarkasiType === 'installment'
                        ? 'bg-brand-orange text-slate-950 border-slate-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                        : 'border-slate-950 bg-white hover:bg-slate-100'
                    }`}
                  >
                    Angsuran
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setZarkasiType('lunas');
                      const pay = zarkasiPayments.find(p => p.studentId === selectedZarkasiStudentId);
                      setZarkasiAmount(ZARKASI_TARGET - (pay?.amountPaid || 0));
                    }}
                    className={`py-3 px-3 text-xs font-black uppercase tracking-widest border-2 text-center transition-all ${
                      zarkasiType === 'lunas'
                        ? 'bg-brand-green text-white border-slate-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                        : 'border-slate-950 bg-white hover:bg-slate-100'
                    }`}
                  >
                    Pelunasan
                  </button>
                </div>
              </div>

              {zarkasiType === 'installment' && (
                <div className="space-y-1">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">Nominal yang Dibayar (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-xs font-black text-slate-950 font-mono">Rp</span>
                    <input
                      type="number"
                      value={zarkasiAmount || ''}
                      onChange={(e) => setZarkasiAmount(Number(e.target.value))}
                      className="w-full border-3 border-slate-950 bg-white pl-10 pr-3 py-2.5 text-xs font-bold text-slate-950 placeholder-slate-400 uppercase tracking-wider focus:outline-none focus:border-brand-orange"
                      placeholder="CONTOH: 150000"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t-2 border-slate-950">
                <button
                  type="button"
                  onClick={() => setIsZarkasiModalOpen(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-950 font-black text-xs px-4 py-2.5 border-2 border-slate-950 rounded-none uppercase tracking-widest transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-brand-orange hover:bg-brand-orange-hover text-slate-950 hover:text-white font-black text-xs px-5 py-2.5 border-2 border-slate-950 rounded-none uppercase tracking-widest transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px]"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
