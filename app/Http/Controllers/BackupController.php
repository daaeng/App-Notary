<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;

class BackupController extends Controller
{
    public function download()
    {
        $filename = "backup-notaris-" . Carbon::now()->format('Y-m-d-H-i-s') . ".sql";
        $filePath = storage_path("app/{$filename}");

        // 1. Ambil Konfigurasi dari .env
        $dbName = env('DB_DATABASE');
        $dbUser = env('DB_USERNAME');
        $dbPass = env('DB_PASSWORD');
        $dbHost = env('DB_HOST');

        // Path ke mysqldump. Di server Linux biasanya cukup 'mysqldump'.
        // Di Windows (XAMPP), harus full path, misal: "C:/xampp/mysql/bin/mysqldump.exe"
        // Kita set default 'mysqldump', tapi bisa ditimpa lewat .env
        $dumpBinaryPath = env('MYSQLDUMP_PATH', 'mysqldump');

        // 2. Susun Perintah (Command) dengan aman
        // Menggunakan kutip agar path yang berspasi tidak error
        $command = "\"{$dumpBinaryPath}\" --user=\"{$dbUser}\" --host=\"{$dbHost}\"";

        if (!empty($dbPass)) {
            $command .= " --password=\"{$dbPass}\"";
        }

        $command .= " \"{$dbName}\" > \"{$filePath}\"";

        // 3. Eksekusi Perintah
        $output = null;
        $resultCode = null;

        // exec mengembalikan output baris terakhir, dan resultCode (0 = sukses)
        exec($command, $output, $resultCode);

        // 4. Cek Hasil & Download
        if ($resultCode === 0 && file_exists($filePath)) {
            // Sukses
            return response()->download($filePath)->deleteFileAfterSend(true);
        } else {
            // Gagal (Biasanya karena path mysqldump salah atau permission)
            // Hapus file kosong jika terbentuk
            if (file_exists($filePath)) {
                unlink($filePath);
            }

            return back()->withErrors([
                'error' => 'Gagal backup. Kode Error: ' . $resultCode . '. Pastikan path mysqldump di .env sudah benar.'
            ]);
        }
    }
}
