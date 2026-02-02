import { useState, FormEventHandler, useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { route } from 'ziggy-js';

interface Event {
    id: number;
    title: string;
    start: string;
    end: string;
    color: string;
    location?: string;
    description?: string;
}

interface Props extends PageProps {
    events: Event[];
}

export default function ScheduleGlass({ events = [] }: Props) {
    const { data, setData, post, processing, reset } = useForm({
        title: '',
        start_time: '',
        end_time: '',
        location: '',
        description: '',
        color: 'blue',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('schedules.store'), { onSuccess: () => reset() });
    };

    const deleteEvent = (id: number) => {
        if (confirm('Hapus agenda ini?')) router.delete(route('schedules.destroy', id));
    };

    // --- LOGIC ---
    const sortedEvents = useMemo(() => {
        return (Array.isArray(events) ? events : []).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    }, [events]);

    const nextEvent = useMemo(() => {
        const now = new Date();
        return sortedEvents.find(e => new Date(e.end) > now);
    }, [sortedEvents]);

    const upcomingList = useMemo(() => {
        const now = new Date();
        // Tampilkan semua event setelah "Next Event", atau semua event jika next event null
        if (!nextEvent) return sortedEvents.filter(e => new Date(e.end) > now);
        return sortedEvents.filter(e => e.id !== nextEvent.id && new Date(e.end) > now);
    }, [sortedEvents, nextEvent]);

    // Helper Gradient Text
    const getGradientText = (color: string) => {
        const map: any = {
            blue: 'from-blue-600 to-cyan-500',
            red: 'from-rose-600 to-orange-500',
            green: 'from-emerald-600 to-teal-500',
            amber: 'from-amber-600 to-yellow-500',
            purple: 'from-purple-600 to-pink-500',
        };
        return map[color] || map.blue;
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Agenda', href: '/schedules' }]}>
            <Head title="Glass Horizon" />

            {/* BACKGROUND ANIMATED GRADIENT */}
            <div className="fixed inset-0 -z-10 bg-gray-50 dark:bg-slate-900">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900 opacity-60"></div>
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-[100px] pointer-events-none"></div>
            </div>

            <div className="min-h-screen bg-gray-50 dark:bg-black font-sans p-4 lg:p-8">
                <div className="w-full mx-auto">

                    {/* Header */}
                    <div className="mb-8 flex items-end justify-between">
                        <div>
                            <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter mb-1">
                                Hello, Notaris.
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">
                                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                        {/* === KIRI (7 Cols): FOCUS AREA & FORM === */}
                        <div className="lg:col-span-7 space-y-8">

                            {/* GLASS CARD: NEXT EVENT */}
                            <div className="relative overflow-hidden rounded-[2.5rem] p-8 shadow-2xl border border-white/50 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-xl transition hover:scale-[1.01] duration-500 group">
                                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>

                                {nextEvent ? (
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-6">
                                            <span className="px-4 py-1.5 rounded-full bg-white/50 dark:bg-black/50 text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 backdrop-blur-md shadow-sm">
                                                Sedang Berlangsung
                                            </span>
                                            {nextEvent.location && (
                                                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm font-medium">
                                                    📍 {nextEvent.location}
                                                </span>
                                            )}
                                        </div>

                                        <h2 className={`text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r ${getGradientText(nextEvent.color)} mb-4 leading-tight`}>
                                            {nextEvent.title}
                                        </h2>

                                        <div className="flex items-center gap-4 text-slate-700 dark:text-slate-200">
                                            <div className="p-3 bg-white/50 dark:bg-white/10 rounded-2xl backdrop-blur-sm">
                                                <p className="text-xs uppercase opacity-60 font-bold">Mulai</p>
                                                <p className="text-xl font-mono font-bold">
                                                    {new Date(nextEvent.start).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            <div className="h-px w-8 bg-slate-400/50"></div>
                                            <div className="p-3 bg-white/50 dark:bg-white/10 rounded-2xl backdrop-blur-sm">
                                                <p className="text-xs uppercase opacity-60 font-bold">Selesai</p>
                                                <p className="text-xl font-mono font-bold">
                                                    {new Date(nextEvent.end).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => deleteEvent(nextEvent.id)}
                                            className="absolute bottom-8 right-8 w-10 h-10 flex items-center justify-center rounded-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition opacity-0 group-hover:opacity-100"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center py-10 opacity-60">
                                        <p className="text-4xl mb-2">✨</p>
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Agenda Kosong</h3>
                                        <p className="text-sm">Tidak ada jadwal mendesak saat ini.</p>
                                    </div>
                                )}
                            </div>

                            {/* GLASS FORM */}
                            <div className="rounded-[2.5rem] p-8 shadow-xl border border-white/50 dark:border-white/10 bg-white/60 dark:bg-black/60 backdrop-blur-lg">
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-slate-800 dark:bg-white flex items-center justify-center text-white dark:text-black text-sm">✍️</span>
                                    Buat Agenda Baru
                                </h3>

                                <form onSubmit={submit} className="space-y-5">
                                    <input
                                        type="text"
                                        value={data.title} onChange={e => setData('title', e.target.value)}
                                        placeholder="Judul Kegiatan..."
                                        className="w-full bg-white/50 dark:bg-black/50 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-4 text-sm font-medium placeholder-slate-400 focus:ring-0 shadow-sm"
                                        required
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/50 dark:bg-black/50 rounded-2xl px-4 py-2 shadow-sm">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Mulai</label>
                                            <input
                                                type="datetime-local"
                                                value={data.start_time} onChange={e => setData('start_time', e.target.value)}
                                                className="w-full bg-transparent border-none p-0 text-xs font-mono font-bold focus:ring-0"
                                                required
                                            />
                                        </div>
                                        <div className="bg-white/50 dark:bg-black/50 rounded-2xl px-4 py-2 shadow-sm">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Selesai</label>
                                            <input
                                                type="datetime-local"
                                                value={data.end_time} onChange={e => setData('end_time', e.target.value)}
                                                className="w-full bg-transparent border-none p-0 text-xs font-mono font-bold focus:ring-0"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 bg-white/50 dark:bg-black/50 rounded-2xl px-4 py-2 shadow-sm flex items-center gap-2">
                                            <span className="text-slate-400">📍</span>
                                            <input
                                                type="text"
                                                value={data.location} onChange={e => setData('location', e.target.value)}
                                                placeholder="Lokasi..."
                                                className="w-full bg-transparent border-none p-0 text-sm focus:ring-0 placeholder-slate-400"
                                            />
                                        </div>
                                        <div className="flex gap-1 bg-white/50 dark:bg-black/50 p-2 rounded-2xl shadow-sm">
                                            {['blue', 'red', 'green'].map(c => (
                                                <button
                                                    key={c} type="button"
                                                    onClick={() => setData('color', c)}
                                                    className={`w-6 h-6 rounded-full transition-transform ${data.color === c ? 'scale-125 ring-2 ring-indigo-500' : 'opacity-40 hover:opacity-100'} bg-${c}-500`}
                                                ></button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        type="submit" disabled={processing}
                                        className="w-full py-4 bg-slate-800 dark:bg-white text-white dark:text-black font-bold rounded-2xl shadow-lg hover:scale-[1.02] transition-transform"
                                    >
                                        Simpan Agenda
                                    </button>
                                </form>
                            </div>

                        </div>

                        {/* === KANAN (5 Cols): UPCOMING LIST === */}
                        <div className="lg:col-span-5">
                            <div className="rounded-[2.5rem] p-8 border border-white/60 dark:border-white/5 bg-white/30 dark:bg-black/30 backdrop-blur-md h-full min-h-[600px] flex flex-col">
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-6 uppercase tracking-widest opacity-70">
                                    Berikutnya
                                </h3>

                                <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                                    {upcomingList.length === 0 ? (
                                        <p className="text-slate-400 italic">Tidak ada agenda mendatang.</p>
                                    ) : (
                                        upcomingList.map((event, idx) => {
                                            const isDifferentDay = idx === 0 || new Date(event.start).toDateString() !== new Date(upcomingList[idx - 1].start).toDateString();

                                            return (
                                                <div key={event.id}>
                                                    {isDifferentDay && (
                                                        <div className="sticky top-0 z-10 py-2 mb-2">
                                                            <span className="bg-slate-800/80 dark:bg-white/80 text-white dark:text-black px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
                                                                {new Date(event.start).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="group relative bg-white/60 dark:bg-black/60 p-5 rounded-2xl hover:bg-white/80 dark:hover:bg-black/80 transition-all duration-300 border border-transparent hover:border-indigo-200 dark:hover:border-indigo-900/50 shadow-sm">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex gap-4">
                                                                <div className="flex flex-col items-center">
                                                                    <div className={`w-3 h-3 rounded-full mb-1 bg-${event.color}-500 shadow-[0_0_10px_currentColor]`}></div>
                                                                    <div className="w-0.5 h-full bg-slate-300/30 rounded-full"></div>
                                                                </div>
                                                                <div className="pb-2">
                                                                    <p className="font-mono text-xs font-bold text-slate-400 mb-1">
                                                                        {new Date(event.start).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                                    </p>
                                                                    <h4 className="font-bold text-slate-800 dark:text-white text-lg leading-tight mb-1">
                                                                        {event.title}
                                                                    </h4>
                                                                    {event.location && (
                                                                        <p className="text-xs text-slate-500">📍 {event.location}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => deleteEvent(event.id)}
                                                                className="text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
