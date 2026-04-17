<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\ServiceType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SimulationController extends Controller
{
    public function index()
    {
        return Inertia::render('Simulation/Index', [
            // Kirim data layanan lengkap dengan rincian biaya dan persyaratannya
            'serviceTypes' => ServiceType::with('services')->get(),
            // Kirim data kantor untuk keperluan cetak Estimasi/Kop Surat
            'company' => Company::first()
        ]);
    }
}
