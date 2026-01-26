import { useState, useEffect, FormEventHandler } from 'react';
import AppLayout from '@/layouts/app-layout';
import InputError from '@/components/ui/input-error';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { route } from 'ziggy-js';

// Interface Data
interface Props extends PageProps {
    order: any;
    clients: any[];
    serviceTypes: any[];
}

export default function OrderEdit({ auth, order, clients, serviceTypes }: Props) {
    const [isPpat, setIsPpat] = useState(false);

    // 1. FORM UTAMA (Untuk Edit Data Order)
    const { data, setData, put, processing, errors } = useForm({
        client_id: order.client_id,
        service_id: order.service_id,
        description: order.description || '',
        akta_date: order.akta_date || '',
        status: order.status,
        service_price: order.service_price,
        tax_deposit: order.tax_deposit,
        // Detail PPAT
        seller_name: order.ppat_detail?.seller_name || '',
        buyer_name: order.ppat_detail?.buyer_name || '',
        certificate_number: order.ppat_detail?.certificate_number || '',
        object_address: order.ppat_detail?.object_address || '',
        land_area: order.ppat_detail?.land_area || 0,
        building_area: order.ppat_detail?.building_area || 0,
        njop: order.ppat_detail?.njop || 0,
        transaction_value: order.ppat_detail?.transaction_value || 0,
        ssp_amount: order.ppat_detail?.ssp_amount || 0,
        ssb_amount: order.ppat_detail?.ssb_amount || 0,
    });

    // 2. FORM UPLOAD (Update: Menambahkan Kategori)
    const {
        data: uploadData,
        setData: setUploadData,
        post: postUpload,
        processing: uploading,
        reset: resetUpload,
        errors: uploadErrors
    } = useForm({
        file_name: '',
        category: 'requirement', // Default: Berkas Persyaratan
        file: null as File | null,
    });

    // Logic Deteksi PPAT
    useEffect(() => {
        let foundType = null;
        serviceTypes.forEach(type => {
            const svc = type.services.find((s: any) => s.id === Number(data.service_id));
            if (svc) foundType = type;
        });
        setIsPpat(foundType?.slug === 'ppat');
    }, [data.service_id]);

    // Submit Perubahan Data Order
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('orders.update', order.id));
    };

    // Submit Upload File
    const handleUpload: FormEventHandler = (e) => {
        e.preventDefault();
        postUpload(route('orders.upload', order.id), {
            onSuccess: () => resetUpload(),
            preserveScroll: true,
        });
    };

    // Hapus File
    const deleteFile = (fileId: number) => {
        if (confirm('Yakin ingin menghapus dokumen ini?')) {
            router.delete(route('orders.deleteFile', fileId), {
                preserveScroll: true
            });
        }
    };

    // Helper URL File
    const getFileUrl = (path: string) => {
        return '/storage/' + path.replace('public/', '');
    };

    // Definisi Kategori
    const CATEGORIES = [
        { id: 'requirement', label: '📂 Berkas Persyaratan', desc: 'KTP, KK, PBB, Sertifikat' },
        { id: 'draft', label: '📝 Draft Akta', desc: 'Konsep awal & Revisi' },
        { id: 'final', label: '⚖️ Produk Hukum', desc: 'Minuta, Salinan, Kwitansi' },
    ];

    // Styles
    const inputClasses = "mt-1 block w-full rounded-xl bg-slate-900/60 border border-slate-800 text-slate-100 placeholder-slate-500 shadow-sm backdrop-blur-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 sm:text-sm transition-all duration-300 py-3 px-4";
    const labelClasses = "block text-sm font-medium text-slate-300 mb-1 tracking-wide";
    const sectionTitle = "text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 mb-4 border-b border-slate-800 pb-2";

    return (
        <AppLayout breadcrumbs={[{ title: 'Order', href: '/orders' }, { title: `Edit #${order.order_number}`, href: '#' }]}>
            <Head title="Edit Pekerjaan" />

            <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8 font-sans">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* KOLOM KIRI: FORM UTAMA */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800">Detail Pekerjaan</h1>
                                <p className="text-slate-500 text-sm">Update data dan status pengerjaan.</p>
                            </div>
                            <Link href={route('orders.index')} className="px-4 py-2 text-sm font-bold text-white bg-slate-800 rounded-lg hover:bg-slate-700">
                                &larr; Kembali
                            </Link>
                        </div>

                        <div className="relative overflow-hidden bg-slate-950 p-8 rounded-[2rem] border border-slate-800/50 shadow-2xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

                            <form onSubmit={submit} className="relative z-10 space-y-8">
                                {/* Status Bar */}
                                <div className="bg-slate-900/80 p-6 rounded-2xl border border-dashed border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-cyan-400 font-bold text-lg">Status Pengerjaan</h3>
                                        <p className="text-slate-400 text-sm">Update posisi berkas saat ini.</p>
                                    </div>
                                    <div className="w-full md:w-1/3">
                                        <select
                                            value={data.status}
                                            onChange={e => setData('status', e.target.value)}
                                            className={`${inputClasses} bg-slate-800 border-cyan-900 focus:border-cyan-500 font-bold text-cyan-50`}
                                        >
                                            <option value="new">🆕 Baru Masuk</option>
                                            <option value="draft">📝 Drafting Akta</option>
                                            <option value="process">⚙️ Proses (BPN/Instansi)</option>
                                            <option value="minuta">✅ Tanda Tangan (Minuta)</option>
                                            <option value="done">🎉 Selesai (Salinan Diambil)</option>
                                            <option value="cancel">❌ Batal</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Section 1: Info */}
                                <div>
                                    <h3 className={sectionTitle}>1. Informasi & Layanan</h3>
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className={labelClasses}>Klien</label>
                                                <select value={data.client_id} onChange={e => setData('client_id', e.target.value)} className={inputClasses}>
                                                    {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className={labelClasses}>Layanan</label>
                                                <select value={data.service_id} onChange={e => setData('service_id', e.target.value)} className={inputClasses}>
                                                    {serviceTypes.map((type: any) => (
                                                        <optgroup key={type.id} label={type.name}>
                                                            {type.services.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                        </optgroup>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Judul / Keterangan</label>
                                            <input type="text" value={data.description} onChange={e => setData('description', e.target.value)} className={inputClasses} />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: PPAT */}
                                {isPpat && (
                                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                                        <h3 className={sectionTitle}>2. Detail PPAT</h3>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <input placeholder="Penjual" value={data.seller_name} onChange={e => setData('seller_name', e.target.value)} className={inputClasses} />
                                            <input placeholder="Pembeli" value={data.buyer_name} onChange={e => setData('buyer_name', e.target.value)} className={inputClasses} />
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <input placeholder="No. Sertifikat" value={data.certificate_number} onChange={e => setData('certificate_number', e.target.value)} className={inputClasses} />
                                            <input placeholder="Alamat Objek" value={data.object_address} onChange={e => setData('object_address', e.target.value)} className={`${inputClasses} col-span-2`} />
                                        </div>
                                    </div>
                                )}

                                {/* Section 3: Biaya */}
                                <div>
                                    <h3 className={sectionTitle}>3. Biaya (Billing)</h3>
                                    <div className="grid grid-cols-3 gap-6">
                                        <div>
                                            <label className="text-xs text-slate-400">Jasa Notaris</label>
                                            <input type="number" value={data.service_price} onChange={e => setData('service_price', Number(e.target.value))} className={inputClasses} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400">Titipan Biaya</label>
                                            <input type="number" value={data.tax_deposit} onChange={e => setData('tax_deposit', Number(e.target.value))} className={inputClasses} />
                                        </div>
                                        <div className="bg-slate-900 rounded-xl p-2 border border-slate-700 flex flex-col justify-center items-end px-4">
                                            <span className="text-xs text-slate-400">Total</span>
                                            <span className="text-xl font-bold text-white">
                                                { (Number(data.service_price) + Number(data.tax_deposit)).toLocaleString('id-ID') }
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-slate-800">
                                    <button type="submit" disabled={processing} className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all">
                                        {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* KOLOM KANAN: ARSIP DIGITAL (DENGAN KATEGORI) */}
                    <div className="space-y-6">

                        {/* Cetak */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="font-bold text-slate-800 mb-4">Cetak Dokumen</h3>
                            <a href={route('orders.invoice', order.id)} target="_blank" className="flex items-center justify-center gap-2 w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition">
                                🖨️ Cetak Invoice / Tagihan
                            </a>
                        </div>

                        {/* Arsip Digital */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-fit">
                            <h3 className="font-bold text-slate-800 mb-1">Arsip Digital</h3>
                            <p className="text-xs text-slate-500 mb-4">Upload scan KTP, Sertifikat, dll.</p>

                            {/* LIST FILE TERKELOMPOK */}
                            <div className="space-y-6 mb-6">
                                {CATEGORIES.map(cat => {
                                    // Filter file sesuai kategori
                                    const filesInCat = order.files.filter((f:any) => f.category === cat.id || (cat.id === 'requirement' && !f.category));

                                    return (
                                        <div key={cat.id}>
                                            <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-100">
                                                <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{cat.label}</h4>
                                                <span className="bg-slate-100 text-slate-500 text-[10px] px-1.5 rounded-full font-bold">{filesInCat.length}</span>
                                            </div>

                                            {filesInCat.length === 0 ? (
                                                <p className="text-[10px] text-slate-400 italic pl-1">Kosong.</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {filesInCat.map((file:any) => (
                                                        <div key={file.id} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-100 group hover:border-cyan-200 transition-colors">
                                                            <a href={getFileUrl(file.file_path)} target="_blank" className="flex items-center gap-2 overflow-hidden w-full">
                                                                <span className="text-lg">📄</span>
                                                                <div className="flex flex-col min-w-0">
                                                                    <span className="text-xs font-bold text-slate-700 truncate group-hover:text-cyan-600">{file.file_name}</span>
                                                                    <span className="text-[9px] text-slate-400">{new Date(file.created_at).toLocaleDateString()}</span>
                                                                </div>
                                                            </a>
                                                            <button onClick={() => deleteFile(file.id)} className="text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition">
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            {/* FORM UPLOAD (Dengan Dropdown Kategori) */}
                            <form onSubmit={handleUpload} className="mt-auto pt-4 border-t border-slate-100 bg-slate-50 p-4 rounded-xl">
                                <h4 className="text-xs font-bold text-slate-700 mb-3">Upload Dokumen Baru</h4>
                                <div className="space-y-3">
                                    {/* Input Nama */}
                                    <input
                                        type="text"
                                        value={uploadData.file_name}
                                        onChange={e => setUploadData('file_name', e.target.value)}
                                        placeholder="Nama Dokumen (Cth: KTP)"
                                        className="w-full text-xs rounded-lg border-slate-300 focus:border-cyan-500 focus:ring-cyan-500"
                                        required
                                    />

                                    {/* Input Kategori (BARU) */}
                                    <select
                                        value={uploadData.category}
                                        onChange={e => setUploadData('category', e.target.value)}
                                        className="w-full text-xs rounded-lg border-slate-300 focus:border-cyan-500 focus:ring-cyan-500 bg-white"
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                                        ))}
                                    </select>

                                    {/* Input File */}
                                    <input
                                        type="file"
                                        onChange={e => setUploadData('file', e.target.files ? e.target.files[0] : null)}
                                        className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-cyan-100 file:text-cyan-700 hover:file:bg-cyan-200"
                                        required
                                    />
                                    <InputError message={uploadErrors.file} className="mt-1" />

                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="w-full py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700 transition flex justify-center items-center gap-2"
                                    >
                                        {uploading ? 'Mengunggah...' : '⬆ Upload Sekarang'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
