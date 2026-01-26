import { FormEventHandler } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';

interface Schedule {
    id: number;
    title: string;
    start_time: string;
    location: string;
    color: string;
    description: string;
}

interface Props extends PageProps {
    schedules: { data: Schedule[]; links: any[] };
}

export default function ScheduleIndex({ schedules }: Props) {
    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        start_time: '',
        location: '',
        color: 'blue',
        description: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('schedules.store'), { onSuccess: () => reset() });
    };

    const deleteSchedule = (id: number) => {
        if (confirm('Hapus agenda ini?')) router.delete(route('schedules.destroy', id));
    };

    // Helper Format Tanggal Cantik (Senin, 20 Jan 2026 - 10:00)
    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // Helper Warna
    const getColorClass = (color: string) => {
        const map: any = {
            blue: 'bg-blue-100 text-blue-700 border-blue-200',
            red: 'bg-red-100 text-red-700 border-red-200',
            green: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            purple: 'bg-purple-100 text-purple-700 border-purple-200',
        };
        return map[color] || map.blue;
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Agenda', href: '/schedules' }]}>
            <Head title="Jadwal Kegiatan" />

            <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8 font-sans">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-2xl font-bold text-slate-800 mb-6">Agenda & Jadwal Kantor 📅</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* FORM INPUT */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
                            <h3 className="font-bold text-lg mb-4 text-slate-700">Buat Agenda Baru</h3>
                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500">Judul Kegiatan</label>
                                    <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} placeholder="Misal: Tanda Tangan Akta PT..." className="w-full rounded-lg border-slate-300 text-sm mt-1" required />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500">Waktu Pelaksanaan</label>
                                    <input type="datetime-local" value={data.start_time} onChange={e => setData('start_time', e.target.value)} className="w-full rounded-lg border-slate-300 text-sm mt-1" required />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500">Lokasi</label>
                                    <input type="text" value={data.location} onChange={e => setData('location', e.target.value)} placeholder="Kantor / BPN / Bank" className="w-full rounded-lg border-slate-300 text-sm mt-1" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500">Label Warna</label>
                                    <div className="flex gap-2 mt-2">
                                        {['blue', 'green', 'red', 'yellow', 'purple'].map(c => (
                                            <button type="button" key={c} onClick={() => setData('color', c)}
                                                className={`w-6 h-6 rounded-full border-2 ${data.color === c ? 'border-slate-600 scale-110' : 'border-transparent'} bg-${c === 'green' ? 'emerald' : c}-500`}>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500">Catatan</label>
                                    <textarea value={data.description} onChange={e => setData('description', e.target.value)} className="w-full rounded-lg border-slate-300 text-sm mt-1" rows={2}></textarea>
                                </div>
                                <button type="submit" disabled={processing} className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition shadow-lg">
                                    + Tambah Jadwal
                                </button>
                            </form>
                        </div>

                        {/* LIST AGENDA */}
                        <div className="lg:col-span-2 space-y-4">
                            {schedules.data.length === 0 ? (
                                <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                                    <p className="text-slate-400 italic">Belum ada agenda mendatang.</p>
                                </div>
                            ) : (
                                schedules.data.map((item) => (
                                    <div key={item.id} className="group flex bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all items-start gap-4">
                                        {/* Tanggal Box */}
                                        <div className={`hidden sm:flex flex-col items-center justify-center w-20 h-20 rounded-xl border ${getColorClass(item.color)}`}>
                                            <span className="text-xs font-bold uppercase">{new Date(item.start_time).toLocaleDateString('id-ID', { month: 'short' })}</span>
                                            <span className="text-2xl font-black">{new Date(item.start_time).getDate()}</span>
                                        </div>

                                        {/* Konten */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-slate-800 text-lg">{item.title}</h4>
                                                <button onClick={() => deleteSchedule(item.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">Hapus</button>
                                            </div>
                                            <p className="text-sm text-cyan-600 font-bold mt-1">
                                                🕒 {formatDateTime(item.start_time)}
                                            </p>
                                            {item.location && (
                                                <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                                    📍 {item.location}
                                                </p>
                                            )}
                                            {item.description && <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-2 rounded-lg">{item.description}</p>}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
