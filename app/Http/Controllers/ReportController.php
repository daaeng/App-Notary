<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        // 1. Ambil input tanggal dari user (Default: Bulan Ini)
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));
        $status = $request->input('status', 'all');

        // 2. Query Data berdasarkan filter
        $query = Order::with(['client', 'service'])
            ->whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate);

        // Filter Status jika dipilih
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $orders = $query->latest()->get();

        // 3. Hitung Ringkasan untuk Header Laporan
        $totalOmzet = $orders->sum('total_amount');
        $totalJasa = $orders->sum('service_price');
        $totalTitipan = $orders->sum('tax_deposit');

        $company = Company::first();

        return Inertia::render('Reports/Index', [
            'orders' => $orders,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => $status,
            ],
            'summary' => [
                'total_omzet' => $totalOmzet,
                'total_jasa' => $totalJasa,
                'total_titipan' => $totalTitipan,
                'total_order' => $orders->count(),
            ],
            'company' => $company
        ]);
    }
}
