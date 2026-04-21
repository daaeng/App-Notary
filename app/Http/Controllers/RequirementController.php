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
        // Menarik semua data tipe layanan beserta anak layanannya
        $serviceTypes = ServiceType::with('services')->get();

        return Inertia::render('Requirements/Index', [
            'serviceTypes' => $serviceTypes
        ]);
    }

    // Fungsi baru untuk menyimpan hasil edit persyaratan
    public function update(Request $request, Service $service)
    {
        $request->validate([
            'uploads' => 'nullable|array',
            'inputs' => 'nullable|array',
        ]);

        // Bersihkan array dari input yang kosong (empty string)
        $requirements = [
            'uploads' => array_values(array_filter($request->uploads ?? [])),
            'inputs' => array_values(array_filter($request->inputs ?? [])),
        ];

        $service->update([
            'requirements' => json_encode($requirements)
        ]);

        return back()->with('success', 'Data Persyaratan berhasil diperbarui!');
    }
}
