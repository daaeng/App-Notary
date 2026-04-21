import { useState, FormEventHandler } from 'react';
import AppLayout from '@/layouts/app-layout';
import Modal from '@/components/ui/modal';
import InputError from '@/components/ui/input-error';
import { Head, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

// Inisialisasi SweetAlert untuk React
const MySwal = withReactContent(Swal);

interface Client {
    id: number;
    name: string;
    nik_or_npwp: string;
    type: string;
    phone: string;
    email?: string;
    address: string;
}

interface Props extends PageProps {
    clients: {
        data: Client[];
        links: any[];
    };
}

export default function ClientIndex({ auth, clients }: Props) {
    // STATE
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [search, setSearch] = useState('');

    // FORM HANDLING
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        id: 0,
        name: '',
        type: 'perorangan',
        nik_or_npwp: '',
        phone: '',
        email: '',
        address: '',
    });

    // Alert Custom Style untuk konsistensi tema
    const alertConfig = {
        background: '#0f172a', // slate-950
        color: '#f1f5f9', // slate-100
        confirmButtonColor: '#0891b2', // cyan-600
        cancelButtonColor: '#1e293b', // slate-800
    };

    // LOGIC: FILTER SEARCH
    const filteredClients = clients.data.filter((client) =>
        client.name.toLowerCase().includes(search.toLowerCase()) ||
        client.nik_or_npwp.includes(search) ||
        (client.email && client.email.toLowerCase().includes(search.toLowerCase()))
    );

    const getInitials = (name: string) => {
        return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
    };

    // MODAL HANDLERS
    const openCreateModal = () => {
        setIsEdit(false);
        reset();
        clearErrors();
        setShowModal(true);
    };

    const openEditModal = (client: Client) => {
        setIsEdit(true);
        setData({
            id: client.id,
            name: client.name,
            type: client.type,
            nik_or_npwp: client.nik_or_npwp,
            phone: client.phone || '',
            email: client.email || '',
            address: client.address || '',
        });
        clearErrors();
        setShowModal(true);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const action = isEdit ? put : post;
        const url = isEdit ? `/clients/${data.id}` : '/clients';

        action(url, {
            onSuccess: () => {
                closeModal();
                MySwal.fire({
                    icon: 'success',
                    title: isEdit ? 'Data Diperbarui!' : 'Klien Ditambahkan!',
                    text: `Berhasil ${isEdit ? 'mengubah' : 'menambah'} data klien ${data.name}.`,
                    timer: 2000,
                    showConfirmButton: false,
                    ...alertConfig
                });
            },
        });
    };

    const closeModal = () => {
        setShowModal(false);
        reset();
    };

    const deleteClient = (client: Client) => {
        MySwal.fire({
            title: 'Hapus Data Klien?',
            text: `Data klien "${client.name}" akan dihapus permanen!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
            reverseButtons: true,
            ...alertConfig
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/clients/${client.id}`, {
                    onSuccess: () => {
                        MySwal.fire({
                            title: 'Terhapus!',
                            text: 'Data klien berhasil dihapus.',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false,
                            ...alertConfig
                        });
                    }
                });
            }
        });
    };

    // STYLES
    const inputClasses = "mt-1 block w-full rounded-xl bg-slate-900/60 border border-slate-800 text-slate-100 placeholder-slate-500 shadow-sm backdrop-blur-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 sm:text-sm transition-all duration-300 hover:border-slate-700 hover:bg-slate-900/80 py-3 px-4 outline-none";
    const labelClasses = "block text-sm font-medium text-slate-300 mb-1 tracking-wide";

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Data Klien', href: '/clients' }]}>
            <Head title="Data Klien" />

            <div className="min-h-screen bg-slate-50 dark:bg-black p-6 lg:p-8 font-sans">
                {/* --- HEADER SECTION --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Daftar Klien</h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Kelola database klien Anda dengan mudah dan cepat.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-slate-400 group-focus-within:text-cyan-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Cari nama atau NIK..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 pr-4 py-3 w-full sm:w-72 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all shadow-sm hover:border-slate-300 outline-none"
                            />
                        </div>

                        <button
                            onClick={openCreateModal}
                            className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-black uppercase tracking-widest text-white transition-all duration-300 bg-slate-900 rounded-2xl hover:bg-slate-800 shadow-xl shadow-slate-900/20 hover:shadow-cyan-500/20 hover:-translate-y-1"
                        >
                            <svg className="w-5 h-5 transition-transform group-hover:rotate-90 text-cyan-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                            </svg>
                            Tambah Klien
                        </button>
                    </div>
                </div>

                {/* --- TABLE CARD --- */}
                <div className="bg-white dark:bg-neutral-800 rounded-[2rem] shadow-2xl shadow-slate-200/50 border  overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y  dark:text-black">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-left text-[10px] font-black dark:text-black text-slate-400 uppercase tracking-[0.2em]">Profil Klien</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black dark:text-black text-slate-400 uppercase tracking-[0.2em]">Identitas Resmi</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black dark:text-black text-slate-400 uppercase tracking-[0.2em]">Kontak</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black dark:text-black text-slate-400 uppercase tracking-[0.2em]">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-neutral-800 divide-y ">
                                {filteredClients.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-500 animate-pulse">
                                                <span className="text-6xl mb-4">📂</span>
                                                <p className="text-lg font-bold text-slate-900 dark:text-white">Data Tidak Ditemukan</p>
                                                <p className="text-sm font-medium">Pastikan kata kunci pencarian sudah benar.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredClients.map((client) => (
                                        <tr key={client.id} className="group hover:bg-slate-50 transition-all duration-300">
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-sm font-black text-white shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3
                                                        ${client.type === 'perorangan'
                                                            ? 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-cyan-200'
                                                            : 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-200'}`
                                                    }>
                                                        {getInitials(client.name)}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-black text-slate-900 group-hover:text-cyan-600 transition-colors">
                                                            {client.name}
                                                        </div>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border mt-1 ${
                                                            client.type === 'perorangan'
                                                                ? 'bg-cyan-50 text-cyan-700 border-cyan-100'
                                                                : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                                                        }`}>
                                                            {client.type === 'perorangan' ? 'Perorangan' : 'Badan Hukum'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">
                                                        {client.type === 'perorangan' ? 'NIK' : 'NPWP'}
                                                    </span>
                                                    <span className="text-sm text-slate-700 font-mono font-bold tracking-tighter bg-slate-100 px-3 py-1 rounded-xl border border-slate-200 w-fit">
                                                        {client.nik_or_npwp}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                                        <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                        </div>
                                                        {client.phone}
                                                    </div>
                                                    {client.email && (
                                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                                                            <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center pl-0.5">
                                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                            </div>
                                                            {client.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                                                    <button
                                                        onClick={() => openEditModal(client)}
                                                        className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
                                                        title="Edit Data"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    </button>
                                                    <button
                                                        onClick={() => deleteClient(client)}
                                                        className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                                                        title="Hapus Data"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-slate-50/80 px-8 py-4 border-t border-slate-100">
                        <p className="text-[11px] font-bold text-slate-500 text-center sm:text-left uppercase tracking-widest">
                            Total: <span className="text-slate-900">{filteredClients.length} Klien Terdaftar</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* --- MODAL FORM --- */}
            <Modal show={showModal} onClose={closeModal}>
                <div className="relative overflow-hidden bg-slate-950 p-10 rounded-[3rem] border border-slate-800 shadow-2xl">
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="mb-8">
                            <h2 className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent tracking-tighter">
                                {isEdit ? 'PERBARUI KLIEN' : 'REGISTRASI KLIEN'}
                            </h2>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Pastikan data sesuai dengan dokumen resmi.</p>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className={labelClasses}>Nama Lengkap / Nama Badan</label>
                                    <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className={inputClasses} placeholder="Masukkan nama klien..." required />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>
                                <div>
                                    <label className={labelClasses}>Tipe Klien</label>
                                    <select value={data.type} onChange={(e) => setData('type', e.target.value)} className={`${inputClasses} cursor-pointer`}>
                                        <option value="perorangan">👤 Perorangan</option>
                                        <option value="badan_hukum">🏢 Badan Hukum</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClasses}>{data.type === 'perorangan' ? 'NIK (Identitas)' : 'NPWP Perusahaan'}</label>
                                    <input type="text" value={data.nik_or_npwp} onChange={(e) => setData('nik_or_npwp', e.target.value)} className={`${inputClasses} font-mono tracking-widest`} placeholder="16 Digit Angka..." required />
                                    <InputError message={errors.nik_or_npwp} className="mt-2" />
                                </div>
                                <div>
                                    <label className={labelClasses}>No. Handphone</label>
                                    <input type="text" value={data.phone} onChange={(e) => setData('phone', e.target.value)} className={inputClasses} placeholder="08..." required />
                                </div>
                                <div>
                                    <label className={labelClasses}>Email (Opsional)</label>
                                    <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className={inputClasses} placeholder="email@client.com" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className={labelClasses}>Alamat Domisili</label>
                                    <textarea rows={3} value={data.address} onChange={(e) => setData('address', e.target.value)} className={`${inputClasses} resize-none`} placeholder="Alamat lengkap klien..." required></textarea>
                                    <InputError message={errors.address} className="mt-2" />
                                </div>
                            </div>

                            <div className="mt-10 flex gap-4 pt-6 border-t border-slate-800/50">
                                <button type="button" onClick={closeModal} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all rounded-2xl hover:bg-slate-900 border border-transparent hover:border-slate-800">Batal</button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-[2] py-4 text-xs font-black uppercase tracking-[0.2em] text-white bg-gradient-to-r from-cyan-600 to-indigo-600 rounded-2xl shadow-xl shadow-cyan-900/40 hover:shadow-cyan-500/40 hover:-translate-y-1 transition-all disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Daftarkan Klien')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
