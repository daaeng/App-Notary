<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    // Tampilkan Daftar Agenda (Diurutkan dari yang terdekat)
    public function index()
    {
        $schedules = Schedule::orderBy('start_time', 'asc')
            ->whereDate('start_time', '>=', now()->subDays(1)) // Tampilkan dari kemarin ke depan
            ->paginate(10);

        return Inertia::render('Schedules/Index', [
            'schedules' => $schedules
        ]);
    }

    // Simpan Agenda Baru
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'start_time' => 'required|date',
            'color' => 'required|string',
        ]);

        Schedule::create([
            'title' => $request->title,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'location' => $request->location,
            'color' => $request->color,
            'description' => $request->description,
        ]);

        return back()->with('success', 'Agenda berhasil dijadwalkan!');
    }

    // Hapus Agenda
    public function destroy(Schedule $schedule)
    {
        $schedule->delete();
        return back()->with('success', 'Agenda dihapus.');
    }
}
