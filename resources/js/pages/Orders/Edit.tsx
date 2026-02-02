import { useState, FormEventHandler } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { route } from 'ziggy-js';

// --- TIPE DATA ---
interface Props extends PageProps {
    order: any;
    clients: any[];
    serviceTypes: any[];
}

export default function OrderEdit({ auth, order, clients, serviceTypes }: Props) {
    const [isPpat, setIsPpat] = useState(false);

    // Hitung Keuangan Real-time
    const totalTagihan = Number(order.service_price) + Number(order.tax_deposit);
    const totalBayar = order.payments?.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0) || 0;
    const sisaTagihan = totalTagihan - totalBayar;
    const persentaseBayar = totalTagihan > 0 ? Math.min((totalBayar / totalTagihan) * 100, 100) : 0;

    // --- FORM DATA UTAMA ---
    const { data, setData, put, processing, errors } = useForm({
        client_id: order.client_id || '',
        service_id: order.service_id || '',
        description: order.description || '',
        akta_date: order.akta_date || '',
        status: order.status,
        service_price: order.service_price,
        tax_deposit: order.tax_deposit,

        // Data PPAT (Opsional)
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

    // --- FORM UPLOAD FILE ---
    const { data: fileData, setData: setFileData, post: postFile, processing: fileProcessing, errors: fileErrors, reset: resetFile } = useForm({
        file_name: '',
        category: 'ktp',
        file: null as File | null,
    });

    // --- ACTIONS ---
    const submitUpdate: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('orders.update', order.id));
    };

    const submitUpload: FormEventHandler = (e) => {
        e.preventDefault();
        postFile(route('orders.upload', order.id), {
            onSuccess: () => resetFile(),
        });
    };

    const deleteFile = (fileId: number) => {
        if(confirm('Hapus file ini?')) router.delete(route('orders.deleteFile', fileId));
    };

    const deletePayment = (paymentId: number) => {
        if(confirm('Batalkan pembayaran ini?')) router.delete(route('payments.destroy', paymentId));
    };

    // Helper Rupiah
    const rupiah = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
    const getFileUrl = (path: string) => `/storage/${path}`;

    // --- STYLES DIPERBAIKI (LEBIH BESAR & LEGA) ---
    // Perubahan: Menambahkan py-3 (tinggi) px-4 (lebar) dan rounded-xl
    const inputClasses = "w-full rounded-xl bg-gray-50 dark:bg-black border border-gray-300 dark:border-zinc-700 text-slate-900 dark:text-white text-sm focus:ring-indigo-500 focus:border-indigo-500 transition-all py-3 px-4 shadow-sm";
    const labelClasses = "block text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase mb-2 ml-1"; // Sedikit margin bawah dan kiri
    const cardClasses = "bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm p-6";

    return (
        <AppLayout breadcrumbs={[{ title: 'Order', href: '/orders' }, { title: `#${order.order_number}`, href: '#' }]}>
            <Head title={`Edit Order ${order.order_number}`} />

            <div className="min-h-screen bg-gray-50 dark:bg-black font-sans transition-colors duration-300 p-4 lg:p-8">
                <div className="w-full mx-auto">

                    {/* HEADER */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{order.order_number}</h1>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                                    data.status === 'done' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                    data.status === 'cancel' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                    'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                }`}>
                                    {data.status}
                                </span>
                            </div>
                            <p className="mt-1 text-slate-500 dark:text-zinc-400 text-sm">
                                Dibuat pada: {new Date(order.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>

                        {/* TOMBOL DELETE (Hanya Super Admin) */}
                        <button
                            onClick={() => { if(confirm('HAPUS ORDER INI PERMANEN?')) router.delete(route('orders.destroy', order.id)); }}
                            className="text-xs font-bold text-red-500 hover:text-red-400 border border-red-500/30 hover:bg-red-500/10 px-4 py-2 rounded-lg transition"
                        >
                            🗑️ Hapus Order
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                        {/* === KOLOM KIRI: FORMULIR DATA (7 Kolom) === */}
                        <div className="lg:col-span-7 space-y-6">
                            <form onSubmit={submitUpdate}>
                                <div className={cardClasses}>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                        <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
                                        Informasi Pekerjaan
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className={labelClasses}>Klien (Pemohon)</label>
                                            <select value={data.client_id} onChange={e => setData('client_id', e.target.value)} className={inputClasses}>
                                                <option value="">-- Pilih Klien --</option>
                                                {clients.map((client: any) => (
                                                    <option key={client.id} value={client.id}>{client.name} - {client.phone}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Status Pekerjaan</label>
                                            <select value={data.status} onChange={e => setData('status', e.target.value)} className={`${inputClasses} font-bold`}>
                                                <option value="new">🆕 Baru Masuk</option>
                                                <option value="draft">📝 Sedang Drafting</option>
                                                <option value="process">⚙️ Proses Pemberkasan</option>
                                                <option value="minuta">✍️ Tanda Tangan Minuta</option>
                                                <option value="done">✅ Selesai (Arsip)</option>
                                                <option value="cancel">❌ Dibatalkan</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <label className={labelClasses}>Jenis Layanan</label>
                                        <select value={data.service_id} onChange={e => {
                                            setData('service_id', e.target.value);
                                            // Deteksi PPAT logic here if needed
                                        }} className={inputClasses}>
                                            <option value="">-- Pilih Layanan --</option>
                                            {serviceTypes.map((type: any) => (
                                                <optgroup key={type.id} label={type.name}>
                                                    {type.services.map((svc: any) => (
                                                        <option key={svc.id} value={svc.id}>{svc.code} - {svc.name}</option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className={labelClasses}>Tanggal Akta</label>
                                            <input type="date" value={data.akta_date} onChange={e => setData('akta_date', e.target.value)} className={inputClasses} />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Keterangan Tambahan</label>
                                            <input type="text" value={data.description} onChange={e => setData('description', e.target.value)} className={inputClasses} placeholder="Catatan khusus..." />
                                        </div>
                                    </div>

                                    {/* DATA PPAT (Hanya jika layanan PPAT) */}
                                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800">
                                        <button type="button" onClick={() => setIsPpat(!isPpat)} className="text-xs font-bold text-indigo-500 hover:text-indigo-400 flex items-center gap-1 mb-4">
                                            {isPpat ? '🔽 Sembunyikan' : '▶️ Tampilkan'} Detail Tanah/Bangunan (PPAT)
                                        </button>

                                        {isPpat && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                                                <div className="col-span-2 md:col-span-1">
                                                    <label className={labelClasses}>Nomor Sertifikat</label>
                                                    <input type="text" value={data.certificate_number} onChange={e => setData('certificate_number', e.target.value)} className={inputClasses} placeholder="SHM No..." />
                                                </div>
                                                <div className="col-span-2 md:col-span-1">
                                                    <label className={labelClasses}>Lokasi Objek</label>
                                                    <input type="text" value={data.object_address} onChange={e => setData('object_address', e.target.value)} className={inputClasses} placeholder="Kelurahan/Desa..." />
                                                </div>
                                                <div>
                                                    <label className={labelClasses}>Pihak Penjual</label>
                                                    <input type="text" value={data.seller_name} onChange={e => setData('seller_name', e.target.value)} className={inputClasses} />
                                                </div>
                                                <div>
                                                    <label className={labelClasses}>Pihak Pembeli</label>
                                                    <input type="text" value={data.buyer_name} onChange={e => setData('buyer_name', e.target.value)} className={inputClasses} />
                                                </div>
                                                <div>
                                                    <label className={labelClasses}>Nilai Transaksi (Rp)</label>
                                                    <input type="number" value={data.transaction_value} onChange={e => setData('transaction_value', Number(e.target.value))} className={inputClasses} />
                                                </div>
                                                <div>
                                                    <label className={labelClasses}>NJOP (Rp)</label>
                                                    <input type="number" value={data.njop} onChange={e => setData('njop', Number(e.target.value))} className={inputClasses} />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-8 flex justify-end">
                                        <button type="submit" disabled={processing} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/25 transition">
                                            {processing ? 'Menyimpan...' : 'Simpan Perubahan Data'}
                                        </button>
                                    </div>
                                </div>
                            </form>

                            {/* --- TABEL FILE UPLOAD --- */}
                            <div className={cardClasses}>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                        <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
                                        Berkas & Dokumen
                                    </h3>
                                </div>

                                {/* Form Upload */}
                                <form onSubmit={submitUpload} className="mb-6 bg-gray-50 dark:bg-black p-4 rounded-xl border border-dashed border-gray-300 dark:border-zinc-700">
                                    <div className="flex flex-col md:flex-row gap-3 items-end">
                                        <div className="flex-1 w-full">
                                            <label className={labelClasses}>Nama Dokumen</label>
                                            <input type="text" value={fileData.file_name} onChange={e => setFileData('file_name', e.target.value)} className={inputClasses} placeholder="Contoh: KTP Suami" required />
                                        </div>
                                        <div className="w-full md:w-1/3">
                                            <label className={labelClasses}>Kategori</label>
                                            <select value={fileData.category} onChange={e => setFileData('category', e.target.value)} className={inputClasses}>
                                                <option value="ktp">Identitas (KTP/KK)</option>
                                                <option value="sertifikat">Sertifikat Tanah</option>
                                                <option value="pbb">PBB / Pajak</option>
                                                <option value="draft">Draft Akta</option>
                                                <option value="lainnya">Lainnya</option>
                                            </select>
                                        </div>
                                        <div className="w-full md:w-auto">
                                            <input
                                                type="file"
                                                onChange={e => e.target.files && setFileData('file', e.target.files[0])}
                                                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 dark:file:bg-zinc-800 dark:file:text-zinc-300"
                                                required
                                            />
                                        </div>
                                        <button type="submit" disabled={fileProcessing} className="w-full md:w-auto px-4 py-2 bg-slate-800 dark:bg-white text-white dark:text-black font-bold rounded-lg hover:opacity-90">
                                            Upload
                                        </button>
                                    </div>
                                    {fileErrors.file && <p className="text-red-500 text-xs mt-1">{fileErrors.file}</p>}
                                </form>

                                {/* List File */}
                                <div className="space-y-2">
                                    {order.files?.length === 0 ? (
                                        <p className="text-center text-slate-400 text-sm py-4 italic">Belum ada dokumen yang diunggah.</p>
                                    ) : (
                                        order.files.map((file: any) => (
                                            <div key={file.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-black rounded-lg border border-gray-100 dark:border-zinc-800 group hover:border-indigo-500/30 transition">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <span className="p-2 bg-white dark:bg-zinc-900 rounded-lg text-lg">📄</span>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{file.file_name}</p>
                                                        <p className="text-[10px] text-slate-500 uppercase">{file.category} • {file.file_type}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <a href={getFileUrl(file.file_path)} target="_blank" className="p-1.5 text-slate-400 hover:text-indigo-500 bg-white dark:bg-zinc-900 rounded-md border border-gray-200 dark:border-zinc-700" title="Download / Lihat">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    </a>
                                                    <button onClick={() => deleteFile(file.id)} className="p-1.5 text-slate-400 hover:text-red-500 bg-white dark:bg-zinc-900 rounded-md border border-gray-200 dark:border-zinc-700" title="Hapus">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* === KOLOM KANAN: ACTIONS & FINANCE (5 Kolom) === */}
                        <div className="lg:col-span-5 space-y-6">

                            {/* CARD: SMART ACTIONS (Tombol Sakti) */}
                            <div className={`${cardClasses} border-l-4 border-l-indigo-500 relative overflow-hidden`}>
                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                    <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                                </div>
                                <h3 className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-4">Aksi Cepat</h3>
                                <div className="grid grid-cols-2 gap-3 relative z-10">

                                    {/* Tombol Invoice */}
                                    <a href={route('orders.invoice', order.id)} target="_blank" className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-black rounded-xl border border-gray-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition group cursor-pointer">
                                        <span className="text-2xl mb-2 group-hover:scale-110 transition">🖨️</span>
                                        <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Cetak Invoice</span>
                                    </a>

                                    {/* Tombol Generate Dokumen (Placeholder Href) */}
                                    <a href="#" className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-black rounded-xl border border-gray-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition group cursor-pointer" onClick={(e) => { e.preventDefault(); alert("Fitur Generate Dokumen akan aktif setelah template diupload."); }}>
                                        <span className="text-2xl mb-2 group-hover:scale-110 transition">📜</span>
                                        <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">Generate Akta</span>
                                    </a>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-3 text-center">
                                    *Pastikan template Word sudah diupload sebelum generate.
                                </p>
                            </div>

                            {/* CARD: KEUANGAN */}
                            <div className={cardClasses}>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                                    Rincian Tagihan
                                </h3>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between items-center">
                                        <label className={labelClasses}>Biaya Jasa</label>
                                        <input
                                            type="number"
                                            value={data.service_price}
                                            onChange={e => setData('service_price', Number(e.target.value))}
                                            className="w-1/2 text-right rounded-lg bg-gray-50 dark:bg-black border border-gray-300 dark:border-zinc-700 text-sm py-2 px-3 font-mono font-bold text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <label className={labelClasses}>Titipan Pajak/Negara</label>
                                        <input
                                            type="number"
                                            value={data.tax_deposit}
                                            onChange={e => setData('tax_deposit', Number(e.target.value))}
                                            className="w-1/2 text-right rounded-lg bg-gray-50 dark:bg-black border border-gray-300 dark:border-zinc-700 text-sm py-2 px-3 font-mono font-bold text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div className="pt-4 border-t border-dashed border-gray-200 dark:border-zinc-700 flex justify-between items-center">
                                        <span className="font-black text-slate-800 dark:text-white uppercase text-xs">Total Tagihan</span>
                                        <span className="font-black text-xl text-indigo-600 dark:text-indigo-400">{rupiah(totalTagihan)}</span>
                                    </div>
                                </div>

                                {/* Progress Pembayaran */}
                                <div className="bg-gray-100 dark:bg-black rounded-xl p-4 border border-gray-200 dark:border-zinc-800">
                                    <div className="flex justify-between text-xs mb-2 font-bold text-slate-500 dark:text-zinc-400">
                                        <span>Terbayar: {rupiah(totalBayar)}</span>
                                        <span>Sisa: {rupiah(sisaTagihan)}</span>
                                    </div>
                                    <div className="w-full bg-gray-300 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-500 ${persentaseBayar >= 100 ? 'bg-emerald-500' : 'bg-orange-500'}`}
                                            style={{ width: `${persentaseBayar}%` }}
                                        ></div>
                                    </div>
                                    <p className={`text-center text-xs font-bold mt-2 ${persentaseBayar >= 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-500'}`}>
                                        Status: {persentaseBayar >= 100 ? 'LUNAS' : 'BELUM LUNAS'}
                                    </p>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
