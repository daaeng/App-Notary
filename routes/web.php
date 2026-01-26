<?php

use App\Http\Controllers\ClientController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ScheduleController;
use App\Models\Order; // Tambahkan ini
use App\Models\Expense;
use App\Models\Schedule;
use Carbon\Carbon;    // Tambahkan ini
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    // --- UPDATE BAGIAN DASHBOARD INI ---
    Route::get('dashboard', function () {
        // 1. Hitung Statistik Order (Tetap)
        $totalOrders = Order::count();
        $ordersNew = Order::where('status', 'new')->count();
        $ordersProcess = Order::whereIn('status', ['process', 'draft'])->count();
        $ordersDone = Order::where('status', 'done')->count();

        // 2. KEUANGAN BULAN INI
        $currentMonth = Carbon::now()->month;
        $currentYear = Carbon::now()->year;

        // A. Pemasukan (Service Price)
        $revenueMonth = Order::whereMonth('created_at', $currentMonth)
            ->whereYear('created_at', $currentYear)
            ->sum('service_price');

        // B. Pengeluaran (Expense) - BARU!
        $expenseMonth = Expense::whereMonth('transaction_date', $currentMonth)
            ->whereYear('transaction_date', $currentYear)
            ->sum('amount');

        // C. Profit Bersih
        $netProfit = $revenueMonth - $expenseMonth;

        $upcomingSchedules = Schedule::where('start_time', '>=', now())
            ->orderBy('start_time', 'asc')
            ->limit(3)
            ->get();

        // 3. Ambil 5 Pekerjaan Terbaru (Tetap)
        $recentOrders = Order::with(['client', 'service'])
            ->latest()
            ->limit(5)
            ->get();

        return Inertia::render('dashboard', [ // Perhatikan nama file 'dashboard' (huruf kecil/besar sesuaikan)
            'stats' => [
                'total' => $totalOrders,
                'new' => $ordersNew,
                'process' => $ordersProcess,
                'done' => $ordersDone,
                // Kirim data keuangan baru
                'revenue' => $revenueMonth,
                'expense' => $expenseMonth,
                'profit' => $netProfit
            ],
            'recentOrders' => $recentOrders,
            'upcomingSchedules' => $upcomingSchedules
        ]);
    })->name('dashboard');
    // -----------------------------------

    Route::resource('clients', ClientController::class);

    Route::resource('orders', OrderController::class);
    Route::get('orders/{order}/invoice', [OrderController::class, 'invoice'])->name('orders.invoice');
    Route::post('orders/{order}/files', [OrderController::class, 'uploadFile'])->name('orders.upload');
    Route::delete('orders/files/{file}', [OrderController::class, 'deleteFile'])->name('orders.deleteFile');

    Route::get('reports', [ReportController::class, 'index'])->name('reports.index');

    Route::get('office-settings', [CompanyController::class, 'edit'])->name('settings.edit');
    Route::put('office-settings', [CompanyController::class, 'update'])->name('settings.update');

    Route::resource('expenses', ExpenseController::class)->only(['index', 'store', 'destroy']);

    Route::resource('schedules', ScheduleController::class)->only(['index', 'store', 'destroy']);




});

require __DIR__.'/settings.php';
