import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';

// --- DEFINISI TIPE DATA ---
interface Activity {
    id: number;
    description: string;
    event: string;
    created_at: string;
    subject_type: string;
    subject?: {
        order_number?: string;
        description?: string;
        name?: string;
        title?: string;
    };
    causer: {
        id: number;
        name: string;
        email?: string;
    } | null;
    properties?: {
        attributes?: Record<string, any>;
        old?: Record<string, any>;
    };
}

interface Props extends PageProps {
    activities: {
        data: Activity[];
        links: any[];
    };
}

export default function ActivityLogStream({ activities }: Props) {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    // --- HELPERS ---
    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDateHeader = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Hari Ini';
        if (date.toDateString() === yesterday.toDateString()) return 'Kemarin';

        return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    const formatField = (field: string) => {
        const dict: Record<string, string> = {
            service_price: 'Jasa Notaris', tax_deposit: 'Titipan Pajak', status: 'Status',
            payment_status: 'Pembayaran', description: 'Keterangan', client_id: 'Klien',
            amount: 'Nominal', title: 'Judul', name: 'Nama', phone: 'HP', address: 'Alamat',
            transaction_value: 'Nilai Transaksi', njop: 'NJOP'
        };
        return dict[field] || field.replace(/_/g, ' ');
    };

    const formatValue = (key: string, value: any) => {
        // PERBAIKAN: Warna teks kosong dibuat lebih terang di dark mode (zinc-500)
        if (value === null || value === undefined) return <span className="text-gray-400 dark:text-zinc-500 italic">-</span>;

        if (['service_price', 'tax_deposit', 'amount', 'transaction_value', 'njop', 'total_amount'].includes(key)) {
            return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(value));
        }
        return String(value);
    };

    // Grouping Log berdasarkan Tanggal
    const groupedActivities = activities.data.reduce((groups: any, activity) => {
        const dateKey = new Date(activity.created_at).toDateString();
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(activity);
        return groups;
    }, {});

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Log Aktivitas', href: '#' }]}>
            <Head title="Jejak Audit" />

            {/* BACKGROUND: Hitam Pekat di Dark Mode */}
            <div className="min-h-screen bg-gray-50 dark:bg-black font-sans transition-colors duration-300">

                {/* FULL WIDTH CONTAINER */}
                <div className="w-full mx-auto py-8 px-4 lg:px-8">

                    {/* Header Page */}
                    <div className="mb-10 flex items-end justify-between border-b border-gray-200 dark:border-zinc-800 pb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Jejak Aktivitas</h1>
                            {/* PERBAIKAN: Warna deskripsi lebih terang (zinc-400) */}
                            <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
                                Monitoring perubahan data sistem secara real-time (Audit Trail).
                            </p>
                        </div>
                    </div>

                    {/* STREAM CONTENT */}
                    <div className="space-y-12">
                        {Object.keys(groupedActivities).length === 0 ? (
                            <div className="py-20 text-center text-slate-400 dark:text-zinc-500 italic">Belum ada data aktivitas.</div>
                        ) : (
                            Object.keys(groupedActivities).map((dateKey) => (
                                <div key={dateKey} className="relative">

                                    {/* STICKY HEADER (Tanggal) */}
                                    <div className="sticky top-20 z-20 bg-gray-50/95 dark:bg-black/95 backdrop-blur-sm py-3 border-b border-gray-200 dark:border-zinc-900 mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-2 w-2 rounded-full bg-slate-400 dark:bg-zinc-500"></div>
                                            {/* PERBAIKAN: Teks tanggal lebih terang */}
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-300">
                                                {formatDateHeader(dateKey)}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="relative pl-2">
                                        {/* GARIS VERTIKAL KIRI */}
                                        <div className="absolute left-[3px] sm:left-[3px] top-0 bottom-0 w-px bg-gray-300 dark:bg-zinc-800"></div>

                                        <div className="space-y-4">
                                            {groupedActivities[dateKey].map((log: Activity) => {
                                                const isExpanded = expandedId === log.id;

                                                // Warna Dot
                                                let dotClass = 'bg-slate-400 border-slate-200';
                                                if (log.event === 'created') dotClass = 'bg-emerald-500 border-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
                                                if (log.event === 'updated') dotClass = 'bg-blue-500 border-blue-200 shadow-[0_0_10px_rgba(59,130,246,0.5)]';
                                                if (log.event === 'deleted') dotClass = 'bg-red-500 border-red-200 shadow-[0_0_10px_rgba(239,68,68,0.5)]';

                                                return (
                                                    <div key={log.id} className="relative flex gap-6 group">

                                                        {/* DOT CONNECTOR */}
                                                        <div className={`absolute left-[-4px] top-5 w-3.5 h-3.5 rounded-full border-2 dark:border-black z-10 transition-all duration-300 ${dotClass} ${isExpanded ? 'scale-125' : 'group-hover:scale-110'}`}></div>

                                                        {/* CARD UTAMA */}
                                                        {/* PERBAIKAN: Dark Mode pakai bg-zinc-900 (sedikit lebih terang dari hitam background) */}
                                                        <div
                                                            onClick={() => toggleExpand(log.id)}
                                                            className={`ml-6 flex-grow cursor-pointer rounded-xl border transition-all duration-300 overflow-hidden
                                                                ${isExpanded
                                                                    ? 'bg-white dark:bg-zinc-900 border-indigo-500 dark:border-indigo-500/50 shadow-lg ring-1 ring-indigo-500/20'
                                                                    : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-zinc-600 hover:shadow-md'
                                                                }`}
                                                        >
                                                            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">

                                                                {/* BAGIAN KIRI: Info Utama */}
                                                                <div className="flex-grow">
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        {/* Waktu (Kontras diperbaiki) */}
                                                                        <span className="text-xs font-mono font-bold text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-black px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700">
                                                                            {formatTime(log.created_at)}
                                                                        </span>

                                                                        {/* Nama User (Putih Terang) */}
                                                                        <span className="text-sm font-bold text-slate-800 dark:text-white">
                                                                            {log.causer?.name || 'Sistem Otomatis'}
                                                                        </span>

                                                                        {/* Badge Event */}
                                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border
                                                                            ${log.event === 'created' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900' :
                                                                            log.event === 'updated' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900' :
                                                                            'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900'}`}>
                                                                            {log.event}
                                                                        </span>
                                                                    </div>

                                                                    {/* Deskripsi & Target (Warna zinc-300 agar jelas) */}
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <p className="text-sm text-slate-600 dark:text-zinc-300 font-medium">
                                                                            {log.description}
                                                                        </p>
                                                                        <svg className="hidden sm:block w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                                                        <span className="text-sm font-bold text-slate-800 dark:text-zinc-200 bg-slate-50 dark:bg-zinc-800 px-2 py-0.5 rounded border border-transparent dark:border-zinc-700">
                                                                            {log.subject?.order_number || log.subject?.name || `ID #${log.id}`}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                {/* BAGIAN KANAN: Tombol Expand */}
                                                                <div className="flex-shrink-0 self-center">
                                                                    <div className={`p-2 rounded-full transition-colors ${isExpanded ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-slate-300 dark:text-zinc-500 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-600 dark:hover:text-zinc-300'}`}>
                                                                        <svg className={`w-5 h-5 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* AREA DETAIL (Expandable) */}
                                                            {isExpanded && (
                                                                <div className="px-5 pb-5 pt-0 animate-fade-in-down">
                                                                    <div className="border-t border-gray-100 dark:border-zinc-800 pt-4">
                                                                        <h4 className="text-xs font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-widest mb-3">
                                                                            Rincian Perubahan
                                                                        </h4>

                                                                        {log.properties?.old || log.properties?.attributes ? (
                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                                {Object.keys(log.properties.attributes || {}).map((key) => {
                                                                                    if (['updated_at', 'created_at', 'id'].includes(key)) return null;
                                                                                    const oldVal = log.properties?.old?.[key];
                                                                                    const newVal = log.properties?.attributes?.[key];
                                                                                    if (log.event === 'updated' && oldVal == newVal) return null;

                                                                                    return (
                                                                                        <div key={key} className="flex flex-col bg-gray-50 dark:bg-black rounded-lg border border-gray-100 dark:border-zinc-800 p-3 hover:border-indigo-200 dark:hover:border-zinc-700 transition">
                                                                                            <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500 mb-2">
                                                                                                {formatField(key)}
                                                                                            </span>

                                                                                            <div className="flex items-center justify-between text-sm">
                                                                                                {/* Old Value */}
                                                                                                <div className="text-red-500 dark:text-red-400 line-through decoration-red-500/30 opacity-70 truncate max-w-[45%] font-mono">
                                                                                                    {formatValue(key, oldVal)}
                                                                                                </div>

                                                                                                <div className="text-slate-300 dark:text-zinc-600">➜</div>

                                                                                                {/* New Value (Warna diperjelas) */}
                                                                                                <div className="text-emerald-600 dark:text-emerald-400 font-bold truncate max-w-[45%] font-mono">
                                                                                                    {formatValue(key, newVal)}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        ) : (
                                                                            <p className="text-xs text-slate-400 dark:text-zinc-500 italic">Tidak ada detail perubahan atribut.</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    <div className="mt-16 flex justify-center">
                        <div className="inline-flex rounded-lg shadow-sm bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-1">
                            {activities.links.map((link: any, index: number) => (
                                link.url ? (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        className={`px-4 py-2 text-xs font-bold rounded-md transition-colors ${
                                            link.active
                                                ? 'bg-slate-900 text-white dark:bg-white dark:text-black'
                                                : 'text-slate-500 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span key={index} className="px-4 py-2 text-xs text-slate-300 dark:text-zinc-700" dangerouslySetInnerHTML={{ __html: link.label }} />
                                )
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
