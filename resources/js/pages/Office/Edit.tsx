import { FormEventHandler, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { route } from 'ziggy-js';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

interface Props extends PageProps {
    company: {
        name: string;
        notary_name: string;
        sk_number: string | null; // Baru
        address: string;
        phone: string;
        email: string;
        bank_name: string | null;
        account_number: string | null;
        account_name: string | null;
        logo_path: string | null;
        staff_data: any[] | null;
    };
}

import { PlusCircle, Trash2, Users } from 'lucide-react';

export default function OfficeEdit({ company }: Props) {
    const [preview, setPreview] = useState<string | null>(
        company.logo_path ? `/storage/${company.logo_path}` : null
    );

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        name: company.name,
        notary_name: company.notary_name,
        sk_number: company.sk_number || '', // Baru
        address: company.address,
        phone: company.phone,
        email: company.email || '',
        bank_name: company.bank_name || '',
        account_number: company.account_number || '',
        account_name: company.account_name || '',
        logo: null as File | null,
        staff_data: (company.staff_data || []) as { name: string, position: string, phone: string }[],
    });

    const toastConfig = {
        background: '#0f172a', color: '#f1f5f9', confirmButtonColor: '#0891b2', cancelButtonColor: '#1e293b',
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('settings.update'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                MySwal.fire({
                    icon: 'success', title: 'Berhasil!', text: 'Identitas kantor telah diperbarui.',
                    timer: 2000, showConfirmButton: false, ...toastConfig
                });
            }
        });
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setData('logo', file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleDeleteLogo = () => {
        MySwal.fire({
            title: 'Hapus Logo?', text: "Logo yang dihapus tidak dapat dikembalikan!", icon: 'warning',
            showCancelButton: true, confirmButtonText: 'Ya, Hapus!', cancelButtonText: 'Batal', reverseButtons: true, ...toastConfig
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('settings.logo.delete'), {
                    preserveScroll: true,
                    onSuccess: () => {
                        setPreview(null); setData('logo', null);
                        MySwal.fire({ title: 'Terhapus!', text: 'Logo berhasil dihapus.', icon: 'success', timer: 1500, showConfirmButton: false, ...toastConfig });
                    }
                });
            }
        });
    };

    const addStaff = () => {
        setData('staff_data', [...data.staff_data, { name: '', position: '', phone: '' }]);
    };

    const removeStaff = (index: number) => {
        const newData = [...data.staff_data];
        newData.splice(index, 1);
        setData('staff_data', newData);
    };

    const handleStaffChange = (index: number, field: string, value: string) => {
        const newData = [...data.staff_data];
        newData[index] = { ...newData[index], [field]: value };
        setData('staff_data', newData);
    };

    const inputClasses = "mt-1 block w-full rounded-2xl bg-[#09090b] border border-[#27272a] text-slate-200 placeholder-slate-600 shadow-inner focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm py-3.5 px-4 transition-all outline-none hover:bg-[#09090b]/80";
    const labelClasses = "block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1";
    const sectionTitle = "text-lg font-black text-white mb-6 flex items-center gap-3 border-b border-[#27272a] pb-4 uppercase tracking-wide";

    return (
        <AppLayout breadcrumbs={[{ title: 'Pengaturan', href: '/office-settings' }]}>
            <Head title="Identitas Kantor" />
            <div className="min-h-screen bg-gray-50 dark:bg-black font-sans transition-colors duration-300 p-4 lg:p-8">
                <div className="npm install -g npm@11.13.0">
                    <div className="mb-8 flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Identitas Kantor</h1>
                            <p className="text-slate-500 mt-1">Kelola informasi profil, logo, dan rekening kantor Anda.</p>
                        </div>
                    </div>

                    <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* PANEL KIRI: LOGO (TETAP SAMA) */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-slate-950 rounded-[2rem] p-8 border border-slate-800/50 shadow-2xl relative overflow-hidden text-center transition-all hover:border-slate-700">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
                                <h3 className="text-white font-bold text-lg mb-6 relative z-10 tracking-tight">Logo Kantor</h3>

                                <div className="relative group mx-auto w-48 h-48 mb-6">
                                    <div className={`w-full h-full rounded-full border-4 border-slate-800 overflow-hidden flex items-center justify-center bg-slate-900 shadow-2xl transition-all duration-300 group-hover:border-cyan-500/50 ${!preview ? 'border-dashed' : ''}`}>
                                        {preview ? <img src={preview} alt="Logo" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" /> : <div className="text-center p-4"><span className="text-5xl mb-2 block animate-pulse">🏛️</span><p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">No Logo</p></div>}
                                        <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-[4px]">
                                            <svg className="w-10 h-10 text-cyan-400 mb-2 transform -translate-y-2 group-hover:translate-y-0 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                            <span className="text-white text-[10px] font-black uppercase tracking-widest">Update Logo</span>
                                        </div>
                                        <input type="file" accept="image/*" onChange={handleLogoChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                    </div>
                                </div>
                                <div className="space-y-4 relative z-10">
                                    {errors.logo && <div className="text-red-400 text-[10px] font-bold bg-red-950/40 p-3 rounded-xl border border-red-900/50 animate-shake">{errors.logo}</div>}
                                    {company.logo_path && (
                                        <button type="button" onClick={handleDeleteLogo} className="w-full py-3 text-[11px] font-black uppercase tracking-widest text-red-400 hover:text-white border border-red-900/30 hover:bg-red-600 rounded-xl transition-all flex items-center justify-center gap-2 group">
                                            <svg className="w-4 h-4 group-hover:animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            Hapus Logo
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* PANEL KANAN: FORM DATA */}
                        <div className="lg:col-span-8">
                            <div className="bg-slate-950 rounded-[2rem] p-8 lg:p-12 border border-slate-800/50 shadow-2xl relative overflow-hidden transition-all hover:border-slate-700">
                                <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

                                <div className="relative z-10 space-y-12">
                                    {/* SECTION 1 */}
                                    <div className="group animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                                        <h3 className={sectionTitle}><span className="w-2 h-6 bg-indigo-500 rounded-full group-hover:scale-y-125 transition-transform"></span> Informasi Dasar</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <label className={labelClasses}>Nama Kantor</label>
                                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className={inputClasses} placeholder="KANTOR NOTARIS..." />
                                                {errors.name && <p className="text-red-500 text-[10px] mt-1">{errors.name}</p>}
                                            </div>
                                            <div>
                                                <label className={labelClasses}>Nama Pejabat Lengkap</label>
                                                <input type="text" value={data.notary_name} onChange={e => setData('notary_name', e.target.value)} className={inputClasses} placeholder="Orista Miranti..." />
                                                {errors.notary_name && <p className="text-red-500 text-[10px] mt-1">{errors.notary_name}</p>}
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className={labelClasses}>Nomor SK Pejabat</label>
                                                <input type="text" value={data.sk_number} onChange={e => setData('sk_number', e.target.value)} className={inputClasses} placeholder="Contoh: AHU-111.AH.02.01. TAHUN 2026" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECTION 2 */}
                                    <div className="group animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                                        <h3 className={sectionTitle}><span className="w-2 h-6 bg-cyan-500 rounded-full group-hover:scale-y-125 transition-transform"></span> Kontak & Alamat</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                                            <div>
                                                <label className={labelClasses}>No. Telepon / WhatsApp</label>
                                                <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} className={inputClasses} placeholder="0812..." />
                                            </div>
                                            <div>
                                                <label className={labelClasses}>Email Resmi</label>
                                                <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className={inputClasses} placeholder="admin@kantor.com" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Alamat Lengkap Kantor</label>
                                            <textarea rows={3} value={data.address} onChange={e => setData('address', e.target.value)} className={`${inputClasses} resize-none`} placeholder="Jalan Sudirman No. 50..."></textarea>
                                        </div>
                                    </div>

                                    {/* SECTION 3 */}
                                    <div className="group animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                                        <h3 className={sectionTitle}><span className="w-2 h-6 bg-emerald-500 rounded-full group-hover:scale-y-125 transition-transform"></span> Rekening Pembayaran</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div>
                                                <label className={labelClasses}>Nama Bank</label>
                                                <input type="text" value={data.bank_name} onChange={e => setData('bank_name', e.target.value)} className={`${inputClasses} border-emerald-900/30 focus:border-emerald-500 focus:ring-emerald-500`} placeholder="BTN" />
                                            </div>
                                            <div>
                                                <label className={labelClasses}>No. Rekening</label>
                                                <input type="text" value={data.account_number} onChange={e => setData('account_number', e.target.value)} className={`${inputClasses} border-emerald-900/30 font-mono tracking-wider focus:border-emerald-500 focus:ring-emerald-500`} placeholder="1100188..." />
                                            </div>
                                            <div>
                                                <label className={labelClasses}>Atas Nama</label>
                                                <input type="text" value={data.account_name} onChange={e => setData('account_name', e.target.value)} className={`${inputClasses} border-emerald-900/30 focus:border-emerald-500 focus:ring-emerald-500`} placeholder="Nurain Septiani..." />
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECTION 4: DATA STAFF NOTARIS */}
                                    <div className="group animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                                        <h3 className={sectionTitle}><span className="w-2 h-6 bg-purple-500 rounded-full group-hover:scale-y-125 transition-transform"></span> <Users className="text-purple-500" size={20}/> Data Staff Notaris</h3>
                                        <div className="space-y-4 bg-[#18181b]/50 p-6 rounded-3xl border border-[#27272a]">
                                            {data.staff_data.map((staff, index) => (
                                                <div key={index} className="flex flex-col md:flex-row gap-4 items-start md:items-end">
                                                    <div className="flex-1 w-full">
                                                        <label className={labelClasses}>Nama Lengkap</label>
                                                        <input type="text" value={staff.name} onChange={e => handleStaffChange(index, 'name', e.target.value)} className={inputClasses} placeholder="Nama staff..." />
                                                    </div>
                                                    <div className="flex-1 w-full">
                                                        <label className={labelClasses}>Posisi / Jabatan</label>
                                                        <input type="text" value={staff.position} onChange={e => handleStaffChange(index, 'position', e.target.value)} className={inputClasses} placeholder="Contoh: Staff Admin..." />
                                                    </div>
                                                    <div className="flex-1 w-full">
                                                        <label className={labelClasses}>No. HP / WA</label>
                                                        <input type="text" value={staff.phone || ''} onChange={e => handleStaffChange(index, 'phone', e.target.value)} className={inputClasses} placeholder="0812..." />
                                                    </div>
                                                    <button type="button" onClick={() => removeStaff(index)} className="p-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-sm w-full md:w-auto flex justify-center mt-2 md:mt-0">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button type="button" onClick={addStaff} className="w-full py-4 border border-dashed border-[#27272a] text-slate-400 hover:border-purple-500 hover:text-purple-400 rounded-2xl text-[11px] font-bold uppercase tracking-widest flex justify-center items-center gap-2 transition-all hover:bg-purple-500/5">
                                                <PlusCircle size={16}/> Tambah Data Staff
                                            </button>
                                        </div>
                                    </div>

                                    {/* ACTION BUTTON */}
                                    <div className="pt-10 border-t border-[#27272a] flex justify-end items-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                                        <span className="text-[10px] text-slate-500 font-medium hidden md:block uppercase tracking-widest bg-[#18181b] px-3 py-1.5 rounded-lg border border-[#27272a]">Perubahan langsung diterapkan pada sistem</span>
                                        <button type="submit" disabled={processing} className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2">
                                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
