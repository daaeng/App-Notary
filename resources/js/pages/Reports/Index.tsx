import { useState, FormEventHandler } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';

interface Props extends PageProps {
    orders: any[];
    filters: { start_date: string; end_date: string; status: string };
    summary: { total_omzet: number; total_jasa: number; total_titipan: number; total_order: number };
    company: { name: string; notary_name: string; address: string; phone: string };
}

export default function ReportIndex({ orders, filters, summary, company }: Props) {
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

    const getStatusColor = (s: string) => {
        if(s === 'done') return 'text-emerald-600 font-bold';
        if(s === 'cancel') return 'text-red-600 font-bold';
        return 'text-slate-600';
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Laporan', href: '/reports' }]}>
            <Head title="Laporan Bulanan" />

            {/* --- PERBAIKAN CSS PRINT --- */}
            <style>{`
                @media print {
                    @page { margin: 1cm; size: A4 landscape; }
                    /* 1. Sembunyikan SELURUH elemen di body */
                    body { visibility: hidden; }

                    /* 2. Tampilkan HANYA elemen dengan ID 'printable-area' */
                    #printable-area, #printable-area * { visibility: visible; }

                    /* 3. Posisikan area print di pojok kiri atas kertas */
                    #printable-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }

                    /* 4. Matikan scrollbar saat print */
                    .no-print-scroll { overflow: visible !important; }
                }
            `}</style>

            <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8 font-sans">

                {/* Bagian Filter (Tidak perlu print:hidden lagi karena sudah dihandle CSS body visibility) */}
                <div className="mb-8 print:hidden">
                    <h1 className="text-2xl font-bold text-slate-800">Laporan & Rekapitulasi</h1>
                    <p className="text-slate-500 text-sm mt-1 mb-6">Analisa kinerja dan keuangan kantor berdasarkan periode.</p>
                    <form onSubmit={handleFilter} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-end">
                        {/* ... Input Filter Tetap Sama ... */}
                        <div className="w-full md:w-auto">
                            <label className="text-xs font-bold text-slate-500 block mb-1">Dari Tanggal</label>
                            <input type="date" value={values.start_date} onChange={e => setValues({...values, start_date: e.target.value})} className="rounded-lg border-slate-300 text-sm focus:ring-cyan-500 focus:border-cyan-500" />
                        </div>
                        <div className="w-full md:w-auto">
                            <label className="text-xs font-bold text-slate-500 block mb-1">Sampai Tanggal</label>
                            <input type="date" value={values.end_date} onChange={e => setValues({...values, end_date: e.target.value})} className="rounded-lg border-slate-300 text-sm focus:ring-cyan-500 focus:border-cyan-500" />
                        </div>
                        <div className="w-full md:w-auto">
                            <label className="text-xs font-bold text-slate-500 block mb-1">Status</label>
                            <select value={values.status} onChange={e => setValues({...values, status: e.target.value})} className="rounded-lg border-slate-300 text-sm focus:ring-cyan-500 focus:border-cyan-500 min-w-[150px]">
                                <option value="all">Semua Status</option>
                                <option value="done">Selesai (Done)</option>
                                <option value="process">Proses</option>
                                <option value="new">Baru</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" className="px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded-lg hover:bg-slate-700">Terapkan</button>
                            <button type="button" onClick={() => window.print()} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50">🖨️ Cetak</button>
                        </div>
                    </form>
                </div>

                {/* --- AREA LAPORAN --- */}
                {/* Tambahkan ID 'printable-area' di sini */}
                <div id="printable-area" className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">

                    {/* Kop Laporan */}
                    <div className="text-center mb-6 border-b-2 border-slate-800 pb-4">
                        <h2 className="text-xl font-bold uppercase text-slate-900 tracking-wide">{company.name}</h2>
                        <p className="text-sm text-slate-600">{company.address}</p>
                        <p className="text-xs text-slate-500 mt-1">Telp: {company.phone} | Email: {company.email}</p>

                        <div className="mt-6 pt-4 border-t border-slate-200">
                            <h3 className="text-lg font-black uppercase text-slate-800">Laporan Rekapitulasi Pekerjaan</h3>
                            <p className="text-sm text-slate-600">Periode: {new Date(filters.start_date).toLocaleDateString('id-ID')} s/d {new Date(filters.end_date).toLocaleDateString('id-ID')}</p>
                        </div>
                    </div>

                    {/* Ringkasan Cards (Disembunyikan saat print via CSS class) */}
                    <div className="grid grid-cols-4 gap-4 mb-8 text-center print:hidden">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-xs text-slate-500 uppercase font-bold">Total Order</p>
                            <p className="text-xl font-bold text-slate-800">{summary.total_order} Berkas</p>
                        </div>
                        <div className="p-4 bg-cyan-50 rounded-xl border border-cyan-100">
                            <p className="text-xs text-cyan-600 uppercase font-bold">Total Pendapatan</p>
                            <p className="text-xl font-bold text-cyan-700">{rupiah(summary.total_omzet)}</p>
                        </div>
                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                            <p className="text-xs text-emerald-600 uppercase font-bold">Total Jasa (Net)</p>
                            <p className="text-xl font-bold text-emerald-700">{rupiah(summary.total_jasa)}</p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                            <p className="text-xs text-orange-600 uppercase font-bold">Total Titipan</p>
                            <p className="text-xl font-bold text-orange-700">{rupiah(summary.total_titipan)}</p>
                        </div>
                    </div>

                    {/* Tabel Data */}
                    {/* Tambahkan class 'no-print-scroll' */}
                    <div className="overflow-x-auto no-print-scroll">
                        <table className="w-full text-sm text-left border-collapse print:text-xs">
                            <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-xs print:bg-gray-200 print:text-black">
                                <tr>
                                    <th className="px-3 py-2 border border-slate-300">Tgl Masuk</th>
                                    <th className="px-3 py-2 border border-slate-300">No. Order</th>
                                    <th className="px-3 py-2 border border-slate-300">Klien</th>
                                    <th className="px-3 py-2 border border-slate-300">Layanan</th>
                                    <th className="px-3 py-2 border border-slate-300 text-right">Jasa (Rp)</th>
                                    <th className="px-3 py-2 border border-slate-300 text-right">Titipan (Rp)</th>
                                    <th className="px-3 py-2 border border-slate-300 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-slate-400 italic border border-slate-200">Tidak ada data.</td>
                                    </tr>
                                ) : (
                                    orders.map((order, index) => (
                                        <tr key={order.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50 print:bg-white'}>
                                            <td className="px-3 py-2 border border-slate-200 whitespace-nowrap">{new Date(order.created_at).toLocaleDateString('id-ID')}</td>
                                            <td className="px-3 py-2 border border-slate-200 font-mono text-xs whitespace-nowrap">{order.order_number}</td>
                                            <td className="px-3 py-2 border border-slate-200 font-bold">{order.client?.name}</td>
                                            <td className="px-3 py-2 border border-slate-200">
                                                <div className="font-bold">{order.service?.name}</div>
                                                <div className="text-[10px] text-slate-500 print:text-black line-clamp-1">{order.description}</div>
                                            </td>
                                            <td className="px-3 py-2 border border-slate-200 text-right font-mono">{Number(order.service_price).toLocaleString('id-ID')}</td>
                                            <td className="px-3 py-2 border border-slate-200 text-right font-mono text-slate-500 print:text-black">{Number(order.tax_deposit).toLocaleString('id-ID')}</td>
                                            <td className={`px-3 py-2 border border-slate-200 text-center uppercase text-[9px] font-bold ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300 print:bg-gray-100">
                                <tr>
                                    <td colSpan={4} className="px-3 py-2 text-right uppercase text-xs">Total Periode Ini</td>
                                    <td className="px-3 py-2 text-right border border-slate-300">{rupiah(summary.total_jasa)}</td>
                                    <td className="px-3 py-2 text-right border border-slate-300">{rupiah(summary.total_titipan)}</td>
                                    <td className="bg-slate-200 border border-slate-300 print:bg-gray-200"></td>
                                </tr>
                                <tr className="bg-slate-800 text-white print:bg-black print:text-white">
                                    <td colSpan={4} className="px-3 py-3 text-right uppercase text-sm">Grand Total Omzet</td>
                                    <td colSpan={3} className="px-3 py-3 text-center text-lg font-black">{rupiah(summary.total_omzet)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="hidden print:flex justify-end mt-12 break-inside-avoid">
                        <div className="text-center w-1/3">
                            <p className="mb-16">Jakarta, {new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                            <p className="font-bold underline uppercase">{company.notary_name}</p>
                            <p className="text-sm">Notaris & PPAT</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
