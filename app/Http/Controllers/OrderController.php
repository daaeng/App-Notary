<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Company;
use App\Models\Order;
use App\Models\Service;
use App\Models\ServiceType;
use App\Models\OrderFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with(['client', 'service'])->latest()->paginate(10);
        return Inertia::render('Orders/Index', ['orders' => $orders]);
    }

    public function create()
    {
        return Inertia::render('Orders/Create', [
            'clients' => Client::orderBy('name')->get(),
            'serviceTypes' => ServiceType::with('services')->get(),
            'company' => Company::first()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'client_id' => 'required|exists:clients,id',
            'service_id' => 'required|exists:services,id',
            'completed_requirements' => 'nullable|array', // [BARU]
        ]);

        DB::beginTransaction();
        try {
            $count = Order::whereYear('created_at', date('Y'))->whereMonth('created_at', date('m'))->count();
            $orderNumber = 'ORD-' . date('Ym') . '-' . str_pad($count + 1, 4, '0', STR_PAD_LEFT);

            $totalAmount = ($request->service_price ?? 0) + ($request->plotting_fee ?? 0) + ($request->pnbp_fee ?? 0) + ($request->validation_fee ?? 0) + ($request->bphtb_fee ?? 0) + ($request->pph_fee ?? 0) + ($request->measurement_fee ?? 0) + ($request->tax_deposit ?? 0) + ($request->location_check_fee ?? 0) + ($request->area_measurement_fee ?? 0);

            $order = Order::create([
                'client_id' => $request->client_id, 'service_id' => $request->service_id,
                'order_number' => $orderNumber, 'description' => $request->description, 'akta_date' => $request->akta_date,
                'service_price' => $request->service_price ?? 0, 'plotting_fee' => $request->plotting_fee ?? 0,
                'pnbp_fee' => $request->pnbp_fee ?? 0, 'validation_fee' => $request->validation_fee ?? 0,
                'bphtb_fee' => $request->bphtb_fee ?? 0, 'pph_fee' => $request->pph_fee ?? 0,
                'measurement_fee' => $request->measurement_fee ?? 0, 'location_check_fee' => $request->location_check_fee ?? 0,
                'area_measurement_fee' => $request->area_measurement_fee ?? 0, 'tax_deposit' => $request->tax_deposit ?? 0,
                'total_amount' => $totalAmount, 'additional_info' => $request->additional_info,
                'completed_requirements' => $request->completed_requirements ?? [], // [BARU] Simpan Checklist
                'status' => 'new',
            ]);

            if ($request->service_id) {
                $service = Service::with('type')->find($request->service_id);
                if ($service && $service->type->slug === 'ppat') {
                    $order->ppat_detail()->create([
                        'seller_name' => $request->seller_name, 'land_area' => $request->land_area ?? 0,
                        'transaction_value' => $request->transaction_value ?? 0, 'njop' => $request->njop ?? 0,
                    ]);
                }
            }

            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $reqName => $file) {
                    if ($file) {
                        $cleanName = preg_replace('/[^A-Za-z0-9\-\.]/', '', str_replace(' ', '-', $file->getClientOriginalName()));
                        $path = $file->storeAs('order_files/' . $order->id, time() . '_' . $cleanName, 'public');
                        $order->files()->create(['file_name' => $cleanName, 'file_path' => $path, 'file_type' => $file->getClientOriginalExtension(), 'category' => $reqName]);
                    }
                }
            }
            DB::commit();
            return redirect()->route('orders.index')->with('success', 'Pekerjaan berhasil dibuat!');
        } catch (\Exception $e) {
            DB::rollback(); return back()->withErrors(['error' => 'Gagal: ' . $e->getMessage()]);
        }
    }

    public function edit(Order $order)
    {
        $order->load(['client', 'service', 'files', 'payments.user', 'ppat_detail']);
        return Inertia::render('Orders/Edit', [
            'order' => $order,
            'clients' => Client::orderBy('name')->get(),
            'serviceTypes' => ServiceType::with('services')->get(),
            'company' => Company::first()
        ]);
    }

    public function update(Request $request, Order $order)
    {
        $request->validate([
            'client_id' => 'required|exists:clients,id',
            'service_id' => 'required|exists:services,id',
            'completed_requirements' => 'nullable|array', // [BARU]
            'completed_at' => 'nullable|date', // [BARU]
        ]);

        DB::beginTransaction();
        try {
            $totalAmount = ($request->service_price ?? 0) + ($request->plotting_fee ?? 0) + ($request->pnbp_fee ?? 0) + ($request->validation_fee ?? 0) + ($request->bphtb_fee ?? 0) + ($request->pph_fee ?? 0) + ($request->measurement_fee ?? 0) + ($request->tax_deposit ?? 0) + ($request->location_check_fee ?? 0) + ($request->area_measurement_fee ?? 0);

            $newStatus = $request->status ?? $order->status;
            $completedAt = $order->completed_at;
            
            if ($newStatus === 'done') {
                $completedAt = $request->completed_at ?? ($order->completed_at ?? now()->toDateString());
            } else {
                $completedAt = null;
            }

            $order->update([
                'client_id' => $request->client_id, 'service_id' => $request->service_id,
                'description' => $request->description, 'akta_date' => $request->akta_date, 'status' => $newStatus,
                'service_price' => $request->service_price ?? 0, 'plotting_fee' => $request->plotting_fee ?? 0,
                'pnbp_fee' => $request->pnbp_fee ?? 0, 'validation_fee' => $request->validation_fee ?? 0,
                'bphtb_fee' => $request->bphtb_fee ?? 0, 'pph_fee' => $request->pph_fee ?? 0,
                'measurement_fee' => $request->measurement_fee ?? 0, 'location_check_fee' => $request->location_check_fee ?? 0,
                'area_measurement_fee' => $request->area_measurement_fee ?? 0, 'tax_deposit' => $request->tax_deposit ?? 0,
                'total_amount' => $totalAmount, 'additional_info' => $request->additional_info,
                'completed_requirements' => $request->completed_requirements ?? [], // [BARU] Update Checklist
                'completed_at' => $completedAt, // [BARU]
            ]);

            $service = Service::with('type')->find($request->service_id);
            if ($service && $service->type->slug === 'ppat') {
                $order->ppat_detail()->updateOrCreate(['order_id' => $order->id], [
                    'seller_name' => $request->seller_name, 'land_area' => $request->land_area ?? 0,
                    'transaction_value' => $request->transaction_value ?? 0, 'njop' => $request->njop ?? 0,
                ]);
            }

            // PROSES UPLOAD FILE DI HALAMAN EDIT
            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $reqName => $file) {
                    if ($file) {
                        $cleanName = preg_replace('/[^A-Za-z0-9\-\.]/', '', str_replace(' ', '-', $file->getClientOriginalName()));
                        $path = $file->storeAs('order_files/' . $order->id, time() . '_' . $cleanName, 'public');
                        $order->files()->create(['file_name' => $cleanName, 'file_path' => $path, 'file_type' => $file->getClientOriginalExtension(), 'category' => $reqName]);
                    }
                }
            }

            DB::commit();
            return redirect()->route('orders.index')->with('success', 'Data pekerjaan berhasil diperbarui!');
        } catch (\Exception $e) {
            DB::rollback(); return back()->withErrors(['error' => 'Gagal: ' . $e->getMessage()]);
        }
    }

    public function invoice(Order $order) {
        $order->load(['client', 'service', 'ppat_detail']);
        return Inertia::render('Orders/Invoice', ['order' => $order, 'company' => Company::first()]);
    }

    public function addPayment(Request $request, Order $order)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'required|string',
            'note' => 'nullable|string'
        ]);

        // Simpan riwayat pembayaran ke database
        $order->payments()->create([
            'amount' => $request->amount,
            'payment_method' => $request->payment_method,
            'note' => $request->note,
        ]);

        return back()->with('success', 'Pembayaran berhasil ditambahkan!');
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

    public function printFiles(\Illuminate\Http\Request $request, Order $order)
    {
        $query = $order->files();
        
        if ($request->has('files')) {
            $fileIds = explode(',', $request->query('files'));
            $query->whereIn('id', $fileIds);
        }

        $files = $query->get();
        if ($files->isEmpty()) {
            return back()->with('error', 'Tidak ada file untuk dicetak.');
        }

        $pdf = new \setasign\Fpdi\Fpdi();

        foreach ($files as $file) {
            $path = storage_path('app/public/' . $file->file_path);
            if (!file_exists($path)) continue;

            $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));

            if ($ext === 'pdf') {
                try {
                    $pageCount = $pdf->setSourceFile($path);
                    for ($pageNo = 1; $pageNo <= $pageCount; $pageNo++) {
                        $templateId = $pdf->importPage($pageNo);
                        $size = $pdf->getTemplateSize($templateId);
                        $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
                        $pdf->useTemplate($templateId);
                    }
                } catch (\Exception $e) {
                    // Skip invalid PDFs
                }
            } elseif (in_array($ext, ['jpg', 'jpeg', 'png'])) {
                try {
                    $size = getimagesize($path);
                    if ($size) {
                        $orientation = $size[0] > $size[1] ? 'L' : 'P';
                        $pdf->AddPage($orientation);
                        
                        $maxWidth = $orientation == 'P' ? 210 : 297;
                        $maxHeight = $orientation == 'P' ? 297 : 210;
                        
                        // Margin
                        $maxWidth -= 20;
                        $maxHeight -= 20;

                        $width = $size[0];
                        $height = $size[1];
                        $ratio = min($maxWidth / $width, $maxHeight / $height);
                        $newWidth = $width * $ratio;
                        $newHeight = $height * $ratio;

                        $x = ($orientation == 'P' ? 210 : 297 - $newWidth) / 2;
                        $y = ($orientation == 'P' ? 297 : 210 - $newHeight) / 2;

                        // Add title for image
                        $pdf->SetFont('Arial', 'B', 12);
                        $pdf->SetXY(10, 5);
                        $pdf->Cell(0, 10, strtoupper($file->category) . ' - ' . $file->file_name, 0, 1, 'C');

                        $pdf->Image($path, (210 - $newWidth)/2, (297 - $newHeight)/2 + 5, $newWidth, $newHeight);
                    }
                } catch (\Exception $e) {
                    // Skip invalid images
                }
            }
        }

        $pdf->Output('I', 'Cetak_File_' . $order->order_number . '.pdf');
    }
}
