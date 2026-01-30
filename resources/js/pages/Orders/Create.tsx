import { useState, useEffect, FormEventHandler } from 'react';
import AppLayout from '@/layouts/app-layout';
import InputError from '@/components/ui/input-error';
import { Head, useForm, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { route } from 'ziggy-js';

// Definisi Tipe Data
interface Service {
    id: number;
    name: string;
    code: string;
    default_price: number;
    service_type_id: number;
}

interface ServiceType {
    id: number;
    name: string;
    slug: string;
    services: Service[];
}

interface Client {
    id: number;
    name: string;
    nik_or_npwp: string;
}

interface Props extends PageProps {
    clients: Client[];
    serviceTypes: ServiceType[];
}

export default function OrderCreate({ auth, clients, serviceTypes }: Props) {
    const [isPpat, setIsPpat] = useState(false);

    // Form Handling
    const { data, setData, post, processing, errors } = useForm({
        client_id: '',
        service_id: '',
        description: '',
        akta_date: '',
        service_price: 0,
        tax_deposit: 0,
        seller_name: '',
        buyer_name: '',
        certificate_number: '',
        object_address: '',
        land_area: 0,
        building_area: 0,
        njop: 0,
        transaction_value: 0,
        ssp_amount: 0,
        ssb_amount: 0,
    });

    useEffect(() => {
        let foundType = null;
        for (const type of serviceTypes) {
            const svc = type.services.find(s => s.id === Number(data.service_id));
            if (svc) {
                foundType = type;
                break;
            }
        }
        setIsPpat(foundType?.slug === 'ppat' || false);
    }, [data.service_id]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('orders.store'));
    };

    // --- STYLE UPDATE: COMPACT & FULL ---
    // Menggunakan text-sm dan py-2.5 agar tidak terlalu "bongsor" tapi tetap jelas
    const inputClasses = "mt-1 block w-full rounded-xl bg-slate-900/60 border border-slate-800 text-slate-100 placeholder-slate-500 shadow-sm backdrop-blur-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm py-2.5 px-4 hover:bg-slate-900/80 transition-all";
    const labelClasses = "block text-xs font-bold text-slate-400 mb-1.5 tracking-wide uppercase";
    const sectionTitle = "text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-2";

    const rupiah = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

    return (
        <AppLayout breadcrumbs={[{ title: 'Order', href: '/orders' }, { title: 'Buat Baru', href: '#' }]}>
            <Head title="Buat Order Baru" />

            <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8 font-sans">
                {/* WADAH FULL WIDTH (w-full) */}
                <div className="w-full">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Buat Pekerjaan Baru</h1>
                            <p className="text-slate-500 text-sm mt-1">Isi formulir di bawah untuk mendaftarkan order masuk.</p>
                        </div>
                        <Link
                            href={route('orders.index')}
                            className="px-5 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-sm"
                        >
                            &larr; Kembali
                        </Link>
                    </div>

                    {/* FORM CONTAINER (Premium Dark Mode) */}
                    <div className="relative overflow-hidden bg-slate-950 p-8 rounded-[1.5rem] border border-slate-800/50 shadow-2xl">

                        {/* Dekorasi Background */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

                        <form onSubmit={submit} className="relative z-10 space-y-8">

                            {/* SECTION 1: INFO DASAR (GRID 3 KOLOM) */}
                            {/* Inputan berjajar ke samping agar tidak terlalu panjang */}
                            <div>
                                <h3 className={sectionTitle}>
                                    <span className="w-2 h-6 bg-cyan-500 rounded-full"></span>
                                    1. Informasi Pekerjaan
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Pilih Klien */}
                                    <div>
                                        <label className={labelClasses}>Klien Utama</label>
                                        <select value={data.client_id} onChange={e => setData('client_id', e.target.value)} className={inputClasses}>
                                            <option value="">-- Pilih Klien --</option>
                                            {clients.map(client => (
                                                <option key={client.id} value={client.id}>{client.name} - {client.nik_or_npwp}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.client_id} className="mt-1" />
                                    </div>

                                    {/* Pilih Layanan */}
                                    <div>
                                        <label className={labelClasses}>Jenis Layanan</label>
                                        <select value={data.service_id} onChange={e => setData('service_id', e.target.value)} className={inputClasses}>
                                            <option value="">-- Pilih Layanan --</option>
                                            {serviceTypes.map(type => (
                                                <optgroup key={type.id} label={type.name}>
                                                    {type.services.map(service => (
                                                        <option key={service.id} value={service.id}>{service.name}</option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                        <InputError message={errors.service_id} className="mt-1" />
                                    </div>

                                    {/* Judul / Keterangan */}
                                    <div>
                                        <label className={labelClasses}>Judul / Keterangan (Opsional)</label>
                                        <input type="text" value={data.description} onChange={e => setData('description', e.target.value)} className={inputClasses} placeholder="Keterangan singkat..." />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: DETAIL PPAT (GRID 4 KOLOM) */}
                            {isPpat && (
                                <div className="animate-fade-in-down bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                                    <h3 className="text-sm font-bold text-indigo-400 mb-4 flex items-center gap-2">
                                        <span className="text-xl">🏛️</span> Detail Objek (PPAT)
                                    </h3>

                                    {/* Baris 1: Pihak & Objek */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                        <div className="md:col-span-1">
                                            <label className={labelClasses}>Penjual</label>
                                            <input type="text" value={data.seller_name} onChange={e => setData('seller_name', e.target.value)} className={inputClasses} />
                                        </div>
                                        <div className="md:col-span-1">
                                            <label className={labelClasses}>Pembeli</label>
                                            <input type="text" value={data.buyer_name} onChange={e => setData('buyer_name', e.target.value)} className={inputClasses} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className={labelClasses}>Alamat Objek</label>
                                            <input type="text" value={data.object_address} onChange={e => setData('object_address', e.target.value)} className={inputClasses} />
                                        </div>
                                    </div>

                                    {/* Baris 2: Angka Teknis */}
                                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                                        <div className="md:col-span-2">
                                            <label className={labelClasses}>No. Sertifikat</label>
                                            <input type="text" value={data.certificate_number} onChange={e => setData('certificate_number', e.target.value)} className={inputClasses} />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Luas (m²)</label>
                                            <input type="number" value={data.land_area} onChange={e => setData('land_area', Number(e.target.value))} className={inputClasses} />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>NJOP</label>
                                            <input type="number" value={data.njop} onChange={e => setData('njop', Number(e.target.value))} className={inputClasses} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className={labelClasses}>Nilai Transaksi</label>
                                            <input type="number" value={data.transaction_value} onChange={e => setData('transaction_value', Number(e.target.value))} className={inputClasses} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SECTION 3: KEUANGAN (GRID 3 KOLOM PROPORSIONAL) */}
                            <div>
                                <h3 className={sectionTitle}>
                                    <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                                    {isPpat ? '3. Biaya & Tagihan' : '2. Rincian Tagihan'}
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                                    {/* Input Biaya */}
                                    <div>
                                        <label className={labelClasses}>Jasa Notaris/PPAT (Rp)</label>
                                        <input type="number" value={data.service_price} onChange={e => setData('service_price', Number(e.target.value))} className={`${inputClasses} font-bold text-emerald-300`} />
                                        <InputError message={errors.service_price} className="mt-1" />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Titipan Biaya (Pajak/PNBP)</label>
                                        <input type="number" value={data.tax_deposit} onChange={e => setData('tax_deposit', Number(e.target.value))} className={inputClasses} />
                                    </div>

                                    {/* Total Tagihan (Tampil Beda) */}
                                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-3 px-6 border border-slate-700 flex flex-col justify-center h-[52px]">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Tagihan</span>
                                            <span className="text-xl font-black text-white tracking-tight">
                                                {rupiah(Number(data.service_price) + Number(data.tax_deposit))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* FOOTER ACTIONS */}
                            <div className="flex justify-end pt-6 border-t border-slate-800">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/20 transition-all hover:-translate-y-0.5 transform active:scale-95"
                                >
                                    {processing ? 'Menyimpan...' : '💾 Simpan Pekerjaan'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
