import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';

interface Activity {
    id: number;
    description: string;
    created_at: string;
    causer: {
        id: number;
        name: string;
    } | null;
    event: string;
    subject_type: string;
}

interface Props extends PageProps {
    activities: {
        data: Activity[];
        links: any[];
    };
}

export default function ActivityLogIndex({ activities }: Props) {

    // Helper: Warna Badge Event
    const getEventBadge = (event: string) => {
        switch (event) {
            case 'created': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'updated': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'deleted': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    // Helper: Format Tanggal & Jam
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(date);
    };

    // Helper: Inisial Nama
    const getInitials = (name: string) => {
        return name ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() : '?';
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Log Aktivitas', href: '/activity-logs' }]}>
            <Head title="Log Aktivitas Sistem" />

            <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8 font-sans">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Log Aktivitas (Audit Trail)</h1>
                    <p className="text-slate-500 text-sm mt-1">Rekam jejak penggunaan sistem oleh seluruh pengguna.</p>
                </div>

                {/* Tabel Log */}
                <div className="bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Waktu</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Pelaku (User)</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {activities.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm italic">
                                            Belum ada aktivitas terekam.
                                        </td>
                                    </tr>
                                ) : (
                                    activities.data.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                                            {/* Waktu */}
                                            <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-500">
                                                {formatDate(log.created_at)}
                                            </td>

                                            {/* Pelaku */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8 bg-slate-200 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-600">
                                                        {log.causer ? getInitials(log.causer.name) : 'SYS'}
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-bold text-slate-700">
                                                            {log.causer ? log.causer.name : 'Sistem'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Badge Aksi */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${getEventBadge(log.event)}`}>
                                                    {log.event}
                                                </span>
                                            </td>

                                            {/* Keterangan */}
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {log.description}
                                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                    Target: {log.subject_type.replace('App\\Models\\', '')}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Simple */}
                    <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-xs text-slate-500">
                            Menampilkan {activities.data.length} aktivitas terbaru.
                        </span>
                        <div className="flex gap-2">
                            {activities.links.map((link: any, index: number) => (
                                link.url && (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        className={`px-3 py-1 text-xs rounded border ${link.active
                                            ? 'bg-slate-800 text-white border-slate-800'
                                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                )
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
