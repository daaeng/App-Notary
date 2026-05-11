<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    // Tampilkan Daftar Pengeluaran (Dengan Filter Bulan)
    public function index(Request $request)
    {
        // Ambil filter dari URL, default ke bulan & tahun saat ini
        $month = $request->query('month', now()->format('m'));
        $year = $request->query('year', now()->format('Y'));

        // Buat query dasar
        $query = Expense::whereMonth('transaction_date', $month)
                        ->whereYear('transaction_date', $year);

        // Hitung Total Pengeluaran Bulan Tersebut
        $totalAmount = (clone $query)->sum('amount');

        // Hitung Statistik Per Kategori
        $categoryStats = (clone $query)
            ->selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->pluck('total', 'category');

        // Ambil data untuk tabel dengan pagination
        $expenses = $query->latest('transaction_date')
                          ->latest('id')
                          ->paginate(15)
                          ->withQueryString();

        return Inertia::render('Expenses/Index', [
            'expenses' => $expenses,
            'filters' => [
                'month' => $month,
                'year' => $year,
            ],
            'stats' => [
                'totalAmount' => $totalAmount,
                'categoryStats' => $categoryStats
            ]
        ]);
    }

    // Simpan Pengeluaran Baru
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'transaction_date' => 'required|date',
            'category' => 'required|string',
        ]);

        Expense::create([
            'title' => $request->title,
            'amount' => $request->amount,
            'transaction_date' => $request->transaction_date,
            'category' => $request->category,
            'description' => $request->description,
        ]);

        return back()->with('success', 'Pengeluaran berhasil dicatat!');
    }

    // Hapus Pengeluaran
    public function destroy(Expense $expense)
    {
        $expense->delete();
        return back()->with('success', 'Data pengeluaran dihapus.');
    }
}
