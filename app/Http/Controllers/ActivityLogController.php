<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    public function index()
    {
        // Ambil data log, urutkan dari yang terbaru, dan ambil data pelakunya (causer)
        $activities = Activity::with('causer')
            ->latest()
            ->paginate(20); // Tampilkan 20 per halaman

        return Inertia::render('ActivityLog/Index', [
            'activities' => $activities
        ]);
    }
}
