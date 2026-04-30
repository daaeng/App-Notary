<?php

namespace App\Http\Controllers;

use App\Models\ServiceType;
use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RequirementController extends Controller
{
    public function index()
    {
        $serviceTypes = ServiceType::with('services')->get();

        return Inertia::render('Requirements/Index', [
            'serviceTypes' => $serviceTypes
        ]);
    }

    // Fungsi Tambah Layanan Baru
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'service_type_id' => 'required|exists:service_types,id',
            'default_price' => 'required|numeric|min:0',
            'uploads' => 'nullable|array',
            'inputs' => 'nullable|array',
            'active_fee_fields' => 'nullable|array' // Khusus PPAT
        ]);

        $requirements = [
            'uploads' => array_values(array_filter($request->uploads ?? [])),
            'inputs' => array_values(array_filter($request->inputs ?? [])),
        ];

        Service::create([
            'name' => $request->name,
            'service_type_id' => $request->service_type_id,
            'default_price' => $request->default_price,
            'requirements' => json_encode($requirements),
            'active_fee_fields' => json_encode($request->active_fee_fields ?? [])
        ]);

        return back()->with('success', 'Layanan baru berhasil ditambahkan!');
    }

    // Fungsi Edit Layanan (Termasuk Harga dan Nama)
    public function update(Request $request, Service $service)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'default_price' => 'required|numeric|min:0',
            'uploads' => 'nullable|array',
            'inputs' => 'nullable|array',
        ]);

        $requirements = [
            'uploads' => array_values(array_filter($request->uploads ?? [])),
            'inputs' => array_values(array_filter($request->inputs ?? [])),
        ];

        $service->update([
            'name' => $request->name,
            'default_price' => $request->default_price,
            'requirements' => json_encode($requirements)
        ]);

        return back()->with('success', 'Data Layanan berhasil diperbarui!');
    }

    // Fungsi Hapus Layanan
    public function destroy(Service $service)
    {
        $service->delete();
        return back()->with('success', 'Layanan berhasil dihapus!');
    }
}
