import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { route } from 'ziggy-js';

// --- TIPE DATA ---
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

export default function OrderIndexExecutive({ orders }: Props) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('active'); // 'active', 'done', 'all'

    // --- LOGIC FILTER ---
    const filteredOrders = orders.data.filter((order) => {
        // Filter Search
        const matchesSearch =
            order.order_number.toLowerCase().includes(search.toLowerCase()) ||
            order.client.name.toLowerCase().includes(search.toLowerCase()) ||
            (order.description && order.description.toLowerCase().includes(search.toLowerCase()));

        if (!matchesSearch) return false;

        // Filter Tab Status
        if (statusFilter === 'active') return !['done', 'cancel'].includes(order.status);
        if (statusFilter === 'done') return ['done', 'cancel'].includes(order.status);

        return true; // 'all'
    });

    // Hitung Statistik Sederhana (Client Side - dari data yang di-load)
    const stats = {
        total: orders.data.length,
        active: orders.data.filter(o => !['done', 'cancel'].includes(o.status)).length,
        done: orders.data.filter(o => o.status === 'done').length,
    };

    const rupiah = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

    // Helper Status Badge (Senada dengan Edit Page)
    const getStatusBadge = (status: string) => {
        const map: any = {
            new: { label: 'Baru Masuk', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', dot: 'bg-blue-500' },
            draft: { label: 'Drafting', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800', dot: 'bg-slate-500' },
            process: { label: 'Proses', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', dot: 'bg-amber-500' },
            minuta: { label: 'Siap TTD', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20', dot: 'bg-purple-500' },
            done: { label: 'Selesai', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', dot: 'bg-emerald-500' },
            cancel: { label: 'Batal', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', dot: 'bg-red-500' },
        };
        const s = map[status] || map.new;
        return (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold w-fit ${s.bg} ${s.color}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></div>
                {s.label}
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Order', href: '/orders' }]}>
            <Head title="Daftar Pekerjaan" />

            <div className="min-h-screen bg-gray-50 dark:bg-black font-sans transition-colors duration-300 p-4 lg:p-8">
                <div className="w-full mx-auto space-y-8">

                    {/* HEADER & STATS CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                        {/* Title Section */}
                        <div className="lg:col-span-1 flex flex-col justify-center">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Pekerjaan</h1>
                            <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">Daftar semua berkas masuk.</p>
                            <Link
                                href={route('orders.create')}
                                className="mt-4 w-fit px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/20 transition flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                Buat Order Baru
                            </Link>
                        </div>

                        {/* Stat 1: Sedang Jalan */}
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm flex items-center justify-between group hover:border-indigo-500/30 transition">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Sedang Jalan</p>
                                <p className="text-3xl font-black text-slate-800 dark:text-white">{stats.active}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                        </div>

                        {/* Stat 2: Selesai */}
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm flex items-center justify-between group hover:border-emerald-500/30 transition">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Selesai</p>
                                <p className="text-3xl font-black text-slate-800 dark:text-white">{stats.done}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                        </div>

                        {/* Stat 3: Total */}
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Berkas</p>
                                <p className="text-3xl font-black text-slate-800 dark:text-white">{stats.total}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-500">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            </div>
                        </div>
                    </div>

                    {/* MAIN CONTENT AREA */}
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden min-h-[500px]">

                        {/* TOOLBAR */}
                        <div className="p-5 border-b border-gray-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50 dark:bg-black/20">

                            {/* Filter Tabs */}
                            <div className="flex p-1 bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-zinc-800">
                                {['active', 'done', 'all'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setStatusFilter(tab)}
                                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all capitalize ${
                                            statusFilter === tab
                                            ? 'bg-slate-900 dark:bg-zinc-800 text-white shadow-md'
                                            : 'text-slate-500 hover:text-slate-900 dark:text-zinc-500 dark:hover:text-zinc-300'
                                        }`}
                                    >
                                        {tab === 'active' ? 'Sedang Jalan' : tab === 'done' ? 'Selesai / Batal' : 'Semua'}
                                    </button>
                                ))}
                            </div>

                            {/* Search */}
                            <div className="relative w-full md:w-auto group">
                                <input
                                    type="text"
                                    placeholder="Cari No. Order / Klien..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full md:w-80 pl-10 pr-4 py-2.5 bg-white dark:bg-black border border-gray-200 dark:border-zinc-800 rounded-xl text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                                <svg className="w-5 h-5 text-slate-400 absolute left-3 top-2.5 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                        </div>

                        {/* ORDER LIST (Card Row Style) */}
                        <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                            {filteredOrders.length === 0 ? (
                                <div className="py-20 text-center text-slate-400 dark:text-zinc-600">
                                    <p className="text-4xl mb-3 opacity-50">📭</p>
                                    <p className="font-bold">Tidak ada data ditemukan.</p>
                                </div>
                            ) : (
                                filteredOrders.map((order) => (
                                    <Link
                                        href={route('orders.edit', order.id)}
                                        key={order.id}
                                        className="group block p-5 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
                                    >
                                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

                                            {/* Left: Info Utama */}
                                            <div className="flex items-center gap-4 w-full md:w-1/3">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-lg font-bold text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                                                    {order.client.name.substring(0, 1)}
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="text-base font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                        {order.client.name}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 dark:text-zinc-500 font-mono">
                                                        #{order.order_number}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Middle: Layanan */}
                                            <div className="w-full md:w-1/3">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-slate-500 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700">
                                                        {order.service.code}
                                                    </span>
                                                    <span className="text-xs text-slate-400 dark:text-zinc-600">
                                                        {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-medium text-slate-700 dark:text-zinc-300 truncate">
                                                    {order.service.name}
                                                </p>
                                            </div>

                                            {/* Right: Status & Aksi */}
                                            <div className="w-full md:w-1/3 flex items-center justify-between md:justify-end gap-6">
                                                {getStatusBadge(order.status)}

                                                <div className="text-right hidden sm:block">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">{rupiah(order.total_amount)}</p>
                                                    <p className={`text-[10px] font-bold uppercase ${order.payment_status === 'paid' ? 'text-emerald-500' : 'text-orange-500'}`}>
                                                        {order.payment_status === 'paid' ? 'LUNAS' : 'BELUM'}
                                                    </p>
                                                </div>

                                                <div className="text-slate-300 dark:text-zinc-600 group-hover:text-indigo-500 transition-transform group-hover:translate-x-1">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                                </div>
                                            </div>

                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>

                        {/* PAGINATION SIMPLE */}
                        <div className="p-4 border-t border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-black/20 flex justify-center">
                             <div className="flex gap-2">
                                {orders.links.map((link: any, index: number) => (
                                    link.url ? (
                                        <Link
                                            key={index}
                                            href={link.url}
                                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${link.active ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-sm'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : null
                                ))}
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
