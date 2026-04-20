<?php

namespace App\Http\Controllers;

use App\Models\ServiceType;
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
}
