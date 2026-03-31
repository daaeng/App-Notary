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

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'staff',
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
        const userRole = user.roles.length > 0 ? user.roles[0].name : 'staff';
        setData({
            name: user.name,
            email: user.email,
            password: '',
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

    const getRoleBadge = (role: string) => {
        switch(role) {
            case 'super_admin': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
            case 'notaris': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
            case 'bos': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
            default: return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800';
        }
    };

    const getInitials = (name: string) => {
        return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Tim', href: '/users' }]}>
            <Head title="Manajemen Tim" />

            <div className="min-h-screen bg-gray-50 dark:bg-black font-sans transition-colors duration-300 p-4 lg:p-8">
                <div className="max-w-7xl mx-auto">

                    {/* HEADER */}
                    <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Manajemen Tim</h1>
                            <p className="mt-1 text-slate-500 dark:text-zinc-400 text-sm">Kelola akun, hak akses, dan peran anggota kantor.</p>
                        </div>
                        <button onClick={openCreateModal} className="px-6 py-3 bg-indigo-600 dark:bg-white text-white dark:text-black font-bold rounded-xl shadow-lg hover:bg-indigo-700 dark:hover:bg-gray-100 transition-all flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            Tambah Anggota
                        </button>
                    </div>

                    {/* LIST USER */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {users.map((user) => (
                            <div key={user.id} className="group bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-2">
                                        {user.roles.map(role => (
                                            <span key={role.name} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${getRoleBadge(role.name)}`}>
                                                {role.name.replace('_', ' ')}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => openEditModal(user)} className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg transition"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                                        {auth.user.id !== user.id && (
                                            <button onClick={() => deleteUser(user.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-lg ${user.roles[0]?.name === 'super_admin' ? 'bg-gradient-to-br from-purple-600 to-indigo-600' : 'bg-gradient-to-br from-emerald-500 to-teal-500'}`}>
                                        {getInitials(user.name)}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">{user.name}</h3>
                                        <p className="text-sm text-slate-500 dark:text-zinc-400 truncate">{user.email}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- MODAL FORM (PERBAIKAN DI SINI) --- */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        {/* Perubahan: max-w-xl untuk ruang lebih luas */}
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-xl border border-gray-200 dark:border-zinc-800 overflow-hidden transform transition-all">

                            {/* Modal Header */}
                            <div className="px-8 py-5 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-black/20 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                        {isEditing ? 'Edit Anggota Tim' : 'Tambah Anggota Baru'}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Lengkapi formulir di bawah ini dengan benar.</p>
                                </div>
                                <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-white dark:bg-zinc-800 rounded-full shadow-sm transition">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={submit} className="p-8 space-y-6">

                                {/* Baris 1: Nama & Email Sejajar */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider ml-1">Nama Lengkap</label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                            placeholder="Nama Pegawai..."
                                            required
                                        />
                                        {errors.name && <p className="text-red-500 text-[10px] mt-1 font-bold italic">{errors.name}</p>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider ml-1">Email Login</label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                            placeholder="email@kantor.com"
                                            required
                                        />
                                        {errors.email && <p className="text-red-500 text-[10px] mt-1 font-bold italic">{errors.email}</p>}
                                    </div>
                                </div>

                                {/* Baris 2: Password */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider ml-1">
                                        {isEditing ? 'Ganti Password (Kosongkan jika tidak diganti)' : 'Password'}
                                    </label>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-zinc-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        placeholder={isEditing ? 'Minimal 8 karakter' : 'Minimal 8 karakter'}
                                        required={!isEditing}
                                    />
                                    {errors.password && <p className="text-red-500 text-[10px] mt-1 font-bold italic">{errors.password}</p>}
                                </div>

                                {/* Baris 3: Jabatan */}
                                <div className="space-y-3">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider ml-1">Jabatan / Role</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {roles.map((role) => (
                                            <div
                                                key={role.id}
                                                onClick={() => setData('role', role.name)}
                                                className={`cursor-pointer border-2 rounded-xl p-3 text-center transition-all ${
                                                    data.role === role.name
                                                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 shadow-sm'
                                                    : 'border-gray-100 dark:border-zinc-800 text-slate-500 dark:text-zinc-500 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:border-gray-300'
                                                }`}
                                            >
                                                <span className="text-[10px] font-black uppercase tracking-tighter block">{role.name.replace('_', ' ')}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.role && <p className="text-red-500 text-[10px] mt-1 font-bold italic">{errors.role}</p>}
                                </div>

                                {/* Footer Action */}
                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 py-3.5 bg-gray-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-[2] py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/30 transition-all transform active:scale-95 disabled:opacity-50"
                                    >
                                        {processing ? 'Memproses...' : (isEditing ? 'Simpan Perubahan' : 'Tambahkan Anggota')}
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
