<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index()
    {
        // Cari Jadwal dalam 3 Hari ke depan (H-0 sampai H+3)
        $today = now()->startOfDay();
        $next3Days = now()->addDays(3)->endOfDay();

        $upcomingSchedules = Schedule::whereBetween('start_time', [$today, $next3Days])
            ->orderBy('start_time', 'asc')
            ->get()
            ->map(function ($schedule) {
                return [
                    'id' => $schedule->id,
                    'title' => $schedule->title,
                    'time' => $schedule->start_time->format('d M, H:i'), // Format: 28 Jan, 10:00
                    'is_today' => $schedule->start_time->isToday(),
                    'color' => $schedule->color,
                ];
            });

        return response()->json([
            'count' => $upcomingSchedules->count(),
            'notifications' => $upcomingSchedules
        ]);
    }
}
