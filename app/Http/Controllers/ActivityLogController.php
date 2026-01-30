<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    public function index()
    {
        // Ambil log aktivitas
        // 'causer' = Pelaku (User)
        // 'subject' = Data yang diubah (Order/Client/dll)
        $activities = Activity::with(['causer', 'subject'])
            ->latest()
            ->paginate(20);

        // Perhatikan: Folder 'ActivityLogs' (Pakai 's')
        return Inertia::render('ActivityLog/Index', [
            'activities' => $activities
        ]);
    }
}
