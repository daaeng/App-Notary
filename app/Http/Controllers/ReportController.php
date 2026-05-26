<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Expense;
use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->input('type', 'monthly'); // monthly | yearly | custom
        $year = (int) $request->input('year', Carbon::now()->year);
        $month = (int) $request->input('month', Carbon::now()->month);
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $compareYear = (int) $request->input('compare_year', $year - 1);

        $query = Order::with(['client', 'service'])->where('status', 'done');

        if ($type === 'monthly') {
            $start = Carbon::create($year, $month, 1)->startOfMonth();
            $end = Carbon::create($year, $month, 1)->endOfMonth();
            $query->whereBetween('updated_at', [$start, $end]);
            $periodTitle = $start->translatedFormat('F Y');
        } elseif ($type === 'yearly') {
            $start = Carbon::create($year, 1, 1)->startOfYear();
            $end = Carbon::create($year, 12, 31)->endOfYear();
            $query->whereBetween('updated_at', [$start, $end]);
            $periodTitle = "Tahun {$year}";
        } else {
            $start = Carbon::parse($startDate);
            $end = Carbon::parse($endDate);
            $query->whereBetween('updated_at', [$start, $end]);
            $periodTitle = "{$start->format('d M Y')} - {$end->format('d M Y')}";
        }

        $orders = $query->latest('updated_at')->get();

        // Ringkasan
        $totalOmzet = $orders->sum('total_amount');
        $totalJasa = $orders->sum('service_price');
        $totalTitipan = $orders->sum('tax_deposit');

        // Pengeluaran
        $expensesQuery = Expense::whereBetween('transaction_date', [$start, $end]);
        $totalExpense = $expensesQuery->sum('amount');
        $expenseByCategory = $expensesQuery->selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->pluck('total', 'category');

        $netProfit = $totalJasa - $totalExpense;

        // Data untuk Grafik Perbandingan Bulanan (Tahun Ini vs Tahun Lalu)
        $monthlyComparison = $this->getMonthlyComparison($year, $compareYear);

        $company = Company::first();

        $growthJasa = 0;
        if ($type === 'monthly') {
            $lastMonth = Carbon::create($year, $month, 1)->subMonth();
            $jasaBulanIni = $orders->sum('service_price');
            $jasaBulanLalu = Order::where('status', 'done')
                ->whereYear('updated_at', $lastMonth->year)
                ->whereMonth('updated_at', $lastMonth->month)
                ->sum('service_price');

            $growthJasa = $jasaBulanLalu > 0
                ? round((($jasaBulanIni - $jasaBulanLalu) / $jasaBulanLalu) * 100, 1)
                : 100;
        }

        return Inertia::render('Reports/Index', [
            'orders' => $orders,
            'summary' => [
                'total_omzet' => $totalOmzet,
                'total_jasa' => $totalJasa,
                'total_titipan' => $totalTitipan,
                'total_expense' => $totalExpense,
                'net_profit' => $netProfit,
                'total_order' => $orders->count(),
            ],
            'filters' => [
                'type' => $type,
                'year' => $year,
                'month' => $month,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'compare_year' => $compareYear,
            ],
            'period_title' => $periodTitle,
            'monthly_comparison' => $monthlyComparison,
            'expense_by_category' => $expenseByCategory,
            'company' => $company,
            'growth' => [
                'jasa' => $growthJasa,
            ],
        ]);
    }

    private function getMonthlyComparison($year, $compareYear)
    {
        $data = [];

        for ($m = 1; $m <= 12; $m++) {
            $current = Order::where('status', 'done')
                ->whereYear('updated_at', $year)
                ->whereMonth('updated_at', $m)
                ->sum('service_price');

            $previous = Order::where('status', 'done')
                ->whereYear('updated_at', $compareYear)
                ->whereMonth('updated_at', $m)
                ->sum('service_price');

            $data[] = [
                'month' => Carbon::create($year, $m, 1)->translatedFormat('M'),
                'current' => $current,
                'previous' => $previous,
            ];
        }

        return $data;
    }
}
