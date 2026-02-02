<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ScheduleController extends Controller
{
    public function index()
    {
        // Ambil semua jadwal untuk kalender
        $events = Schedule::orderBy('start_time')->get()->map(function ($event) {
            return [
                'id' => $event->id,
                'title' => $event->title,
                'start' => $event->start_time,
                'end' => $event->end_time,
                'color' => $event->color, // red, blue, green, amber, purple
                'location' => $event->location,
                'description' => $event->description,
            ];
        });

        return Inertia::render('Schedules/Index', [
            'events' => $events
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after_or_equal:start_time',
            'color' => 'required|string',
        ]);

        Schedule::create($request->all());

        return back()->with('success', 'Agenda berhasil ditambahkan.');
    }

    public function destroy(Schedule $schedule)
    {
        $schedule->delete();
        return back()->with('success', 'Agenda dihapus.');
    }
}
