import { FormEventHandler, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';

interface Expense {
    id: number;
    title: string;
    amount: number;
    transaction_date: string;
    category: string;
}

interface Props extends PageProps {
    expenses: { data: Expense[]; links: any[] };
}

export default function ExpenseIndex({ expenses }: Props) {
    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0], // Default Hari Ini
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

    // Kategori Pilihan
    const categories = ['Operasional', 'Gaji Staff', 'ATK & Kertas', 'Konsumsi', 'Transport', 'Biaya Taktis', 'Lainnya'];

    return (
        <AppLayout breadcrumbs={[{ title: 'Keuangan', href: '/expenses' }]}>
            <Head title="Pengeluaran Kantor" />

            <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8 font-sans">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-bold text-slate-800 mb-6">Pengeluaran Operasional (Expenses)</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* FORM INPUT (KIRI) */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
                            <h3 className="font-bold text-lg mb-4 text-slate-700">Catat Pengeluaran Baru</h3>
                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Nama Pengeluaran</label>
                                    <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} placeholder="Contoh: Beli Kertas F4" className="w-full rounded-lg border-slate-300 text-sm" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Jumlah (Rp)</label>
                                        <input type="number" value={data.amount} onChange={e => setData('amount', e.target.value)} className="w-full rounded-lg border-slate-300 text-sm font-mono" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">Tanggal</label>
                                        <input type="date" value={data.transaction_date} onChange={e => setData('transaction_date', e.target.value)} className="w-full rounded-lg border-slate-300 text-sm" required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Kategori</label>
                                    <select value={data.category} onChange={e => setData('category', e.target.value)} className="w-full rounded-lg border-slate-300 text-sm">
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Keterangan (Opsional)</label>
                                    <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows={2} className="w-full rounded-lg border-slate-300 text-sm"></textarea>
                                </div>
                                <button type="submit" disabled={processing} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition">
                                    Simpan Pengeluaran
                                </button>
                            </form>
                        </div>

                        {/* TABEL DATA (KANAN) */}
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <h3 className="font-bold text-slate-700">Riwayat Pengeluaran</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                                        <tr>
                                            <th className="px-6 py-3">Tanggal</th>
                                            <th className="px-6 py-3">Keterangan</th>
                                            <th className="px-6 py-3">Kategori</th>
                                            <th className="px-6 py-3 text-right">Jumlah</th>
                                            <th className="px-6 py-3 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {expenses.data.length === 0 ? (
                                            <tr><td colSpan={5} className="p-6 text-center text-slate-400 italic">Belum ada data pengeluaran.</td></tr>
                                        ) : (
                                            expenses.data.map((item) => (
                                                <tr key={item.id} className="hover:bg-slate-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(item.transaction_date).toLocaleDateString('id-ID')}</td>
                                                    <td className="px-6 py-4 font-bold text-slate-700">{item.title}</td>
                                                    <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600">{item.category}</span></td>
                                                    <td className="px-6 py-4 text-right font-mono text-red-600 font-bold">-{rupiah(item.amount)}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button onClick={() => deleteExpense(item.id)} className="text-slate-400 hover:text-red-600" title="Hapus">🗑️</button>
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
        </AppLayout>
    );
}
