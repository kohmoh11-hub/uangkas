import React, { useState } from 'react';
import { Copy, Check, FileCode, Database, AlertCircle, RefreshCw, Wifi, WifiOff, CheckCircle } from 'lucide-react';

interface AppScriptGeneratorProps {
  webAppUrl: string;
  setWebAppUrl: (url: string) => void;
  isSyncing: boolean;
  syncStatus: 'idle' | 'success' | 'error';
  syncMessage: string;
  onSync: () => void;
}

export default function AppScriptGenerator({
  webAppUrl,
  setWebAppUrl,
  isSyncing,
  syncStatus,
  syncMessage,
  onSync
}: AppScriptGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const [inputUrl, setInputUrl] = useState(webAppUrl);

  const appsScriptCode = `/**
 * SISTEM INFORMASI KEUANGAN KELAS 6C - MI QUDSIYYAH KUDUS
 * Wali Kelas: ROSIDUL MOHTAZ, M.Pd
 * 
 * Aturan Finansial:
 * 1. Uang Kas Kelas: Rp 5.000 / bulan atau Rp 60.000 / tahun
 * 2. Iuran Zarkasi Kelas 6: Rp 750.000 / santri (Dapat diangsur)
 * 
 * PETUNJUK DEPLOYMENT OTOMATIS:
 * 1. Buat Google Spreadsheet baru di Google Drive Anda.
 * 2. Buka menu Ekstensi -> Apps Script.
 * 3. Hapus semua kode bawaan, lalu paste seluruh kode ini.
 * 4. Klik ikon Simpan (kertas disket).
 * 5. Pilih fungsi "setupSpreadsheet" di toolbar atas, lalu klik tombol "Jalankan (Run)".
 *    Berikan izin akses ke Akun Google Anda jika diminta. Fungsi ini akan membuat 
 *    5 Sheet (Siswa, Uang_Kas, Zarkasi, Log, Pengumuman) secara otomatis beserta contoh datanya!
 * 6. Klik "Terapkan (Deploy)" -> "Penerapan Baru (New Deployment)".
 * 7. Pilih Jenis: "Aplikasi Web (Web App)".
 * 8. Setel "Akses" ke: "Siapa saja (Anyone)". Klik Terapkan.
 * 9. Salin URL Aplikasi Web yang diberikan, lalu paste pada kolom koneksi di aplikasi ini!
 */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

// Fungsi Setup Otomatis Sheet dan Tabel Keuangan
function setupSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Setup sheet "Siswa"
  let siswaSheet = ss.getSheetByName("Siswa");
  if (!siswaSheet) {
    siswaSheet = ss.insertSheet("Siswa");
    siswaSheet.appendRow(["Id", "Nama", "NISN", "Orang_Tua"]);
  }
  
  // 2. Setup sheet "Uang_Kas"
  let kasSheet = ss.getSheetByName("Uang_Kas");
  if (!kasSheet) {
    kasSheet = ss.insertSheet("Uang_Kas");
    kasSheet.appendRow(["Id", "Juli", "Agustus", "September", "Oktober", "November", "Desember", "Januari", "Februari", "Maret", "April", "Mei", "Juni"]);
  }
  
  // 3. Setup sheet "Zarkasi"
  let zarkasiSheet = ss.getSheetByName("Zarkasi");
  if (!zarkasiSheet) {
    zarkasiSheet = ss.insertSheet("Zarkasi");
    zarkasiSheet.appendRow(["Id", "Terbayar", "Last_Updated"]);
  }
  
  // 4. Setup sheet "Log"
  let logSheet = ss.getSheetByName("Log");
  if (!logSheet) {
    logSheet = ss.insertSheet("Log");
    logSheet.appendRow(["Nama_Santri", "Jenis", "Detail_Transaksi", "Nominal", "Waktu", "Operator"]);
  }
  
  // 5. Setup sheet "Pengumuman"
  let pengumumanSheet = ss.getSheetByName("Pengumuman");
  if (!pengumumanSheet) {
    pengumumanSheet = ss.insertSheet("Pengumuman");
    pengumumanSheet.appendRow(["Id", "Judul", "Isi", "Waktu", "Penulis"]);
  }
  
  // Hapus "Sheet1" bawaan jika kosong
  const defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet && ss.getSheets().length > 1) {
    try {
      ss.deleteSheet(defaultSheet);
    } catch(e) {}
  }
  
  // Seed sample data jika baru dibuat
  if (siswaSheet.getLastRow() === 1) {
    seedSampleData(ss);
  }
  
  return "Setup Berhasil! Semua sheet dan kolom iuran telah dikonfigurasi otomatis.";
}

function seedSampleData(ss) {
  const siswaSheet = ss.getSheetByName("Siswa");
  const kasSheet = ss.getSheetByName("Uang_Kas");
  const zarkasiSheet = ss.getSheetByName("Zarkasi");
  const logSheet = ss.getSheetByName("Log");
  const pengumumanSheet = ss.getSheetByName("Pengumuman");

  const sampleStudents = [
    ["1", "Ahmad Faiz Kamaluddin", "0123456001", "Kamiluddin"],
    ["2", "Muhammad Rizqi Syahputra", "0123456002", "Heri Syahputra"],
    ["3", "Hilmi Aufar Rabbani", "0123456003", "Sutrisno"],
    ["4", "Abdullah Azam Mubarok", "0123456004", "Mubarok"],
    ["5", "Syamil Basayev Al-Fatih", "0123456005", "Nurhadi"]
  ];
  sampleStudents.forEach(row => siswaSheet.appendRow(row));

  const sampleCash = [
    ["1", true, true, false, false, false, false, false, false, false, false, false, false],
    ["2", true, true, true, false, false, false, false, false, false, false, false, false],
    ["3", true, false, false, false, false, false, false, false, false, false, false, false],
    ["4", true, true, true, true, true, false, false, false, false, false, false, false],
    ["5", false, false, false, false, false, false, false, false, false, false, false, false]
  ];
  sampleCash.forEach(row => kasSheet.appendRow(row));

  const sampleZarkasi = [
    ["1", 750000, new Date().toISOString()],
    ["2", 350000, new Date().toISOString()],
    ["3", 0, new Date().toISOString()],
    ["4", 750000, new Date().toISOString()],
    ["5", 0, new Date().toISOString()]
  ];
  sampleZarkasi.forEach(row => zarkasiSheet.appendRow(row));

  const sampleLogs = [
    ["Ahmad Faiz Kamaluddin", "Uang Kas", "Pembayaran Uang Kas bulan Juli & Agustus", 10000, new Date().toISOString(), "Rosidul Mohtaz, M.Pd"],
    ["Muhammad Rizqi Syahputra", "Iuran Zarkasi", "Pembayaran angsuran Iuran Zarkasi", 350000, new Date().toISOString(), "Rosidul Mohtaz, M.Pd"],
    ["Ahmad Faiz Kamaluddin", "Iuran Zarkasi", "Pelunasan Iuran Zarkasi Kelas 6", 750000, new Date().toISOString(), "Rosidul Mohtaz, M.Pd"]
  ];
  sampleLogs.forEach(row => logSheet.appendRow(row));

  const sampleAnnouncements = [
    ["ann-1", "Pemberitahuan Pelunasan Iuran Zarkasi Kelas 6", "Assalamu'alaikum wr. wb. Diberitahukan kepada seluruh wali santri Kelas 6C MI Qudsiyyah bahwa iuran Zarkasi sebesar Rp 750.000 diharapkan dapat diangsur atau dilunasi sebelum pelaksanaan ujian akhir semester ganjil. Terima kasih atas perhatiannya. Wassalamu'alaikum wr. wb.", new Date().toISOString(), "Rosidul Mohtaz, M.Pd"],
    ["ann-2", "Laporan Rekap Bulanan Uang Kas", "Pencatatan uang kas bulan Juli telah diperbarui. Silakan bapak/ibu wali santri untuk memantau status pembayaran uang kas putra masing-masing melalui portal ini. Besaran uang kas adalah Rp 5.000 per bulan atau Rp 60.000 per tahun.", new Date().toISOString(), "Rosidul Mohtaz, M.Pd"]
  ];
  sampleAnnouncements.forEach(row => pengumumanSheet.appendRow(row));
}

// ------------------- MAIN ROUTING -------------------

function doGet(e) {
  const action = e.parameter.action;
  
  if (!action) {
    return createJsonResponse({ status: "success", message: "Koneksi API Keuangan Kelas 6C MI Qudsiyyah Aktif!" });
  }

  try {
    if (action === "get_data") {
      return handleGetData();
    }
    return createJsonResponse({ status: "error", message: "Action doGet tidak dikenali" });
  } catch (error) {
    return createJsonResponse({ status: "error", message: error.toString() });
  }
}

function doPost(e) {
  let postData;
  try {
    postData = JSON.parse(e.postData.contents);
  } catch (err) {
    return createJsonResponse({ status: "error", message: "Format JSON tidak valid" });
  }

  const action = postData.action;

  try {
    if (action === "toggle_cash") {
      return handleToggleCash(postData);
    } else if (action === "pay_yearly_cash") {
      return handlePayYearlyCash(postData);
    } else if (action === "pay_zarkasi") {
      return handlePayZarkasi(postData);
    } else if (action === "add_student") {
      return handleAddStudent(postData);
    } else if (action === "edit_student") {
      return handleEditStudent(postData);
    } else if (action === "delete_student") {
      return handleDeleteStudent(postData);
    } else if (action === "add_announcement") {
      return handleAddAnnouncement(postData);
    } else if (action === "delete_announcement") {
      return handleDeleteAnnouncement(postData);
    }
    return createJsonResponse({ status: "error", message: "Action doPost tidak dikenali" });
  } catch (error) {
    return createJsonResponse({ status: "error", message: error.toString() });
  }
}

// ------------------- API HANDLERS -------------------

function handleGetData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Ambil Data Siswa
  const studentSheet = ss.getSheetByName("Siswa");
  const studentRows = studentSheet.getDataRange().getValues();
  const students = [];
  for (let i = 1; i < studentRows.length; i++) {
    students.push({
      id: studentRows[i][0].toString(),
      name: studentRows[i][1],
      nisn: studentRows[i][2].toString(),
      parentName: studentRows[i][3]
    });
  }

  // 2. Ambil Data Uang Kas
  const cashSheet = ss.getSheetByName("Uang_Kas");
  const cashRows = cashSheet.getDataRange().getValues();
  const monthsHeader = cashRows[0].slice(1, 13); // Juli s/d Juni
  const cashPayments = [];
  for (let i = 1; i < cashRows.length; i++) {
    const studentId = cashRows[i][0].toString();
    const months = {};
    monthsHeader.forEach((m, idx) => {
      months[m] = cashRows[i][idx + 1] === true || cashRows[i][idx + 1] === "TRUE" || cashRows[i][idx + 1] === 1;
    });
    cashPayments.push({ studentId, months });
  }

  // 3. Ambil Data Zarkasi
  const zarkasiSheet = ss.getSheetByName("Zarkasi");
  const zarkasiRows = zarkasiSheet.getDataRange().getValues();
  const zarkasiPayments = [];
  for (let i = 1; i < zarkasiRows.length; i++) {
    zarkasiPayments.push({
      studentId: zarkasiRows[i][0].toString(),
      amountPaid: Number(zarkasiRows[i][1]) || 0,
      lastUpdated: zarkasiRows[i][2] || new Date().toISOString()
    });
  }

  // 4. Ambil Log Transaksi
  const logSheet = ss.getSheetByName("Log");
  const logRows = logSheet.getDataRange().getValues();
  const logs = [];
  for (let i = Math.max(1, logRows.length - 100); i < logRows.length; i++) {
    logs.push({
      id: "log-" + i,
      studentName: logRows[i][0],
      type: logRows[i][1],
      description: logRows[i][2],
      amount: Number(logRows[i][3]) || 0,
      date: logRows[i][4],
      operator: logRows[i][5]
    });
  }

  // 5. Ambil Pengumuman
  const pengumumanSheet = ss.getSheetByName("Pengumuman");
  const announcements = [];
  if (pengumumanSheet) {
    const annRows = pengumumanSheet.getDataRange().getValues();
    for (let i = 1; i < annRows.length; i++) {
      announcements.push({
        id: annRows[i][0].toString(),
        title: annRows[i][1],
        content: annRows[i][2],
        date: annRows[i][3],
        author: annRows[i][4]
      });
    }
  }

  return createJsonResponse({
    status: "success",
    data: {
      students,
      cashPayments,
      zarkasiPayments,
      logs: logs.reverse(),
      announcements: announcements.reverse()
    }
  });
}

function handleToggleCash(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Uang_Kas");
  const rows = sheet.getDataRange().getValues();
  
  const studentId = data.studentId.toString();
  const month = data.month;
  
  const header = rows[0];
  const colIndex = header.indexOf(month);
  if (colIndex === -1) throw new Error("Bulan tidak valid: " + month);

  let rowIndex = -1;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0].toString() === studentId) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex === -1) throw new Error("Siswa tidak ditemukan di tab Kas");

  const cell = sheet.getRange(rowIndex, colIndex + 1);
  const currentValue = cell.getValue();
  const newValue = !currentValue;
  cell.setValue(newValue);

  const studentName = getStudentNameById(studentId);
  logTransaction(studentName, "Uang Kas", "Mengubah status kas bulan " + month + " menjadi " + (newValue ? "LUNAS" : "BELUM LUNAS"), newValue ? 5000 : -5000, data.operator);

  return createJsonResponse({ status: "success", message: "Status kas berhasil diperbarui!" });
}

function handlePayYearlyCash(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Uang_Kas");
  const rows = sheet.getDataRange().getValues();
  
  const studentId = data.studentId.toString();
  let rowIndex = -1;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0].toString() === studentId) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex === -1) throw new Error("Siswa tidak ditemukan di tab Kas");

  const studentRow = rows[rowIndex - 1];
  let unpaidCount = 0;
  for (let col = 1; col <= 12; col++) {
    if (studentRow[col] !== true && studentRow[col] !== "TRUE" && studentRow[col] !== 1) {
      unpaidCount++;
    }
    sheet.getRange(rowIndex, col + 1).setValue(true);
  }

  const studentName = getStudentNameById(studentId);
  const amountPaid = unpaidCount * 5000;
  logTransaction(studentName, "Uang Kas", "Pelunasan langsung uang kas setahun penuh (" + unpaidCount + " bulan)", amountPaid, data.operator);

  return createJsonResponse({ status: "success", message: "Pelunasan setahun berhasil dicatat!" });
}

function handlePayZarkasi(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Zarkasi");
  const rows = sheet.getDataRange().getValues();
  
  const studentId = data.studentId.toString();
  const amountToPay = Number(data.amount);
  const isInstallment = data.isInstallment;

  let rowIndex = -1;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0].toString() === studentId) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex === -1) throw new Error("Siswa tidak ditemukan di tab Zarkasi");

  const currentPaid = Number(sheet.getRange(rowIndex, 2).getValue()) || 0;
  const finalPaid = currentPaid + amountToPay;
  if (finalPaid > 750000) {
    throw new Error("Pembayaran melebihi kuota iuran Zarkasi Rp 750.000");
  }

  sheet.getRange(rowIndex, 2).setValue(finalPaid);
  sheet.getRange(rowIndex, 3).setValue(new Date().toISOString());

  const studentName = getStudentNameById(studentId);
  logTransaction(
    studentName, 
    "Iuran Zarkasi", 
    isInstallment ? "Pembayaran angsuran Zarkasi" : "Pelunasan Zarkasi Kelas 6", 
    amountToPay, 
    data.operator
  );

  return createJsonResponse({ status: "success", message: "Iuran Zarkasi berhasil dicatat!" });
}

function handleAddStudent(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const studentSheet = ss.getSheetByName("Siswa");
  const cashSheet = ss.getSheetByName("Uang_Kas");
  const zarkasiSheet = ss.getSheetByName("Zarkasi");

  // ID unik berdasarkan timestamp / auto increment baris
  const id = (studentSheet.getLastRow()).toString();
  
  studentSheet.appendRow([id, data.name, data.nisn, data.parentName]);

  const defaultCash = [id, false, false, false, false, false, false, false, false, false, false, false, false];
  cashSheet.appendRow(defaultCash);

  zarkasiSheet.appendRow([id, 0, new Date().toISOString()]);

  logTransaction(data.name, "Siswa", "Pendaftaran santri baru Kelas 6C", 0, data.operator);

  return createJsonResponse({ status: "success", message: "Santri baru berhasil terdaftar!" });
}

function handleEditStudent(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Siswa");
  const rows = sheet.getDataRange().getValues();
  
  const studentId = data.studentId.toString();
  let rowIndex = -1;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0].toString() === studentId) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex === -1) throw new Error("Siswa tidak ditemukan untuk diedit");

  sheet.getRange(rowIndex, 2).setValue(data.name);
  sheet.getRange(rowIndex, 3).setValue(data.nisn.toString());
  sheet.getRange(rowIndex, 4).setValue(data.parentName);

  logTransaction(data.name, "Siswa", "Mengubah informasi data diri santri", 0, data.operator);

  return createJsonResponse({ status: "success", message: "Data santri berhasil diperbarui!" });
}

function handleDeleteStudent(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const studentId = data.studentId.toString();
  const studentName = getStudentNameById(studentId);

  // 1. Hapus dari Siswa
  const siswaSheet = ss.getSheetByName("Siswa");
  const siswaRows = siswaSheet.getDataRange().getValues();
  for (let i = 1; i < siswaRows.length; i++) {
    if (siswaRows[i][0].toString() === studentId) {
      siswaSheet.deleteRow(i + 1);
      break;
    }
  }

  // 2. Hapus dari Uang_Kas
  const cashSheet = ss.getSheetByName("Uang_Kas");
  const cashRows = cashSheet.getDataRange().getValues();
  for (let i = 1; i < cashRows.length; i++) {
    if (cashRows[i][0].toString() === studentId) {
      cashSheet.deleteRow(i + 1);
      break;
    }
  }

  // 3. Hapus dari Zarkasi
  const zarkasiSheet = ss.getSheetByName("Zarkasi");
  const zarkasiRows = zarkasiSheet.getDataRange().getValues();
  for (let i = 1; i < zarkasiRows.length; i++) {
    if (zarkasiRows[i][0].toString() === studentId) {
      zarkasiSheet.deleteRow(i + 1);
      break;
    }
  }

  logTransaction(studentName, "Siswa", "Menghapus data santri dari kelas", 0, data.operator);

  return createJsonResponse({ status: "success", message: "Data santri berhasil dihapus!" });
}

function handleAddAnnouncement(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Pengumuman");
  
  const id = "ann-" + Date.now();
  sheet.appendRow([
    id,
    data.title,
    data.content,
    new Date().toISOString(),
    data.author || "Rosidul Mohtaz, M.Pd"
  ]);

  return createJsonResponse({ status: "success", message: "Pengumuman berhasil disiarkan!" });
}

function handleDeleteAnnouncement(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Pengumuman");
  const rows = sheet.getDataRange().getValues();
  
  const annId = data.id.toString();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0].toString() === annId) {
      sheet.deleteRow(i + 1);
      break;
    }
  }

  return createJsonResponse({ status: "success", message: "Pengumuman berhasil dihapus!" });
}

// ----------------- UTILS -----------------

function getStudentNameById(id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Siswa");
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0].toString() === id.toString()) return rows[i][1];
  }
  return "Santri Tidak Dikenal";
}

function logTransaction(studentName, type, description, amount, operator) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Log");
  sheet.appendRow([
    studentName,
    type,
    description,
    amount,
    new Date().toISOString(),
    operator || "Sistem"
  ]);
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveConnection = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = inputUrl.trim();
    setWebAppUrl(cleanUrl);
  };

  return (
    <div className="bg-white rounded-none border-4 border-slate-900 p-6 md:p-8 space-y-6 max-w-4xl mx-auto shadow-[8px_8px_0px_0px_#0B4619]" id="appscript-gen-section">
      {/* Tab Header Banner */}
      <div className="flex items-center space-x-3 pb-5 border-b-3 border-slate-900">
        <div className="p-3 bg-brand-green text-white border-2 border-slate-900 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <Database className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-950 uppercase tracking-wider">Koneksi & Kode Google Sheets Backend</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wide mt-0.5">
            Hubungkan aplikasi ini dengan Google Spreadsheet Anda secara gratis dan langsung!
          </p>
        </div>
      </div>

      {/* Connection Panel - Neo-brutalist widget */}
      <div className="bg-amber-50 border-4 border-slate-950 p-5 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        <div className="md:col-span-4 space-y-2">
          <div className="flex items-center space-x-2">
            {webAppUrl ? (
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            ) : (
              <span className="h-3 w-3 rounded-full bg-brand-orange"></span>
            )}
            <h3 className="font-black text-xs uppercase tracking-wider text-slate-950">Status Integrasi</h3>
          </div>
          {webAppUrl ? (
            <div className="text-xs text-slate-800 space-y-1">
              <p className="font-extrabold text-brand-green uppercase tracking-wider flex items-center space-x-1">
                <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Terhubung ke Sheets (LIVE)</span>
              </p>
              <p className="text-[10px] text-slate-500 font-mono truncate max-w-[200px]" title={webAppUrl}>{webAppUrl}</p>
            </div>
          ) : (
            <div className="text-xs text-slate-800 space-y-1">
              <p className="font-extrabold text-brand-orange uppercase tracking-wider flex items-center space-x-1">
                <WifiOff className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Mode Simulasi (Offline)</span>
              </p>
              <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">Data disimpan dalam memory browser Anda.</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSaveConnection} className="md:col-span-8 flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-[10px] text-slate-700 font-extrabold uppercase tracking-wider mb-1">
              URL Web App Google Apps Script
            </label>
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="w-full border-3 border-slate-950 bg-white px-3 py-2 text-xs font-bold text-slate-950 placeholder-slate-400 focus:outline-none focus:border-brand-orange"
            />
          </div>
          <div className="sm:self-end flex space-x-2">
            <button
              type="submit"
              className="bg-brand-orange hover:bg-brand-orange-hover text-slate-950 hover:text-white font-black text-xs px-4 py-2.5 border-2 border-slate-950 uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] transition-all"
            >
              Simpan URL
            </button>
            {webAppUrl && (
              <button
                type="button"
                onClick={onSync}
                disabled={isSyncing}
                className="bg-white hover:bg-slate-100 text-slate-950 font-black text-xs px-3.5 py-2.5 border-2 border-slate-950 uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] transition-all disabled:opacity-50 flex items-center justify-center"
                title="Sinkronisasi Ulang"
              >
                <RefreshCw className={`w-4 h-4 stroke-[2.5] ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Sync messages alert panel */}
      {syncStatus !== 'idle' && (
        <div className={`p-4 border-3 border-slate-950 text-xs font-bold uppercase tracking-wider flex items-center space-x-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
          syncStatus === 'success' ? 'bg-emerald-100 text-slate-950' : 'bg-red-100 text-slate-950'
        }`}>
          {syncStatus === 'success' ? (
            <CheckCircle className="w-5 h-5 text-brand-green shrink-0 stroke-[2.5]" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 stroke-[2.5]" />
          )}
          <span>{syncMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Instruction Section */}
        <div className="lg:col-span-5 space-y-5 text-xs text-slate-800 leading-relaxed font-semibold">
          <div className="space-y-4">
            <h4 className="font-black text-slate-950 uppercase tracking-widest text-[11px] border-b-2 border-slate-950 pb-1">
              Cara Menyambungkan Ke Spreadsheet Anda:
            </h4>
            
            <div className="flex items-start space-x-2.5">
              <span className="w-6 h-6 bg-brand-green text-white font-black border-2 border-slate-900 flex items-center justify-center shrink-0 text-xs shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">1</span>
              <p className="pt-0.5">
                Buat <strong>Google Spreadsheet</strong> baru di Google Drive Anda. Beri nama bebas (misal: <code>Keuangan Kelas 6C Qudsiyyah</code>).
              </p>
            </div>

            <div className="flex items-start space-x-2.5">
              <span className="w-6 h-6 bg-brand-green text-white font-black border-2 border-slate-900 flex items-center justify-center shrink-0 text-xs shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">2</span>
              <p className="pt-0.5">
                Klik menu <strong>Ekstensi (Extensions)</strong> &gt; <strong>Apps Script</strong> di toolbar atas Google Sheets.
              </p>
            </div>

            <div className="flex items-start space-x-2.5">
              <span className="w-6 h-6 bg-brand-green text-white font-black border-2 border-slate-900 flex items-center justify-center shrink-0 text-xs shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">3</span>
              <p className="pt-0.5">
                Hapus seluruh kode default <code>function myFunction() &#123;&#125;</code>, lalu <strong>salin kode lengkap Code.gs</strong> di samping dan tempel (paste) seluruhnya ke dalam editor.
              </p>
            </div>

            <div className="flex items-start space-x-2.5">
              <span className="w-6 h-6 bg-brand-green text-white font-black border-2 border-slate-900 flex items-center justify-center shrink-0 text-xs shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">4</span>
              <p className="pt-0.5">
                Klik ikon <strong>Simpan Projek (floppy disk)</strong>. Lalu pada toolbar fungsi atas, pilih <strong>"setupSpreadsheet"</strong> dan klik <strong>Jalankan (Run)</strong>. Beri otorisasi akses Google. Ini akan otomatis mengonfigurasi seluruh tabel database di spreadsheet Anda!
              </p>
            </div>

            <div className="flex items-start space-x-2.5">
              <span className="w-6 h-6 bg-brand-green text-white font-black border-2 border-slate-900 flex items-center justify-center shrink-0 text-xs shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">5</span>
              <p className="pt-0.5">
                Klik tombol <strong>Terapkan (Deploy)</strong> &gt; <strong>Penerapan Baru (New Deployment)</strong>. Pilih tipe <strong>Aplikasi Web (Web App)</strong>. Atur akses ke <strong>"Siapa saja" (Anyone)</strong>, lalu klik Terapkan.
              </p>
            </div>

            <div className="flex items-start space-x-2.5">
              <span className="w-6 h-6 bg-brand-green text-white font-black border-2 border-slate-900 flex items-center justify-center shrink-0 text-xs shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">6</span>
              <p className="pt-0.5">
                Salin <strong>URL Aplikasi Web</strong> yang dihasilkan (berakhiran <code>/exec</code>), tempel di formulir koneksi di atas, lalu klik <strong>Simpan URL</strong>. Selesai! Aplikasi Anda telah bertransformasi menjadi full-stack terhubung rill!
              </p>
            </div>
          </div>
        </div>

        {/* Code Block Section */}
        <div className="lg:col-span-7 flex flex-col border-3 border-slate-900 rounded-none overflow-hidden bg-slate-950 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
          <div className="bg-slate-900 px-4 py-3 flex justify-between items-center text-slate-300 border-b-2 border-slate-900">
            <div className="flex items-center space-x-2">
              <FileCode className="w-4.5 h-4.5 text-brand-orange" />
              <span className="font-mono text-xs font-black uppercase tracking-wider text-white">Code.gs</span>
            </div>
            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-1.5 bg-brand-orange hover:bg-brand-orange-hover active:bg-slate-950 text-slate-950 hover:text-white font-black text-[10px] px-3 py-2 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-wider cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Berhasil Disalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Semua Kode</span>
                </>
              )}
            </button>
          </div>
          
          <pre className="p-4 overflow-x-auto text-[10.5px] text-brand-orange font-mono leading-relaxed h-[420px] select-all scrollbar-thin scrollbar-thumb-slate-700 bg-slate-950">
            {appsScriptCode}
          </pre>
        </div>
      </div>
    </div>
  );
}
