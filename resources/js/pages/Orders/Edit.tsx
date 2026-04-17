import { useState, useEffect, FormEventHandler } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { route } from 'ziggy-js';
import { Upload, FileText, CheckCircle2, Calculator, ShieldCheck, Info, MapPin, Wallet, ArrowLeft, Trash2, Printer, FileOutput, Download, PlusCircle } from 'lucide-react';

interface Props extends PageProps {
    order: any;
    clients: any[];
    serviceTypes: any[];
    company: any;
}

export default function OrderEdit({ auth, order, clients, serviceTypes, company }: Props) {
    const [selectedService, setSelectedService] = useState<any>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({});

    const { data, setData, put, processing, errors } = useForm({
        client_id: order.client_id || '',
        service_id: order.service_id || '',
        description: order.description || '',
        akta_date: order.akta_date || '',
        status: order.status,
        seller_name: order.ppat_detail?.seller_name || '',
        land_area: order.ppat_detail?.land_area || '',
        transaction_value: order.ppat_detail?.transaction_value || '',
        njop: order.ppat_detail?.njop || '',
        service_price: order.service_price || 0,
        plotting_fee: order.plotting_fee || 0,
        pnbp_fee: order.pnbp_fee || 0,
        validation_fee: order.validation_fee || 0,
        bphtb_fee: order.bphtb_fee || 0,
        pph_fee: order.pph_fee || 0,
        measurement_fee: order.measurement_fee || 0,
        location_check_fee: order.location_check_fee || 0,
        area_measurement_fee: order.area_measurement_fee || 0,
        tax_deposit: order.tax_deposit || 0,
        additional_info: order.additional_info || {},
        completed_requirements: (order.completed_requirements || []) as string[],
        files: {} as Record<string, File | null>,
    });

    useEffect(() => {
        const found = serviceTypes.flatMap((t: any) => t.services).find((s: any) => s.id === Number(data.service_id));
        if (found) setSelectedService(found);
    }, [data.service_id]);

    // --- LOGIKA KEUANGAN ---
    const calculateTotal = () => {
        return Number(data.service_price) + Number(data.plotting_fee) + Number(data.pnbp_fee) +
               Number(data.validation_fee) + Number(data.bphtb_fee) + Number(data.pph_fee) +
               Number(data.measurement_fee) + Number(data.tax_deposit) +
               Number(data.location_check_fee) + Number(data.area_measurement_fee);
    };

    const totalTagihan = calculateTotal();
    const totalBayar = order.payments?.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0) || 0;
    const sisaTagihan = totalTagihan - totalBayar;
    const persentaseBayar = totalTagihan > 0 ? Math.min((totalBayar / totalTagihan) * 100, 100) : 0;

    // --- FORM PEMBAYARAN BARU (Sesuai PaymentController) ---
    const { data: paymentData, setData: setPaymentData, post: postPayment, processing: paymentProcessing, reset: resetPayment } = useForm({
        amount: sisaTagihan > 0 ? sisaTagihan : '',
        payment_date: new Date().toISOString().split('T')[0], // Default hari ini
        payment_method: 'Transfer',
        note: '',
        proof_file: null as File | null
    });

    const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPaymentData('proof_file', e.target.files[0]);
        }
    };

    const submitPayment: FormEventHandler = (e) => {
        e.preventDefault();
        // Mengarah ke route payments.store milik PaymentController Mas Daeng
        postPayment(route('payments.store', order.id), {
            forceFormData: true,
            onSuccess: () => {
                setShowPaymentModal(false);
                resetPayment();
            }
        });
    };

    const deletePayment = (paymentId: number) => {
        if(confirm('Hapus riwayat pembayaran ini? Saldo akan dihitung ulang.')) {
            router.delete(route('payments.destroy', paymentId));
        }
    };

    const rupiah = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
    const getFileUrl = (path: string) => `/storage/${path}`;

    const toggleRequirement = (reqName: string) => {
        const current = data.completed_requirements || [];
        if (current.includes(reqName)) setData('completed_requirements', current.filter(item => item !== reqName));
        else setData('completed_requirements', [...current, reqName]);
    };

    const handleFileChange = (reqName: string, file: File | null) => {
        const newFiles = { ...uploadedFiles, [reqName]: file };
        setUploadedFiles(newFiles);
        setData('files', newFiles);
        if (file && !data.completed_requirements.includes(reqName)) toggleRequirement(reqName);
    };

    const submitUpdate: FormEventHandler = (e) => {
        e.preventDefault();
        router.post(route('orders.update', order.id), { _method: 'PUT', ...data, forceFormData: true });
    };

    const deleteFile = (fileId: number) => {
        if(confirm('Hapus file permanen?')) router.delete(route('orders.deleteFile', fileId));
    };

    const confirmDeleteOrder = () => {
        setShowDeleteModal(false);
        router.delete(route('orders.destroy', order.id));
    };

    const getReqs = () => {
        if (!selectedService?.requirements) return { uploads: [], inputs: [] };
        return typeof selectedService.requirements === 'string' ? JSON.parse(selectedService.requirements) : selectedService.requirements;
    };
    const getActiveFees = () => {
        if (!selectedService?.active_fee_fields) return [];
        return typeof selectedService.active_fee_fields === 'string' ? JSON.parse(selectedService.active_fee_fields) : selectedService.active_fee_fields;
    };

    const cardClass = "bg-[#121214] border border-[#27272a] rounded-2xl p-6 shadow-lg";
    const inputClass = "w-full bg-[#09090b] border border-[#27272a] text-slate-200 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 transition-all outline-none";
    const labelClass = "block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1";
    const sectionTitle = "text-base font-black text-white mb-6 flex items-center gap-2 uppercase tracking-wide";

    return (
        <AppLayout breadcrumbs={[{ title: 'Order', href: '/orders' }, { title: `#${order.order_number}`, href: '#' }]}>
            <Head title={`Edit Order ${order.order_number}`} />

            <div className="min-h-screen bg-gray-50 dark:bg-black p-4 lg:p-8 font-sans">
                <div className="w-full mx-auto space-y-8">

                    {/* HEADER */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-black text-black dark:text-white tracking-tight">{order.order_number}</h1>
                                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                    {data.status === 'new' ? 'Baru Masuk' : data.status}
                                </span>
                            </div>
                            <p className="mt-1 text-slate-500 text-sm">Dibuat pada: {new Date(order.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                        <div className="flex gap-3">
                            <Link href={route('orders.index')} className="px-5 py-2.5 border border-[#27272a] text-slate-400 hover:text-white hover:bg-[#27272a] rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2"><ArrowLeft size={14} /> Kembali</Link>
                            <button type="button" onClick={() => setShowDeleteModal(true)} className="px-5 py-2.5 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2"><Trash2 size={14} /> Hapus Order</button>
                        </div>
                    </div>

                    <form onSubmit={submitUpdate} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                        {/* === KOLOM KIRI === */}
                        <div className="lg:col-span-7 space-y-6">

                            <div className={cardClass}>
                                <h3 className={sectionTitle}><ShieldCheck className="text-indigo-500" size={20}/> Informasi Pekerjaan</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                                    <div><label className={labelClass}>Klien (Pemohon)</label><select value={data.client_id} onChange={e => setData('client_id', e.target.value)} className={inputClass}><option value="">-- Pilih Klien --</option>{clients.map((c: any) => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}</select></div>
                                    <div>
                                        <label className={labelClass}>Status Pekerjaan</label>
                                        <select value={data.status} onChange={e => setData('status', e.target.value)} className={inputClass}>
                                            <option value="new">🆕 Baru Masuk</option><option value="process">⚙️ Proses Pemberkasan</option><option value="done">✅ Selesai (Arsip)</option><option value="cancel">❌ Dibatalkan</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mb-5">
                                    <label className={labelClass}>Jenis Layanan</label>
                                    <select value={data.service_id} onChange={e => setData('service_id', e.target.value)} className={inputClass}><option value="">-- Pilih Layanan --</option>{serviceTypes.map((type: any) => (<optgroup key={type.id} label={type.name}>{type.services.map((svc: any) => <option key={svc.id} value={svc.id}>{svc.name}</option>)}</optgroup>))}</select>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div><label className={labelClass}>Tanggal Akta</label><input type="date" value={data.akta_date} onChange={e => setData('akta_date', e.target.value)} className={inputClass} /></div>
                                    <div><label className={labelClass}>Keterangan Tambahan</label><input type="text" value={data.description} onChange={e => setData('description', e.target.value)} className={inputClass} placeholder="Catatan khusus..." /></div>
                                </div>
                            </div>

                            <div className={cardClass}>
                                <h3 className={sectionTitle}><MapPin className="text-rose-500" size={20}/> Detail Objek Tanah / Bangunan</h3>
                                <div className="space-y-5">
                                    <div><label className={labelClass}>Atas Nama (A.n)</label><input type="text" value={data.seller_name} onChange={e => setData('seller_name', e.target.value)} className={inputClass} placeholder="Sesuai Sertifikat..." /></div>
                                    <div className="grid grid-cols-3 gap-5">
                                        <div><label className={labelClass}>Luas (M²)</label><input type="number" value={data.land_area} onChange={e => setData('land_area', e.target.value)} className={inputClass} /></div>
                                        <div><label className={labelClass}>Harga Transaksi (Rp)</label><input type="number" value={data.transaction_value} onChange={e => setData('transaction_value', e.target.value)} className={inputClass} /></div>
                                        <div><label className={labelClass}>Total NJOP (Rp)</label><input type="number" value={data.njop} onChange={e => setData('njop', e.target.value)} className={inputClass} /></div>
                                    </div>
                                </div>
                            </div>

                            {(getReqs().uploads.length > 0 || order.files?.length > 0) && (
                                <div className={cardClass}>
                                    <h3 className={sectionTitle}><Upload className="text-indigo-400" size={20}/> Progress Berkas & Scan Dokumen</h3>
                                    {order.files?.length > 0 && (
                                        <div className="mb-8">
                                            <p className="text-[10px] font-bold text-slate-500 mb-3 tracking-widest uppercase">Arsip Tersimpan:</p>
                                            <div className="space-y-3">
                                                {order.files.map((file: any) => (
                                                    <div key={file.id} className="flex justify-between items-center p-4 bg-[#09090b] rounded-xl border border-[#27272a]">
                                                        <div className="flex items-center gap-4">
                                                            <CheckCircle2 size={20} className="text-emerald-500"/>
                                                            <div><p className="text-sm font-bold text-white">{file.file_name}</p><p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">{file.category}</p></div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <a href={getFileUrl(file.file_path)} target="_blank" className="p-2.5 text-slate-400 hover:text-white bg-[#18181b] rounded-lg border border-[#27272a] transition"><Download size={16}/></a>
                                                            <button type="button" onClick={() => deleteFile(file.id)} className="p-2.5 text-red-500 hover:text-white hover:bg-red-600 bg-[#18181b] rounded-lg border border-[#27272a] transition"><Trash2 size={16}/></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <p className="text-[10px] font-bold text-slate-500 mb-3 tracking-widest uppercase">Checklist Persyaratan:</p>
                                    <div className="grid grid-cols-1 gap-3">
                                        {getReqs().uploads.map((req: string, i: number) => {
                                            const isUploadedInDB = order.files?.some((f: any) => f.category === req);
                                            const isChecked = data.completed_requirements.includes(req) || isUploadedInDB;
                                            return (
                                            <div key={i} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isChecked ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-[#27272a] bg-[#09090b]'}`}>
                                                <div className="flex items-center gap-4">
                                                    <input type="checkbox" checked={isChecked} onChange={() => toggleRequirement(req)} disabled={isUploadedInDB} className="w-5 h-5 rounded border-[#27272a] bg-[#18181b] text-emerald-500 focus:ring-emerald-500 cursor-pointer" />
                                                    <span className={`text-xs font-bold uppercase tracking-wider ${isChecked ? 'text-emerald-500' : 'text-slate-400'}`}>{req}</span>
                                                </div>
                                                {!isUploadedInDB && (
                                                    <label className="cursor-pointer px-4 py-2 bg-[#18181b] text-slate-300 border border-[#27272a] rounded-lg hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                                        <Upload size={14} /> Upload <input type="file" className="hidden" onChange={e => handleFileChange(req, e.target.files![0])} />
                                                    </label>
                                                )}
                                            </div>
                                        )})}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* === KOLOM KANAN === */}
                        <div className="lg:col-span-5 space-y-6">

                            {/* AKSI CEPAT */}
                            <div className={cardClass}>
                                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Aksi Cepat</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <a href={route('orders.invoice', order.id)} target="_blank" className="flex flex-col items-center justify-center p-6 bg-[#09090b] rounded-xl border border-[#27272a] hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group cursor-pointer">
                                        <Printer className="text-slate-400 group-hover:text-emerald-500 mb-3 transition-colors" size={28}/>
                                        <span className="text-xs font-bold text-slate-300 group-hover:text-white">Cetak Tagihan</span>
                                    </a>
                                    <a href="#" onClick={(e) => { e.preventDefault(); alert("Generasi Akta aktif setelah template diunggah."); }} className="flex flex-col items-center justify-center p-6 bg-[#09090b] rounded-xl border border-[#27272a] hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group cursor-pointer">
                                        <FileOutput className="text-slate-400 group-hover:text-amber-500 mb-3 transition-colors" size={28}/>
                                        <span className="text-xs font-bold text-slate-300 group-hover:text-white">Generate Akta</span>
                                    </a>
                                </div>
                            </div>

                            {/* METODE PEMBAYARAN KLIEN */}
                            <div className={`${cardClass} border-emerald-500/20 bg-emerald-500/5`}>
                                <h4 className="text-emerald-500 font-bold text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2"><Wallet size={14} /> Metode Pembayaran Klien</h4>
                                <div className="space-y-3 text-xs text-slate-400">
                                    <div className="flex justify-between border-b border-emerald-500/10 pb-2"><span>Bank</span><span className="font-bold text-black dark:text-white">{company?.bank_name || '-'}</span></div>
                                    <div className="flex justify-between border-b border-emerald-500/10 pb-2"><span>No. Rekening</span><span className="font-mono font-bold text-emerald-600">{company?.account_number || '-'}</span></div>
                                    <div className="flex justify-between pt-1"><span>Atas Nama</span><span className="font-bold text-black dark:text-white uppercase">{company?.account_name || '-'}</span></div>
                                </div>
                            </div>

                            {/* RINCIAN TAGIHAN */}
                            <div className={cardClass}>
                                <h3 className={sectionTitle}><Calculator className="text-emerald-500" size={20}/> Rincian Tagihan</h3>

                                <div className="space-y-5 mb-8">
                                    <div><label className={labelClass}>Honorarium Utama</label><input type="number" value={data.service_price} onChange={e => setData('service_price', Number(e.target.value))} className={`${inputClass} text-lg font-black text-white`} /></div>
                                    <div className="grid grid-cols-2 gap-5">
                                        {getActiveFees().includes('plotting') && (<div><label className={labelClass}>Plotting</label><input type="number" value={data.plotting_fee} onChange={e => setData('plotting_fee', Number(e.target.value))} className={inputClass} /></div>)}
                                        {getActiveFees().includes('penataan_batas') && (<div><label className={labelClass}>Penataan Batas</label><input type="number" value={data.measurement_fee} onChange={e => setData('measurement_fee', Number(e.target.value))} className={inputClass} /></div>)}
                                        {getActiveFees().includes('pengecekan_lokasi') && (<div><label className={labelClass}>Pengecekan Lokasi</label><input type="number" value={data.location_check_fee} onChange={e => setData('location_check_fee', Number(e.target.value))} className={inputClass} /></div>)}
                                        {getActiveFees().includes('pengukuran') && (<div><label className={labelClass}>Pengukuran</label><input type="number" value={data.area_measurement_fee} onChange={e => setData('area_measurement_fee', Number(e.target.value))} className={inputClass} /></div>)}
                                        {getActiveFees().includes('pnbp') && (<div><label className={labelClass}>PNBP</label><input type="number" value={data.pnbp_fee} onChange={e => setData('pnbp_fee', Number(e.target.value))} className={inputClass} /></div>)}
                                        {getActiveFees().includes('validasi_pajak') && (<div><label className={labelClass}>Validasi Pajak</label><input type="number" value={data.validation_fee} onChange={e => setData('validation_fee', Number(e.target.value))} className={inputClass} /></div>)}
                                        {getActiveFees().includes('bphtb') && (<div className="col-span-2"><label className={labelClass}>Pajak Pembeli/Penerima (BPHTB)</label><input type="number" value={data.bphtb_fee} onChange={e => setData('bphtb_fee', Number(e.target.value))} className={inputClass} /></div>)}
                                        {getActiveFees().includes('pph') && (<div className="col-span-2"><label className={labelClass}>Pajak Penjual/Pengalih (PPh)</label><input type="number" value={data.pph_fee} onChange={e => setData('pph_fee', Number(e.target.value))} className={inputClass} /></div>)}
                                        <div className="col-span-2"><label className={labelClass}>Balik Nama SPPT</label><input type="number" value={data.tax_deposit} onChange={e => setData('tax_deposit', Number(e.target.value))} className={inputClass} /></div>
                                    </div>
                                </div>

                                <div className="p-5 bg-[#09090b] rounded-xl border border-[#27272a] mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Tagihan</span>
                                        <span className="text-2xl font-black text-indigo-400">{rupiah(totalTagihan)}</span>
                                    </div>
                                </div>

                                {/* --- PROGRESS PEMBAYARAN & TOMBOL BAYAR --- */}
                                <div className="p-5 bg-[#09090b] rounded-xl border border-[#27272a] mb-6">
                                    <div className="flex justify-between text-xs mb-3 font-bold text-slate-400 uppercase tracking-widest">
                                        <span className="text-emerald-500">Terbayar: {rupiah(totalBayar)}</span>
                                        <span className="text-orange-500">Sisa: {rupiah(sisaTagihan)}</span>
                                    </div>

                                    <div className="w-full bg-[#27272a] h-2 rounded-full overflow-hidden mb-5">
                                        <div className={`h-full transition-all duration-700 ease-out ${persentaseBayar >= 100 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]'}`} style={{ width: `${persentaseBayar}%` }}></div>
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t border-[#27272a]">
                                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded border ${persentaseBayar >= 100 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>
                                            Status: {persentaseBayar >= 100 ? 'LUNAS' : 'BELUM LUNAS'}
                                        </span>
                                        {sisaTagihan > 0 && (
                                            <button type="button" onClick={() => { setPaymentData('amount', sisaTagihan); setShowPaymentModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[10px] uppercase tracking-widest transition-all">
                                                <PlusCircle size={14} /> Tambah Pembayaran
                                            </button>
                                        )}
                                    </div>

                                    {/* RIWAYAT PEMBAYARAN */}
                                    {order.payments && order.payments.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-[#27272a]">
                                            <p className="text-[10px] font-bold text-slate-500 mb-3 tracking-widest uppercase">Riwayat Pembayaran:</p>
                                            <div className="space-y-2">
                                                {order.payments.map((pay: any) => (
                                                    <div key={pay.id} className="flex justify-between items-center p-3 bg-[#121214] rounded-lg border border-[#27272a]">
                                                        <div>
                                                            <p className="text-xs font-bold text-emerald-400">{rupiah(pay.amount)}</p>
                                                            <p className="text-[10px] text-slate-500">{new Date(pay.payment_date).toLocaleDateString('id-ID')} • {pay.payment_method}</p>
                                                        </div>
                                                        <button type="button" onClick={() => deletePayment(pay.id)} className="text-red-500 hover:text-red-400 p-1.5 bg-red-500/10 rounded-md transition-colors" title="Hapus Pembayaran">
                                                            <Trash2 size={12}/>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button type="submit" disabled={processing} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                                    {processing ? 'Menyimpan...' : 'Simpan Perubahan Data'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* --- MODAL TAMBAH PEMBAYARAN --- */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#121214] border border-[#27272a] rounded-[2rem] p-8 max-w-md w-full shadow-2xl">
                        <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tight flex items-center gap-3">
                            <Wallet className="text-emerald-500"/> Tambah Pembayaran
                        </h3>
                        <form onSubmit={submitPayment}>
                            <div className="space-y-4 mb-8">
                                <div>
                                    <label className={labelClass}>Nominal Bayar (Rp)</label>
                                    <input type="number" value={paymentData.amount} onChange={e => setPaymentData('amount', Number(e.target.value))} className={`${inputClass} text-emerald-400 font-bold text-lg`} max={sisaTagihan} required />
                                    <p className="text-[10px] text-slate-500 mt-1">Sisa Tagihan: {rupiah(sisaTagihan)}</p>
                                </div>
                                <div>
                                    <label className={labelClass}>Tanggal Pembayaran</label>
                                    <input type="date" value={paymentData.payment_date} onChange={e => setPaymentData('payment_date', e.target.value)} className={inputClass} required />
                                </div>
                                <div>
                                    <label className={labelClass}>Metode Pembayaran</label>
                                    <select value={paymentData.payment_method} onChange={e => setPaymentData('payment_method', e.target.value)} className={inputClass}>
                                        <option value="Transfer">Transfer Bank</option>
                                        <option value="Cash">Tunai (Cash)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Bukti Transfer (Opsional)</label>
                                    <input type="file" onChange={handleProofChange} className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#27272a] file:text-slate-300 hover:file:bg-[#3f3f46] transition-all" accept="image/*" />
                                </div>
                                <div>
                                    <label className={labelClass}>Catatan (Opsional)</label>
                                    <input type="text" value={paymentData.note} onChange={e => setPaymentData('note', e.target.value)} className={inputClass} placeholder="Contoh: DP 50% atau Pelunasan..." />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowPaymentModal(false)} className="flex-1 py-3 bg-[#27272a] text-white font-bold rounded-xl hover:bg-[#3f3f46] text-xs uppercase tracking-widest transition">Batal</button>
                                <button type="submit" disabled={paymentProcessing} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 text-xs uppercase tracking-widest transition shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL HAPUS ORDER */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#121214] border border-red-500/20 rounded-3xl p-8 max-w-sm w-full shadow-2xl">
                        <div className="w-16 h-16 bg-red-500/10 text-red-500 flex items-center justify-center rounded-full mx-auto mb-4"><Trash2 size={24}/></div>
                        <h3 className="text-xl font-black text-white text-center mb-2 tracking-tight">Hapus Permanen?</h3>
                        <p className="text-slate-400 text-xs text-center mb-8 leading-relaxed">
                            Aksi ini tidak dapat dibatalkan. Semua data terkait order <span className="text-white font-bold">#{order.order_number}</span> akan dihapus selamanya.
                        </p>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 bg-[#27272a] text-white font-bold rounded-xl hover:bg-[#3f3f46] text-xs uppercase tracking-widest transition">Batal</button>
                            <button type="button" onClick={confirmDeleteOrder} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-500 text-xs uppercase tracking-widest transition">Hapus</button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
