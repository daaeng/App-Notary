import { useState, FormEventHandler } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import Modal from '@/components/ui/modal';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Book, FileText, Scale, Plus, Search, Trash2, Printer } from 'lucide-react';

const MySwal = withReactContent(Swal);

export default function RegisterIndex({ registers, currentType }: any) {
    const [activeTab, setActiveTab] = useState(currentType || 'akta');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const { data, setData, post, processing, reset, errors } = useForm({
        type: activeTab,
        halaman_buku: '',
        nama_penghadap: '',
        nomor_bulanan: '',
        tanggal_akta: '',
        sifat_akta: '',
        nomor_akta: '',
        tanggal: '',
        yang_ditagih: '',
        yang_menagih: '',
        tanggal_wesel: '',
        tanggal_jatuh_waktu: '',
        tanggal_surat: '',
        tanggal_didaftarkan: '',
        sifat_surat: '',
    });

    const tabs = [
        { id: 'akta', name: 'Buku Daftar Akta', color: 'bg-red-500', icon: Book, desc: 'Pencatatan akta notaris bulanan' },
        { id: 'protes', name: 'Buku Daftar Protes', color: 'bg-zinc-800', icon: Scale, desc: 'Pencatatan protes surat berharga' },
        { id: 'legalisasi', name: 'Buku Bawah Tangan', color: 'bg-emerald-600', icon: FileText, desc: 'Legalisasi & Waarmerking' },
    ];

    const handleTabChange = (type: string) => {
        setActiveTab(type);
        setData('type', type);
        router.get(route('registers.index'), { type }, { preserveState: true });
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('registers.store'), {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
                MySwal.fire({
                    icon: 'success',
                    title: 'Data Tersimpan',
                    text: 'Berhasil mencatat ke dalam buku register.',
                    background: '#18181b',
                    color: '#fff',
                    confirmButtonColor: '#6366f1'
                });
            },
        });
    };

    const inputClasses = "w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm";
    const labelClasses = "block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2";

    return (
        <AppLayout breadcrumbs={[{ title: 'Buku Register', href: '/registers' }]}>
            <Head title="Klampening Digital" />

            <div className="p-6 lg:p-10 bg-gray-50/50 dark:bg-black min-h-screen">

                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight">Klampening Digital</h1>
                        <p className="text-slate-500 font-medium mt-1">Sistem administrasi buku daftar wajib kantor Notaris.</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all shadow-sm">
                            <Printer className="w-4 h-4" /> Cetak
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                        >
                            <Plus className="w-5 h-5" /> Tambah Data
                        </button>
                    </div>
                </div>

                {/* --- TAB CARDS --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`relative group overflow-hidden p-6 rounded-[2.5rem] text-left transition-all duration-300 ${
                                    activeTab === tab.id
                                    ? `${tab.color} text-white shadow-2xl shadow-indigo-500/20 -translate-y-2`
                                    : 'bg-white dark:bg-zinc-900 text-slate-600 hover:shadow-xl border border-transparent hover:border-gray-100'
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100 dark:bg-zinc-800'}`}>
                                    <Icon className={`w-6 h-6 ${activeTab === tab.id ? 'text-white' : 'text-slate-500'}`} />
                                </div>
                                <h3 className="text-xl font-bold tracking-tight">{tab.name}</h3>
                                <p className={`text-xs mt-1 font-medium ${activeTab === tab.id ? 'text-white/70' : 'text-slate-400'}`}>{tab.desc}</p>
                                {activeTab === tab.id && (
                                    <div className="absolute top-4 right-6 text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">Aktif</div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* --- DATA TABLE CONTAINER --- */}
                <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
                    <div className="p-8 border-b border-gray-50 dark:border-zinc-800 flex justify-between items-center">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder={`Cari di ${activeTab}...`}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-zinc-950 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-zinc-950">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">No. Urut</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Penghadap</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Informasi Akta</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Halaman</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
                                {registers.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <div className="flex flex-col items-center opacity-20">
                                                <Book className="w-16 h-16 mb-4" />
                                                <p className="font-bold">Belum ada data tercatat</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    registers.data.map((item: any) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors group">
                                            <td className="px-8 py-6 font-mono font-bold text-indigo-600">{item.nomor_urut.toString().padStart(3, '0')}</td>
                                            <td className="px-8 py-6">
                                                <div className="font-bold text-zinc-900 dark:text-white">{item.nama_penghadap}</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">{activeTab}</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="text-sm font-medium">{item.sifat_akta || item.sifat_surat || 'N/A'}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">{item.tanggal_akta || item.tanggal_surat || 'N/A'}</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="px-3 py-1 bg-gray-100 dark:bg-zinc-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400">
                                                    {item.halaman_buku}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
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

            {/* --- MODAL INPUT MODERN --- */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="bg-white dark:bg-zinc-950 p-8 lg:p-12 rounded-[3rem] overflow-hidden relative">
                    {/* Decoration */}
                    <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-3xl ${tabs.find(t => t.id === activeTab)?.color}`}></div>

                    <div className="relative z-10">
                        <div className="mb-10 flex justify-between items-start">
                            <div>
                                <h2 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase">
                                    Catat {activeTab}
                                </h2>
                                <p className="text-slate-500 text-sm font-medium mt-1">Lengkapi data buku register sesuai dokumen fisik.</p>
                            </div>
                        </div>

                        <form onSubmit={submit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="md:col-span-2">
                                    <label className={labelClasses}>Nama Penghadap / Badan Hukum</label>
                                    <input type="text" value={data.nama_penghadap} onChange={e => setData('nama_penghadap', e.target.value)} className={inputClasses} placeholder="Ketik nama lengkap..." />
                                </div>

                                <div>
                                    <label className={labelClasses}>Halaman Buku</label>
                                    <input type="text" value={data.halaman_buku} onChange={e => setData('halaman_buku', e.target.value)} className={inputClasses} placeholder="Contoh: Hal 120" />
                                </div>

                                {activeTab === 'akta' && (
                                    <>
                                        <div>
                                            <label className={labelClasses}>Nomor Bulanan</label>
                                            <input type="text" value={data.nomor_bulanan} onChange={e => setData('nomor_bulanan', e.target.value)} className={inputClasses} />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Tanggal Akta</label>
                                            <input type="date" value={data.tanggal_akta} onChange={e => setData('tanggal_akta', e.target.value)} className={inputClasses} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className={labelClasses}>Sifat Akta (Isi Ringkasan)</label>
                                            <textarea value={data.sifat_akta} onChange={e => setData('sifat_akta', e.target.value)} className={`${inputClasses} h-24 resize-none`} placeholder="Ringkasan isi akta..."></textarea>
                                        </div>
                                    </>
                                )}

                                {/* Tambahkan fields protes & legalisasi di sini dengan gaya yang sama */}
                            </div>

                            <div className="flex gap-4 pt-6 border-t border-gray-100 dark:border-zinc-900">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">Batalkan</button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`flex-[2] py-4 rounded-2xl text-white font-bold text-sm uppercase tracking-widest shadow-xl transition-all ${tabs.find(t => t.id === activeTab)?.color} hover:brightness-110 active:scale-95`}
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan ke Buku'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
