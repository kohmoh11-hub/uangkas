import React, { useState, useEffect } from 'react';
import { Student, CashPayment, ZarkasiPayment, TransactionLog, Announcement } from './types';
import {
  INITIAL_STUDENTS,
  INITIAL_CASH_PAYMENTS,
  INITIAL_ZARKASI_PAYMENTS,
  INITIAL_LOGS,
  INITIAL_ANNOUNCEMENTS,
  ACADEMIC_MONTHS
} from './data';
import Login from './components/Login';
import TeacherDashboard from './components/TeacherDashboard';
import GuardianDashboard from './components/GuardianDashboard';
import AppScriptGenerator from './components/AppScriptGenerator';
import { Database, Laptop, RefreshCw, Wifi, WifiOff } from 'lucide-react';

export default function App() {
  // Navigation: 'app' (live simulator) or 'appscript' (apps script tutorial)
  const [activeMainTab, setActiveMainTab] = useState<'app' | 'appscript'>('app');

  // Role authentication states
  const [role, setRole] = useState<'teacher' | 'guardian' | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // App core database states
  const [students, setStudents] = useState<Student[]>([]);
  const [cashPayments, setCashPayments] = useState<CashPayment[]>([]);
  const [zarkasiPayments, setZarkasiPayments] = useState<ZarkasiPayment[]>([]);
  const [logs, setLogs] = useState<TransactionLog[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Live Sync States
  const [webAppUrl, setWebAppUrl] = useState<string>(() => localStorage.getItem('miq_6c_web_app_url') || '');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState<string>('');

  // Synchronize/fetch latest data from Google Sheets Web App
  const syncDataFromSheets = async (urlToUse = webAppUrl) => {
    if (!urlToUse) return;
    setIsSyncing(true);
    setSyncStatus('idle');
    try {
      const response = await fetch(`${urlToUse}?action=get_data`);
      const result = await response.json();
      if (result.status === 'success' && result.data) {
        const { students: s, cashPayments: cp, zarkasiPayments: zp, logs: lg, announcements: an } = result.data;
        setStudents(s);
        setCashPayments(cp);
        setZarkasiPayments(zp);
        setLogs(lg);
        if (an) {
          setAnnouncements(an);
        }

        localStorage.setItem('miq_6c_students', JSON.stringify(s));
        localStorage.setItem('miq_6c_cash', JSON.stringify(cp));
        localStorage.setItem('miq_6c_zarkasi', JSON.stringify(zp));
        localStorage.setItem('miq_6c_logs', JSON.stringify(lg));
        if (an) {
          localStorage.setItem('miq_6c_announcements', JSON.stringify(an));
        }

        setSyncStatus('success');
        setSyncMessage('Berhasil sinkronisasi data keuangan dari Google Sheets!');
      } else {
        throw new Error(result.message || 'Respons server tidak mengembalikan sukses');
      }
    } catch (err: any) {
      console.error(err);
      setSyncStatus('error');
      setSyncMessage(`Gagal sinkronisasi: ${err.message || 'Periksa koneksi internet atau URL Web App.'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // POST changes to Google Sheets Web App
  const postToSheets = async (action: string, payload: any) => {
    if (!webAppUrl) return true;
    setIsSyncing(true);
    try {
      const response = await fetch(webAppUrl, {
        method: 'POST',
        body: JSON.stringify({
          action,
          operator: 'Rosidul Mohtaz, M.Pd',
          ...payload
        })
      });
      const text = await response.text();
      try {
        const result = JSON.parse(text);
        if (result.status === 'error') {
          throw new Error(result.message);
        }
      } catch (e) {
        // Safe bypass if response is not direct JSON but redirected
      }
      return true;
    } catch (err: any) {
      console.error(err);
      alert(`Gagal mengirim data ke Google Sheets. Perubahan disimpan secara lokal. Error: ${err.message}`);
      return false;
    } finally {
      setIsSyncing(false);
      // Automatically pull latest re-calculated state from sheets
      await syncDataFromSheets();
    }
  };

  // Initialize database
  useEffect(() => {
    const url = localStorage.getItem('miq_6c_web_app_url') || '';
    if (url) {
      syncDataFromSheets(url);
    } else {
      // Local mode fallback loading
      const cachedStudents = localStorage.getItem('miq_6c_students');
      const cachedCash = localStorage.getItem('miq_6c_cash');
      const cachedZarkasi = localStorage.getItem('miq_6c_zarkasi');
      const cachedLogs = localStorage.getItem('miq_6c_logs');
      const cachedAnn = localStorage.getItem('miq_6c_announcements');

      if (cachedStudents && cachedCash && cachedZarkasi && cachedLogs && cachedAnn) {
        setStudents(JSON.parse(cachedStudents));
        setCashPayments(JSON.parse(cachedCash));
        setZarkasiPayments(JSON.parse(cachedZarkasi));
        setLogs(JSON.parse(cachedLogs));
        setAnnouncements(JSON.parse(cachedAnn));
      } else {
        // Set default pre-populated data
        setStudents(INITIAL_STUDENTS);
        setCashPayments(INITIAL_CASH_PAYMENTS);
        setZarkasiPayments(INITIAL_ZARKASI_PAYMENTS);
        setLogs(INITIAL_LOGS);
        setAnnouncements(INITIAL_ANNOUNCEMENTS);

        // Save to cache
        localStorage.setItem('miq_6c_students', JSON.stringify(INITIAL_STUDENTS));
        localStorage.setItem('miq_6c_cash', JSON.stringify(INITIAL_CASH_PAYMENTS));
        localStorage.setItem('miq_6c_zarkasi', JSON.stringify(INITIAL_ZARKASI_PAYMENTS));
        localStorage.setItem('miq_6c_logs', JSON.stringify(INITIAL_LOGS));
        localStorage.setItem('miq_6c_announcements', JSON.stringify(INITIAL_ANNOUNCEMENTS));
      }
    }
  }, []);

  // Set and persist Web App URL
  const handleSaveWebAppUrl = (url: string) => {
    setWebAppUrl(url);
    if (url) {
      localStorage.setItem('miq_6c_web_app_url', url);
      syncDataFromSheets(url);
    } else {
      localStorage.removeItem('miq_6c_web_app_url');
      // Reload defaults or cache
      const cachedStudents = localStorage.getItem('miq_6c_students') || JSON.stringify(INITIAL_STUDENTS);
      const cachedCash = localStorage.getItem('miq_6c_cash') || JSON.stringify(INITIAL_CASH_PAYMENTS);
      const cachedZarkasi = localStorage.getItem('miq_6c_zarkasi') || JSON.stringify(INITIAL_ZARKASI_PAYMENTS);
      const cachedLogs = localStorage.getItem('miq_6c_logs') || JSON.stringify(INITIAL_LOGS);
      const cachedAnn = localStorage.getItem('miq_6c_announcements') || JSON.stringify(INITIAL_ANNOUNCEMENTS);

      setStudents(JSON.parse(cachedStudents));
      setCashPayments(JSON.parse(cachedCash));
      setZarkasiPayments(JSON.parse(cachedZarkasi));
      setLogs(JSON.parse(cachedLogs));
      setAnnouncements(JSON.parse(cachedAnn));
      setSyncStatus('idle');
      setSyncMessage('');
    }
  };

  // Helper function to update & persist state locally
  const saveState = (
    updatedStudents: Student[],
    updatedCash: CashPayment[],
    updatedZarkasi: ZarkasiPayment[],
    updatedLogs: TransactionLog[],
    updatedAnn: Announcement[]
  ) => {
    setStudents(updatedStudents);
    setCashPayments(updatedCash);
    setZarkasiPayments(updatedZarkasi);
    setLogs(updatedLogs);
    setAnnouncements(updatedAnn);

    localStorage.setItem('miq_6c_students', JSON.stringify(updatedStudents));
    localStorage.setItem('miq_6c_cash', JSON.stringify(updatedCash));
    localStorage.setItem('miq_6c_zarkasi', JSON.stringify(updatedZarkasi));
    localStorage.setItem('miq_6c_logs', JSON.stringify(updatedLogs));
    localStorage.setItem('miq_6c_announcements', JSON.stringify(updatedAnn));
  };

  // Reset database to factory initial state
  const handleResetDatabase = () => {
    if (window.confirm('Reset ulang seluruh data keuangan kelas 6C ke pengaturan awal pabrik?')) {
      if (webAppUrl) {
        alert('Tidak dapat mereset data langsung jika sedang terhubung ke Google Sheets. Putuskan URL terlebih dahulu.');
        return;
      }
      saveState(
        INITIAL_STUDENTS,
        INITIAL_CASH_PAYMENTS,
        INITIAL_ZARKASI_PAYMENTS,
        INITIAL_LOGS,
        INITIAL_ANNOUNCEMENTS
      );
      setRole(null);
      setSelectedStudentId(null);
      setActiveMainTab('app');
    }
  };

  // ------------------- CONTROLLERS -------------------

  // 1. Add Student
  const handleAddStudent = (name: string, nisn: string, parentName: string) => {
    const newId = (students.length + 1).toString();
    const newStudent: Student = { id: newId, name, nisn, parentName };

    const newCashPayment: CashPayment = {
      studentId: newId,
      months: ACADEMIC_MONTHS.reduce((acc, month) => {
        acc[month] = false;
        return acc;
      }, {} as { [m: string]: boolean })
    };

    const newZarkasiPayment: ZarkasiPayment = {
      studentId: newId,
      amountPaid: 0,
      lastUpdated: new Date().toISOString()
    };

    const newLog: TransactionLog = {
      id: 'log-' + Date.now(),
      studentName: name,
      type: 'Uang Kas',
      description: 'Pendaftaran santri baru Kelas 6C',
      amount: 0,
      date: new Date().toISOString(),
      operator: 'Rosidul Mohtaz, M.Pd'
    };

    const updatedStudents = [...students, newStudent];
    const updatedCash = [...cashPayments, newCashPayment];
    const updatedZarkasi = [...zarkasiPayments, newZarkasiPayment];
    const updatedLogs = [newLog, ...logs];

    saveState(updatedStudents, updatedCash, updatedZarkasi, updatedLogs, announcements);

    if (webAppUrl) {
      postToSheets('add_student', { name, nisn, parentName });
    }
  };

  // 2. Edit Student Info
  const handleEditStudent = (id: string, name: string, nisn: string, parentName: string) => {
    const updatedStudents = students.map(s => s.id === id ? { ...s, name, nisn, parentName } : s);
    saveState(updatedStudents, cashPayments, zarkasiPayments, logs, announcements);

    if (webAppUrl) {
      postToSheets('edit_student', { studentId: id, name, nisn, parentName });
    }
  };

  // 3. Delete Student
  const handleDeleteStudent = (id: string) => {
    const targetStudent = students.find(s => s.id === id);
    if (!targetStudent) return;

    const updatedStudents = students.filter(s => s.id !== id);
    const updatedCash = cashPayments.filter(p => p.studentId !== id);
    const updatedZarkasi = zarkasiPayments.filter(p => p.studentId !== id);
    
    const newLog: TransactionLog = {
      id: 'log-' + Date.now(),
      studentName: targetStudent.name,
      type: 'Uang Kas',
      description: `Penghapusan data santri dari kelas`,
      amount: 0,
      date: new Date().toISOString(),
      operator: 'Rosidul Mohtaz, M.Pd'
    };
    const updatedLogs = [newLog, ...logs];

    saveState(updatedStudents, updatedCash, updatedZarkasi, updatedLogs, announcements);

    if (webAppUrl) {
      postToSheets('delete_student', { studentId: id });
    }
  };

  // 4. Toggle Class Cash monthly check (Guru only)
  const handleToggleCash = (studentId: string, month: string) => {
    const targetStudent = students.find(s => s.id === studentId);
    if (!targetStudent) return;

    let previousStatus = false;
    const updatedCash = cashPayments.map(p => {
      if (p.studentId === studentId) {
        previousStatus = p.months[month] || false;
        return {
          ...p,
          months: {
            ...p.months,
            [month]: !previousStatus
          }
        };
      }
      return p;
    });

    const isNowPaid = !previousStatus;
    const cashRate = 5000;

    const newLog: TransactionLog = {
      id: 'log-' + Date.now(),
      studentName: targetStudent.name,
      type: 'Uang Kas',
      description: `Uang Kas bulan ${month} diubah menjadi [${isNowPaid ? 'LUNAS' : 'BELUM LUNAS'}]`,
      amount: isNowPaid ? cashRate : -cashRate,
      date: new Date().toISOString(),
      operator: 'Rosidul Mohtaz, M.Pd'
    };

    saveState(students, updatedCash, zarkasiPayments, [newLog, ...logs], announcements);

    if (webAppUrl) {
      postToSheets('toggle_cash', { studentId, month });
    }
  };

  // 5. Pay Yearly Cash Lump Sum (Guru only)
  const handlePayYearlyCash = (studentId: string) => {
    const targetStudent = students.find(s => s.id === studentId);
    if (!targetStudent) return;

    const pay = cashPayments.find(p => p.studentId === studentId);
    if (!pay) return;

    const unpaidMonths = ACADEMIC_MONTHS.filter(m => !pay.months[m]);
    if (unpaidMonths.length === 0) {
      alert('Semua bulan di tahun ajaran ini sudah lunas!');
      return;
    }

    const lumpSumAmount = unpaidMonths.length * 5000;

    const updatedCash = cashPayments.map(p => {
      if (p.studentId === studentId) {
        const months = { ...p.months };
        ACADEMIC_MONTHS.forEach(m => { months[m] = true; });
        return { ...p, months };
      }
      return p;
    });

    const newLog: TransactionLog = {
      id: 'log-' + Date.now(),
      studentName: targetStudent.name,
      type: 'Uang Kas',
      description: `Pelunasan langsung uang kas setahun penuh (${unpaidMonths.length} bulan)`,
      amount: lumpSumAmount,
      date: new Date().toISOString(),
      operator: 'Rosidul Mohtaz, M.Pd'
    };

    saveState(students, updatedCash, zarkasiPayments, [newLog, ...logs], announcements);

    if (webAppUrl) {
      postToSheets('pay_yearly_cash', { studentId });
    }
  };

  // 6. Record Zarkasi installment (Guru only)
  const handleUpdateZarkasi = (studentId: string, amount: number, isInstallment: boolean) => {
    const targetStudent = students.find(s => s.id === studentId);
    if (!targetStudent) return;

    const updatedZarkasi = zarkasiPayments.map(p => {
      if (p.studentId === studentId) {
        return {
          ...p,
          amountPaid: p.amountPaid + amount,
          lastUpdated: new Date().toISOString()
        };
      }
      return p;
    });

    const newLog: TransactionLog = {
      id: 'log-' + Date.now(),
      studentName: targetStudent.name,
      type: 'Iuran Zarkasi',
      description: isInstallment ? `Setoran angsuran iuran Zarkasi` : `Pelunasan penuh iuran Zarkasi`,
      amount,
      date: new Date().toISOString(),
      operator: 'Rosidul Mohtaz, M.Pd'
    };

    saveState(students, cashPayments, updatedZarkasi, [newLog, ...logs], announcements);

    if (webAppUrl) {
      postToSheets('pay_zarkasi', { studentId, amount, isInstallment });
    }
  };

  // 7. Add Announcement (Guru only)
  const handleAddAnnouncement = (title: string, content: string) => {
    const newAnn: Announcement = {
      id: 'ann-' + Date.now(),
      title,
      content,
      date: new Date().toISOString(),
      author: 'Rosidul Mohtaz, M.Pd'
    };
    const updatedAnn = [newAnn, ...announcements];
    saveState(students, cashPayments, zarkasiPayments, logs, updatedAnn);

    if (webAppUrl) {
      postToSheets('add_announcement', { title, content, author: 'Rosidul Mohtaz, M.Pd' });
    }
  };

  // 8. Delete Announcement (Guru only)
  const handleDeleteAnnouncement = (id: string) => {
    const updatedAnn = announcements.filter(a => a.id !== id);
    saveState(students, cashPayments, zarkasiPayments, logs, updatedAnn);

    if (webAppUrl) {
      postToSheets('delete_announcement', { id });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-brand-orange/20">
      
      {/* Top Universal Platform Header */}
      <div className="w-full bg-slate-950 text-slate-100 py-3 px-4 flex justify-between items-center text-xs border-b-3 border-slate-900 print:hidden z-30">
        <div className="flex items-center space-x-2 md:space-x-4">
          <span className="font-black text-brand-orange font-sans tracking-widest text-sm uppercase">MI QUDSIYYAH PORTAL</span>
          <span className="hidden md:inline text-slate-700">|</span>
          <p className="hidden md:inline text-slate-300 font-bold uppercase tracking-wider text-[11px]">Wali Kelas: <strong className="text-white font-extrabold">Rosidul Mohtaz, M.Pd</strong></p>
          
          {/* Active Mode Badge in Header */}
          <span className="hidden lg:inline text-slate-700">|</span>
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-0.5 border-2 border-slate-900 rounded-none bg-slate-900 shadow-[1px_1px_0px_0px_rgba(249,115,22,1)]">
            {webAppUrl ? (
              <>
                <Wifi className="w-3 h-3 text-emerald-400 stroke-[3]" />
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Sheets Terhubung (LIVE)</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-brand-orange stroke-[3]" />
                <span className="text-[10px] font-black uppercase text-brand-orange tracking-wider">Simulasi Offline</span>
              </>
            )}
          </div>
        </div>
        
        {/* Navigation Switchers */}
        {role === 'teacher' && (
          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setActiveMainTab('app')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(249,115,22,1)] rounded transition-all font-black uppercase tracking-wider text-[10px] cursor-pointer ${
                activeMainTab === 'app' ? 'bg-brand-green text-white' : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Laptop className="w-3.5 h-3.5 text-brand-orange" />
              <span>Simulator Aplikasi</span>
            </button>
            
            <button
              onClick={() => setActiveMainTab('appscript')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(249,115,22,1)] rounded transition-all font-black uppercase tracking-wider text-[10px] cursor-pointer ${
                activeMainTab === 'appscript' ? 'bg-brand-green text-white' : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-brand-orange" />
              <span>Kode Apps Script</span>
            </button>

            <span className="text-slate-800">|</span>

            {/* Sync Trigger button */}
            {webAppUrl && (
              <button
                onClick={() => syncDataFromSheets()}
                disabled={isSyncing}
                className="text-slate-400 hover:text-brand-orange p-1.5 border-2 border-slate-900 bg-slate-900 rounded hover:bg-slate-850 transition-colors cursor-pointer"
                title="Sinkronisasi Ulang dengan Google Sheets"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            )}

            {/* Reset button */}
            <button
              onClick={handleResetDatabase}
              className="text-slate-400 hover:text-rose-500 p-1.5 border-2 border-slate-900 bg-slate-900 rounded hover:bg-slate-850 transition-colors cursor-pointer"
              title="Reset Database"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Container Router */}
      <div className="flex-1 flex flex-col">
        {activeMainTab === 'appscript' ? (
          <div className="p-4 md:p-8 flex-1 flex items-center justify-center">
            <AppScriptGenerator 
              webAppUrl={webAppUrl}
              setWebAppUrl={handleSaveWebAppUrl}
              isSyncing={isSyncing}
              syncStatus={syncStatus}
              syncMessage={syncMessage}
              onSync={() => syncDataFromSheets()}
            />
          </div>
        ) : (
          /* Simulator Tab */
          <div className="flex-1 flex flex-col">
            {!role ? (
              <Login
                students={students}
                onLoginTeacher={() => setRole('teacher')}
                onLoginGuardian={(studentId) => {
                  setRole('guardian');
                  setSelectedStudentId(studentId);
                }}
              />
            ) : role === 'teacher' ? (
              <TeacherDashboard
                students={students}
                cashPayments={cashPayments}
                zarkasiPayments={zarkasiPayments}
                logs={logs}
                announcements={announcements}
                onAddStudent={handleAddStudent}
                onEditStudent={handleEditStudent}
                onDeleteStudent={handleDeleteStudent}
                onToggleCash={handleToggleCash}
                onPayYearlyCash={handlePayYearlyCash}
                onUpdateZarkasi={handleUpdateZarkasi}
                onAddAnnouncement={handleAddAnnouncement}
                onDeleteAnnouncement={handleDeleteAnnouncement}
                onLogout={() => {
                  setRole(null);
                  setActiveMainTab('app');
                }}
              />
            ) : (
              <GuardianDashboard
                studentId={selectedStudentId || ''}
                students={students}
                cashPayments={cashPayments}
                zarkasiPayments={zarkasiPayments}
                logs={logs}
                announcements={announcements}
                onLogout={() => {
                  setRole(null);
                  setSelectedStudentId(null);
                  setActiveMainTab('app');
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
