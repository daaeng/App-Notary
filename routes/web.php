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
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\RequirementController;
use App\Http\Controllers\SimulationController;
use App\Models\Order;
use App\Models\Expense;
use App\Models\Schedule;
use Carbon\Carbon;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
// use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        // 'canRegister' => Features::enabled(Features::registration()),
        'canRegister' => false,
    ]);
})->name('home');

// --- AREA LOGIN ---
Route::middleware(['auth', 'verified'])->group(function () {

    // 1. DASHBOARD (Updated Logic)
    Route::get('dashboard', function () {
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;

        // A. Statistik Order
        $totalOrders = Order::count();
        $activeOrders = Order::whereIn('status', ['new', 'draft', 'process', 'minuta'])->count();
        $completedOrders = Order::where('status', 'done')->whereMonth('updated_at', $currentMonth)->count();
        $totalClients = \App\Models\Client::count(); // Tambahan: Total Klien

        // B. Keuangan (Real Cashflow Logic - Pertahankan yang sudah benar)
        $revenueMonth = \App\Models\Payment::whereMonth('payment_date', $currentMonth)
            ->whereYear('payment_date', $currentYear)
            ->sum('amount');

        $expenseMonth = Expense::whereMonth('transaction_date', $currentMonth)
            ->whereYear('transaction_date', $currentYear)
            ->sum('amount');

        $netProfit = $revenueMonth - $expenseMonth;

        // C. Data Pendukung
        $upcomingSchedules = Schedule::where('start_time', '>=', now())
            ->orderBy('start_time', 'asc')
            ->take(5) // Ambil 5 agenda terdekat
            ->get();

        $recentOrders = Order::with(['client', 'service'])
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('dashboard', [
            'stats' => [
                'active_orders' => $activeOrders, // Order berjalan
                'completed_month' => $completedOrders, // Selesai bulan ini
                'total_clients' => $totalClients, // Jumlah Klien
                'revenue' => $revenueMonth, // Uang Masuk Real
                'expense' => $expenseMonth, // Uang Keluar
                'profit' => $netProfit // Laba Bersih
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
    Route::group(['middleware' => ['role:super_admin']], function () {
        // Hapus Order & File
        Route::delete('orders/{order}', [OrderController::class, 'destroy'])->name('orders.destroy');
        Route::delete('orders/files/{file}', [OrderController::class, 'deleteFile'])->name('orders.deleteFile');

        // Pengaturan Kantor
        Route::get('office-settings', [CompanyController::class, 'edit'])->name('settings.edit');
        Route::put('office-settings', [CompanyController::class, 'update'])->name('settings.update');
        Route::delete('/office-settings/logo', [\App\Http\Controllers\CompanyController::class, 'destroyLogo'])->name('settings.logo.delete');

        // PERSYARATAN LAYANAN (SUPER ADMIN FULL CONTROL)
        Route::post('/persyaratan', [RequirementController::class, 'store'])->name('requirements.store');
        Route::put('/persyaratan/{service}', [RequirementController::class, 'update'])->name('requirements.update');
        Route::delete('/persyaratan/{service}', [RequirementController::class, 'destroy'])->name('requirements.destroy');
     });


    // MONITORING CCTV & LAINNYA
    Route::get('activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index');
    Route::get('/global-search', [GlobalSearchController::class, 'search'])->name('global.search');
    Route::get('/notifications-data', [NotificationController::class, 'index'])->name('notifications.data');
    Route::get('/backup-db', [BackupController::class, 'download'])->name('backup.download');

    // PAYMENT ROUTES (Admin, Staff, Notaris, & BOS)
    Route::post('orders/{order}/payments', [PaymentController::class, 'store'])->name('orders.payments.store');
    // Route::post('orders/{order}/payments', [PaymentController::class, 'store'])->name('payments.store');
    // Route::post('/orders/{order}/payments', [OrderController::class, 'addPayment'])->name('orders.payments.store');
    // Route::delete('payments/{payment}', [PaymentController::class, 'destroy'])->name('payments.destroy');

    // 7. BUKU REGISTER / KLAMPENING (Admin, Staff, Notaris, & BOS)
    // Mas Daeng bisa akses ini karena role Mas adalah IT/Super Admin
    Route::group(['middleware' => ['role:super_admin|staff|notaris|bos']], function () {
        Route::get('registers', [RegisterController::class, 'index'])->name('registers.index');
        Route::post('registers', [RegisterController::class, 'store'])->name('registers.store');
        Route::delete('registers/{register}', [RegisterController::class, 'destroy'])->name('registers.destroy');

        // Opsional: Route untuk Export PDF/Print jika nanti dibutuhkan
        Route::get('registers/export', [RegisterController::class, 'export'])->name('registers.export');
    });

    // 8. SIMULASI ESTIMASI BIAYA (Bisa diakses semua role yang sudah disebutkan)
    Route::get('/simulasi', [SimulationController::class, 'index'])->name('simulasi.index');

    // 9. PERSYARATAN LAYANAN (Bisa diakses semua role yang sudah disebutkan)
    Route::get('/persyaratan', [RequirementController::class, 'index'])->name('requirements.index');

});

require __DIR__.'/settings.php';
