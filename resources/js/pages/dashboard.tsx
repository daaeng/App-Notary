import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';

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
    upcomingSchedules: any[]; // Definisi Data Jadwal
}

// PENTING: Tambahkan 'upcomingSchedules' di sini agar bisa dipakai
export default function Dashboard({ stats, recentOrders, upcomingSchedules }: DashboardProps) {

    const rupiah = (amount: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

    const formatTime = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
            <Head title="Dashboard" />

            <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8 font-sans">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Halo, Mas Daeng! 👋</h1>
                    <p className="text-slate-500 mt-1">Berikut laporan performa & keuangan bulan ini.</p>
                </div>

                {/* --- ROW 1: KEUANGAN --- */}
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Keuangan Bulan Ini</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Pemasukan */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase mb-1">Pemasukan (Omzet)</p>
                                <h3 className="text-2xl font-black text-slate-800">{rupiah(stats.revenue)}</h3>
                            </div>
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg text-xl">💰</div>
                        </div>
                    </div>
                    {/* Pengeluaran */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase mb-1">Pengeluaran</p>
                                <h3 className="text-2xl font-black text-red-600">-{rupiah(stats.expense)}</h3>
                            </div>
                            <div className="p-2 bg-red-50 text-red-600 rounded-lg text-xl">💸</div>
                        </div>
                    </div>
                    {/* Profit */}
                    <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl shadow-slate-900/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase mb-1">Profit Bersih (Net)</p>
                                <h3 className="text-3xl font-black text-emerald-400">{rupiah(stats.profit)}</h3>
                            </div>
                            <div className="p-2 bg-white/10 text-emerald-400 rounded-lg text-xl">📈</div>
                        </div>
                    </div>
                </div>

                {/* --- ROW 2: OPERASIONAL & AGENDA (Split 2 Kolom) --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

                    {/* KOLOM KIRI (2/3 layar): Status & Tabel Order */}
                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Operasional Berkas</h3>

                        {/* Status Cards Kecil */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center">
                                <div className="text-2xl mb-1">📂</div>
                                <div className="text-xl font-bold text-slate-800">{stats.total}</div>
                                <div className="text-[10px] uppercase text-slate-400 font-bold">Total</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center">
                                <div className="text-2xl mb-1">🆕</div>
                                <div className="text-xl font-bold text-slate-800">{stats.new}</div>
                                <div className="text-[10px] uppercase text-slate-400 font-bold">Baru</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center">
                                <div className="text-2xl mb-1">⚙️</div>
                                <div className="text-xl font-bold text-slate-800">{stats.process}</div>
                                <div className="text-[10px] uppercase text-slate-400 font-bold">Proses</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center">
                                <div className="text-2xl mb-1">✅</div>
                                <div className="text-xl font-bold text-slate-800">{stats.done}</div>
                                <div className="text-[10px] uppercase text-slate-400 font-bold">Selesai</div>
                            </div>
                        </div>

                        {/* Tabel Recent Orders */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="font-bold text-slate-800 text-sm">Pekerjaan Terbaru</h3>
                                <Link href={route('orders.index')} className="text-xs font-bold text-indigo-600 hover:underline">Lihat Semua &rarr;</Link>
                            </div>
                            <table className="w-full text-sm text-left">
                                <tbody className="divide-y divide-slate-100">
                                    {recentOrders.length === 0 ? (
                                        <tr><td className="p-4 text-center text-slate-400 italic">Belum ada data.</td></tr>
                                    ) : (
                                        recentOrders.map((order) => (
                                            <tr key={order.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 font-mono text-xs text-slate-500">{order.order_number}</td>
                                                <td className="px-4 py-3 font-bold text-slate-700">{order.client?.name}</td>
                                                <td className="px-4 py-3 text-xs">
                                                    <span className={`px-2 py-1 rounded-md font-bold uppercase text-[10px] ${
                                                        order.status === 'done' ? 'bg-emerald-100 text-emerald-700' :
                                                        order.status === 'new' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>{order.status}</span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Link href={route('orders.edit', order.id)} className="text-indigo-600 font-bold hover:underline text-xs">Detail</Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* KOLOM KANAN (1/3 layar): Agenda / Jadwal */}
                    <div>
                        <div className="flex justify-between items-end mb-4">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Agenda Terdekat</h3>
                            <Link href={route('schedules.index')} className="text-xs text-blue-600 hover:underline">+ Buat Baru</Link>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4 min-h-[300px]">
                            {/* Logic Tampilan Agenda */}
                            {!upcomingSchedules || upcomingSchedules.length === 0 ? (
                                <div className="text-center py-10">
                                    <div className="text-4xl mb-2">🌴</div>
                                    <p className="text-slate-400 text-sm">Tidak ada jadwal dalam waktu dekat.</p>
                                </div>
                            ) : (
                                upcomingSchedules.map((item: any) => (
                                    <div key={item.id} className="flex gap-3 items-start p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-300 transition-colors cursor-pointer group">
                                        {/* Tanggal Box */}
                                        <div className={`w-12 h-12 rounded-lg flex-shrink-0 flex flex-col items-center justify-center text-white font-bold shadow-md
                                            ${item.color === 'red' ? 'bg-red-500' : item.color === 'green' ? 'bg-emerald-500' : 'bg-blue-500'}`}>
                                            <span className="text-[10px] uppercase leading-none">{new Date(item.start_time).toLocaleString('id-ID', {month: 'short'})}</span>
                                            <span className="text-lg leading-none">{new Date(item.start_time).getDate()}</span>
                                        </div>
                                        {/* Detail Agenda */}
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm line-clamp-2 group-hover:text-blue-600">{item.title}</h4>
                                            <p className="text-xs text-slate-500 mt-1">⏰ {formatTime(item.start_time)}</p>
                                        </div>
                                    </div>
                                ))
                            )}

                            {upcomingSchedules && upcomingSchedules.length > 0 && (
                                <Link href={route('schedules.index')} className="block text-center text-xs text-slate-400 hover:text-slate-600 mt-4 pt-4 border-t border-dashed border-slate-200">
                                    Lihat Agenda Selengkapnya
                                </Link>
                            )}
                        </div>
                    </div>

                </div>

            </div>
        </AppLayout>
    );
}
