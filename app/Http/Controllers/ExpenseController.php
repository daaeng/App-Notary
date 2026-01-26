<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    // Tampilkan Daftar Pengeluaran
    public function index()
    {
        $expenses = Expense::latest('transaction_date')
            ->paginate(10);

        return Inertia::render('Expenses/Index', [
            'expenses' => $expenses
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
