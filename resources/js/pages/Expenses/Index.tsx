import { FormEventHandler } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { route } from 'ziggy-js';

interface Expense {
    id: number;
    title: string;
    amount: number;
    transaction_date: string;
    category: string;
    description?: string;
}

interface Props extends PageProps {
    expenses: { data: Expense[]; links: any[] };
}

export default function ExpenseIndex({ expenses }: Props) {
    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0],
        category: 'Operasional',
        description: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('expenses.store'), { onSuccess: () => reset() });
    };

    const deleteExpense = (id: number) => {
        if (confirm('Hapus data pengeluaran ini?')) {
            router.delete(route('expenses.destroy', id));
        }
    };

    const rupiah = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

    // Helper Ikon Kategori
    const getCategoryIcon = (cat: string) => {
        if (cat.includes('Gaji')) return '👥';
        if (cat.includes('ATK')) return '📎';
        if (cat.includes('Konsumsi')) return '☕';
        if (cat.includes('Transport')) return '⛽';
        return '💰';
    };

    const categories = ['Operasional', 'Gaji Staff', 'ATK & Kertas', 'Konsumsi', 'Transport', 'Biaya Taktis', 'Lainnya'];

    // Style Input Dark Mode (Sama seperti Order Edit)
    const inputClasses = "mt-1 block w-full rounded-xl bg-slate-900/50 border border-slate-700 text-slate-100 placeholder-slate-500 shadow-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-base py-3 px-4 transition-all";
    const labelClasses = "block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1";

    return (
        <AppLayout breadcrumbs={[{ title: 'Keuangan', href: '/expenses' }]}>
            <Head title="Pengeluaran Kantor" />

            <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8 font-sans">
                <div className="w-full">

                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Pengeluaran Operasional</h1>
                            <p className="text-slate-500 text-sm">Catat semua biaya keluar untuk operasional kantor.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* === KIRI: FORM INPUT (DARK MODE PREMIUM) === */}
                        <div className="relative overflow-hidden bg-slate-950 p-8 rounded-[2rem] border border-slate-800/50 shadow-2xl h-fit">
                            {/* Dekorasi Background */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

                            <div className="relative z-10">
                                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-800 pb-4">
                                    <span className="w-2 h-6 bg-red-500 rounded-full"></span>
                                    Catat Pengeluaran Baru
                                </h3>

                                <form onSubmit={submit} className="space-y-5">
                                    {/* Nama Pengeluaran */}
                                    <div>
                                        <label className={labelClasses}>Nama Pengeluaran</label>
                                        <input
                                            type="text"
                                            value={data.title}
                                            onChange={e => setData('title', e.target.value)}
                                            placeholder="Contoh: Beli Kertas F4 5 Rim"
                                            className={inputClasses}
                                            required
                                        />
                                    </div>

                                    {/* Nominal & Tanggal */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClasses}>Jumlah (Rp)</label>
                                            <input
                                                type="number"
                                                value={data.amount}
                                                onChange={e => setData('amount', e.target.value)}
                                                className={`${inputClasses} font-mono text-red-300`}
                                                placeholder="0"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Tanggal</label>
                                            <input
                                                type="date"
                                                value={data.transaction_date}
                                                onChange={e => setData('transaction_date', e.target.value)}
                                                className={inputClasses}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Kategori */}
                                    <div>
                                        <label className={labelClasses}>Kategori</label>
                                        <select
                                            value={data.category}
                                            onChange={e => setData('category', e.target.value)}
                                            className={inputClasses}
                                        >
                                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                    </div>

                                    {/* Keterangan */}
                                    <div>
                                        <label className={labelClasses}>Keterangan (Opsional)</label>
                                        <textarea
                                            value={data.description}
                                            onChange={e => setData('description', e.target.value)}
                                            rows={2}
                                            className={inputClasses}
                                            placeholder="Detail tambahan..."
                                        ></textarea>
                                    </div>

                                    {/* Tombol Simpan */}
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-red-900/30 transform hover:-translate-y-1 transition-all duration-300 mt-4"
                                    >
                                        {processing ? 'Menyimpan...' : '💸 Simpan Pengeluaran'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* === KANAN: TABEL RIWAYAT (CLEAN WHITE) === */}
                        <div className="lg:col-span-2 flex flex-col h-full">
                            <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-200 overflow-hidden flex-1">
                                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-800 text-lg">Riwayat Transaksi</h3>
                                    <span className="text-xs font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                                        Terbaru
                                    </span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                                            <tr>
                                                <th className="px-8 py-4">Tanggal</th>
                                                <th className="px-6 py-4">Keterangan</th>
                                                <th className="px-6 py-4 text-center">Kategori</th>
                                                <th className="px-6 py-4 text-right">Nominal</th>
                                                <th className="px-6 py-4 text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {expenses.data.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic bg-slate-50/30">
                                                        <div className="text-4xl mb-2">🍃</div>
                                                        Belum ada data pengeluaran.
                                                    </td>
                                                </tr>
                                            ) : (
                                                expenses.data.map((item) => (
                                                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                                                        <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-500">
                                                            {new Date(item.transaction_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="font-bold text-slate-700 text-sm group-hover:text-red-600 transition-colors">
                                                                {item.title}
                                                            </div>
                                                            {item.description && (
                                                                <div className="text-xs text-slate-400 mt-1 truncate max-w-[200px]">
                                                                    {item.description}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-5 text-center">
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200">
                                                                <span>{getCategoryIcon(item.category)}</span>
                                                                {item.category}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-5 text-right font-mono font-bold text-red-500 text-sm">
                                                            -{rupiah(item.amount)}
                                                        </td>
                                                        <td className="px-6 py-5 text-center">
                                                            <button
                                                                onClick={() => deleteExpense(item.id)}
                                                                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-red-600 hover:bg-red-50 transition-all"
                                                                title="Hapus"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
