import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';

// Definisi Tipe Data Log
interface Activity {
    id: number;
    description: string;
    event: string;
    created_at: string;
    subject_type: string;
    // Subject = Data asli yang diedit (Order/Client/dll)
    subject?: {
        order_number?: string; // Jika Order
        description?: string;  // Jika Order/Expense
        name?: string;         // Jika Client/User
        title?: string;        // Jika Expense
    };
    causer: {
        id: number;
        name: string;
    } | null;
    properties?: {
        attributes?: Record<string, any>; // Nilai Baru
        old?: Record<string, any>;        // Nilai Lama
    };
}

interface Props extends PageProps {
    activities: {
        data: Activity[];
        links: any[];
    };
}

export default function ActivityLogIndex({ activities }: Props) {
    const [openRows, setOpenRows] = useState<number[]>([]);

    const toggleRow = (id: number) => {
        if (openRows.includes(id)) setOpenRows(openRows.filter(rowId => rowId !== id));
        else setOpenRows([...openRows, id]);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // --- KAMUS BAHASA MANUSIA (FIELD) ---
    const formatField = (field: string) => {
        const dictionary: Record<string, string> = {
            // Order
            service_price: 'Jasa Notaris',
            tax_deposit: 'Titipan Pajak',
            status: 'Status Pengerjaan',
            payment_status: 'Status Pembayaran',
            description: 'Judul / Keterangan',
            client_id: 'Klien',
            service_id: 'Layanan',
            akta_date: 'Tanggal Akta',
            // PPAT
            seller_name: 'Nama Penjual',
            buyer_name: 'Nama Pembeli',
            transaction_value: 'Nilai Transaksi',
            njop: 'NJOP',
            // Expense
            amount: 'Nominal Uang',
            title: 'Judul Pengeluaran',
            category: 'Kategori',
            // Client
            name: 'Nama Lengkap',
            phone: 'No. HP',
            address: 'Alamat',
            nik_or_npwp: 'NIK / NPWP',
        };
        return dictionary[field] || field.replace(/_/g, ' ').toUpperCase();
    };

    // --- KAMUS BAHASA MANUSIA (VALUE) ---
    // Fungsi ini yang membuat detailnya jadi "JELAS"
    const formatValue = (key: string, value: any) => {
        if (value === null || value === undefined) return '-';

        // 1. Format Rupiah (untuk kolom harga/duit)
        if (['service_price', 'tax_deposit', 'amount', 'transaction_value', 'njop', 'total_amount'].includes(key)) {
            return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(value));
        }

        // 2. Format Status Pengerjaan
        if (key === 'status') {
            const statusMap: Record<string, string> = {
                new: '🆕 Baru Masuk',
                draft: '📝 Drafting',
                process: '⚙️ Proses BPN/Instansi',
                minuta: '✍️ Tanda Tangan (Minuta)',
                done: '✅ Selesai',
                cancel: '❌ Dibatalkan'
            };
            return statusMap[value] || value;
        }

        // 3. Format Status Pembayaran
        if (key === 'payment_status') {
            const payMap: Record<string, string> = {
                unpaid: '🔴 Belum Bayar',
                partial: '🟠 Cicilan',
                paid: '🟢 Lunas'
            };
            return payMap[value] || value;
        }

        return String(value);
    };

    const getEventBadge = (event: string) => {
        switch (event) {
            case 'created': return <span className="px-2 py-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded border border-emerald-200">TAMBAH DATA</span>;
            case 'updated': return <span className="px-2 py-1 text-[10px] font-bold bg-blue-100 text-blue-700 rounded border border-blue-200">UPDATE / EDIT</span>;
            case 'deleted': return <span className="px-2 py-1 text-[10px] font-bold bg-red-100 text-red-700 rounded border border-red-200">HAPUS DATA</span>;
            default: return <span className="px-2 py-1 text-[10px] font-bold bg-gray-100 text-gray-600 rounded border border-gray-200">{event.toUpperCase()}</span>;
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Log Aktivitas', href: '/activity-logs' }]}>
            <Head title="Log Aktivitas (CCTV)" />

            <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8 font-sans">
                <div className="max-w-7xl mx-auto">

                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-slate-800">Log Aktivitas (Audit Trail)</h1>
                        <p className="text-slate-500 text-sm">Rekam jejak detail perubahan data sistem (Sebelum vs Sesudah).</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="w-10 px-4 py-4"></th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Waktu</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Pelaku</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Aksi</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Target Data (Konteks)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {activities.data.length === 0 ? (
                                        <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Belum ada aktivitas terekam.</td></tr>
                                    ) : (
                                        activities.data.map((log) => (
                                            <>
                                                {/* BARIS UTAMA */}
                                                <tr
                                                    key={log.id}
                                                    onClick={() => toggleRow(log.id)}
                                                    className={`cursor-pointer transition-colors ${openRows.includes(log.id) ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}
                                                >
                                                    <td className="px-4 py-4 text-center text-slate-400 font-bold">{openRows.includes(log.id) ? '▼' : '▶'}</td>
                                                    <td className="px-6 py-4 text-xs font-mono text-slate-600 whitespace-nowrap">{formatDate(log.created_at)}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                                                {log.causer?.name?.substring(0, 1) || 'S'}
                                                            </div>
                                                            <span className="text-sm font-bold text-slate-700">{log.causer?.name || 'Sistem'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">{getEventBadge(log.event)}</td>
                                                    <td className="px-6 py-4 text-sm text-slate-600">
                                                        {/* LOGIC JUDUL YANG LEBIH JELAS */}
                                                        <div className="font-bold text-slate-800">
                                                            {log.subject?.order_number || log.subject?.name || log.subject?.title || log.description}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                            {log.subject_type.split('\\').pop()} - {log.subject?.description || '#'+log.id}
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* BARIS DETAIL (EXPANDABLE) */}
                                                {openRows.includes(log.id) && (
                                                    <tr className="bg-slate-50 shadow-inner">
                                                        <td colSpan={5} className="px-6 py-4">
                                                            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                                                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 border-b border-slate-100 pb-2 flex justify-between">
                                                                    <span>Atribut</span>
                                                                    <span>Perubahan (Sebelum ➔ Sesudah)</span>
                                                                </h4>

                                                                {log.properties?.old || log.properties?.attributes ? (
                                                                    <div className="space-y-3">
                                                                        {Object.keys(log.properties.attributes || {}).map((key) => {
                                                                            if (key === 'updated_at' || key === 'created_at') return null;

                                                                            const oldVal = log.properties?.old?.[key];
                                                                            const newVal = log.properties?.attributes?.[key];

                                                                            // Hanya tampilkan jika nilai berubah
                                                                            if (log.event === 'updated' && oldVal == newVal) return null;

                                                                            return (
                                                                                <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm items-center border-b border-dashed border-slate-100 last:border-0 pb-2">
                                                                                    <div className="font-bold text-slate-600 capitalize">
                                                                                        {formatField(key)}
                                                                                    </div>

                                                                                    {/* Nilai Lama */}
                                                                                    <div className="font-mono text-xs text-red-500 bg-red-50 px-3 py-1.5 rounded border border-red-100 flex items-center gap-2">
                                                                                        <span className="opacity-50 text-[10px]">LAMA:</span>
                                                                                        <span className="font-bold line-through">{formatValue(key, oldVal)}</span>
                                                                                    </div>

                                                                                    {/* Nilai Baru */}
                                                                                    <div className="font-mono text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded border border-emerald-100 flex items-center gap-2 shadow-sm">
                                                                                        <span className="opacity-50 text-[10px]">BARU:</span>
                                                                                        <span className="font-bold">{formatValue(key, newVal)}</span>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-xs text-slate-400 italic">Tidak ada detail atribut yang tercatat.</p>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-center">
                            <div className="flex gap-1">
                                {activities.links.map((link: any, index: number) => (
                                    link.url ? <Link key={index} href={link.url} className={`px-3 py-1 text-xs rounded ${link.active ? 'bg-slate-800 text-white' : 'bg-white border hover:bg-slate-100'}`} dangerouslySetInnerHTML={{ __html: link.label }} /> : <span key={index} className="px-3 py-1 text-xs text-slate-300" dangerouslySetInnerHTML={{ __html: link.label }} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
