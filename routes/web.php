<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\GlobalSearchController;
use App\Http\Controllers\NotificationController; // Pastikan import
use App\Http\Controllers\BackupController;       // Pastikan import
use App\Models\Order;
use App\Models\Expense;
use App\Models\Schedule;
use Carbon\Carbon;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// --- AREA LOGIN ---
Route::middleware(['auth', 'verified'])->group(function () {

    // 1. DASHBOARD
    Route::get('dashboard', function () {
        $totalOrders = Order::count();
        $ordersNew = Order::where('status', 'new')->count();
        $ordersProcess = Order::whereIn('status', ['process', 'draft'])->count();
        $ordersDone = Order::where('status', 'done')->count();

        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;

        // --- PERBAIKAN LOGIC KEUANGAN (REAL CASHFLOW) ---

        // SEBELUMNYA (Salah): Menghitung total harga order (walau belum bayar)
        // $revenueMonth = Order::whereMonth('created_at', $currentMonth)...

        // SEKARANG (Benar): Menghitung uang ASLI yang diterima kasir
        $revenueMonth = \App\Models\Payment::whereMonth('payment_date', $currentMonth)
            ->whereYear('payment_date', $currentYear)
            ->sum('amount');

        // Pengeluaran: Tetap dari tabel Expense
        $expenseMonth = Expense::whereMonth('transaction_date', $currentMonth)
            ->whereYear('transaction_date', $currentYear)
            ->sum('amount');

        // Profit Bersih = Uang Masuk - Uang Keluar
        $netProfit = $revenueMonth - $expenseMonth;

        // Jadwal Terdekat
        $upcomingSchedules = Schedule::where('start_time', '>=', now())
            ->orderBy('start_time', 'asc')
            ->limit(3)
            ->get();

        // Order Terbaru
        $recentOrders = Order::with(['client', 'service'])
            ->latest()
            ->limit(5)
            ->get();

        return Inertia::render('dashboard', [
            'stats' => [
                'total' => $totalOrders,
                'new' => $ordersNew,
                'process' => $ordersProcess,
                'done' => $ordersDone,
                'revenue' => $revenueMonth, // Angka ini sekarang JUJUR (Real Cash)
                'expense' => $expenseMonth,
                'profit' => $netProfit
            ],
            'recentOrders' => $recentOrders,
            'upcomingSchedules' => $upcomingSchedules
        ]);
    })->name('dashboard');


    // 2. JADWAL & KLIEN
    // KITA BUNGKUS DENGAN ROLE: Super Admin, Staff, Notaris, DAN BOS
    Route::group(['middleware' => ['role:super_admin|staff|notaris|bos']], function () {
        Route::resource('clients', ClientController::class);
        Route::resource('schedules', ScheduleController::class)->only(['index', 'store', 'destroy']);
    });


    // 3. AREA OPERASIONAL (Admin, Staff, Notaris, & BOS)
    // UPDATE: Tambahkan '|notaris' agar akun Notaris juga bisa kerja
    Route::group(['middleware' => ['role:super_admin|staff|notaris|bos']], function () {
        Route::resource('orders', OrderController::class)->except(['destroy']);
        Route::get('orders/{order}/invoice', [OrderController::class, 'invoice'])->name('orders.invoice');
        Route::post('orders/{order}/files', [OrderController::class, 'uploadFile'])->name('orders.upload');
    });


    // 4. AREA MONITORING (Admin, Notaris, & BOS)
    // UPDATE: Tambahkan '|bos' agar bos bisa lihat laporan keuangan
    Route::group(['middleware' => ['role:super_admin|notaris|bos']], function () {
        Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
        Route::resource('expenses', ExpenseController::class)->only(['index', 'store', 'destroy']);
    });


    // 5. MANAJEMEN USER (Admin & BOS)
    // UPDATE: Kita pisahkan dari grup "Berbahaya" agar BOS bisa akses ini
    // (Fitur Delete sudah diproteksi oleh Policy yang kita buat sebelumnya)
    Route::group(['middleware' => ['role:super_admin|bos']], function () {
         Route::resource('users', UserController::class);
    });


    // 6. AREA BERBAHAYA / SENSITIF (Hanya Super Admin)
    // UPDATE: Hapus 'users' dari sini karena sudah dipindah ke atas
    Route::group(['middleware' => ['role:super_admin']], function () {
        // Hapus Order & File (BOS Tidak Boleh Hapus Order)
        Route::delete('orders/{order}', [OrderController::class, 'destroy'])->name('orders.destroy');
        Route::delete('orders/files/{file}', [OrderController::class, 'deleteFile'])->name('orders.deleteFile');

        // Pengaturan Kantor
        Route::get('office-settings', [CompanyController::class, 'edit'])->name('settings.edit');
        Route::put('office-settings', [CompanyController::class, 'update'])->name('settings.update');
    });


    // MONITORING CCTV & LAINNYA
    Route::get('activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index');
    Route::get('/global-search', [GlobalSearchController::class, 'search'])->name('global.search');
    Route::get('/notifications-data', [NotificationController::class, 'index'])->name('notifications.data');
    Route::get('/backup-db', [BackupController::class, 'download'])->name('backup.download');

    Route::post('orders/{order}/payments', [App\Http\Controllers\PaymentController::class, 'store'])->name('payments.store');
    Route::delete('payments/{payment}', [App\Http\Controllers\PaymentController::class, 'destroy'])->name('payments.destroy');

});

require __DIR__.'/settings.php';
