import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { route } from 'ziggy-js';

// Tipe Data
interface Order {
    id: number;
    order_number: string;
    description: string;
    status: string;
    total_amount: number;
    payment_status: string;
    created_at: string;
    client: {
        name: string;
        phone: string;
        nik_or_npwp: string;
    };
    service: {
        name: string;
        code: string;
    };
}

interface Props extends PageProps {
    orders: {
        data: Order[];
        links: any[];
    };
}

export default function OrderIndex({ orders }: Props) {
    const [search, setSearch] = useState('');

    // Filter Search Client Side
    const filteredOrders = orders.data.filter((order) =>
        order.order_number.toLowerCase().includes(search.toLowerCase()) ||
        order.client.name.toLowerCase().includes(search.toLowerCase()) ||
        (order.description && order.description.toLowerCase().includes(search.toLowerCase()))
    );

    // Helper Rupiah (Format Indonesia)
    const rupiah = (num: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    };

    // Badge Status Pengerjaan (Pill Shape)
    const getStatusBadge = (status: string) => {
        const styles: any = {
            new:     'bg-blue-50 text-blue-700 ring-blue-600/20',
            draft:   'bg-slate-100 text-slate-700 ring-slate-600/20',
            process: 'bg-amber-50 text-amber-700 ring-amber-600/20',
            minuta:  'bg-purple-50 text-purple-700 ring-purple-600/20',
            done:    'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
            cancel:  'bg-red-50 text-red-700 ring-red-600/10',
        };

        const labels: any = {
            new: 'Baru Masuk',
            draft: 'Drafting',
            process: 'Dalam Proses',
            minuta: 'Minuta / TTD',
            done: 'Selesai',
            cancel: 'Dibatalkan'
        };

        return (
            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${styles[status] || 'bg-gray-50 text-gray-600 ring-gray-500/10'}`}>
                {labels[status] || status}
            </span>
        );
    };

    // Badge Status Pembayaran
    const getPaymentBadge = (status: string) => {
        if (status === 'paid') {
            return <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">LUNAS</span>;
        }
        if (status === 'partial') {
            return <span className="inline-flex items-center rounded-full bg-orange-50 px-2 py-1 text-[10px] font-bold text-orange-700 ring-1 ring-inset ring-orange-600/20">CICILAN</span>;
        }
        return <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold text-red-700 ring-1 ring-inset ring-red-600/10">BELUM LUNAS</span>;
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Order', href: '/orders' }]}>
            <Head title="Daftar Pekerjaan" />

            <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8 font-sans">

                {/* HEADER AREA */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Daftar Pekerjaan</h1>
                        <p className="text-slate-500 text-sm">Pantau progres berkas dan status pembayaran klien.</p>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        {/* Search Input */}
                        <div className="relative group flex-1 md:flex-none">
                            <input
                                type="text"
                                placeholder="Cari No. Order / Klien..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 pr-4 py-2.5 w-full md:w-72 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all shadow-sm"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                            </div>
                        </div>

                        {/* Button Buat Order */}
                        <Link
                            href={route('orders.create')}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-900/10 hover:-translate-y-0.5 transition-all whitespace-nowrap"
                        >
                            <svg className="w-5 h-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
                            Buat Baru
                        </Link>
                    </div>
                </div>

                {/* TABEL LIST */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Pekerjaan</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Klien</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Total Tagihan</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                                            <div className="flex flex-col items-center justify-center">
                                                <span className="text-4xl mb-2">📂</span>
                                                <p>Belum ada data pekerjaan.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-slate-50 transition-colors group">

                                            {/* Kolom 1: Pekerjaan */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                                            {order.order_number}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400">
                                                            {new Date(order.created_at).toLocaleDateString('id-ID')}
                                                        </span>
                                                    </div>
                                                    <span className="font-bold text-slate-800 text-sm">
                                                        {order.service.name}
                                                    </span>
                                                    {order.description && (
                                                        <span className="text-xs text-slate-500 italic line-clamp-1 max-w-[250px]">
                                                            "{order.description}"
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Kolom 2: Klien */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs border border-slate-300">
                                                        {order.client.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-slate-700">{order.client.name}</div>
                                                        <div className="text-xs text-slate-400 font-mono">{order.client.phone}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Kolom 3: Tagihan */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col items-start gap-1.5">
                                                    <span className="text-sm font-bold text-slate-800 font-mono tracking-tight">
                                                        {rupiah(order.total_amount)}
                                                    </span>
                                                    {getPaymentBadge(order.payment_status)}
                                                </div>
                                            </td>

                                            {/* Kolom 4: Status */}
                                            <td className="px-6 py-4">
                                                {getStatusBadge(order.status)}
                                            </td>

                                            {/* Kolom 5: Aksi */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-100 group-hover:opacity-100 transition-opacity">
                                                    <a
                                                        href={route('orders.invoice', order.id)}
                                                        target="_blank"
                                                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                                                        title="Cetak Invoice"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                                    </a>

                                                    <Link
                                                        href={route('orders.edit', order.id)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-all shadow-sm hover:shadow-md"
                                                    >
                                                        Detail
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                                    </Link>
                                                </div>
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
