<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Company;
use App\Models\Order;
use App\Models\Service;
use App\Models\ServiceType;
use App\Models\OrderFile; // Import Model File
use Illuminate\Support\Facades\Storage; // Import Storage untuk hapus file fisik
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrderController extends Controller
{
    // Menampilkan Daftar Order
    public function index()
    {
        $orders = Order::with(['client', 'service'])
            ->latest()
            ->paginate(10);

        return Inertia::render('Orders/Index', [
            'orders' => $orders
        ]);
    }

    // Menampilkan Form Tambah Order
    public function create()
    {
        return Inertia::render('Orders/Create', [
            'clients' => Client::orderBy('name')->get(),
            // Kita kirim data services dikelompokkan berdasarkan Type (Notaris/PPAT)
            'serviceTypes' => ServiceType::with('services')->get()
        ]);
    }

    // Menyimpan Data Order (Logic Utama)
    public function store(Request $request)
    {
        // 1. Validasi Dasar
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'service_id' => 'required|exists:services,id',
            'description' => 'nullable|string',
            'akta_date' => 'nullable|date',
            'service_price' => 'numeric|min:0',
            'tax_deposit' => 'numeric|min:0',

            // Validasi Kondisional untuk PPAT akan kita handle manual di bawah
            'seller_name' => 'nullable|string',
            'buyer_name' => 'nullable|string',
            'land_area' => 'nullable|numeric',
        ]);

        DB::beginTransaction(); // Pakai Transaksi agar data aman

        try {
            // 2. Generate No Order Otomatis (Format: ORD-YYYYMM-XXXX)
            $count = Order::whereYear('created_at', date('Y'))
                        ->whereMonth('created_at', date('m'))
                        ->count();
            $orderNumber = 'ORD-' . date('Ym') . '-' . str_pad($count + 1, 4, '0', STR_PAD_LEFT);

            // 3. Simpan ke Tabel Orders
            $order = Order::create([
                'client_id' => $request->client_id,
                'service_id' => $request->service_id,
                'order_number' => $orderNumber,
                'description' => $request->description,
                'akta_date' => $request->akta_date,
                'service_price' => $request->service_price ?? 0,
                'tax_deposit' => $request->tax_deposit ?? 0,
                'total_amount' => ($request->service_price ?? 0) + ($request->tax_deposit ?? 0),
                'status' => 'new', // Default status
            ]);

            // 4. Cek apakah ini layanan PPAT?
            $service = Service::with('type')->find($request->service_id);

            // Jika Tipenya PPAT, simpan juga detailnya
            if ($service && $service->type->slug === 'ppat') {
                $order->ppat_detail()->create([
                    'seller_name' => $request->seller_name,
                    'buyer_name' => $request->buyer_name,
                    'certificate_number' => $request->certificate_number,
                    'object_address' => $request->object_address,
                    'land_area' => $request->land_area ?? 0,
                    'building_area' => $request->building_area ?? 0,
                    'njop' => $request->njop ?? 0,
                    'transaction_value' => $request->transaction_value ?? 0,
                    'ssp_amount' => $request->ssp_amount ?? 0,
                    'ssb_amount' => $request->ssb_amount ?? 0,
                ]);
            }

            DB::commit();

            return redirect()->route('orders.index')->with('success', 'Pekerjaan berhasil dibuat!');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Gagal menyimpan data: ' . $e->getMessage()]);
        }
    }

    public function invoice(Order $order)
    {
        // Load relasi client dan service agar bisa ditampilkan di kwitansi
        $order->load(['client', 'service', 'ppat_detail']);
        $company = Company::first();

        return Inertia::render('Orders/Invoice', [
            'order' => $order,
            'company' => $company // Kirim data dinamis dari database
        ]);
    }
        //         'notary_name' => 'ORISTA MIRANTI IRPADA ADAM, S.H., M.Kn.',
        //         'address' => 'Jl. Jendral Sudirman No. 123, Jakarta Selatan',
        //         'phone' => '(021) 789-1011',
        //         'email' => 'admin@notarisdaeng.com'
        //     ]
        // ]);

    // HALAMAN EDIT (DETAIL)
    public function edit(Order $order)
    {
        // Ambil data order beserta detailnya
        $order->load(['client', 'service', 'ppat_detail', 'files']);

        return Inertia::render('Orders/Edit', [
            'order' => $order,
            'clients' => Client::orderBy('name')->get(),
            'serviceTypes' => ServiceType::with('services')->get()
        ]);
    }

    // PROSES UPDATE DATA
    public function update(Request $request, Order $order)
    {
        // 1. Validasi (Sama seperti store, tapi status boleh diubah)
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'service_id' => 'required|exists:services,id',
            'description' => 'nullable|string',
            'akta_date' => 'nullable|date',
            'status' => 'required|string', // Tambahan: Update Status
            'service_price' => 'numeric|min:0',
            'tax_deposit' => 'numeric|min:0',
            // PPAT
            'seller_name' => 'nullable|string',
            'buyer_name' => 'nullable|string',
            'land_area' => 'nullable|numeric',
        ]);

        DB::beginTransaction();

        try {
            // 2. Update Data Utama
            $order->update([
                'client_id' => $request->client_id,
                'service_id' => $request->service_id,
                'description' => $request->description,
                'akta_date' => $request->akta_date,
                'status' => $request->status, // Update status di sini
                'service_price' => $request->service_price ?? 0,
                'tax_deposit' => $request->tax_deposit ?? 0,
                'total_amount' => ($request->service_price ?? 0) + ($request->tax_deposit ?? 0),
            ]);

            // 3. Update Detail PPAT (Jika ada)
            $service = Service::with('type')->find($request->service_id);

            if ($service && $service->type->slug === 'ppat') {
                // Update atau Create jika belum ada
                $order->ppat_detail()->updateOrCreate(
                    ['order_id' => $order->id],
                    [
                        'seller_name' => $request->seller_name,
                        'buyer_name' => $request->buyer_name,
                        'certificate_number' => $request->certificate_number,
                        'object_address' => $request->object_address,
                        'land_area' => $request->land_area ?? 0,
                        'building_area' => $request->building_area ?? 0,
                        'njop' => $request->njop ?? 0,
                        'transaction_value' => $request->transaction_value ?? 0,
                        'ssp_amount' => $request->ssp_amount ?? 0,
                        'ssb_amount' => $request->ssb_amount ?? 0,
                    ]
                );
            }

            DB::commit();

            return redirect()->route('orders.index')->with('success', 'Data pekerjaan berhasil diperbarui!');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Gagal update: ' . $e->getMessage()]);
        }
    }

    // --- FITUR ARSIP DIGITAL ---

    // 1. Upload File (Revisi: Gunakan Disk Public)
    public function uploadFile(Request $request, Order $order)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // Max 10MB
            'file_name' => 'required|string|max:255',
            'category' => 'required|string', // Pastikan backend mewajibkan kategori
        ]);

        try {
            $file = $request->file('file');

            // Bersihkan nama file
            $cleanName = str_replace(' ', '-', $file->getClientOriginalName());
            $cleanName = preg_replace('/[^A-Za-z0-9\-\.]/', '', $cleanName);

            // Simpan di disk 'public'
            $path = $file->storeAs(
                'order_files/' . $order->id,
                time() . '_' . $cleanName,
                'public'
            );

            // Simpan ke database
            $order->files()->create([
                'file_name' => $request->file_name,
                'file_path' => $path,
                'file_type' => $file->getClientOriginalExtension(),
                'category'  => $request->category, // Data kategori dari frontend
            ]);

            return back()->with('success', 'Dokumen berhasil diunggah!');

        } catch (\Exception $e) {
            return back()->withErrors(['file' => 'Gagal upload: ' . $e->getMessage()]);
        }
    }

    // 2. Hapus File (Revisi: Gunakan Disk Public)
    public function deleteFile(OrderFile $file)
    {
        try {
            // Gunakan disk 'public' saat menghapus
            if (Storage::disk('public')->exists($file->file_path)) {
                Storage::disk('public')->delete($file->file_path);
            }

            $file->delete();

            return back()->with('success', 'Dokumen dihapus.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal menghapus file.']);
        }
    }

}
