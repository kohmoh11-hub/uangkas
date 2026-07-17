import { Student, CashPayment, ZarkasiPayment, TransactionLog, Announcement } from './types';

export const ACADEMIC_MONTHS = [
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni'
];

export const INITIAL_STUDENTS: Student[] = [
  { id: '1', name: 'Ahmad Faiz Kamaluddin', nisn: '0123456001', parentName: 'Kamiluddin' },
  { id: '2', name: 'Muhammad Rizqi Syahputra', nisn: '0123456002', parentName: 'Heri Syahputra' },
  { id: '3', name: 'Hilmi Aufar Rabbani', nisn: '0123456003', parentName: 'Sutrisno' },
  { id: '4', name: 'Abdullah Azam Mubarok', nisn: '0123456004', parentName: 'Mubarok' },
  { id: '5', name: 'Syamil Basayev Al-Fatih', nisn: '0123456005', parentName: 'Nurhadi' },
  { id: '6', name: 'Khabib Nurmaulid', nisn: '0123456006', parentName: 'Maulidi' },
  { id: '7', name: 'Faza Muhammad Ihsan', nisn: '0123456007', parentName: 'Subekti Ihsan' },
  { id: '8', name: 'Hasan Al-Banna', nisn: '0123456008', parentName: 'Sholehuddin' },
  { id: '9', name: 'Zainuddin Fanani', nisn: '0123456009', parentName: 'Fanani' },
  { id: '10', name: 'Abdurrahman Wahid', nisn: '0123456010', parentName: 'Achmad Syaifuddin' },
  { id: '11', name: 'Ali bin Abi Tholib', nisn: '0123456011', parentName: 'Samsul Arifin' },
  { id: '12', name: 'Fathurrahman Al-Ghazi', nisn: '0123456012', parentName: 'Imron Ghazi' },
  { id: '13', name: 'Habiburrahman El-Shirazy', nisn: '0123456013', parentName: 'Shirazy' },
  { id: '14', name: 'Luqman Hakim', nisn: '0123456014', parentName: 'Hakim Widodo' },
  { id: '15', name: 'Rizwan Shodiq', nisn: '0123456015', parentName: 'Shodiqul Amin' },
  { id: '16', name: 'Hamzah Fansuri', nisn: '0123456016', parentName: 'Budi Fansuri' },
  { id: '17', name: 'Dhiyaul Haq', nisn: '0123456017', parentName: 'Zaenal Abidin' },
  { id: '18', name: 'Mufid Ridho', nisn: '0123456018', parentName: 'Ridho' },
  { id: '19', name: 'Yahya Muhaimin', nisn: '0123456019', parentName: 'Muhaimin' },
  { id: '20', name: 'Zulfaqar Ali', nisn: '0123456020', parentName: 'Ali Murtadho' },
];

export const INITIAL_CASH_PAYMENTS: CashPayment[] = INITIAL_STUDENTS.map((student, idx) => {
  const months: { [monthName: string]: boolean } = {};
  ACADEMIC_MONTHS.forEach((month, mIdx) => {
    // Make some months paid based on index to create a realistic mixed initial state
    months[month] = mIdx < (5 + (idx % 4));
  });
  return { studentId: student.id, months };
});

export const INITIAL_ZARKASI_PAYMENTS: ZarkasiPayment[] = INITIAL_STUDENTS.map((student, idx) => {
  // Total Zarkasi is 750.000. Give students different payment stages: some fully paid, some partial, some none.
  let amountPaid = 0;
  if (idx % 3 === 0) {
    amountPaid = 750000; // Paid off
  } else if (idx % 3 === 1) {
    amountPaid = 350000; // Partial installment
  } else {
    amountPaid = 0; // Not paid yet
  }
  return {
    studentId: student.id,
    amountPaid,
    lastUpdated: '2026-07-10T14:30:00Z',
  };
});

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Pemberitahuan Pelunasan Iuran Zarkasi Kelas 6',
    content: 'Assalamu\'alaikum wr. wb. Diberitahukan kepada seluruh wali santri Kelas 6C MI Qudsiyyah bahwa iuran Zarkasi sebesar Rp 750.000 diharapkan dapat diangsur atau dilunasi sebelum pelaksanaan ujian akhir semester ganjil. Terima kasih atas perhatiannya. Wassalamu\'alaikum wr. wb.',
    date: '2026-07-15T08:00:00Z',
    author: 'Rosidul Mohtaz, M.Pd'
  },
  {
    id: 'ann-2',
    title: 'Laporan Rekap Bulanan Uang Kas',
    content: 'Pencatatan uang kas bulan Juli telah diperbarui. Silakan bapak/ibu wali santri untuk memantau status pembayaran uang kas putra masing-masing melalui portal ini. Besaran uang kas adalah Rp 5.000 per bulan atau Rp 60.000 per tahun.',
    date: '2026-07-12T10:30:00Z',
    author: 'Rosidul Mohtaz, M.Pd'
  }
];

export const INITIAL_LOGS: TransactionLog[] = [
  {
    id: 'log-1',
    studentName: 'Ahmad Faiz Kamaluddin',
    type: 'Uang Kas',
    description: 'Pembayaran Uang Kas bulan Juli & Agustus',
    amount: 10000,
    date: '2026-07-16T09:15:00Z',
    operator: 'Rosidul Mohtaz, M.Pd'
  },
  {
    id: 'log-2',
    studentName: 'Muhammad Rizqi Syahputra',
    type: 'Iuran Zarkasi',
    description: 'Pembayaran angsuran Iuran Zarkasi',
    amount: 350000,
    date: '2026-07-15T11:20:00Z',
    operator: 'Rosidul Mohtaz, M.Pd'
  },
  {
    id: 'log-3',
    studentName: 'Ahmad Faiz Kamaluddin',
    type: 'Iuran Zarkasi',
    description: 'Pelunasan Iuran Zarkasi Kelas 6',
    amount: 750000,
    date: '2026-07-14T08:30:00Z',
    operator: 'Rosidul Mohtaz, M.Pd'
  }
];
