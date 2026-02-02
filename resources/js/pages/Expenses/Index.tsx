import { FormEventHandler, useMemo } from 'react';
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

export default function ExpenseWallet({ expenses }: Props) {
    const { data, setData, post, processing, reset } = useForm({
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
        if (confirm('Batalkan transaksi ini?')) {
            router.delete(route('expenses.destroy', id));
        }
    };

    const rupiah = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

    // Hitung Total & Kategori (Client Side Simulation)
    const totalAmount = useMemo(() => expenses.data.reduce((acc, curr) => acc + Number(curr.amount), 0), [expenses.data]);

    // Hitung total per kategori untuk progress bar
    const categoryStats = useMemo(() => {
        const stats: any = {};
        expenses.data.forEach(item => {
            stats[item.category] = (stats[item.category] || 0) + Number(item.amount);
        });
        return stats;
    }, [expenses.data]);

    const categories = ['Operasional', 'Gaji Staff', 'ATK & Kertas', 'Konsumsi', 'Transport', 'Biaya Taktis', 'Lainnya'];

    return (
        <AppLayout breadcrumbs={[{ title: 'Keuangan', href: '/expenses' }]}>
            <Head title="Dompet Kantor" />

            <div className="min-h-screen bg-slate-50 dark:bg-black font-sans transition-colors duration-300 p-4 lg:p-8">
                <div className="w-full mx-auto">

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                        {/* === KOLOM KIRI (4 Cols): KARTU & ANALISIS === */}
                        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">

                            {/* 1. VISUAL CREDIT CARD */}
                            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 to-black p-8 text-white shadow-2xl shadow-slate-900/40 border border-slate-700/50 group hover:scale-[1.02] transition-transform duration-500">
                                {/* Efek Glossy */}
                                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
                                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-indigo-500 opacity-10 rounded-full blur-3xl"></div>

                                <div className="relative z-10 flex flex-col justify-between h-48">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Total Pengeluaran</p>
                                            <p className="text-xs text-slate-500 mt-1">Halaman Ini</p>
                                        </div>
                                        <div className="text-2xl opacity-80">💳</div>
                                    </div>

                                    <div>
                                        <h2 className="text-3xl md:text-4xl font-mono font-black tracking-tight text-white mb-1">
                                            {rupiah(totalAmount)}
                                        </h2>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px] font-bold uppercase border border-red-500/30">
                                                Cash Out
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase">Pemegang Kartu</p>
                                            <p className="text-sm font-bold tracking-widest uppercase">KANTOR NOTARIS</p>
                                        </div>
                                        <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center">
                                            <div className="w-6 h-4 border border-white/30 rounded-sm flex items-center justify-center">
                                                <div className="w-full h-[1px] bg-white/30"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 2. CATEGORY BREAKDOWN */}
                            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm">
                                <h3 className="font-bold text-slate-800 dark:text-white mb-4 text-sm uppercase tracking-wide">
                                    Pos Pengeluaran
                                </h3>
                                <div className="space-y-4">
                                    {Object.entries(categoryStats).map(([cat, amount]: [string, any], idx) => {
                                        const percent = Math.min((amount / totalAmount) * 100, 100) || 0;
                                        const colors = ['bg-indigo-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-cyan-500'];
                                        const color = colors[idx % colors.length];

                                        return (
                                            <div key={cat}>
                                                <div className="flex justify-between text-xs mb-1 font-bold text-slate-600 dark:text-zinc-400">
                                                    <span>{cat}</span>
                                                    <span>{Math.round(percent)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                                                    <div className={`h-full ${color}`} style={{ width: `${percent}%` }}></div>
                                                </div>
                                                <div className="text-right mt-0.5">
                                                    <span className="text-[10px] font-mono text-slate-400">{rupiah(amount)}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {Object.keys(categoryStats).length === 0 && (
                                        <p className="text-center text-xs text-slate-400 italic py-2">Belum ada data statistik.</p>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* === KOLOM KANAN (8 Cols): FORM & LIST === */}
                        <div className="lg:col-span-8 space-y-8">

                            {/* FORM INPUT (Clean Horizontal) */}
                            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-zinc-800 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                    <span className="w-2 h-6 bg-rose-500 rounded-full"></span>
                                    Input Transaksi Baru
                                </h3>

                                <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Nama Transaksi</label>
                                        <input
                                            type="text"
                                            value={data.title}
                                            onChange={e => setData('title', e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-black border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 focus:ring-rose-500 focus:border-rose-500 text-slate-800 dark:text-white font-bold"
                                            placeholder="Contoh: Pembayaran Listrik"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Nominal (Rp)</label>
                                        <input
                                            type="number"
                                            value={data.amount}
                                            onChange={e => setData('amount', e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-black border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 focus:ring-rose-500 focus:border-rose-500 text-rose-600 dark:text-rose-500 font-mono font-black"
                                            placeholder="0"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Tanggal</label>
                                        <input
                                            type="date"
                                            value={data.transaction_date}
                                            onChange={e => setData('transaction_date', e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-black border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 focus:ring-rose-500 focus:border-rose-500 text-slate-800 dark:text-white"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Kategori</label>
                                        <select
                                            value={data.category}
                                            onChange={e => setData('category', e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-black border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 focus:ring-rose-500 focus:border-rose-500 text-slate-800 dark:text-white"
                                        >
                                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Catatan (Opsional)</label>
                                        <input
                                            type="text"
                                            value={data.description}
                                            onChange={e => setData('description', e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-black border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 focus:ring-rose-500 focus:border-rose-500 text-slate-800 dark:text-white"
                                            placeholder="..."
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:opacity-90 transition shadow-lg flex justify-center items-center gap-2"
                                        >
                                            {processing ? '...' : '💸 Simpan Transaksi'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* TRANSACTION LIST (Feed Style) */}
                            <div>
                                <h3 className="font-bold text-slate-500 dark:text-zinc-500 text-xs uppercase tracking-widest mb-4 ml-2">Mutasi Terakhir</h3>
                                <div className="space-y-4">
                                    {expenses.data.length === 0 ? (
                                        <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-gray-300 dark:border-zinc-800">
                                            <p className="text-3xl opacity-30 mb-2">🏷️</p>
                                            <p className="text-sm text-slate-400">Belum ada transaksi.</p>
                                        </div>
                                    ) : (
                                        expenses.data.map((item) => (
                                            <div key={item.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 hover:border-rose-500/30 hover:shadow-lg transition-all">

                                                <div className="flex items-start gap-4">
                                                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 font-bold shrink-0">
                                                        <span className="text-[9px] uppercase leading-none opacity-70">{new Date(item.transaction_date).toLocaleString('id-ID', { month: 'short' })}</span>
                                                        <span className="text-lg leading-none">{new Date(item.transaction_date).getDate()}</span>
                                                    </div>

                                                    <div>
                                                        <h4 className="font-bold text-slate-800 dark:text-white text-base group-hover:text-rose-600 transition-colors">
                                                            {item.title}
                                                        </h4>
                                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                                            <span className="text-[10px] font-bold uppercase bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-slate-500 dark:text-zinc-400">
                                                                {item.category}
                                                            </span>
                                                            {item.description && (
                                                                <span className="text-xs text-slate-400 dark:text-zinc-500 italic truncate max-w-[200px]">
                                                                    — {item.description}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto mt-3 sm:mt-0 gap-6 border-t sm:border-t-0 border-gray-100 dark:border-zinc-800 pt-3 sm:pt-0">
                                                    <p className="font-mono font-black text-rose-600 dark:text-rose-500 text-lg">
                                                        -{rupiah(item.amount)}
                                                    </p>
                                                    <button
                                                        onClick={() => deleteExpense(item.id)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                                        title="Hapus"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>

                                            </div>
                                        ))
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
