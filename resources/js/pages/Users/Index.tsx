import { useState, FormEventHandler } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';

interface User {
    id: number;
    name: string;
    email: string;
    roles: { name: string }[];
    created_at: string;
}

interface Role {
    id: number;
    name: string;
}

interface Props extends PageProps {
    users: User[];
    roles: Role[];
}

export default function UserIndex({ users, roles, auth }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editUserId, setEditUserId] = useState<number | null>(null);

    // Form Handling
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'staff', // Default role
    });

    const openCreateModal = () => {
        setIsEditing(false);
        setEditUserId(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    const openEditModal = (user: User) => {
        setIsEditing(true);
        setEditUserId(user.id);

        // Ambil role pertama user (karena sistem kita 1 user = 1 role utama)
        const userRole = user.roles.length > 0 ? user.roles[0].name : 'staff';

        setData({
            name: user.name,
            email: user.email,
            password: '', // Password kosong saat edit (biar tidak overwrite jika tidak mau ganti)
            role: userRole,
        });
        clearErrors();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (isEditing && editUserId) {
            put(route('users.update', editUserId), { onSuccess: () => closeModal() });
        } else {
            post(route('users.store'), { onSuccess: () => closeModal() });
        }
    };

    const deleteUser = (id: number) => {
        if (confirm('Yakin ingin menghapus akses pengguna ini?')) {
            router.delete(route('users.destroy', id));
        }
    };

    // Helper Visual Badge Role
    const getRoleBadge = (role: string) => {
        switch(role) {
            case 'super_admin': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
            case 'notaris': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
            case 'bos': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
            default: return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800'; // Staff
        }
    };

    // Helper Inisial Nama (Misal: "Mas Daeng" -> "MD")
    const getInitials = (name: string) => {
        return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Tim', href: '/users' }]}>
            <Head title="Manajemen Tim" />

            <div className="min-h-screen bg-gray-50 dark:bg-black font-sans transition-colors duration-300 p-4 lg:p-8">
                <div className="w-full mx-auto">

                    {/* HEADER */}
                    <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Manajemen Tim</h1>
                            <p className="mt-1 text-slate-500 dark:text-zinc-400 text-sm">Kelola akun, hak akses, dan peran anggota kantor.</p>
                        </div>
                        <button onClick={openCreateModal} className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black font-bold rounded-xl shadow-lg hover:opacity-90 transition flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                            Tambah Anggota
                        </button>
                    </div>

                    {/* LIST USER (CARD STYLE) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {users.map((user) => (
                            <div key={user.id} className="group relative bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">

                                {/* Header Card: Role & Actions */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-2">
                                        {user.roles.map(role => (
                                            <span key={role.name} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${getRoleBadge(role.name)}`}>
                                                {role.name.replace('_', ' ')}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Menu Aksi (Edit/Delete) */}
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEditModal(user)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition" title="Edit Data">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        </button>

                                        {/* Proteksi: Tidak bisa hapus diri sendiri */}
                                        {auth.user.id !== user.id && (
                                            <button onClick={() => deleteUser(user.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition" title="Hapus Akses">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Profil User */}
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-lg ${user.roles[0]?.name === 'super_admin' ? 'bg-gradient-to-br from-purple-600 to-indigo-600' : 'bg-gradient-to-br from-emerald-500 to-teal-500'}`}>
                                        {getInitials(user.name)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{user.name}</h3>
                                        <p className="text-sm text-slate-500 dark:text-zinc-400 font-mono mt-0.5">{user.email}</p>
                                    </div>
                                </div>

                                {/* Footer Card: Status & Tanggal */}
                                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800 flex justify-between items-center text-xs">
                                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-500">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        Aktif
                                    </span>
                                    <span className="text-slate-400 dark:text-zinc-600">
                                        Bergabung: {new Date(user.created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {/* Card Tambah Baru (Placeholder) */}
                        <button onClick={openCreateModal} className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 dark:border-zinc-800 p-6 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all cursor-pointer min-h-[180px]">
                            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-zinc-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900 flex items-center justify-center text-gray-400 group-hover:text-indigo-600 transition-colors mb-3">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            </div>
                            <span className="text-sm font-bold text-gray-500 dark:text-zinc-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Tambah Anggota Baru</span>
                        </button>
                    </div>

                </div>

                {/* --- MODAL FORM --- */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-zinc-800 overflow-hidden transform scale-100 transition-all">

                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-black/50 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                    {isEditing ? 'Edit Data Anggota' : 'Tambah Anggota Baru'}
                                </h3>
                                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={submit} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 mb-1 uppercase">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full rounded-lg bg-gray-50 dark:bg-black border border-gray-300 dark:border-zinc-700 text-slate-900 dark:text-white text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Nama Pegawai..."
                                        required
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 mb-1 uppercase">Email Login</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        className="w-full rounded-lg bg-gray-50 dark:bg-black border border-gray-300 dark:border-zinc-700 text-slate-900 dark:text-white text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="email@kantor.com"
                                        required
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 mb-1 uppercase">
                                        {isEditing ? 'Password Baru (Opsional)' : 'Password'}
                                    </label>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        className="w-full rounded-lg bg-gray-50 dark:bg-black border border-gray-300 dark:border-zinc-700 text-slate-900 dark:text-white text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder={isEditing ? 'Biarkan kosong jika tidak diganti' : 'Minimal 8 karakter'}
                                        required={!isEditing}
                                    />
                                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 mb-1 uppercase">Jabatan / Role</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {roles.map((role) => (
                                            <div
                                                key={role.id}
                                                onClick={() => setData('role', role.name)}
                                                className={`cursor-pointer border rounded-lg p-3 text-center transition-all ${
                                                    data.role === role.name
                                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 ring-1 ring-indigo-500'
                                                    : 'border-gray-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
                                                }`}
                                            >
                                                <span className="text-xs font-bold uppercase">{role.name.replace('_', ' ')}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition transform hover:-translate-y-0.5"
                                    >
                                        {processing ? 'Menyimpan...' : 'Simpan Data'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
