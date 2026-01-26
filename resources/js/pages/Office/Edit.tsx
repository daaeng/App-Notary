import { FormEventHandler } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@/types';
import { route } from 'ziggy-js';

interface Props extends PageProps {
    company: {
        name: string;
        notary_name: string;
        address: string;
        phone: string;
        email: string;
    };
}

export default function SettingsEdit({ company }: Props) {
    const { data, setData, put, processing } = useForm({
        name: company.name,
        notary_name: company.notary_name,
        address: company.address,
        phone: company.phone,
        email: company.email,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('settings.update'));
    };

    const inputClasses = "mt-1 block w-full rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 sm:text-sm py-3 px-4";
    const labelClasses = "block text-sm font-bold text-slate-700 mb-1";

    return (
        <AppLayout breadcrumbs={[{ title: 'Pengaturan', href: '/settings' }]}>
            <Head title="Pengaturan Kantor" />

            <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8 font-sans">
                <div className="max-w-3xl mx-auto">

                    <h1 className="text-2xl font-bold text-slate-800 mb-6">Pengaturan Kantor</h1>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <form onSubmit={submit} className="space-y-6">

                            {/* Nama Kantor */}
                            <div>
                                <label className={labelClasses}>Nama Kantor (Header)</label>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className={inputClasses} />
                            </div>

                            {/* Nama Pejabat */}
                            <div>
                                <label className={labelClasses}>Nama Pejabat (Notaris/PPAT)</label>
                                <input type="text" value={data.notary_name} onChange={e => setData('notary_name', e.target.value)} className={inputClasses} />
                                <p className="text-xs text-slate-500 mt-1">Nama ini akan muncul di Tanda Tangan Invoice & Laporan.</p>
                            </div>

                            {/* Kontak */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClasses}>Nomor Telepon</label>
                                    <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Email Kantor</label>
                                    <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className={inputClasses} />
                                </div>
                            </div>

                            {/* Alamat */}
                            <div>
                                <label className={labelClasses}>Alamat Lengkap</label>
                                <textarea rows={3} value={data.address} onChange={e => setData('address', e.target.value)} className={inputClasses}></textarea>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex justify-end">
                                <button type="submit" disabled={processing} className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-lg">
                                    {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>

                        </form>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
