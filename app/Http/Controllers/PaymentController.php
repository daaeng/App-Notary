<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function store(Request $request, Order $order)
    {
        // 1. Validasi Input
        $request->validate([
            'amount' => 'required|numeric|min:1000',
            'payment_date' => 'required|date',
            'payment_method' => 'required|string',
            'note' => 'nullable|string',
            'proof_file' => 'nullable|image|max:2048', // Max 2MB
        ]);

        DB::beginTransaction(); // Mulai transaksi database (agar aman)

        try {
            // 2. Upload Bukti Transfer (Jika ada)
            $proofPath = null;
            if ($request->hasFile('proof_file')) {
                $file = $request->file('proof_file');
                $filename = time() . '_' . $file->getClientOriginalName();
                // Simpan ke storage public
                $proofPath = $file->storeAs('payment_proofs/' . $order->id, $filename, 'public');
            }

            // 3. Simpan Data Pembayaran
            $order->payments()->create([
                'amount' => $request->amount,
                'payment_date' => $request->payment_date,
                'payment_method' => $request->payment_method,
                'note' => $request->note,
                'proof_file' => $proofPath,
                'created_by' => auth()->id(),
            ]);

            // 4. LOGIC UPDATE STATUS OTOMATIS
            // Hitung total yang sudah dibayar (termasuk yang barusan)
            $totalPaid = $order->payments()->sum('amount');

            // Bandingkan dengan total tagihan
            if ($totalPaid >= $order->total_amount) {
                $order->update(['payment_status' => 'paid']);
            } elseif ($totalPaid > 0) {
                $order->update(['payment_status' => 'partial']);
            } else {
                $order->update(['payment_status' => 'unpaid']);
            }

            DB::commit(); // Simpan permanen

            return back()->with('success', 'Pembayaran berhasil dicatat.');

        } catch (\Exception $e) {
            DB::rollBack(); // Batalkan jika error
            return back()->withErrors(['error' => 'Gagal menyimpan pembayaran: ' . $e->getMessage()]);
        }
    }

    // Fitur Hapus Pembayaran (Hanya Admin/Bos)
    public function destroy(Payment $payment)
    {
        $order = $payment->order;
        $payment->delete();

        // Hitung ulang status setelah dihapus
        $totalPaid = $order->payments()->sum('amount');
        if ($totalPaid >= $order->total_amount) {
            $order->update(['payment_status' => 'paid']);
        } elseif ($totalPaid > 0) {
            $order->update(['payment_status' => 'partial']);
        } else {
            $order->update(['payment_status' => 'unpaid']);
        }

        return back()->with('success', 'Riwayat pembayaran dihapus.');
    }
}
