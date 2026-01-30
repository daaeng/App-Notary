import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { route } from 'ziggy-js';

// Tipe Data (Update: ijinkan null agar Typescript tidak protes)
interface Order {
    id: number;
    order_number: string;
    description: string;
    status: string;
    total_amount: number;
    payment_status: string;
    created_at: string;
    // Client & Service bisa null jika data master dihapus
    client: {
        name: string;
        phone: string;
    } | null;
    service: {
        name: string;
        code: string;
    } | null;
}

interface Props extends PageProps {
    orders: {
        data: Order[];
        links: any[];
    };
}

export default function OrderIndex({ orders }: Props) {
    const [search, setSearch] = useState('');

    // --- PERBAIKAN 1: SAFE SEARCH FILTER ---
    // Tambahkan '?' (Optional Chaining) agar tidak crash saat client/service null
    const filteredOrders = orders.data.filter((order) => {
        const searchLower = search.toLowerCase();

        return (
            order.order_number.toLowerCase().includes(searchLower) ||
            // Cek apakah client ada sebelum cek namanya
            (order.client?.name && order.client.name.toLowerCase().includes(searchLower)) ||
            (order.description && order.description.toLowerCase().includes(searchLower))
        );
    });

    // Helper: Warna Badge Status Pengerjaan
    const getStatusBadge = (status: string) => {
        const colors: any = {
            new: 'bg-blue-100 text-blue-700 border-blue-200',
            draft: 'bg-gray-100 text-gray-700 border-gray-200',
            process: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            done: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            cancel: 'bg-red-100 text-red-700 border-red-200',
        };
        return colors[status] || 'bg-slate-100 text-slate-700';
    };

    // Helper: Warna Badge Pembayaran
    const getPaymentBadge = (status: string) => {
        if (status === 'paid') return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        if (status === 'partial') return 'text-orange-600 bg-orange-50 border-orange-100';
        return 'text-red-600 bg-red-50 border-red-100';
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Order', href: '/orders' }]}>
            <Head title="Daftar Pekerjaan" />

            <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8 font-sans">
                {/* HEADER & ACTIONS */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Daftar Pekerjaan</h1>
                        <p className="text-slate-500 text-sm mt-1">Pantau progres akta dan status pembayaran.</p>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        {/* Search Bar */}
                        <div className="relative group flex-1 md:flex-none">
                            <input
                                type="text"
                                placeholder="Cari No. Order / Klien..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-4 pr-10 py-2.5 w-full md:w-64 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all shadow-sm"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                            </div>
                        </div>

                        {/* Tombol Buat Baru */}
                        <Link
                            href={route('orders.create')}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-900/20 hover:-translate-y-0.5 transition-all"
                        >
                            <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
                            Buat Order
                        </Link>
                    </div>
                </div>

                {/* TABEL ORDER */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead>
                                <tr className="bg-slate-50/80">
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">No. Order / Layanan</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Klien</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Tagihan</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                            Belum ada data pekerjaan.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">

                                            {/* Kolom 1: No Order & Judul */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-mono text-xs font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded w-fit mb-1">
                                                        {order.order_number}
                                                    </span>

                                                    {/* --- PERBAIKAN 2: SAFE SERVICE RENDER --- */}
                                                    <span className="font-bold text-slate-800 text-sm line-clamp-1" title={order.description}>
                                                        {order.service?.name || <span className="text-red-400 italic">Layanan Dihapus</span>}
                                                    </span>

                                                    <span className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                                                        {order.description || '- Tidak ada keterangan -'}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Kolom 2: Klien */}
                                            <td className="px-6 py-4">
                                                {/* --- PERBAIKAN 3: SAFE CLIENT RENDER --- */}
                                                <div className="text-sm font-medium text-slate-900">
                                                    {order.client?.name || <span className="text-red-400 italic">Data Klien Hilang</span>}
                                                </div>
                                                <div className="text-xs text-slate-400">
                                                    {order.client?.phone || '-'}
                                                </div>
                                            </td>

                                            {/* Kolom 3: Keuangan */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col items-start gap-1">
                                                    <span className="text-sm font-bold text-slate-700">
                                                        Rp {order.total_amount.toLocaleString('id-ID')}
                                                    </span>
                                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getPaymentBadge(order.payment_status)}`}>
                                                        {order.payment_status === 'unpaid' ? 'Belum Lunas' : order.payment_status}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Kolom 4: Status Progress */}
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(order.status)}`}>
                                                    {order.status.toUpperCase()}
                                                </span>
                                            </td>

                                            {/* Kolom 5: Aksi */}
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <a
                                                    href={route('orders.invoice', order.id)}
                                                    target="_blank"
                                                    className="text-sm font-medium text-slate-500 hover:text-slate-800"
                                                    title="Cetak Invoice"
                                                >
                                                    🖨️ Cetak
                                                </a>

                                                <Link
                                                    href={route('orders.edit', order.id)}
                                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                                                >
                                                    Detail &rarr;
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
