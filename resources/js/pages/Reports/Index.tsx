import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';

interface Props extends PageProps {
    orders: any[];
    summary: any;
    filters: any;
    period_title: string;
    monthly_comparison: any[];
    expense_by_category: Record<string, number>;
    company: any;
    growth?: { jasa: number };
}

export default function ReportIndex({
    orders, summary, filters, period_title,
    monthly_comparison, expense_by_category, company, growth
}: Props) {

    const [values, setValues] = useState({
        type: filters.type || 'monthly',
        year: filters.year,
        month: filters.month,
        start_date: filters.start_date,
        end_date: filters.end_date,
        compare_year: filters.compare_year || filters.year - 1,
    });

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/reports', values, { preserveState: true, replace: true });
    };

    const rupiah = (amount: number) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount || 0);

    return (
        <AppLayout breadcrumbs={[{ title: 'Laporan Keuangan', href: '/reports' }]}>
            <Head title="Laporan Keuangan" />

            <div className="min-h-screen bg-gray-50 dark:bg-black font-sans transition-colors duration-300 p-4 lg:p-8">
                <div className="w-full mx-auto space-y-8">

                    {/* Header */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 gap-6">
                        <div>
                            <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">Laporan Keuangan</h1>
                            <p className="text-2xl text-zinc-500 dark:text-zinc-400 mt-1">{period_title}</p>
                        </div>

                        <form onSubmit={handleFilter} className="flex flex-wrap items-center gap-3 bg-white dark:bg-zinc-900 px-5 py-3 rounded-3xl shadow border border-zinc-200 dark:border-zinc-800 transition">
                            <select value={values.type} onChange={e => setValues({ ...values, type: e.target.value })}
                                className="bg-transparent border border-zinc-300 text-black dark:text-white dark:border-zinc-700 rounded-2xl px-5 py-3 text-sm font-medium">
                                <option className='bg-transparent' value="monthly">Bulanan</option>
                                <option className='bg-transparent' value="yearly">Tahunan</option>
                                <option className='bg-transparent' value="custom">Rentang Tanggal</option>
                            </select>

                            {values.type === 'monthly' && (
                                <>
                                    <input type="number" value={values.year} onChange={e => setValues({ ...values, year: +e.target.value })}
                                        className="w-20 text-center border border-zinc-300 dark:border-zinc-700 rounded-2xl px-4 py-3" />
                                    <select value={values.month} onChange={e => setValues({ ...values, month: +e.target.value })}
                                        className="border border-zinc-300 dark:border-zinc-700 rounded-2xl px-5 py-3 text-sm">
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                                {new Date(0, i).toLocaleString('id-ID', { month: 'long' })}
                                            </option>
                                        ))}
                                    </select>
                                </>
                            )}

                            {values.type === 'yearly' && (
                                <input type="number" value={values.year} onChange={e => setValues({ ...values, year: +e.target.value })}
                                    className="w-28 text-center border border-zinc-300 dark:border-zinc-700 rounded-2xl px-5 py-3" />
                            )}

                            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-semibold transition">
                                Terapkan Filter
                            </button>
                            <button onClick={() => window.print()}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 transition">
                                🖨️ Cetak
                            </button>
                        </form>
                    </div>

                    {/* Summary Cards - Full Width & Responsive */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mb-12">
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow hover:shadow-xl transition-all">
                            <p className="text-zinc-500 text-sm">Total Omzet</p>
                            <p className="text-3xl xl:text-4xl font-bold mt-4 break-all">{rupiah(summary.total_omzet)}</p>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow hover:shadow-xl transition-all">
                            <p className="text-emerald-600 text-sm">Pendapatan Jasa</p>
                            <p className="text-3xl xl:text-4xl font-bold mt-4 text-emerald-600 break-all">{rupiah(summary.total_jasa)}</p>
                            {growth && (
                                <div className="mt-3">
                                    <span className={`text-xs font-bold px-4 py-2 rounded-2xl ${growth.jasa >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                        {growth.jasa >= 0 ? '↑' : '↓'} {growth.jasa}% dari bulan lalu
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow hover:shadow-xl transition-all">
                            <p className="text-orange-600 text-sm">Titipan Pajak</p>
                            <p className="text-3xl xl:text-4xl font-bold mt-4 text-orange-600 break-all">{rupiah(summary.total_titipan)}</p>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow hover:shadow-xl transition-all">
                            <p className="text-rose-600 text-sm">Total Pengeluaran</p>
                            <p className="text-3xl xl:text-4xl font-bold mt-4 text-rose-600 break-all">{rupiah(summary.total_expense)}</p>
                        </div>

                        <div className="bg-gradient-to-br from-zinc-900 to-black text-white rounded-3xl p-8 shadow hover:shadow-xl transition-all">
                            <p className="opacity-75 text-sm">Laba Bersih</p>
                            <p className="text-3xl xl:text-4xl font-bold mt-4 break-all">{rupiah(summary.net_profit)}</p>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow mb-12">
                        <h3 className="text-xl font-semibold mb-8">Perbandingan Pendapatan Jasa ({filters.year} vs {filters.compare_year})</h3>

                        <div className="h-96 flex items-end gap-3 md:gap-6">
                            {monthly_comparison.map((item, i) => {
                                const maxVal = Math.max(...monthly_comparison.map(m => Math.max(m.current || 0, m.previous || 0)));
                                const heightCurrent = maxVal > 0 ? (item.current / maxVal) * 92 : 10;
                                const heightPrev = maxVal > 0 ? (item.previous / maxVal) * 92 : 10;

                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                        <div className="w-full flex flex-col-reverse gap-1 h-80">
                                            <div className="bg-indigo-600 rounded-t-2xl group-hover:bg-indigo-500 transition-all duration-300"
                                                style={{ height: `${heightCurrent}%` }}>
                                            </div>
                                            <div className="bg-zinc-300 dark:bg-zinc-700 rounded-t-2xl group-hover:bg-zinc-400 transition-all"
                                                style={{ height: `${heightPrev}%` }}>
                                            </div>
                                        </div>
                                        <p className="text-xs font-medium text-zinc-500 mt-2">{item.month}</p>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex justify-center gap-6 mt-6">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-indigo-600 rounded"></div>
                                <span>Tahun {filters.year}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-zinc-300 dark:bg-zinc-700 rounded"></div>
                                <span>Tahun {filters.compare_year}</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabel Full Width */}
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-full">
                                <thead className="bg-zinc-50 dark:bg-zinc-800">
                                    <tr>
                                        <th className="text-left px-8 py-6 font-semibold">Tanggal</th>
                                        <th className="text-left px-8 py-6 font-semibold">No. Order</th>
                                        <th className="text-left px-8 py-6 font-semibold">Klien</th>
                                        <th className="text-left px-8 py-6 font-semibold">Layanan</th>
                                        <th className="text-right px-8 py-6 font-semibold">Jasa</th>
                                        <th className="text-right px-8 py-6 font-semibold">Titipan</th>
                                        <th className="text-center px-8 py-6 font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {orders.map((order: any) => (
                                        <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">
                                            <td className="px-8 py-5 whitespace-nowrap">{new Date(order.updated_at).toLocaleDateString('id-ID')}</td>
                                            <td className="px-8 py-5 font-mono whitespace-nowrap">{order.order_number}</td>
                                            <td className="px-8 py-5">{order.client?.name}</td>
                                            <td className="px-8 py-5 text-zinc-600 dark:text-zinc-400">{order.service?.name}</td>
                                            <td className="px-8 py-5 text-right font-semibold text-emerald-600 whitespace-nowrap">{rupiah(order.service_price)}</td>
                                            <td className="px-8 py-5 text-right text-zinc-500 whitespace-nowrap">{rupiah(order.tax_deposit)}</td>
                                            <td className="px-8 py-5 text-center">
                                                <span className="px-6 py-2 text-xs font-bold rounded-2xl bg-emerald-100 text-emerald-700">
                                                    {order.status.toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
