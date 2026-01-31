import { FormEventHandler, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { route } from 'ziggy-js';

interface Props extends PageProps {
    company: {
        name: string;
        notary_name: string;
        address: string;
        phone: string;
        email: string;
        bank_account: string;
        logo_path: string | null;
    };
}

export default function OfficeEdit({ company }: Props) {
    // State Preview
    const [preview, setPreview] = useState<string | null>(
        company.logo_path ? `/storage/${company.logo_path}` : null
    );

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        name: company.name,
        notary_name: company.notary_name,
        address: company.address,
        phone: company.phone,
        email: company.email || '',
        bank_account: company.bank_account || '',
        logo: null as File | null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('settings.update'), {
            forceFormData: true,
            preserveScroll: true,
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
        if (confirm('Yakin ingin menghapus logo ini?')) {
            router.delete(route('settings.logo.delete'), {
                preserveScroll: true,
                onSuccess: () => {
                    setPreview(null);
                    setData('logo', null);
                }
            });
        }
    };

    // STYLING
    const inputClasses = "mt-1 block w-full rounded-xl bg-slate-900/50 border border-slate-700 text-slate-100 placeholder-slate-500 shadow-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm py-3 px-4 transition-all";
    const labelClasses = "block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1";
    const sectionTitle = "text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-2";

    return (
        <AppLayout breadcrumbs={[{ title: 'Pengaturan', href: '/office-settings' }]}>
            <Head title="Identitas Kantor" />

            <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8 font-sans">
                <div className="w-full">

                    <div className="mb-8 flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Identitas Kantor</h1>
                            <p className="text-slate-500 mt-1">Kelola informasi profil, logo, dan rekening kantor Anda.</p>
                        </div>
                    </div>

                    <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* === PANEL KIRI: LOGO (3 Kolom) === */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-slate-950 rounded-[1.5rem] p-8 border border-slate-800/50 shadow-2xl relative overflow-hidden text-center">
                                {/* Dekorasi */}
                                <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

                                <h3 className="text-white font-bold text-lg mb-6 relative z-10">Logo Kantor</h3>

                                <div className="relative group mx-auto w-48 h-48 mb-6">
                                    <div className={`w-full h-full rounded-full border-4 border-slate-800 overflow-hidden flex items-center justify-center bg-slate-900 shadow-inner ${!preview ? 'border-dashed' : ''}`}>
                                        {preview ? (
                                            <img src={preview} alt="Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center p-4">
                                                <span className="text-4xl">🏛️</span>
                                                <p className="text-slate-500 text-[10px] mt-2">Belum ada logo</p>
                                            </div>
                                        )}

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-[2px]">
                                            <svg className="w-8 h-8 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                            <span className="text-white text-xs font-bold uppercase tracking-wide">Ganti Logo</span>
                                        </div>

                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3 relative z-10">
                                    <p className="text-slate-500 text-xs">
                                        Format: PNG, JPG (Max 2MB).<br/>Disarankan bentuk persegi (1:1).
                                    </p>
                                    {errors.logo && <p className="text-red-400 text-xs font-bold bg-red-950/30 p-2 rounded">{errors.logo}</p>}

                                    {/* Tombol Hapus Logo */}
                                    {company.logo_path && (
                                        <button
                                            type="button"
                                            onClick={handleDeleteLogo}
                                            className="w-full py-2.5 text-xs font-bold text-red-400 hover:text-red-300 border border-red-900/30 hover:bg-red-900/20 rounded-xl transition flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            Hapus Logo
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* === PANEL KANAN: FORM DATA (9 Kolom) === */}
                        <div className="lg:col-span-8">
                            <div className="bg-slate-950 rounded-[1.5rem] p-8 lg:p-10 border border-slate-800/50 shadow-2xl relative overflow-hidden">
                                {/* Dekorasi */}
                                <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

                                <div className="relative z-10 space-y-8">

                                    {/* SECTION 1 */}
                                    <div>
                                        <h3 className={sectionTitle}>
                                            <span className="w-2 h-6 bg-cyan-500 rounded-full"></span>
                                            Informasi Dasar
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className={labelClasses}>Nama Kantor</label>
                                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className={inputClasses} placeholder="KANTOR NOTARIS..." />
                                            </div>
                                            <div>
                                                <label className={labelClasses}>Nama Pejabat (SK)</label>
                                                <input type="text" value={data.notary_name} onChange={e => setData('notary_name', e.target.value)} className={inputClasses} placeholder="Nama Lengkap & Gelar" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECTION 2 */}
                                    <div>
                                        <h3 className={sectionTitle}>
                                            <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                                            Kontak & Alamat
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                            <div>
                                                <label className={labelClasses}>No. Telepon / WhatsApp</label>
                                                <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} className={inputClasses} />
                                            </div>
                                            <div>
                                                <label className={labelClasses}>Email Resmi</label>
                                                <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className={inputClasses} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Alamat Lengkap</label>
                                            <textarea rows={2} value={data.address} onChange={e => setData('address', e.target.value)} className={inputClasses} placeholder="Jalan, Kelurahan, Kecamatan..."></textarea>
                                        </div>
                                    </div>

                                    {/* SECTION 3 */}
                                    <div>
                                        <h3 className={sectionTitle}>
                                            <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                                            Rekening Pembayaran
                                        </h3>
                                        <div>
                                            <label className={labelClasses}>Bank & No. Rekening</label>
                                            <input
                                                type="text"
                                                value={data.bank_account}
                                                onChange={e => setData('bank_account', e.target.value)}
                                                className={`${inputClasses} border-emerald-900/50 text-emerald-100 placeholder-emerald-800 focus:border-emerald-500 focus:ring-emerald-500 font-mono`}
                                                placeholder="BANK 0000-0000 A.N NAMA"
                                            />
                                        </div>
                                    </div>

                                    {/* ACTION BUTTON */}
                                    <div className="pt-6 border-t border-slate-800 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="px-10 py-4 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-cyan-900/20 transform hover:-translate-y-0.5 transition-all"
                                        >
                                            {processing ? 'Menyimpan...' : '💾 Simpan Perubahan'}
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
