import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';

// Sesuaikan interface dengan data dari web.php Anda
interface DashboardProps extends PageProps {
    stats: {
        total: number;
        new: number;
        process: number;
        done: number;
        revenue: number;
        expense: number;
        profit: number;
    };
    recentOrders: any[];
    upcomingSchedules: any[];
}

export default function DashboardOperations({ auth, stats, recentOrders, upcomingSchedules }: DashboardProps) {

    const rupiah = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
    const formatTime = (date: string) => new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const formatDate = (date: string) => new Date(date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });

    // Sapaan Waktu
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Selamat Pagi' : hour < 15 ? 'Selamat Siang' : hour < 18 ? 'Selamat Sore' : 'Selamat Malam';

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
            <Head title="Operations Center" />

            <div className="min-h-screen bg-gray-50 dark:bg-black font-sans transition-colors duration-300 p-4 lg:p-8">
                <div className="w-full max-w-[1800px] mx-auto">

                    {/* HEADER */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {greeting}, {auth.user.name}
                            </h1>
                            <p className="text-slate-500 dark:text-zinc-400 text-sm mt-0.5">
                                Pantau operasional kantor dalam satu layar.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Link href={route('schedules.index')} className="px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition">
                                📅 Kalender
                            </Link>
                            <Link href={route('orders.create')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold shadow-md shadow-indigo-500/20 transition flex items-center gap-2">
                                + Order Baru
                            </Link>
                        </div>
                    </div>

                    {/* 3-COLUMN LAYOUT */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                        {/* --- KOLOM 1: STATISTIK (3 Cols) --- */}
                        <div className="lg:col-span-3 space-y-6">

                            {/* Card: Profit */}
                            <div className="bg-gradient-to-br from-slate-900 to-black rounded-2xl p-6 shadow-xl text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Net Profit (Bulan Ini)</p>
                                <h3 className="text-3xl font-black">{rupiah(stats.profit)}</h3>
                                <div className="mt-4 pt-4 border-t border-white/10 space-y-1">
                                    <div className="flex justify-between text-xs text-slate-400">
                                        <span>Masuk</span>
                                        <span className="text-emerald-400 font-mono font-bold">+ {rupiah(stats.revenue)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-400">
                                        <span>Keluar</span>
                                        <span className="text-red-400 font-mono font-bold">- {rupiah(stats.expense)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card: Status Order (Vertical Stack) */}
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm p-2">
                                <div className="p-3 flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 mb-2">
                                    <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Pipeline Order</span>
                                    <span className="text-xs font-bold bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-slate-600 dark:text-zinc-300">{stats.total} Total</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                            <span className="text-sm font-bold">Baru Masuk</span>
                                        </div>
                                        <span className="text-lg font-black">{stats.new}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                            <span className="text-sm font-bold">Proses</span>
                                        </div>
                                        <span className="text-lg font-black">{stats.process}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            <span className="text-sm font-bold">Selesai</span>
                                        </div>
                                        <span className="text-lg font-black">{stats.done}</span>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* --- KOLOM 2: PEKERJAAN TERBARU (6 Cols - Paling Lebar) --- */}
                        <div className="lg:col-span-6">
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                                <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-black/20">
                                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                        📋 Aktivitas Pekerjaan
                                    </h3>
                                    <Link href={route('orders.index')} className="text-xs font-bold text-indigo-600 hover:text-indigo-500">
                                        Lihat Semua
                                    </Link>
                                </div>

                                <div className="flex-1 overflow-y-auto p-2">
                                    {recentOrders.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-zinc-600">
                                            <span className="text-4xl mb-2 opacity-50">📭</span>
                                            <p className="text-sm">Belum ada order baru.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {recentOrders.map((order: any) => (
                                                <Link
                                                    key={order.id}
                                                    href={route('orders.edit', order.id)}
                                                    className="group flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition border border-transparent hover:border-gray-200 dark:hover:border-zinc-700"
                                                >
                                                    {/* Ikon Inisial */}
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                                                        order.status === 'done' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                        'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                                                    }`}>
                                                        {order.client?.name.substring(0,1).toUpperCase()}
                                                    </div>

                                                    {/* Info Utama */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start">
                                                            <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                                                                {order.client?.name}
                                                            </h4>
                                                            <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                                                                {new Date(order.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                                                            {order.service?.name}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                                order.status === 'new' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                                order.status === 'process' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                                order.status === 'done' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                                'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-400'
                                                            }`}>
                                                                {order.status}
                                                            </span>
                                                            <span className="text-[10px] font-mono font-bold text-slate-400">
                                                                #{order.order_number}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Panah Aksi */}
                                                    <div className="hidden sm:block text-slate-300 dark:text-zinc-600 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all">
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* --- KOLOM 3: AGENDA (3 Cols) --- */}
                        <div className="lg:col-span-3">
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm p-6">
                                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6">
                                    ⏰ Agenda Terdekat
                                </h3>

                                <div className="space-y-6 relative">
                                    {/* Garis Timeline */}
                                    <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-zinc-800"></div>

                                    {upcomingSchedules && upcomingSchedules.length > 0 ? (
                                        upcomingSchedules.map((schedule: any) => (
                                            <div key={schedule.id} className="relative pl-6 group">
                                                {/* Dot */}
                                                <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-zinc-900 transition-colors ${
                                                    schedule.color === 'red' ? 'bg-red-500' : schedule.color === 'green' ? 'bg-emerald-500' : 'bg-indigo-500'
                                                }`}></div>

                                                <div className="mb-1 flex justify-between items-center">
                                                    <p className="text-xs font-bold text-slate-500 dark:text-zinc-400">
                                                        {formatDate(schedule.start_time)}
                                                    </p>
                                                    <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                                                        {formatTime(schedule.start_time)}
                                                    </p>
                                                </div>

                                                <div className="p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-800 group-hover:bg-white dark:group-hover:bg-zinc-800 group-hover:shadow-sm transition-all">
                                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white line-clamp-2">{schedule.title}</h4>
                                                    {schedule.location && (
                                                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                            📍 {schedule.location}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-slate-400 dark:text-zinc-600">
                                            <p className="text-2xl mb-2">☕</p>
                                            <p className="text-xs">Tidak ada agenda.</p>
                                        </div>
                                    )}

                                    <Link href={route('schedules.index')} className="block text-center text-xs font-bold text-indigo-500 hover:text-indigo-600 mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
                                        Lihat Semua Agenda &rarr;
                                    </Link>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
