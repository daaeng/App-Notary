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
        // ... (Logic Dashboard Singkat) ...
        $totalOrders = Order::count();
        $ordersNew = Order::where('status', 'new')->count();
        $ordersProcess = Order::whereIn('status', ['process', 'draft'])->count();
        $ordersDone = Order::where('status', 'done')->count();

        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;

        $revenueMonth = Order::whereMonth('created_at', $currentMonth)
            ->whereYear('created_at', $currentYear)
            ->sum('service_price');

        $expenseMonth = Expense::whereMonth('transaction_date', $currentMonth)
            ->whereYear('transaction_date', $currentYear)
            ->sum('amount');

        $upcomingSchedules = Schedule::where('start_time', '>=', now())
            ->orderBy('start_time', 'asc')
            ->limit(3)
            ->get();

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
                'revenue' => $revenueMonth,
                'expense' => $expenseMonth,
                'profit' => $revenueMonth - $expenseMonth
            ],
            'recentOrders' => $recentOrders,
            'upcomingSchedules' => $upcomingSchedules
        ]);
    })->name('dashboard');


    // 2. JADWAL & KLIEN
    Route::resource('clients', ClientController::class);
    Route::resource('schedules', ScheduleController::class)->only(['index', 'store', 'destroy']);


    // 3. AREA OPERASIONAL (Admin & Staff)
    Route::group(['middleware' => ['role:super_admin|staff']], function () {
        Route::resource('orders', OrderController::class)->except(['destroy']);
        Route::get('orders/{order}/invoice', [OrderController::class, 'invoice'])->name('orders.invoice');
        Route::post('orders/{order}/files', [OrderController::class, 'uploadFile'])->name('orders.upload');
    });


    // 4. AREA MONITORING (Admin & Notaris)
    Route::group(['middleware' => ['role:super_admin|notaris']], function () {
        Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
        Route::resource('expenses', ExpenseController::class)->only(['index', 'store', 'destroy']);
    });


    // 5. AREA BERBAHAYA (Khusus Super Admin)
    Route::group(['middleware' => ['role:super_admin']], function () {
        // Hapus Order & File
        Route::delete('orders/{order}', [OrderController::class, 'destroy'])->name('orders.destroy');
        Route::delete('orders/files/{file}', [OrderController::class, 'deleteFile'])->name('orders.deleteFile');

        // Pengaturan Kantor
        Route::get('office-settings', [CompanyController::class, 'edit'])->name('settings.edit');
        Route::put('office-settings', [CompanyController::class, 'update'])->name('settings.update');

        // MANAJEMEN USER (Pegawai) - INI YANG KITA TAMBAHKAN
        Route::resource('users', UserController::class);
    });


    // MONITORING CCTV & LAINNYA
    Route::get('activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index');
    Route::get('/global-search', [GlobalSearchController::class, 'search'])->name('global.search');
    Route::get('/notifications-data', [App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.data');
    Route::get('/backup-db', [App\Http\Controllers\BackupController::class, 'download'])->name('backup.download');
});

require __DIR__.'/settings.php';
