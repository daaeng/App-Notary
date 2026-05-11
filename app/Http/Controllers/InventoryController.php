<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\InventoryLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index()
    {
        // [PERBAIKAN]: Menggunakan latest() agar barang yang baru dibuat tampil di paling atas
        $inventories = Inventory::latest()->get();

        // [PERBAIKAN]: Menggunakan latest() (orderByDesc('created_at')) untuk log mutasi
        $logs = InventoryLog::with('inventory')->latest()->paginate(15);

        return Inertia::render('Inventories/Index', [
            'inventories' => $inventories,
            'logs' => $logs
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'unit' => 'required|string|max:50',
            'stock' => 'required|integer|min:0',
            'date' => 'nullable|date',
            'actor_name' => 'nullable|string|max:255',
        ]);

        $inventory = Inventory::create($request->only(['name', 'unit', 'stock']));

        if ($inventory->stock > 0) {
            $log = $inventory->logs()->make([
                'type' => 'in',
                'qty' => $inventory->stock,
                'remaining_stock' => $inventory->stock,
                'actor_name' => $request->actor_name ?: auth()->user()->name,
                'notes' => 'Stok awal barang baru'
            ]);
            $log->created_at = ($request->date ?: date('Y-m-d')) . ' ' . now()->format('H:i:s');
            $log->save();
        }

        return back()->with('success', 'Barang baru berhasil ditambahkan!');
    }

    public function update(Request $request, Inventory $inventory)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'unit' => 'required|string|max:50',
        ]);

        $inventory->update($request->only(['name', 'unit']));
        return back()->with('success', 'Info barang berhasil diperbarui!');
    }

    public function addStock(Request $request, Inventory $inventory)
    {
        $request->validate([
            'qty' => 'required|integer|min:1',
            'notes' => 'required|string|max:255',
            'date' => 'required|date',
            'actor_name' => 'required|string|max:255',
        ]);

        $inventory->increment('stock', $request->qty);

        $log = $inventory->logs()->make([
            'type' => 'in',
            'qty' => $request->qty,
            'remaining_stock' => $inventory->stock,
            'actor_name' => $request->actor_name,
            'notes' => $request->notes
        ]);
        $log->created_at = $request->date . ' ' . now()->format('H:i:s');
        $log->save();

        return back()->with('success', 'Stok berhasil disetor!');
    }

    public function take(Request $request, Inventory $inventory)
    {
        $request->validate([
            'qty' => 'required|integer|min:1|max:' . $inventory->stock,
            'notes' => 'required|string|max:255',
            'date' => 'required|date',
            'actor_name' => 'required|string|max:255',
        ]);

        $inventory->decrement('stock', $request->qty);

        $log = $inventory->logs()->make([
            'type' => 'out',
            'qty' => $request->qty,
            'remaining_stock' => $inventory->stock,
            'actor_name' => $request->actor_name,
            'notes' => $request->notes
        ]);
        $log->created_at = $request->date . ' ' . now()->format('H:i:s');
        $log->save();

        return back()->with('success', 'Barang berhasil diambil!');
    }

    public function destroy(Inventory $inventory)
    {
        $inventory->delete();
        return back()->with('success', 'Barang dihapus dari inventaris!');
    }

    public function updateLog(Request $request, InventoryLog $log)
    {
        $request->validate([
            'qty' => 'required|integer|min:1',
            'date' => 'required|date',
            'actor_name' => 'required|string|max:255',
            'notes' => 'required|string|max:255',
        ]);

        $inventory = $log->inventory;

        if ($request->qty != $log->qty) {
            $diff = $request->qty - $log->qty;
            if ($log->type === 'in') {
                $inventory->increment('stock', $diff);
                $log->remaining_stock += $diff;
            } else {
                if ($inventory->stock - $diff < 0) {
                    return back()->withErrors(['error' => 'Stok di gudang tidak cukup untuk memvalidasi perubahan ini.']);
                }
                $inventory->decrement('stock', $diff);
                $log->remaining_stock -= $diff;
            }
        }

        $log->update([
            'qty' => $request->qty,
            'actor_name' => $request->actor_name,
            'notes' => $request->notes,
            'created_at' => $request->date . ' ' . $log->created_at->format('H:i:s'),
            'remaining_stock' => $log->remaining_stock
        ]);

        return back()->with('success', 'Riwayat log berhasil diperbarui!');
    }
}
