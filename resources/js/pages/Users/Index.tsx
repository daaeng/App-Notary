import { useState, FormEventHandler } from 'react';
import AppLayout from '@/layouts/app-layout';
import InputError from '@/components/ui/input-error';
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

// --- UPDATE 1: Definisikan Tipe Auth Baru ---
interface AuthProps {
    user: {
        id: number;
        name: string;
        email: string;
        roles: { name: string }[];
    };
    can: {
        delete_user: boolean; // Ini data permission dari Middleware
    };
}

// --- UPDATE 2: Override auth di Props ---
interface Props extends PageProps {
    auth: AuthProps; // Gunakan tipe custom kita
    users: User[];
    roles: Role[];
}

// Tambahkan 'auth' ke parameter props
export default function UserIndex({ users, roles, auth }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editUserId, setEditUserId] = useState<number | null>(null);

    // ... (Bagian Form Handling & Modal functions SAMA PERSIS, tidak ada perubahan) ...
    // Copy-paste saja bagian logic form dari kode lama Anda di sini

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
        if (confirm('Yakin ingin menghapus pengguna ini? Akses mereka akan hilang selamanya.')) {
            router.delete(route('users.destroy', id));
        }
    };

    const getRoleBadge = (role: string) => {
        switch(role) {
            case 'super_admin': return 'bg-purple-50 text-purple-700 border-purple-100';
            case 'bos': return 'bg-amber-50 text-amber-700 border-amber-100'; // Tambah Badge Bos
            case 'notaris': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'staff': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const getInitials = (name: string) => {
        return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
    };

    const inputClasses = "mt-1 block w-full rounded-xl bg-slate-900/60 border border-slate-800 text-slate-100 placeholder-slate-500 shadow-sm backdrop-blur-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 sm:text-sm transition-all duration-300 hover:border-slate-700 hover:bg-slate-900/80 py-3 px-4";
    const labelClasses = "block text-sm font-medium text-slate-300 mb-1 tracking-wide";

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Pengguna', href: '/users' }]}>
            <Head title="Manajemen Pengguna" />

            <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8 font-sans">
                 {/* ... (Bagian Header SAMA PERSIS) ... */}
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Pengguna</h1>
                        <p className="text-slate-500 text-sm mt-1">Kelola akses masuk pegawai dan pimpinan.</p>
                    </div>
                    <button onClick={openCreateModal} className="group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 bg-slate-900 rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-900/20 hover:shadow-slate-900/40 hover:-translate-y-0.5">
                        Tambah Pengguna
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            {/* ... (Thead SAMA PERSIS) ... */}
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Pengguna</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Email & Kontak</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Jabatan (Role)</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {users.map((user) => (
                                    <tr key={user.id} className="group hover:bg-slate-50/80 transition-colors duration-200">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {/* Bagian Nama User (SAMA PERSIS) */}
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                     <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${user.roles[0]?.name === 'super_admin' ? 'bg-gradient-to-br from-purple-500 to-indigo-500' : 'bg-gradient-to-br from-emerald-500 to-teal-500'}`}>
                                                        {getInitials(user.name)}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-slate-900">{user.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-600">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                             {user.roles.map(role => (
                                                <span key={role.name} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${getRoleBadge(role.name)}`}>
                                                    {role.name.replace('_', ' ')}
                                                </span>
                                            ))}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                {/* Tombol Edit (Semua bisa lihat) */}
                                                <button onClick={() => openEditModal(user)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Edit">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>

                                                {/* --- UPDATE 3: LOGIK TOMBOL DELETE --- */}
                                                {/* Hanya render jika auth.can.delete_user bernilai TRUE */}
                                                {auth.can.delete_user && (
                                                    <button onClick={() => deleteUser(user.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Hapus">
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                )}

                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ... (Modal Form SAMA PERSIS, tidak ada perubahan) ... */}
            {isModalOpen && (
               /* Gunakan kode modal form yang lama */
               <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
                    <div className="bg-slate-950 p-8 rounded-[2rem] border border-slate-800/50 w-full max-w-lg">
                        <form onSubmit={submit} className="space-y-5">
                             {/* ... input fields ... */}
                             <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-800/50">
                                <button type="button" onClick={closeModal} className="px-5 py-2.5 text-sm font-medium text-slate-300 rounded-xl hover:bg-slate-800">Batal</button>
                                <button type="submit" disabled={processing} className="px-6 py-2.5 text-sm font-bold text-white bg-cyan-600 rounded-xl">Simpan</button>
                            </div>
                        </form>
                    </div>
               </div>
            )}
        </AppLayout>
    );
}
