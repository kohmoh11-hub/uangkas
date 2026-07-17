import React, { useState } from 'react';
import { Student } from '../types';
import { BookOpen, Shield, Users, User, Lock, Search, GraduationCap, ArrowRight } from 'lucide-react';

interface LoginProps {
  students: Student[];
  onLoginTeacher: () => void;
  onLoginGuardian: (studentId: string) => void;
}

export default function Login({ students, onLoginTeacher, onLoginGuardian }: LoginProps) {
  const [role, setRole] = useState<'teacher' | 'guardian' | null>(null);
  
  // Teacher login state
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Guardian login state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [nisnConfirm, setNisnConfirm] = useState('');
  const [guardianError, setGuardianError] = useState('');

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Rosidul110495') {
      onLoginTeacher();
    } else {
      setError('Sandi Wali Kelas salah. Silakan coba lagi atau hubungi administrator.');
    }
  };

  const handleGuardianSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setGuardianError('Silakan pilih nama putra Anda.');
      return;
    }
    const student = students.find(s => s.id === selectedStudentId);
    if (!student) return;

    if (nisnConfirm.trim() === student.nisn) {
      onLoginGuardian(selectedStudentId);
    } else {
      setGuardianError('NISN salah. Silakan masukkan NISN yang benar.');
    }
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.parentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between" id="login-container">
      {/* Decorative Header */}
      <div className="w-full bg-brand-green text-white py-8 px-4 text-center border-b-4 border-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <span className="bg-brand-orange text-slate-950 text-xs font-black px-4 py-1.5 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#000] uppercase tracking-widest mb-3 rounded-none">
            MI Qudsiyyah Kudus
          </span>
          <h1 className="text-3xl md:text-4xl font-black tracking-widest uppercase text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            SISTEM KEUANGAN KELAS 6C
          </h1>
          <p className="text-brand-orange font-bold text-sm md:text-base mt-2 tracking-wide uppercase">
            Wali Kelas: <span className="underline underline-offset-4 decoration-2 decoration-white text-white font-extrabold">ROSIDUL MOHTAZ, M.Pd</span>
          </p>
        </div>
      </div>

      {/* Main Card Grid */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="bg-white rounded-none border-4 border-slate-900 shadow-[8px_8px_0px_0px_#0B4619] w-full max-w-md overflow-hidden">
          
          {/* Tabs/Selection */}
          {!role ? (
            <div className="p-6 md:p-8 flex flex-col items-center">
              <div className="w-16 h-16 bg-brand-orange/10 rounded-none border-3 border-slate-900 flex items-center justify-center mb-6 shadow-[3px_3px_0px_0px_#0f172a]">
                <GraduationCap className="w-8 h-8 text-brand-green" />
              </div>
              <h2 className="text-2xl font-black text-slate-950 text-center uppercase tracking-wider">Selamat Datang</h2>
              <p className="text-xs font-bold text-slate-500 text-center uppercase tracking-widest mt-1 mb-8">Pilih akses masuk Anda</p>

              <div className="w-full space-y-5">
                {/* Teacher Button */}
                <button
                  id="btn-select-teacher"
                  onClick={() => { setRole('teacher'); setError(''); }}
                  className="w-full flex items-center justify-between p-5 rounded-none border-3 border-slate-900 bg-white hover:bg-slate-50 shadow-[4px_4px_0px_0px_rgba(11,70,25,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_rgba(11,70,25,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(11,70,25,1)] transition-all text-left group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-brand-green text-white border-2 border-slate-900 rounded-none">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-950 uppercase tracking-wider text-sm">Guru / Wali Kelas</h3>
                      <p className="text-xs text-slate-500 font-bold mt-0.5 uppercase tracking-wide">Input kas, zarkasi, & rekap</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-brand-green transition-transform group-hover:translate-x-1" />
                </button>

                {/* Guardian Button */}
                <button
                  id="btn-select-guardian"
                  onClick={() => { setRole('guardian'); setGuardianError(''); }}
                  className="w-full flex items-center justify-between p-5 rounded-none border-3 border-slate-900 bg-white hover:bg-slate-50 shadow-[4px_4px_0px_0px_rgba(249,115,22,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_rgba(249,115,22,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(249,115,22,1)] transition-all text-left group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-brand-orange text-white border-2 border-slate-900 rounded-none">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-950 uppercase tracking-wider text-sm">Wali Santri / Orang Tua</h3>
                      <p className="text-xs text-slate-500 font-bold mt-0.5 uppercase tracking-wide">Pantau laporan & status putra</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-brand-orange transition-transform group-hover:translate-x-1" />
                </button>
              </div>

              <div className="mt-8 text-center">
                <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">MI Qudsiyyah Kudus • Kelas 6C</span>
              </div>
            </div>
          ) : role === 'teacher' ? (
            /* Teacher Login Form */
            <div className="p-6 md:p-8">
              <button
                onClick={() => setRole(null)}
                className="text-xs text-brand-green hover:text-slate-950 font-black mb-6 inline-flex items-center space-x-1 uppercase tracking-widest"
              >
                <span>← Kembali</span>
              </button>

              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-brand-green text-white border-2 border-slate-900 rounded-none">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-950 uppercase tracking-wider">Masuk Wali Kelas</h2>
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Akses Penuh Wali Kelas 6C</p>
                </div>
              </div>

              <form onSubmit={handleTeacherSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-950 mb-1 uppercase tracking-wider">Nama Wali Kelas</label>
                  <input
                    type="text"
                    disabled
                    value="ROSIDUL MOHTAZ, M.Pd"
                    className="w-full bg-slate-100 border-3 border-slate-900 rounded-none px-3.5 py-2.5 text-sm text-slate-900 font-bold uppercase tracking-wider"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-950 mb-1 uppercase tracking-wider">Sandi Akses</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-950 absolute left-3 top-3.5" />
                    <input
                      type="password"
                      id="teacher-password-input"
                      placeholder="Masukkan sandi akses"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border-3 border-slate-900 rounded-none pl-10 pr-3.5 py-2.5 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-green focus:shadow-[3px_3px_0px_0px_#0B4619] transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-red-950 bg-red-100 font-bold p-3 rounded-none border-2 border-red-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wide">{error}</p>
                )}

                <button
                  type="submit"
                  id="teacher-login-submit"
                  className="w-full bg-brand-green hover:bg-brand-green-hover text-white font-black py-3 px-4 border-3 border-slate-900 rounded-none text-sm transition-all shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] flex items-center justify-center space-x-2 uppercase tracking-widest"
                >
                  <span>Masuk Ruang Guru</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            /* Guardian Login Form */
            <div className="p-6 md:p-8">
              <button
                onClick={() => setRole(null)}
                className="text-xs text-brand-orange hover:text-slate-950 font-black mb-6 inline-flex items-center space-x-1 uppercase tracking-widest"
              >
                <span>← Kembali</span>
              </button>

              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-brand-orange text-white border-2 border-slate-900 rounded-none">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-950 uppercase tracking-wider">Masuk Wali Santri</h2>
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Melihat status keuangan (Hak Baca Saja)</p>
                </div>
              </div>

              <form onSubmit={handleGuardianSubmit} className="space-y-4">
                {/* Search and Select Student */}
                <div>
                  <label className="block text-xs font-black text-slate-950 mb-1 uppercase tracking-wider">Cari Nama Putra Anda</label>
                  <div className="relative mb-2">
                    <Search className="w-4 h-4 text-slate-950 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      placeholder="Cari nama santri..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full border-3 border-slate-900 rounded-none pl-10 pr-3.5 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-brand-green focus:shadow-[3px_3px_0px_0px_#0B4619] transition-all"
                    />
                  </div>

                  <div className="max-h-36 overflow-y-auto border-3 border-slate-900 rounded-none divide-y-2 divide-slate-900 bg-slate-50">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <button
                          key={student.id}
                          type="button"
                          onClick={() => {
                            setSelectedStudentId(student.id);
                            setSearchTerm(student.name);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 text-xs transition-colors hover:bg-brand-orange/10 ${
                            selectedStudentId === student.id ? 'bg-brand-orange/20 text-slate-950 font-black' : 'text-slate-800 font-bold'
                          }`}
                        >
                          <p className="uppercase tracking-wide">{student.name}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider mt-0.5">Wali Santri / Orang Tua: {student.parentName}</p>
                        </button>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 font-bold p-3 text-center uppercase tracking-wider">Nama tidak ditemukan</p>
                    )}
                  </div>
                </div>

                {/* NISN Verification code */}
                <div>
                  <label className="block text-xs font-black text-slate-950 mb-1 uppercase tracking-wider">Sandi Akses (NISN Putra Anda)</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-950 absolute left-3 top-3.5" />
                    <input
                      type="password"
                      placeholder="Masukkan NISN sebagai sandi akses"
                      value={nisnConfirm}
                      onChange={(e) => setNisnConfirm(e.target.value)}
                      className="w-full border-3 border-slate-900 rounded-none pl-10 pr-3.5 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-brand-green focus:shadow-[3px_3px_0px_0px_#0B4619] transition-all"
                    />
                  </div>
                </div>

                {guardianError && (
                  <p className="text-xs text-red-950 bg-red-100 font-bold p-3 rounded-none border-2 border-red-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wide">{guardianError}</p>
                )}

                <button
                  type="submit"
                  id="guardian-login-submit"
                  className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white font-black py-3 px-4 border-3 border-slate-900 rounded-none text-sm transition-all shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] flex items-center justify-center space-x-2 uppercase tracking-widest"
                >
                  <span>Masuk Portal Wali Santri</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Aesthetic Footer */}
      <div className="w-full py-5 text-center border-t-3 border-slate-900 bg-white">
        <p className="text-xs font-black text-slate-900 uppercase tracking-widest">
          Sistem Informasi Keuangan Kelas © 2026 • MI Qudsiyyah Kudus Jawa Tengah
        </p>
      </div>
    </div>
  );
}
