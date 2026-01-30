import { useState, useEffect, FormEventHandler } from 'react';
import AppLayout from '@/layouts/app-layout';
import InputError from '@/components/ui/input-error';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { route } from 'ziggy-js';

interface Props extends PageProps {
    order: any;
    clients: any[];
    serviceTypes: any[];
}

export default function OrderEdit({ auth, order, clients, serviceTypes }: Props) {
    const [isPpat, setIsPpat] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    // Hitung Keuangan
    const totalTagihan = Number(order.service_price) + Number(order.tax_deposit);
    const totalBayar = order.payments?.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0) || 0;
    const sisaTagihan = totalTagihan - totalBayar;
    const persentaseBayar = totalTagihan > 0 ? Math.min((totalBayar / totalTagihan) * 100, 100) : 0;

    // FORM UTAMA
    const { data, setData, put, processing, errors } = useForm({
        client_id: order.client_id || '',
        service_id: order.service_id || '',
        description: order.description || '',
        akta_date: order.akta_date || '',
        status: order.status,
        service_price: order.service_price,
        tax_deposit: order.tax_deposit,
        seller_name: order.ppat_detail?.seller_name || '',
        buyer_name: order.ppat_detail?.buyer_name || '',
        certificate_number: order.ppat_detail?.certificate_number || '',
        object_address: order.ppat_detail?.object_address || '',
    });

    // FORM UPLOAD
    const {
        data: uploadData,
        setData: setUploadData,
        post: postUpload,
        processing: uploading,
        reset: resetUpload,
        errors: uploadErrors
    } = useForm({
        file_name: '',
        category: 'requirement',
        file: null as File | null,
    });

    // FORM PEMBAYARAN
    const {
        data: payData,
        setData: setPayData,
        post: postPay,
        processing: paying,
        reset: resetPay,
        errors: payErrors
    } = useForm({
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'Transfer BCA',
        note: '',
    });

    useEffect(() => {
        let foundType = null;
        serviceTypes.forEach(type => {
            const svc = type.services.find((s: any) => s.id === Number(data.service_id));
            if (svc) foundType = type;
        });
        setIsPpat(foundType?.slug === 'ppat');
    }, [data.service_id]);

    const submit: FormEventHandler = (e) => { e.preventDefault(); put(route('orders.update', order.id)); };

    const handlePayment: FormEventHandler = (e) => {
        e.preventDefault();
        postPay(route('payments.store', order.id), { onSuccess: () => resetPay(), preserveScroll: true });
    };

    const handleUploadSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        if(!uploadData.file) return alert("Pilih file dulu.");
        postUpload(route('orders.upload', order.id), { onSuccess: () => resetUpload(), preserveScroll: true });
    };

    const deleteFile = (fileId: number) => { if (confirm('Hapus dokumen?')) router.delete(route('orders.deleteFile', fileId), { preserveScroll: true }); };
    const deletePayment = (paymentId: number) => { if (confirm('Batalkan pembayaran?')) router.delete(route('payments.destroy', paymentId), { preserveScroll: true }); };

    // DRAG DROP
    const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
    const onDragLeave = () => setIsDragOver(false);
    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setUploadData('file', e.dataTransfer.files[0]);
            if (!uploadData.file_name) setUploadData('file_name', e.dataTransfer.files[0].name);
        }
    };

    const getFileUrl = (path: string) => '/storage/' + path.replace('public/', '');
    const rupiah = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

    // Helper Icon
    const FileIcon = ({ type }: { type: string }) => {
        const isPdf = type.includes('pdf');
        const isImage = type.includes('jpg') || type.includes('jpeg') || type.includes('png');
        if (isPdf) return (<div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500 shadow-sm border border-red-100"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg></div>);
        if (isImage) return (<div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm border border-blue-100"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>);
        return (<div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 shadow-sm border border-slate-100"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>);
    };

    const STEPS = [
        { id: 'new', label: 'Baru Masuk', icon: '📥' },
        { id: 'draft', label: 'Drafting', icon: '📝' },
        { id: 'process', label: 'Proses', icon: '⚙️' },
        { id: 'minuta', label: 'Minuta/TTD', icon: '✍️' },
        { id: 'done', label: 'Selesai', icon: '✅' },
    ];
    const currentStepIndex = STEPS.findIndex(s => s.id === data.status);

    const inputClasses = "mt-1 block w-full rounded-xl bg-slate-900/60 border border-slate-800 text-slate-100 placeholder-slate-500 shadow-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-base py-3.5 px-4 hover:bg-slate-900/80 transition-all";
    const sideInputClasses = "w-full text-sm rounded-xl border-slate-300 focus:border-cyan-500 focus:ring-cyan-500 py-2.5 px-3";

    return (
        <AppLayout breadcrumbs={[{ title: 'Order', href: '/orders' }, { title: `#${order.order_number}`, href: '#' }]}>
            <Head title="Edit Pekerjaan" />

            <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8 font-sans">
                <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* === KOLOM KIRI (FORM) === */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Detail Pekerjaan</h1>
                                <p className="text-slate-500 text-sm">Update data dan status progres.</p>
                            </div>
                            <Link href={route('orders.index')} className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                                &larr; Kembali
                            </Link>
                        </div>

                        {/* STEPPER */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-8 text-center">Pipeline Pengerjaan</h3>
                            <div className="relative">
                                <div className="absolute left-6 right-6 top-5 h-1 bg-slate-100 rounded-full"></div>
                                <div className="absolute left-6 top-5 h-1 bg-cyan-500 rounded-full transition-all duration-500 ease-out" style={{ width: `calc(${currentStepIndex / (STEPS.length - 1) * 100}% - 3rem)` }}></div>
                                <div className="relative flex justify-between items-start">
                                    {STEPS.map((step, index) => {
                                        const isActive = index <= currentStepIndex;
                                        return (
                                            <button key={step.id} type="button" onClick={() => setData('status', step.id)} className="group flex flex-col items-center focus:outline-none w-12">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-4 transition-all duration-300 z-10 ${isActive ? 'bg-cyan-500 border-cyan-100 text-white scale-110 shadow-lg shadow-cyan-200' : 'bg-white border-slate-100 text-slate-300'}`}>{step.icon}</div>
                                                <span className={`absolute top-12 text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 text-center w-20 ${isActive ? 'text-cyan-700' : 'text-slate-300'}`}>{step.label}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* FORM DARK MODE */}
                        <div className="relative overflow-hidden bg-slate-950 p-8 rounded-[2rem] border border-slate-800/50 shadow-2xl">
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
                            <form onSubmit={submit} className="relative z-10 space-y-8">
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2"><span className="w-2 h-2 bg-cyan-500 rounded-full"></span> Informasi Order</h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div><label className="text-slate-400 text-xs font-bold uppercase mb-2 block">Klien</label><select value={data.client_id} onChange={e => setData('client_id', e.target.value)} className={inputClasses}><option value="">-- Pilih Klien --</option>{clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><InputError message={errors.client_id} className="mt-1" /></div>
                                        <div><label className="text-slate-400 text-xs font-bold uppercase mb-2 block">Layanan</label><select value={data.service_id} onChange={e => setData('service_id', e.target.value)} className={inputClasses}><option value="">-- Pilih Layanan --</option>{serviceTypes.map((type: any) => (<optgroup key={type.id} label={type.name}>{type.services.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}</optgroup>))}</select><InputError message={errors.service_id} className="mt-1" /></div>
                                        <div className="col-span-2"><label className="text-slate-400 text-xs font-bold uppercase mb-2 block">Judul / Keterangan</label><input type="text" value={data.description} onChange={e => setData('description', e.target.value)} className={inputClasses} placeholder="Keterangan singkat..." /></div>
                                    </div>
                                </div>
                                {isPpat && (
                                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-4"><h3 className="text-sm font-bold text-indigo-400">Data Objek (PPAT)</h3><div className="grid grid-cols-2 gap-4"><input placeholder="Nama Penjual" value={data.seller_name} onChange={e => setData('seller_name', e.target.value)} className={inputClasses} /><input placeholder="Nama Pembeli" value={data.buyer_name} onChange={e => setData('buyer_name', e.target.value)} className={inputClasses} /><input placeholder="No. Sertifikat" value={data.certificate_number} onChange={e => setData('certificate_number', e.target.value)} className={inputClasses} /><input placeholder="Alamat Objek" value={data.object_address} onChange={e => setData('object_address', e.target.value)} className={inputClasses} /></div></div>
                                )}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Rincian Tagihan</h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div><label className="text-slate-400 text-xs mb-1 block">Jasa Notaris (Rp)</label><input type="number" value={data.service_price} onChange={e => setData('service_price', Number(e.target.value))} className={inputClasses} /></div>
                                        <div><label className="text-slate-400 text-xs mb-1 block">Titipan / Pajak (Rp)</label><input type="number" value={data.tax_deposit} onChange={e => setData('tax_deposit', Number(e.target.value))} className={inputClasses} /></div>
                                    </div>
                                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700 flex justify-between items-center shadow-lg mt-2"><span className="text-sm text-slate-400 font-bold uppercase tracking-wider">Total Tagihan (Nett)</span><span className="text-2xl font-black text-white tracking-tight">{rupiah(Number(data.service_price) + Number(data.tax_deposit))}</span></div>
                                </div>
                                <div className="pt-4 mt-8 border-t border-slate-800"><button type="submit" disabled={processing} className="w-full py-4 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-cyan-900/20 transform hover:-translate-y-1 transition-all duration-300">{processing ? 'Menyimpan...' : '💾 Simpan Perubahan'}</button></div>
                            </form>
                        </div>
                    </div>

                    {/* === KOLOM KANAN (TOOLS) === */}
                    <div className="space-y-6">
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-2 gap-3">
                            <a href={route('orders.invoice', order.id)} target="_blank" className="flex flex-col items-center justify-center p-3 bg-slate-50 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition border border-slate-100 group"><span className="text-2xl mb-1 group-hover:scale-110 transition">🖨️</span><span className="text-xs">Cetak Invoice</span></a>
                            <button disabled className="flex flex-col items-center justify-center p-3 bg-slate-50 text-slate-300 font-bold rounded-xl border border-slate-100 cursor-not-allowed"><span className="text-2xl mb-1 grayscale opacity-50">📜</span><span className="text-xs">Draft Akta</span></button>
                        </div>

                        {/* 2. PAYMENT CARD (DIPERBAIKI INPUTNYA) */}
                        <div className={`relative overflow-hidden rounded-2xl shadow-lg border p-6 text-white transition-all duration-500 ${sisaTagihan <= 0 ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400 shadow-emerald-200' : 'bg-gradient-to-br from-orange-500 to-red-500 border-orange-400 shadow-orange-200'}`}>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div><p className="text-xs font-bold uppercase opacity-80">Sisa Tagihan</p><h2 className="text-3xl font-black mt-1">{rupiah(sisaTagihan)}</h2></div>
                                    <div className="text-right"><p className="text-xs font-bold opacity-80">Lunas</p><p className="text-xl font-bold">{Math.round(persentaseBayar)}%</p></div>
                                </div>
                                <div className="w-full bg-black/20 h-2 rounded-full mb-6 overflow-hidden"><div className="h-full bg-white/90 rounded-full transition-all duration-1000" style={{ width: `${persentaseBayar}%` }}></div></div>

                                {/* List Pembayaran */}
                                <div className="bg-black/10 rounded-xl p-3 mb-6 max-h-32 overflow-y-auto custom-scrollbar space-y-2">
                                    {order.payments?.length > 0 ? (
                                        order.payments.map((pay: any) => (
                                            <div key={pay.id} className="flex justify-between items-center text-xs border-b border-white/10 pb-1 last:border-0"><span>{new Date(pay.payment_date).toLocaleDateString()}</span><div className="flex items-center gap-2"><span className="font-bold">{rupiah(pay.amount)}</span><button onClick={() => deletePayment(pay.id)} className="text-white/50 hover:text-white font-bold px-1">✕</button></div></div>
                                        ))
                                    ) : (<p className="text-xs text-white/50 text-center italic">Belum ada pembayaran.</p>)}
                                </div>

                                {sisaTagihan > 0 && (
                                    <form onSubmit={handlePayment} className="space-y-4 pt-4 border-t border-white/20">
                                        {/* PERBAIKAN: Input tidak lagi berdempetan */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <input type="number" placeholder="Rp Nominal" value={payData.amount} onChange={e => setPayData('amount', e.target.value)} className="w-full bg-white/90 border-0 text-slate-800 text-sm rounded-lg placeholder-slate-500 focus:ring-2 focus:ring-white p-2.5" required />
                                            <input type="date" value={payData.payment_date} onChange={e => setPayData('payment_date', e.target.value)} className="w-full bg-white/90 border-0 text-slate-800 text-sm rounded-lg p-2.5" />
                                        </div>
                                        <input type="text" placeholder="Via (Contoh: Transfer BCA)" value={payData.payment_method} onChange={e => setPayData('payment_method', e.target.value)} className="w-full bg-white/90 border-0 text-slate-800 text-sm rounded-lg placeholder-slate-500 p-2.5" />

                                        {/* PERBAIKAN: Tombol Bayar Full Width & Menonjol */}
                                        <button type="submit" disabled={paying} className="w-full py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 shadow-lg transition-all transform active:scale-95 flex justify-center items-center gap-2">
                                            {paying ? '...' : '💰 Terima Pembayaran'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* 3. ARSIP DIGITAL */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm"><span className="bg-slate-100 p-1 rounded">📂</span> Arsip Digital</h3>
                            <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 mb-4 ${isDragOver ? 'border-cyan-500 bg-cyan-50' : 'border-slate-300 bg-slate-50 hover:border-cyan-400'}`}>
                                {uploadData.file ? (<div className="text-emerald-600"><p className="text-2xl mb-1">📄</p><p className="text-xs font-bold truncate px-4">{uploadData.file.name}</p></div>) : (<div className="pointer-events-none text-slate-400"><p className="text-xs font-bold">Drag & Drop File</p></div>)}
                            </div>

                            <form onSubmit={handleUploadSubmit} className="space-y-4">
                                <div className="flex gap-2">
                                    <input type="text" value={uploadData.file_name} onChange={e => setUploadData('file_name', e.target.value)} placeholder="Nama Dokumen" className={sideInputClasses} required />
                                    <select value={uploadData.category} onChange={e => setUploadData('category', e.target.value)} className={`${sideInputClasses} bg-white w-28`}><option value="requirement">Syarat</option><option value="draft">Draft</option><option value="final">Final</option></select>
                                </div>

                                {/* PERBAIKAN: Tombol 50:50 (Grid) */}
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="bg-slate-100 text-slate-600 text-xs font-bold py-3 rounded-xl hover:bg-slate-200 text-center cursor-pointer transition flex items-center justify-center gap-2">
                                        📂 {uploadData.file ? 'Ganti' : 'Pilih File'}
                                        <input type="file" className="hidden" onChange={e => {if(e.target.files) {setUploadData('file', e.target.files[0]); if(!uploadData.file_name) setUploadData('file_name', e.target.files[0].name);}}} />
                                    </label>
                                    <button type="submit" disabled={uploading} className="bg-cyan-600 text-white text-xs font-bold py-3 rounded-xl hover:bg-cyan-500 transition flex items-center justify-center gap-2">
                                        ⬆ Upload
                                    </button>
                                </div>
                            </form>

                            <div className="mt-6 space-y-3 border-t border-slate-100 pt-4 max-h-60 overflow-y-auto">
                                {order.files.map((file: any) => (
                                    <div key={file.id} className="group relative flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-cyan-200 transition-all">
                                        <FileIcon type={file.file_type || ''} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-700 truncate">{file.file_name}</p>
                                            <div className="flex gap-2 items-center mt-0.5"><span className="text-[10px] text-slate-400 uppercase bg-slate-100 px-1.5 rounded">{file.category || 'file'}</span><span className="text-[10px] text-slate-300">{new Date(file.created_at).toLocaleDateString()}</span></div>
                                        </div>
                                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <a href={getFileUrl(file.file_path)} target="_blank" className="p-1 text-slate-400 hover:text-cyan-600 bg-slate-50 rounded hover:bg-cyan-50" title="Lihat"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></a>
                                            <button onClick={() => deleteFile(file.id)} className="p-1 text-slate-400 hover:text-red-600 bg-slate-50 rounded hover:bg-red-50" title="Hapus"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                        </div>
                                    </div>
                                ))}
                                {order.files.length === 0 && (<p className="text-center text-xs text-slate-400 italic py-2">Belum ada dokumen.</p>)}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
