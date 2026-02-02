import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';

interface Props extends PageProps {
    orders: any[];
    filters: { start_date: string; end_date: string; status: string };
    summary: { total_omzet: number; total_jasa: number; total_titipan: number; total_order: number };
    company: { name: string; notary_name: string; address: string; phone: string; email: string };
}

export default function ReportDashboard({ orders, filters, summary, company }: Props) {
    const [values, setValues] = useState({
        start_date: filters.start_date,
        end_date: filters.end_date,
        status: filters.status,
    });

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/reports', values, { preserveState: true, replace: true });
    };

    const rupiah = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

    // Hitung Persentase untuk Visual Bar
    const percentJasa = summary.total_omzet > 0 ? Math.round((summary.total_jasa / summary.total_omzet) * 100) : 0;
    const percentTitipan = summary.total_omzet > 0 ? Math.round((summary.total_titipan / summary.total_omzet) * 100) : 0;

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Financial Report', href: '/reports' }]}>
            <Head title="Analisa Keuangan" />

            {/* --- CSS KHUSUS PRINT (MAGIC SWITCH) ---
                Saat print: Background jadi Putih, Teks Hitam, Elemen Dashboard Hilang, Kop Surat Muncul.
            */}
            <style>{`
                @media print {
                    @page { margin: 1cm; size: A4 landscape; }
                    body { background-color: white !important; -webkit-print-color-adjust: exact; }

                    /* Sembunyikan elemen dashboard UI */
                    nav, header, .dashboard-ui, .no-print { display: none !important; }

                    /* Tampilkan area print */
                    #printable-doc { display: block !important; width: 100%; position: absolute; top: 0; left: 0; }

                    /* Reset warna untuk kertas */
                    * { color: black !important; border-color: #000 !important; }
                    .print-bg-gray { background-color: #f3f4f6 !important; }
                    .print-text-white { color: white !important; }
                    .print-border { border: 1px solid #ddd !important; }

                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid black !important; padding: 6px; font-size: 11px; }
                }
            `}</style>

            <div className="min-h-screen bg-gray-50 dark:bg-black font-sans transition-colors duration-300">

                {/* === LAYOUT DASHBOARD (HANYA TAMPIL DI LAYAR) === */}
                <div className="dashboard-ui w-full mx-auto p-6 lg:p-8">

                    {/* Header Modern */}
                    <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                                <span className="text-emerald-500">$$$</span> FINANCIAL ANALYTICS
                            </h1>
                            <p className="mt-1 text-slate-500 dark:text-zinc-400 text-sm font-mono">
                                Real-time revenue stream analysis.
                            </p>
                        </div>

                        {/* Filter Bar Floating */}
                        <form onSubmit={handleFilter} className="flex flex-wrap items-center gap-3 bg-white dark:bg-zinc-900 p-2 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-lg">
                            <input type="date" value={values.start_date} onChange={e => setValues({...values, start_date: e.target.value})} className="bg-gray-50 dark:bg-black border-none text-xs font-bold rounded-lg focus:ring-0 text-slate-700 dark:text-white" />
                            <span className="text-slate-400">-</span>
                            <input type="date" value={values.end_date} onChange={e => setValues({...values, end_date: e.target.value})} className="bg-gray-50 dark:bg-black border-none text-xs font-bold rounded-lg focus:ring-0 text-slate-700 dark:text-white" />
                            <select value={values.status} onChange={e => setValues({...values, status: e.target.value})} className="bg-gray-50 dark:bg-black border-none text-xs font-bold rounded-lg focus:ring-0 text-slate-700 dark:text-white">
                                <option value="all">Semua Status</option>
                                <option value="done">Selesai</option>
                                <option value="process">Proses</option>
                            </select>
                            <button type="submit" className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </button>
                            <div className="w-px h-6 bg-gray-200 dark:bg-zinc-700 mx-1"></div>
                            <button type="button" onClick={() => window.print()} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-500/20">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                CETAK LAPORAN
                            </button>
                        </form>
                    </div>

                    {/* STATS CARDS (GRID 4) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

                        {/* Card 1: Total Omzet */}
                        <div className="relative overflow-hidden bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xl group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition text-emerald-500">
                                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                            </div>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-1">Total Omzet</p>
                            <h3 className="text-2xl lg:text-3xl font-black text-slate-800 dark:text-white truncate">
                                {rupiah(summary.total_omzet)}
                            </h3>
                            <div className="mt-4 flex items-center gap-2">
                                <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded">
                                    +100%
                                </span>
                                <span className="text-[10px] text-slate-400">Periode ini</span>
                            </div>
                        </div>

                        {/* Card 2: Jasa Net */}
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xl relative overflow-hidden">
                             <div className="absolute bottom-0 left-0 h-1 bg-indigo-500 transition-all" style={{ width: `${percentJasa}%` }}></div>
                             <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-1">Pendapatan Jasa</p>
                             <h3 className="text-2xl font-black text-slate-800 dark:text-white">{rupiah(summary.total_jasa)}</h3>
                             <p className="text-xs text-slate-400 mt-2">Murni pendapatan kantor ({percentJasa}%)</p>
                        </div>

                        {/* Card 3: Titipan */}
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xl relative overflow-hidden">
                             <div className="absolute bottom-0 left-0 h-1 bg-orange-500 transition-all" style={{ width: `${percentTitipan}%` }}></div>
                             <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-1">Titipan Pajak/Negara</p>
                             <h3 className="text-2xl font-black text-slate-800 dark:text-white">{rupiah(summary.total_titipan)}</h3>
                             <p className="text-xs text-slate-400 mt-2">Dana titipan klien ({percentTitipan}%)</p>
                        </div>

                        {/* Card 4: Volume */}
                        <div className="bg-gradient-to-br from-slate-800 to-black text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest opacity-50 mb-1">Volume Pekerjaan</p>
                                <h3 className="text-3xl font-black">{summary.total_order} <span className="text-sm font-normal opacity-70">Berkas</span></h3>
                            </div>
                            <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
                                <div className="bg-emerald-400 h-full rounded-full" style={{ width: '75%' }}></div>
                            </div>
                        </div>
                    </div>

                    {/* COMPOSITION BAR (Visualisasi CSS Murni) */}
                    <div className="mb-8">
                        <div className="flex justify-between items-end mb-2">
                            <h4 className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Komposisi Keuangan</h4>
                        </div>
                        <div className="w-full h-4 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden flex shadow-inner">
                            <div className="h-full bg-indigo-500 hover:bg-indigo-400 transition-all relative group" style={{ width: `${percentJasa}%` }}>
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">Jasa {percentJasa}%</div>
                            </div>
                            <div className="h-full bg-orange-500 hover:bg-orange-400 transition-all relative group" style={{ width: `${percentTitipan}%` }}>
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">Titipan {percentTitipan}%</div>
                            </div>
                        </div>
                    </div>

                    {/* PREVIEW TABEL (Mode Layar) */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-gray-50 dark:bg-black text-slate-500 dark:text-zinc-500 uppercase text-[10px] font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Tanggal</th>
                                        <th className="px-6 py-4">No. Order</th>
                                        <th className="px-6 py-4">Klien</th>
                                        <th className="px-6 py-4 text-right">Jasa (Rp)</th>
                                        <th className="px-6 py-4 text-right">Titipan (Rp)</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                    {orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition">
                                            <td className="px-6 py-4 text-slate-600 dark:text-zinc-400">{new Date(order.created_at).toLocaleDateString('id-ID')}</td>
                                            <td className="px-6 py-4 font-mono font-bold text-slate-800 dark:text-white">{order.order_number}</td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-zinc-300">
                                                <div className="font-bold">{order.client?.name}</div>
                                                <div className="text-xs text-slate-400">{order.service?.name}</div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">{Number(order.service_price).toLocaleString('id-ID')}</td>
                                            <td className="px-6 py-4 text-right font-mono text-slate-500 dark:text-zinc-500">{Number(order.tax_deposit).toLocaleString('id-ID')}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                                                    order.status === 'done' ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800' :
                                                    'bg-slate-50 border-slate-200 text-slate-500 dark:bg-zinc-800 dark:border-zinc-700'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>


                {/* === LAYOUT PRINT (HANYA MUNCUL SAAT PRINT) ===
                    Ini adalah layout "Kertas HVS" yang bersih.
                    ID: #printable-doc (Default hidden via CSS)
                */}
                <div id="printable-doc" className="hidden p-8 bg-white text-black font-serif">

                    {/* KOP SURAT */}
                    <div className="text-center border-b-4 border-double border-black pb-4 mb-6">
                        <h1 className="text-2xl font-bold uppercase tracking-widest">{company.name}</h1>
                        <p className="text-sm">{company.address}</p>
                        <p className="text-xs mt-1">Telp: {company.phone} | Email: {company.email}</p>
                    </div>

                    <div className="text-center mb-6">
                        <h2 className="text-lg font-bold uppercase underline">Laporan Rekapitulasi Pekerjaan</h2>
                        <p className="text-sm">Periode: {new Date(filters.start_date).toLocaleDateString('id-ID')} - {new Date(filters.end_date).toLocaleDateString('id-ID')}</p>
                    </div>

                    {/* TABEL PRINT (Simple & Clean) */}
                    <table className="w-full text-xs border-collapse border border-black">
                        <thead>
                            <tr className="bg-gray-100 print-bg-gray text-center font-bold">
                                <th className="border border-black px-2 py-1">Tgl</th>
                                <th className="border border-black px-2 py-1">No. Order</th>
                                <th className="border border-black px-2 py-1">Klien</th>
                                <th className="border border-black px-2 py-1">Uraian</th>
                                <th className="border border-black px-2 py-1">Jasa</th>
                                <th className="border border-black px-2 py-1">Titipan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order, i) => (
                                <tr key={order.id}>
                                    <td className="border border-black px-2 py-1 text-center">{new Date(order.created_at).toLocaleDateString('id-ID')}</td>
                                    <td className="border border-black px-2 py-1 text-center">{order.order_number}</td>
                                    <td className="border border-black px-2 py-1">{order.client?.name}</td>
                                    <td className="border border-black px-2 py-1">{order.service?.name} - {order.description}</td>
                                    <td className="border border-black px-2 py-1 text-right">{Number(order.service_price).toLocaleString('id-ID')}</td>
                                    <td className="border border-black px-2 py-1 text-right">{Number(order.tax_deposit).toLocaleString('id-ID')}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="font-bold bg-gray-100 print-bg-gray">
                                <td colSpan={4} className="border border-black px-2 py-1 text-right uppercase">Total</td>
                                <td className="border border-black px-2 py-1 text-right">{rupiah(summary.total_jasa)}</td>
                                <td className="border border-black px-2 py-1 text-right">{rupiah(summary.total_titipan)}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <div className="flex justify-end mt-16">
                        <div className="text-center w-64">
                            <p className="mb-20">Jakarta, {new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                            <p className="font-bold underline uppercase">{company.notary_name}</p>
                            <p className="text-sm">Notaris & PPAT</p>
                        </div>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
