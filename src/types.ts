export interface Student {
  id: string;
  name: string;
  nisn: string;
  parentName: string;
}

export interface CashPayment {
  studentId: string;
  months: { [monthName: string]: boolean }; // e.g., { "Juli": true, "Agustus": false, ... }
}

export interface ZarkasiPayment {
  studentId: string;
  amountPaid: number; // Max Rp 750.000
  lastUpdated: string;
}

export interface TransactionLog {
  id: string;
  studentName: string;
  type: 'Uang Kas' | 'Iuran Zarkasi';
  description: string;
  amount: number;
  date: string;
  operator: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
}
