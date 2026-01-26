import { useState, useEffect, FormEventHandler } from 'react';
import AppLayout from '@/layouts/app-layout';
import InputError from '@/components/ui/input-error';
import { Head, useForm, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { route } from 'ziggy-js';

// Definisi Tipe Data (Sesuai Database)
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
    // State untuk deteksi apakah layanan yang dipilih adalah PPAT
    const [isPpat, setIsPpat] = useState(false);

    // Form Handling
    const { data, setData, post, processing, errors } = useForm({
        client_id: '',
        service_id: '',
        description: '',
        akta_date: '',

        // Keuangan
        service_price: 0,
        tax_deposit: 0, // Titipan Pajak

        // Detail PPAT (Default null/kosong)
        seller_name: '',
        buyer_name: '',
        certificate_number: '',
        object_address: '',
        land_area: 0,
        building_area: 0,
        njop: 0,
        transaction_value: 0,
        ssp_amount: 0, // PPH
        ssb_amount: 0, // BPHTB
    });

    // LOGIC: Deteksi perubahan Layanan
    useEffect(() => {
        // Cari layanan yang dipilih di dalam list
        let foundType = null;
        let foundService = null;

        for (const type of serviceTypes) {
            const svc = type.services.find(s => s.id === Number(data.service_id));
            if (svc) {
                foundType = type;
                foundService = svc;
                break;
            }
        }

        if (foundType && foundType.slug === 'ppat') {
            setIsPpat(true);
        } else {
            setIsPpat(false);
        }

        // Auto set harga default jika ada
        if (foundService) {
             // Opsional: Bisa auto-fill harga jika mau
             // setData('service_price', foundService.default_price);
        }

    }, [data.service_id]);


    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('orders.store'));
    };

    // --- STYLES (Konsisten dengan Dark Mode Futuristik) ---
    const inputClasses = "mt-1 block w-full rounded-xl bg-slate-900/60 border border-slate-800 text-slate-100 placeholder-slate-500 shadow-sm backdrop-blur-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 sm:text-sm transition-all duration-300 py-3 px-4";
    const labelClasses = "block text-sm font-medium text-slate-300 mb-1 tracking-wide";
    const sectionTitle = "text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 mb-4 border-b border-slate-800 pb-2";

    return (
        <AppLayout breadcrumbs={[{ title: 'Order', href: '/orders' }, { title: 'Buat Baru', href: '#' }]}>
            <Head title="Buat Order Baru" />

            <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8 font-sans">
                <div className="max-w-5xl mx-auto">

                    {/* Header Page */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Buat Pekerjaan Baru</h1>
                            <p className="text-slate-500 text-sm mt-1">Isi formulir di bawah untuk mendaftarkan order masuk.</p>
                        </div>
                        <Link
                            href={route('orders.index')}
                            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                        >
                            &larr; Kembali
                        </Link>
                    </div>

                    {/* FORM CONTAINER (Futuristik) */}
                    <div className="relative overflow-hidden bg-slate-950 p-8 rounded-[2rem] border border-slate-800/50 shadow-2xl">

                        {/* Dekorasi Background */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

                        <form onSubmit={submit} className="relative z-10 space-y-8">

                            {/* SECTION 1: INFO DASAR */}
                            <div>
                                <h3 className={sectionTitle}>1. Informasi Pekerjaan</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Pilih Klien */}
                                    <div>
                                        <label className={labelClasses}>Klien Utama</label>
                                        <select
                                            value={data.client_id}
                                            onChange={e => setData('client_id', e.target.value)}
                                            className={inputClasses}
                                        >
                                            <option value="">-- Pilih Klien --</option>
                                            {clients.map(client => (
                                                <option key={client.id} value={client.id}>
                                                    {client.name} - {client.nik_or_npwp}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.client_id} className="mt-2" />
                                    </div>

                                    {/* Pilih Layanan (Grouped by Type) */}
                                    <div>
                                        <label className={labelClasses}>Jenis Layanan</label>
                                        <select
                                            value={data.service_id}
                                            onChange={e => setData('service_id', e.target.value)}
                                            className={inputClasses}
                                        >
                                            <option value="">-- Pilih Layanan --</option>
                                            {serviceTypes.map(type => (
                                                <optgroup key={type.id} label={type.name}>
                                                    {type.services.map(service => (
                                                        <option key={service.id} value={service.id}>
                                                            {service.name}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                        <InputError message={errors.service_id} className="mt-2" />
                                    </div>

                                    {/* Judul / Keterangan */}
                                    <div className="md:col-span-2">
                                        <label className={labelClasses}>Judul / Keterangan (Opsional)</label>
                                        <input
                                            type="text"
                                            value={data.description}
                                            onChange={e => setData('description', e.target.value)}
                                            className={inputClasses}
                                            placeholder="Contoh: Jual Beli Tanah di Jl. Sudirman No. 5"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: DETAIL KHUSUS PPAT (Hanya Muncul Jika PPAT) */}
                            {isPpat && (
                                <div className="animate-fade-in-down bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                                    <h3 className={sectionTitle}>2. Detail PPAT & Objek</h3>

                                    {/* Para Pihak */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className={labelClasses}>Pihak Yang Mengalihkan (Penjual)</label>
                                            <textarea
                                                rows={2}
                                                value={data.seller_name}
                                                onChange={e => setData('seller_name', e.target.value)}
                                                className={inputClasses}
                                                placeholder="Nama Penjual..."
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Pihak Yang Menerima (Pembeli)</label>
                                            <textarea
                                                rows={2}
                                                value={data.buyer_name}
                                                onChange={e => setData('buyer_name', e.target.value)}
                                                className={inputClasses}
                                                placeholder="Nama Pembeli..."
                                            />
                                        </div>
                                    </div>

                                    {/* Data Objek */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className={labelClasses}>Nomor Sertifikat / Hak</label>
                                            <input
                                                type="text"
                                                value={data.certificate_number}
                                                onChange={e => setData('certificate_number', e.target.value)}
                                                className={inputClasses}
                                                placeholder="Contoh: SHM No. 1234"
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Luas Tanah (m²)</label>
                                            <input
                                                type="number"
                                                value={data.land_area}
                                                onChange={e => setData('land_area', Number(e.target.value))}
                                                className={inputClasses}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>NJOP (Rp)</label>
                                            <input
                                                type="number"
                                                value={data.njop}
                                                onChange={e => setData('njop', Number(e.target.value))}
                                                className={inputClasses}
                                            />
                                        </div>
                                        <div className="md:col-span-3">
                                            <label className={labelClasses}>Alamat / Letak Objek</label>
                                            <input
                                                type="text"
                                                value={data.object_address}
                                                onChange={e => setData('object_address', e.target.value)}
                                                className={inputClasses}
                                                placeholder="Kelurahan, Kecamatan..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* SECTION 3: KEUANGAN */}
                            <div>
                                <h3 className={sectionTitle}>
                                    {isPpat ? '3. Nilai Transaksi & Biaya' : '2. Biaya Layanan'}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {isPpat && (
                                        <>
                                            <div>
                                                <label className={labelClasses}>Harga Transaksi (Real)</label>
                                                <input
                                                    type="number"
                                                    value={data.transaction_value}
                                                    onChange={e => setData('transaction_value', Number(e.target.value))}
                                                    className={inputClasses}
                                                />
                                            </div>
                                            <div>
                                                <label className={labelClasses}>Setoran PPH (Final)</label>
                                                <input
                                                    type="number"
                                                    value={data.ssp_amount}
                                                    onChange={e => setData('ssp_amount', Number(e.target.value))}
                                                    className={inputClasses}
                                                />
                                            </div>
                                            <div>
                                                <label className={labelClasses}>Setoran BPHTB (SSB)</label>
                                                <input
                                                    type="number"
                                                    value={data.ssb_amount}
                                                    onChange={e => setData('ssb_amount', Number(e.target.value))}
                                                    className={inputClasses}
                                                />
                                            </div>
                                            <div className="col-span-3 border-t border-slate-800 my-2"></div>
                                        </>
                                    )}

                                    {/* Biaya Jasa Kantor */}
                                    <div>
                                        <label className={`${labelClasses} text-cyan-400 font-bold`}>Jasa Notaris/PPAT (Honor)</label>
                                        <input
                                            type="number"
                                            value={data.service_price}
                                            onChange={e => setData('service_price', Number(e.target.value))}
                                            className={`${inputClasses} border-cyan-500/50`}
                                        />
                                        <InputError message={errors.service_price} className="mt-2" />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Titipan Biaya (Pajak/PNBP)</label>
                                        <input
                                            type="number"
                                            value={data.tax_deposit}
                                            onChange={e => setData('tax_deposit', Number(e.target.value))}
                                            className={inputClasses}
                                        />
                                    </div>

                                    {/* Total Kalkulasi Otomatis */}
                                    <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 flex flex-col justify-center items-end">
                                        <span className="text-sm text-slate-400">Total Tagihan ke Klien</span>
                                        <span className="text-2xl font-bold text-white">
                                            Rp { (Number(data.service_price) + Number(data.tax_deposit)).toLocaleString('id-ID') }
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* FOOTER ACTIONS */}
                            <div className="flex justify-end pt-6 border-t border-slate-800">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all hover:-translate-y-1"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Pekerjaan'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
