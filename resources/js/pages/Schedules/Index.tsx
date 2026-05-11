import { useState, FormEventHandler, useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { route } from 'ziggy-js';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

// Inisialisasi SweetAlert
const MySwal = withReactContent(Swal);

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
        color: 'blue',
    });

    // Alert Custom Style untuk konsistensi tema
    const alertConfig = {
        background: '#09090b', // warna gelap sesuai tema
        color: '#f1f5f9', // slate-100
        confirmButtonColor: '#4f46e5', // indigo-600
        cancelButtonColor: '#27272a', // zinc-800
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('schedules.store'), {
            onSuccess: () => {
                reset();
                MySwal.fire({
                    icon: 'success',
                    title: 'Agenda Disimpan!',
                    text: 'Jadwal baru berhasil ditambahkan.',
                    timer: 2000,
                    showConfirmButton: false,
                    ...alertConfig
                });
            }
        });
    };

    const deleteEvent = (id: number) => {
        MySwal.fire({
            title: 'Hapus Agenda?',
            text: `Agenda ini akan dihapus secara permanen dari jadwal.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
            reverseButtons: true,
            ...alertConfig
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('schedules.destroy', id), {
                    onSuccess: () => {
                        MySwal.fire({
                            title: 'Terhapus!',
                            text: 'Agenda berhasil dihapus.',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false,
                            ...alertConfig
                        });
                    }
                });
            }
        });
    };

    // --- SOLUSI ZONA WAKTU (TIMEZONE FIX) ---
    // Fungsi untuk memastikan Javascript membaca jam sesuai angka mentahnya (mengabaikan zona waktu / UTC+7 dari server)
    const parseLocal = (dateStr: string) => {
        if (!dateStr) return new Date();
        // Potong milidetik dan huruf 'Z' (contoh: "2026-05-04T14:00:00.000000Z" menjadi "2026-05-04T14:00:00")
        const cleanStr = dateStr.split('.')[0].replace('Z', '');
        return new Date(cleanStr.replace(' ', 'T'));
    };

    // --- LOGIC ---
    const sortedEvents = useMemo(() => {
        return (Array.isArray(events) ? events : []).sort((a, b) => parseLocal(a.start).getTime() - parseLocal(b.start).getTime());
    }, [events]);

    const nextEvent = useMemo(() => {
        const now = new Date();
        return sortedEvents.find(e => parseLocal(e.end) > now);
    }, [sortedEvents]);

    const upcomingList = useMemo(() => {
        const now = new Date();
        if (!nextEvent) return sortedEvents.filter(e => parseLocal(e.end) > now);
        return sortedEvents.filter(e => e.id !== nextEvent.id && parseLocal(e.end) > now);
    }, [sortedEvents, nextEvent]);

    const getGradientText = (color: string) => {
        const map: any = {
            blue: 'from-blue-400 to-cyan-300',
            red: 'from-rose-400 to-orange-300',
            green: 'from-emerald-400 to-teal-300',
            amber: 'from-amber-400 to-yellow-300',
            purple: 'from-purple-400 to-pink-300',
        };
        return map[color] || map.blue;
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Agenda', href: '/schedules' }]}>
            <Head title="Jadwal & Agenda" />

            <div className="fixed inset-0 -z-10 bg-[#09090b]">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
            </div>

            <div className="min-h-screen font-sans p-4 lg:p-8">
                <div className="w-full mx-auto space-y-8">

                    <div className="mb-8 flex items-end justify-between">
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tighter mb-1">
                                Hello, Notaris.
                            </h1>
                            <p className="text-slate-400 font-medium">
                                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                        <div className="lg:col-span-7 space-y-8">

                            <div className="relative overflow-hidden rounded-[2.5rem] p-8 shadow-2xl border border-white/10 bg-[#121214]/80 backdrop-blur-xl transition hover:scale-[1.01] duration-500 group">
                                <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${nextEvent ? getGradientText(nextEvent.color) : 'from-slate-700 to-slate-800'}`}></div>

                                {nextEvent ? (
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-6">
                                            <span className="px-4 py-1.5 rounded-full bg-white/5 text-xs font-bold uppercase tracking-widest text-slate-300 border border-white/10">
                                                Sedang Berlangsung / Mendatang
                                            </span>
                                            {nextEvent.location && (
                                                <span className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                                                    📍 {nextEvent.location}
                                                </span>
                                            )}
                                        </div>

                                        <h2 className={`text-3xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r ${getGradientText(nextEvent.color)} mb-6 leading-tight tracking-tight`}>
                                            {nextEvent.title}
                                        </h2>

                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 text-slate-200">
                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 w-full sm:w-auto">
                                                <p className="text-[10px] uppercase text-slate-500 font-bold tracking-widest mb-1">Mulai</p>
                                                <p className="text-xl font-mono font-black text-white">
                                                    {parseLocal(nextEvent.start).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-1">{parseLocal(nextEvent.start).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                                            </div>
                                            <div className="hidden sm:block h-px w-8 bg-slate-700"></div>
                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 w-full sm:w-auto">
                                                <p className="text-[10px] uppercase text-slate-500 font-bold tracking-widest mb-1">Selesai</p>
                                                <p className="text-xl font-mono font-black text-white">
                                                    {parseLocal(nextEvent.end).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-1">{parseLocal(nextEvent.end).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => deleteEvent(nextEvent.id)}
                                            className="absolute bottom-8 right-8 w-12 h-12 flex items-center justify-center rounded-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 border border-red-500/20"
                                            title="Hapus Agenda"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 opacity-60">
                                        <p className="text-5xl mb-4">✨</p>
                                        <h3 className="text-xl font-bold text-white tracking-tight">Agenda Kosong</h3>
                                        <p className="text-sm text-slate-400 mt-1">Tidak ada jadwal mendesak saat ini.</p>
                                    </div>
                                )}
                            </div>

                            <div className="rounded-[2.5rem] p-8 shadow-xl border border-white/10 bg-[#121214]/80 backdrop-blur-xl">
                                <h3 className="font-black text-lg text-white mb-6 flex items-center gap-3 uppercase tracking-widest">
                                    <span className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm border border-indigo-500/30">✍️</span>
                                    Buat Agenda Baru
                                </h3>

                                <form onSubmit={submit} className="space-y-5">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Judul Kegiatan</label>
                                        <input
                                            type="text"
                                            value={data.title} onChange={e => setData('title', e.target.value)}
                                            placeholder="Contoh: Tanda Tangan Akta PT. ABC..."
                                            className="w-full bg-[#09090b] border border-[#27272a] text-slate-200 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-4 outline-none transition-all placeholder-slate-600"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Mulai</label>
                                            <input
                                                type="datetime-local"
                                                value={data.start_time} onChange={e => setData('start_time', e.target.value)}
                                                className="w-full bg-[#09090b] border border-[#27272a] text-slate-200 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-4 outline-none transition-all"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Selesai</label>
                                            <input
                                                type="datetime-local"
                                                value={data.end_time} onChange={e => setData('end_time', e.target.value)}
                                                className="w-full bg-[#09090b] border border-[#27272a] text-slate-200 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-4 outline-none transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center gap-5">
                                        <div className="w-full sm:flex-1">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Lokasi (Opsional)</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">📍</div>
                                                <input
                                                    type="text"
                                                    value={data.location} onChange={e => setData('location', e.target.value)}
                                                    placeholder="Contoh: Ruang Rapat / Zoom..."
                                                    className="w-full bg-[#09090b] border border-[#27272a] text-slate-200 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block pl-10 p-4 outline-none transition-all placeholder-slate-600"
                                                />
                                            </div>
                                        </div>
                                        <div className="w-full sm:w-auto">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Warna</label>
                                            <div className="flex gap-2 bg-[#09090b] p-3 rounded-xl border border-[#27272a] h-[54px] items-center">
                                                {['blue', 'red', 'green', 'amber', 'purple'].map(c => (
                                                    <button
                                                        key={c} type="button"
                                                        onClick={() => setData('color', c)}
                                                        className={`w-7 h-7 rounded-full transition-all ${data.color === c ? 'scale-125 ring-2 ring-white/50 shadow-lg' : 'opacity-40 hover:opacity-100'} bg-${c}-500`}
                                                    ></button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit" disabled={processing}
                                        className="w-full py-4 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] active:scale-95 transition-all"
                                    >
                                        {processing ? 'Menyimpan...' : 'Simpan Agenda'}
                                    </button>
                                </form>
                            </div>

                        </div>

                        <div className="lg:col-span-5">
                            <div className="rounded-[2.5rem] p-8 border border-white/10 bg-[#121214]/60 backdrop-blur-xl h-full min-h-[600px] flex flex-col shadow-2xl">
                                <h3 className="font-black text-lg text-slate-400 mb-8 uppercase tracking-[0.2em] flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Agenda Mendatang
                                </h3>

                                <div className="flex-1 overflow-y-auto space-y-5 custom-scrollbar pr-2">
                                    {upcomingList.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center opacity-30">
                                            <span className="text-4xl mb-3">📭</span>
                                            <p className="text-sm font-bold uppercase tracking-widest">Tidak ada jadwal</p>
                                        </div>
                                    ) : (
                                        upcomingList.map((event, idx) => {
                                            const isDifferentDay = idx === 0 || parseLocal(event.start).toDateString() !== parseLocal(upcomingList[idx - 1].start).toDateString();

                                            return (
                                                <div key={event.id}>
                                                    {isDifferentDay && (
                                                        <div className="sticky top-0 z-10 py-2 mb-3 backdrop-blur-md">
                                                            <span className="bg-slate-800/80 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-700/50">
                                                                {parseLocal(event.start).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="group relative bg-[#09090b] p-5 rounded-2xl hover:bg-[#18181b] transition-all duration-300 border border-[#27272a] hover:border-indigo-500/30 shadow-md">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex gap-4">
                                                                <div className="flex flex-col items-center mt-1">
                                                                    <div className={`w-3.5 h-3.5 rounded-full mb-1 bg-${event.color}-500 shadow-[0_0_10px_currentColor]`}></div>
                                                                    <div className="w-0.5 h-full bg-[#27272a] rounded-full"></div>
                                                                </div>
                                                                <div className="pb-2">
                                                                    <p className="font-mono text-xs font-bold text-slate-500 mb-1.5 bg-slate-800/50 w-fit px-2 py-0.5 rounded-md">
                                                                        {parseLocal(event.start).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {parseLocal(event.end).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                                    </p>
                                                                    <h4 className="font-black text-white text-base leading-tight mb-2">
                                                                        {event.title}
                                                                    </h4>
                                                                    {event.location && (
                                                                        <p className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                                                                            <span className="opacity-70">📍</span> {event.location}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => deleteEvent(event.id)}
                                                                className="w-8 h-8 flex justify-center items-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 border border-red-500/20 shrink-0"
                                                                title="Hapus Agenda"
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
