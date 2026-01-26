import { useState, FormEventHandler } from 'react';
import AppLayout from '@/layouts/app-layout';
import Modal from '@/components/ui/modal';
import InputError from '@/components/ui/input-error';
import { Head, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';

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
    const [search, setSearch] = useState(''); // State untuk Search

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

    // LOGIC: FILTER SEARCH (Client Side)
    // UX Upgrade: User bisa langsung cari data tanpa reload page
    const filteredClients = clients.data.filter((client) =>
        client.name.toLowerCase().includes(search.toLowerCase()) ||
        client.nik_or_npwp.includes(search) ||
        (client.email && client.email.toLowerCase().includes(search.toLowerCase()))
    );

    // HELPER: Get Initials for Avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
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
            onSuccess: () => closeModal(),
        });
    };

    const closeModal = () => {
        setShowModal(false);
        reset();
    };

    const deleteClient = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
            router.delete(`/clients/${id}`);
        }
    };

    // STYLES
    const inputClasses = "mt-1 block w-full rounded-xl bg-slate-900/60 border border-slate-800 text-slate-100 placeholder-slate-500 shadow-sm backdrop-blur-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 sm:text-sm transition-all duration-300 hover:border-slate-700 hover:bg-slate-900/80 py-3 px-4";
    const labelClasses = "block text-sm font-medium text-slate-300 mb-1 tracking-wide";

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Data Klien', href: '/clients' }]}>
            <Head title="Data Klien" />

            <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8 font-sans">

                {/* --- HEADER SECTION --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Daftar Klien</h1>
                        <p className="text-slate-500 text-sm mt-1">Kelola database klien Anda dengan mudah.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        {/* Search Bar Modern */}
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
                                className="pl-10 pr-4 py-2.5 w-full sm:w-64 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all shadow-sm hover:border-slate-300"
                            />
                        </div>

                        {/* Button Create */}
                        <button
                            onClick={openCreateModal}
                            className="group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 bg-slate-900 rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-900/20 hover:shadow-slate-900/40 hover:-translate-y-0.5"
                        >
                            <svg className="w-5 h-5 transition-transform group-hover:rotate-90 text-cyan-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                            </svg>
                            Tambah Klien
                        </button>
                    </div>
                </div>

                {/* --- TABLE CARD --- */}
                <div className="bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Profil Klien</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Identitas Resmi</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Kontak</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {filteredClients.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400">
                                                <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                                <p className="text-base font-medium text-slate-500">Data tidak ditemukan.</p>
                                                <p className="text-sm">Coba kata kunci lain atau tambah klien baru.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredClients.map((client) => (
                                        <tr key={client.id} className="group hover:bg-slate-50/80 transition-colors duration-200">
                                            {/* Name & Avatar */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm
                                                            ${client.type === 'perorangan'
                                                                ? 'bg-gradient-to-br from-cyan-500 to-blue-500'
                                                                : 'bg-gradient-to-br from-indigo-500 to-purple-500'}`
                                                        }>
                                                            {getInitials(client.name)}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-bold text-slate-900 group-hover:text-cyan-700 transition-colors">
                                                            {client.name}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                                                                client.type === 'perorangan'
                                                                    ? 'bg-cyan-50 text-cyan-700 border-cyan-100'
                                                                    : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                                                            }`}>
                                                                {client.type === 'perorangan' ? 'Perorangan' : 'Badan Usaha'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Identitas */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-slate-400 mb-1">
                                                        {client.type === 'perorangan' ? 'NIK' : 'NPWP'}
                                                    </span>
                                                    <span className="text-sm text-slate-600 font-mono bg-slate-100/50 px-2 py-1 rounded w-fit border border-slate-200/50">
                                                        {client.nik_or_npwp}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Kontak */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-slate-600 flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                        {client.phone}
                                                    </div>
                                                    {client.email && (
                                                        <div className="flex items-center gap-2">
                                                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                            {client.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Aksi */}
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    <button
                                                        onClick={() => openEditModal(client)}
                                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                        title="Edit Data"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    </button>
                                                    <button
                                                        onClick={() => deleteClient(client.id)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
                    {/* Pagination Info simple footer */}
                    <div className="bg-slate-50 px-6 py-4 border-t border-slate-100">
                        <p className="text-xs text-slate-500 text-center sm:text-left">
                            Menampilkan <span className="font-bold text-slate-700">{filteredClients.length}</span> data klien.
                        </p>
                    </div>
                </div>
            </div>

            {/* --- MODAL FORM (TETAP FUTURISTIK) --- */}
            <Modal show={showModal} onClose={closeModal}>
                <div className="relative overflow-hidden bg-slate-950 p-8 rounded-[2rem] border border-slate-800/50 shadow-[0_0_50px_-12px_rgb(6_182_212_/_0.2)]">
                    {/* ... (KODE MODAL SAMA SEPERTI SEBELUMNYA) ... */}
                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative z-10">
                        <h2 className="text-2xl font-extrabold mb-6 bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">
                            {isEdit ? 'Edit Data Klien' : 'Tambah Klien Baru'}
                        </h2>

                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <label className={labelClasses}>Nama Lengkap</label>
                                <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className={inputClasses} placeholder="Nama sesuai identitas" />
                                <InputError message={errors.name} className="mt-2" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className={labelClasses}>Tipe Klien</label>
                                    <select value={data.type} onChange={(e) => setData('type', e.target.value)} className={inputClasses}>
                                        <option value="perorangan">👤 Perorangan</option>
                                        <option value="badan_hukum">🏢 Badan Hukum</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClasses}>{data.type === 'perorangan' ? 'NIK (16 Digit)' : 'NPWP Badan'}</label>
                                    <input type="text" value={data.nik_or_npwp} onChange={(e) => setData('nik_or_npwp', e.target.value)} className={`${inputClasses} font-mono tracking-wider`} placeholder={data.type === 'perorangan' ? '3201...' : '01.234...'} />
                                    <InputError message={errors.nik_or_npwp} className="mt-2" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className={labelClasses}>No. HP / WhatsApp</label>
                                    <input type="text" value={data.phone} onChange={(e) => setData('phone', e.target.value)} className={inputClasses} placeholder="Contoh: 0812..." />
                                </div>
                                <div>
                                    <label className={labelClasses}>Email (Opsional)</label>
                                    <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className={inputClasses} placeholder="contoh@email.com" />
                                </div>
                            </div>
                            <div>
                                <label className={labelClasses}>Alamat Lengkap</label>
                                <textarea rows={3} value={data.address} onChange={(e) => setData('address', e.target.value)} className={`${inputClasses} resize-none`} placeholder="Masukkan alamat domisili lengkap..."></textarea>
                                <InputError message={errors.address} className="mt-2" />
                            </div>
                            <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-800/50">
                                <button type="button" onClick={closeModal} className="px-5 py-2.5 text-sm font-medium text-slate-300 transition-all rounded-xl hover:text-white hover:bg-slate-800/80 focus:ring-2 focus:ring-slate-600">Batal</button>
                                <button type="submit" disabled={processing} className="relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white transition-all duration-200 bg-gradient-to-r from-cyan-600 to-indigo-600 rounded-xl hover:from-cyan-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 disabled:opacity-70 disabled:cursor-not-allowed tracking-wide">{processing ? 'Memproses...' : (isEdit ? 'Simpan Perubahan' : 'Simpan Klien Baru')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
