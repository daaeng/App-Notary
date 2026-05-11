import { useState, useEffect, FormEventHandler, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { route } from 'ziggy-js';
// [PERBAIKAN]: Menambahkan ikon "Eye" untuk fitur Lihat Dokumen
import { Upload, FileText, CheckCircle2, Calculator, ShieldCheck, Info, MapPin, Wallet, ArrowLeft, Trash2, Printer, FileOutput, Download, PlusCircle, X, Eye } from 'lucide-react';

interface Props extends PageProps { order: any; clients: any[]; serviceTypes: any[]; company: any; }

export default function OrderEdit({ auth, order, clients, serviceTypes, company }: Props) {
    const [selectedService, setSelectedService] = useState<any>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const isFirstRun = useRef(true);

    // --- STATE UNTUK UPLOAD DOKUMEN TAMBAHAN LANGSUNG ---
    const [customDocName, setCustomDocName] = useState('');
    const [customDocFile, setCustomDocFile] = useState<File | null>(null);
    const [isUploadingDoc, setIsUploadingDoc] = useState(false);

    const { data, setData, processing, errors } = useForm({
        client_id: order.client_id || '', service_id: order.service_id || '', description: order.description || '', akta_date: order.akta_date || '', status: order.status,
        seller_name: order.ppat_detail?.seller_name || '', land_area: order.ppat_detail?.land_area || '', transaction_value: order.ppat_detail?.transaction_value || '', njop: order.ppat_detail?.njop || '',
        service_price: order.service_price || 0, plotting_fee: order.plotting_fee || 0, pnbp_fee: order.pnbp_fee || 0, validation_fee: order.validation_fee || 0, bphtb_fee: order.bphtb_fee || 0, pph_fee: order.pph_fee || 0, measurement_fee: order.measurement_fee || 0, location_check_fee: order.location_check_fee || 0, area_measurement_fee: order.area_measurement_fee || 0, tax_deposit: order.tax_deposit || 0,
        additional_info: order.additional_info || {}, completed_requirements: (order.completed_requirements || []) as string[], files: {} as Record<string, File | null>,
    });

    useEffect(() => {
        const found = serviceTypes.flatMap((t: any) => t.services).find((s: any) => s.id === Number(data.service_id));
        if (found) setSelectedService(found);
    }, [data.service_id]);

    // --- LOGIKA AUTO-KALKULASI PAJAK (BPHTB & PPh) DINAMIS ---
    useEffect(() => {
        if (isFirstRun.current) { isFirstRun.current = false; return; }
        const transVal = Number(data.transaction_value) || 0;
        const njopVal = Number(data.njop) || 0;
        const N = Math.max(transVal, njopVal);
        const calculatedPph = N > 0 ? N * 0.025 : 0;

        let currentNpoptkp = 0;
        const sName = selectedService?.name?.toLowerCase() || '';
        if (sName.includes('waris') || sName.includes('aphw')) { currentNpoptkp = 300000000; }
        else if (sName.includes('jual beli') || sName.includes('ajb') || sName.includes('hibah')) { currentNpoptkp = 80000000; }

        const calculatedBphtb = N > currentNpoptkp ? (N - currentNpoptkp) * 0.05 : 0;
        setData(prev => ({ ...prev, pph_fee: calculatedPph, bphtb_fee: calculatedBphtb }));
    }, [data.transaction_value, data.njop, selectedService]);

    const selectedCategory = serviceTypes.find((t: any) => t.services.some((s: any) => s.id === Number(data.service_id)));
    const isPPAT = selectedCategory?.slug === 'ppat' || selectedCategory?.name?.toLowerCase() === 'ppat';

    // Variabel untuk Transparansi Rumus Pajak
    const transValDisplay = Number(data.transaction_value) || 0;
    const njopValDisplay = Number(data.njop) || 0;
    const nilaiTertinggi = Math.max(transValDisplay, njopValDisplay);
    const labelNilai = (nilaiTertinggi === transValDisplay && transValDisplay > 0) ? 'Harga Transaksi' : 'NJOP';
    const rupiah = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

    let npoptkpDisplay = 0;
    const sNameDisplay = selectedService?.name?.toLowerCase() || '';
    if (sNameDisplay.includes('waris') || sNameDisplay.includes('aphw')) { npoptkpDisplay = 300000000; }
    else if (sNameDisplay.includes('jual beli') || sNameDisplay.includes('ajb') || sNameDisplay.includes('hibah')) { npoptkpDisplay = 80000000; }

    const calculateTotal = () => {
        return Number(data.service_price) + Number(data.plotting_fee) + Number(data.pnbp_fee) + Number(data.validation_fee) + Number(data.bphtb_fee) + Number(data.pph_fee) + Number(data.measurement_fee) + Number(data.tax_deposit) + Number(data.location_check_fee) + Number(data.area_measurement_fee);
    };

    const totalTagihan = calculateTotal();
    const totalBayar = order.payments?.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0) || 0;
    const sisaTagihan = totalTagihan - totalBayar;
    const persentaseBayar = totalTagihan > 0 ? Math.min((totalBayar / totalTagihan) * 100, 100) : 0;

    const { data: paymentData, setData: setPaymentData, post: postPayment, processing: paymentProcessing, reset: resetPayment } = useForm({
        amount: sisaTagihan > 0 ? sisaTagihan : '', payment_date: new Date().toISOString().split('T')[0], payment_method: 'Transfer', note: '', proof_file: null as File | null
    });

    const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files[0]) setPaymentData('proof_file', e.target.files[0]); };
    const submitPayment: FormEventHandler = (e) => { e.preventDefault(); postPayment(route('payments.store', order.id), { forceFormData: true, onSuccess: () => { setShowPaymentModal(false); resetPayment(); } }); };
    const deletePayment = (paymentId: number) => { if(confirm('Hapus riwayat pembayaran ini? Saldo akan dihitung ulang.')) router.delete(route('payments.destroy', paymentId)); };

    const getFileUrl = (path: string) => `/storage/${path}`;
    const toggleRequirement = (reqName: string) => { const current = data.completed_requirements || []; if (current.includes(reqName)) setData('completed_requirements', current.filter(item => item !== reqName)); else setData('completed_requirements', [...current, reqName]); };

    // Simpan file SOP standar ke state
    const handleFileChange = (reqName: string, file: File | null) => {
        const newFiles = { ...data.files };
        if (file) newFiles[reqName] = file;
        else delete newFiles[reqName];

        setData('files', newFiles);
        if (file && !data.completed_requirements.includes(reqName)) toggleRequirement(reqName);
    };

    // --- FUNGSI UPLOAD DOKUMEN TAMBAHAN LANGSUNG (AJAX) ---
    const addCustomDoc = () => {
        if (!customDocName || !customDocFile) return;
        setIsUploadingDoc(true);

        // Memanfaatkan route upload file terpisah agar langsung masuk database!
        router.post(route('orders.upload', order.id), {
            file: customDocFile,
            file_name: customDocFile.name,
            category: customDocName.trim()
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setCustomDocName('');
                setCustomDocFile(null);
                const fileInput = document.getElementById('customFile') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            },
            onFinish: () => setIsUploadingDoc(false)
        });
    };

    const handleInfoChange = (key: string, value: string) => { setData('additional_info', { ...data.additional_info, [key]: value }); };

    // Perbaikan bug pengiriman data form (Opsi FormData dipisah dengan benar)
    const submitUpdate: FormEventHandler = (e) => {
        e.preventDefault();
        router.post(route('orders.update', order.id), {
            _method: 'PUT',
            ...data
        }, {
            forceFormData: true,
            preserveScroll: true
        });
    };

    const deleteFile = (fileId: number) => { if(confirm('Hapus file permanen?')) router.delete(route('orders.deleteFile', fileId)); };
    const confirmDeleteOrder = () => { setShowDeleteModal(false); router.delete(route('orders.destroy', order.id)); };

    const getReqs = () => { if (!selectedService?.requirements) return { uploads: [], inputs: [] }; return typeof selectedService.requirements === 'string' ? JSON.parse(selectedService.requirements) : selectedService.requirements; };
    const getActiveFees = () => { if (!selectedService?.active_fee_fields) return []; return typeof selectedService.active_fee_fields === 'string' ? JSON.parse(selectedService.active_fee_fields) : selectedService.active_fee_fields; };

    const cardClass = "bg-[#121214] border border-[#27272a] rounded-[2rem] p-8 shadow-xl";
    const inputClass = "w-full bg-[#09090b] border border-[#27272a] text-slate-200 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 transition-all outline-none shadow-inner";
    const labelClass = "block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1";
    const sectionTitle = "text-lg font-black text-white mb-8 flex items-center gap-3 uppercase tracking-wide";

    return (
        <AppLayout breadcrumbs={[{ title: 'Order Masuk', href: '/orders' }, { title: `#${order.order_number}`, href: '#' }]}>
            <Head title={`Edit Order ${order.order_number}`} />
            <div className="min-h-screen bg-gray-50 dark:bg-black p-4 lg:p-8 font-sans">
                <div className="w-full mx-auto space-y-8">

                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-4">
                        <div>
                            <div className="flex items-center gap-3"><h1 className="text-3xl font-black text-black dark:text-white tracking-tight">{order.order_number}</h1><span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20">{data.status === 'new' ? 'Baru Masuk' : data.status}</span></div>
                            <p className="mt-1 text-slate-500 text-sm">Dibuat pada: {new Date(order.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                        <div className="flex gap-3">
                            <Link href={route('orders.index')} className="px-5 py-2.5 border border-[#27272a] text-slate-400 hover:text-white hover:bg-[#27272a] rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2"><ArrowLeft size={14} /> Kembali</Link>
                            <button type="button" onClick={() => setShowDeleteModal(true)} className="px-5 py-2.5 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2"><Trash2 size={14} /> Hapus Order</button>
                        </div>
                    </div>

                    <form onSubmit={submitUpdate} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-7 space-y-6">

                            <div className={cardClass}>
                                <h3 className={sectionTitle}><ShieldCheck className="text-indigo-500" size={24}/> Informasi Pekerjaan</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                                    <div><label className={labelClass}>Klien (Pemohon)</label><select value={data.client_id} onChange={e => setData('client_id', e.target.value)} className={inputClass}><option value="">-- Pilih Klien --</option>{clients.map((c: any) => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}</select></div>
                                    <div><label className={labelClass}>Status Pekerjaan</label><select value={data.status} onChange={e => setData('status', e.target.value)} className={inputClass}><option value="new">🆕 Baru Masuk</option><option value="process">⚙️ Proses Pemberkasan</option><option value="done">✅ Selesai (Arsip)</option><option value="cancel">❌ Dibatalkan</option></select></div>
                                </div>
                                <div className="mb-5"><label className={labelClass}>Jenis Layanan</label><select value={data.service_id} onChange={e => setData('service_id', e.target.value)} className={`${inputClass} font-bold text-white`}><option value="">-- Pilih Layanan --</option>{serviceTypes.map((type: any) => (<optgroup key={type.id} label={type.name} className="text-slate-500 uppercase">{type.services.map((svc: any) => <option key={svc.id} value={svc.id} className="text-white normal-case">{svc.name}</option>)}</optgroup>))}</select></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div><label className={labelClass}>Tanggal Akta</label><input type="date" value={data.akta_date} onChange={e => setData('akta_date', e.target.value)} className={inputClass} /></div>
                                    <div><label className={labelClass}>Keterangan Tambahan</label><input type="text" value={data.description} onChange={e => setData('description', e.target.value)} className={inputClass} placeholder="Catatan khusus..." /></div>
                                </div>
                            </div>

                            <div className={cardClass}>
                                <h3 className={sectionTitle}><Upload className="text-indigo-400" size={24}/> Progress Berkas & Dokumen</h3>

                                {/* ARSIP YANG SUDAH TERUPLOAD DI DATABASE */}
                                {order.files?.length > 0 && (
                                    <div className="mb-8">
                                        <p className="text-[10px] font-bold text-slate-500 mb-3 tracking-widest uppercase">Arsip Tersimpan:</p>
                                        <div className="space-y-3">
                                            {order.files.map((file: any) => (
                                                <div key={file.id} className="flex justify-between items-center p-4 bg-[#09090b] rounded-xl border border-emerald-500/30">
                                                    <div className="flex items-center gap-4">
                                                        <CheckCircle2 size={20} className="text-emerald-500 shrink-0"/>
                                                        <div>
                                                            <a href={getFileUrl(file.file_path)} target="_blank" rel="noreferrer" className="block text-sm font-bold text-white hover:text-blue-400 transition-colors truncate max-w-[200px] md:max-w-xs" title="Klik untuk melihat dokumen">
                                                                {file.file_name}
                                                            </a>
                                                            <p className="text-[10px] text-emerald-500 uppercase tracking-widest mt-0.5">{file.category}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <a href={getFileUrl(file.file_path)} target="_blank" rel="noreferrer" className="p-2.5 text-blue-400 hover:text-white bg-[#18181b] rounded-lg border border-[#27272a] transition" title="Lihat Dokumen">
                                                            <Eye size={16}/>
                                                        </a>
                                                        <a href={getFileUrl(file.file_path)} download className="p-2.5 text-slate-400 hover:text-white bg-[#18181b] rounded-lg border border-[#27272a] transition" title="Download Dokumen">
                                                            <Download size={16}/>
                                                        </a>
                                                        <button type="button" onClick={() => deleteFile(file.id)} className="p-2.5 text-red-500 hover:text-white hover:bg-red-600 bg-[#18181b] rounded-lg border border-[#27272a] transition" title="Hapus Dokumen">
                                                            <Trash2 size={16}/>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* DOKUMEN WAJIB SESUAI SOP */}
                                {getReqs().uploads.length > 0 && (
                                    <>
                                        <p className="text-[10px] font-bold text-slate-500 mb-3 tracking-widest uppercase">Checklist Persyaratan:</p>
                                        <div className="grid grid-cols-1 gap-3">
                                            {getReqs().uploads.map((req: string, i: number) => {
                                                const isUploadedInDB = order.files?.some((f: any) => f.category === req);
                                                const isChecked = data.completed_requirements.includes(req) || isUploadedInDB || !!data.files[req];
                                                return (
                                                <div key={i} className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border transition-all ${isChecked ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-[#27272a] bg-[#09090b]'}`}>
                                                    <div className="flex items-center gap-4 w-full pr-4">
                                                        <input type="checkbox" checked={isChecked} onChange={() => toggleRequirement(req)} disabled={isUploadedInDB} className="w-5 h-5 rounded border-[#27272a] bg-[#18181b] text-emerald-500 focus:ring-emerald-500 cursor-pointer shrink-0" />
                                                        <div className={`p-2.5 rounded-xl shrink-0 ${isChecked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#18181b] text-slate-600'}`}>{isChecked ? <CheckCircle2 size={16} /> : <FileText size={16} />}</div>
                                                        <span className={`text-[11px] font-bold uppercase tracking-wider leading-snug ${isChecked ? 'text-emerald-500' : 'text-slate-300'}`}>{req}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 shrink-0 pl-14 md:pl-0">
                                                        {isChecked ? (<span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"><CheckCircle2 size={14}/> Ada</span>) : (<span className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"><X size={14}/> Belum</span>)}
                                                        {!isUploadedInDB && (<label className="cursor-pointer px-4 py-2 bg-[#18181b] border border-[#27272a] text-slate-300 rounded-lg hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all active:scale-95 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"><Upload size={14} /> Upload <input type="file" className="hidden" onChange={e => handleFileChange(req, e.target.files![0])} /></label>)}
                                                    </div>
                                                </div>
                                            )})}
                                        </div>
                                    </>
                                )}

                                {/* UPLOAD DOKUMEN TAMBAHAN LANGSUNG (AJAX) */}
                                <div className="mt-8 pt-6 border-t border-[#27272a]">
                                    <p className="text-[10px] font-bold text-slate-500 mb-4 tracking-widest uppercase">Upload Dokumen Tambahan / Lainnya:</p>

                                    <div className="flex flex-col md:flex-row gap-3 items-end">
                                        <div className="w-full md:w-2/5">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Kategori / Judul</label>
                                            <input type="text" value={customDocName} onChange={e => setCustomDocName(e.target.value)} placeholder="Cth: KTP Pasangan..." className={inputClass} />
                                        </div>
                                        <div className="w-full md:w-2/5">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Pilih File</label>
                                            <input type="file" id="customFile" className="hidden" onChange={e => setCustomDocFile(e.target.files ? e.target.files[0] : null)} />
                                            <label htmlFor="customFile" className="flex items-center justify-between px-4 py-[14px] bg-[#09090b] border border-[#27272a] text-slate-300 rounded-xl hover:bg-[#18181b] transition-all cursor-pointer text-xs">
                                                <span className="truncate max-w-[150px]">{customDocFile ? customDocFile.name : 'Belum ada file...'}</span>
                                                <Upload size={14} className="text-slate-500 shrink-0"/>
                                            </label>
                                        </div>
                                        <button type="button" onClick={addCustomDoc} disabled={!customDocName || !customDocFile || isUploadingDoc} className="w-full md:w-1/5 py-[14px] bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-500 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.2)]">
                                            {isUploadingDoc ? 'Uploading...' : <><PlusCircle size={16}/> Upload</>}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-emerald-500 font-bold mt-3 tracking-widest uppercase">*Dokumen akan langsung terupload dan masuk ke Arsip Tersimpan.</p>
                                </div>
                            </div>

                            {getReqs().inputs.length > 0 && (
                                <div className={`${cardClass} animate-fade-in`}>
                                    <h3 className={sectionTitle}><Info className="text-amber-500" size={24}/> Informasi Tambahan</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        {getReqs().inputs.map((label: string, i: number) => {
                                            const isChecked = data.completed_requirements.includes(label);
                                            return (
                                            <div key={i} className={`p-4 rounded-xl border transition-all ${isChecked ? 'border-emerald-500/30 bg-emerald-500/5' : 'bg-[#09090b] border-[#27272a]'}`}>
                                                <div className="flex justify-between items-center mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <input type="checkbox" checked={isChecked} onChange={() => toggleRequirement(label)} className="w-5 h-5 rounded border-[#27272a] bg-[#18181b] text-amber-500 focus:ring-amber-500 cursor-pointer" />
                                                        <label className={`block text-[11px] font-bold uppercase tracking-widest ${isChecked ? 'text-emerald-500' : 'text-slate-400'}`}>{label}</label>
                                                    </div>
                                                    {isChecked ? (<span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-bold uppercase tracking-widest">✅ Terisi</span>) : (<span className="px-2.5 py-1 rounded-md bg-red-500/10 text-red-500 border border-red-500/20 text-[9px] font-bold uppercase tracking-widest">❌ Kosong</span>)}
                                                </div>
                                                <input type="text" value={data.additional_info?.[label] || ''} className={inputClass} placeholder={`Ketik isi ${label.toLowerCase()}...`} onChange={e => handleInfoChange(label, e.target.value)} />
                                            </div>
                                        )})}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-5 space-y-6">
                            <div className="sticky top-6 space-y-6">

                                <div className={cardClass}>
                                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Aksi Cepat</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <a href={route('orders.invoice', order.id)} target="_blank" className="flex flex-col items-center justify-center p-6 bg-[#09090b] rounded-xl border border-[#27272a] hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group cursor-pointer"><Printer className="text-slate-400 group-hover:text-emerald-500 mb-3 transition-colors" size={28}/><span className="text-xs font-bold text-slate-300 group-hover:text-white">Cetak Tagihan</span></a>
                                        <a href="#" onClick={(e) => { e.preventDefault(); alert("Generasi Akta aktif setelah template diunggah."); }} className="flex flex-col items-center justify-center p-6 bg-[#09090b] rounded-xl border border-[#27272a] hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group cursor-pointer"><FileOutput className="text-slate-400 group-hover:text-amber-500 mb-3 transition-colors" size={28}/><span className="text-xs font-bold text-slate-300 group-hover:text-white">Generate Akta</span></a>
                                    </div>
                                </div>

                                {isPPAT && (
                                    <div className={`${cardClass} animate-fade-in-up`}>
                                        <h3 className={sectionTitle}><MapPin className="text-rose-500" size={24}/> Detail Objek Tanah / Bangunan</h3>
                                        <div className="space-y-5">
                                            <div><label className={labelClass}>Atas Nama (A.n)</label><input type="text" value={data.seller_name} onChange={e => setData('seller_name', e.target.value)} className={inputClass} placeholder="Sesuai Sertifikat..." /></div>
                                            <div className="grid grid-cols-3 gap-5">
                                                <div><label className={labelClass}>Luas (M²)</label><input type="number" value={data.land_area} onChange={e => setData('land_area', e.target.value)} className={inputClass} /></div>
                                                <div><label className={labelClass}>Harga Transaksi (Rp)</label><input type="number" value={data.transaction_value} onChange={e => setData('transaction_value', e.target.value)} className={inputClass} /></div>
                                                <div><label className={labelClass}>Total NJOP (Rp)</label><input type="number" value={data.njop} onChange={e => setData('njop', e.target.value)} className={inputClass} /></div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className={cardClass}>
                                    <h3 className={sectionTitle}><Calculator className="text-emerald-500" size={24}/> Rincian Tagihan</h3>

                                    <div className="space-y-5 mb-8">
                                        <div><label className={labelClass}>Honorarium Utama</label><input type="number" value={data.service_price} onChange={e => setData('service_price', Number(e.target.value))} className={`${inputClass} text-lg font-black text-emerald-400 border-emerald-500/30`} /></div>

                                        <div className="grid grid-cols-2 gap-5">
                                            {getActiveFees().includes('plotting') && (<div><label className={labelClass}>Plotting & Biaya Lain</label><input type="number" value={data.plotting_fee} onChange={e => setData('plotting_fee', Number(e.target.value))} className={inputClass} /></div>)}
                                            {getActiveFees().includes('penataan_batas') && (<div><label className={labelClass}>Penataan Batas</label><input type="number" value={data.measurement_fee} onChange={e => setData('measurement_fee', Number(e.target.value))} className={inputClass} /></div>)}
                                            {getActiveFees().includes('pnbp') && (<div><label className={labelClass}>PNBP Negara</label><input type="number" value={data.pnbp_fee} onChange={e => setData('pnbp_fee', Number(e.target.value))} className={inputClass} /></div>)}
                                            {getActiveFees().includes('validasi_pajak') && (<div><label className={labelClass}>Validasi Pajak</label><input type="number" value={data.validation_fee} onChange={e => setData('validation_fee', Number(e.target.value))} className={inputClass} /></div>)}

                                            {/* BPHTB DENGAN INFO RUMUS YANG TRANSPARAN */}
                                            {getActiveFees().includes('bphtb') && (
                                                <div className="col-span-2">
                                                    <div className="flex justify-between items-end mb-2">
                                                        <label className={`${labelClass} !mb-0`}>Pajak Pembeli (BPHTB)</label>
                                                        {nilaiTertinggi > 0 && (
                                                            <div className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20 text-right">
                                                                <span className="block text-slate-500 text-[8px] mb-0.5 uppercase tracking-widest">Acuan: {labelNilai} ({rupiah(nilaiTertinggi)})</span>
                                                                5% × ({rupiah(nilaiTertinggi)} - {rupiah(npoptkpDisplay)})
                                                            </div>
                                                        )}
                                                    </div>
                                                    <input type="number" value={data.bphtb_fee} onChange={e => setData('bphtb_fee', Number(e.target.value))} className={inputClass} />
                                                </div>
                                            )}

                                            {/* PPh DENGAN INFO RUMUS YANG TRANSPARAN */}
                                            {getActiveFees().includes('pph') && (
                                                <div className="col-span-2">
                                                    <div className="flex justify-between items-end mb-2">
                                                        <label className={`${labelClass} !mb-0`}>Pajak Penjual (PPh)</label>
                                                        {nilaiTertinggi > 0 && (
                                                            <div className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20 text-right">
                                                                <span className="block text-slate-500 text-[8px] mb-0.5 uppercase tracking-widest">Acuan: {labelNilai} ({rupiah(nilaiTertinggi)})</span>
                                                                2.5% × {rupiah(nilaiTertinggi)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <input type="number" value={data.pph_fee} onChange={e => setData('pph_fee', Number(e.target.value))} className={inputClass} />
                                                </div>
                                            )}
                                            {getActiveFees().includes('tax_deposit') && (<div className="col-span-2"><label className={labelClass}>Balik Nama SPPT</label><input type="number" value={data.tax_deposit} onChange={e => setData('tax_deposit', Number(e.target.value))} className={inputClass} /></div>)}
                                        </div>

                                        <div className="p-6 bg-[#09090b] rounded-2xl border border-[#27272a] mb-6 mt-6">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Total Nilai Tagihan</span>
                                                <span className="text-3xl font-black text-indigo-400 tracking-tighter">Rp {calculateTotal().toLocaleString('id-ID')}</span>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-[#09090b] rounded-2xl border border-[#27272a] mb-8">
                                            <div className="flex justify-between text-xs mb-3 font-bold text-slate-400 uppercase tracking-widest">
                                                <span className="text-emerald-500">Terbayar: {rupiah(totalBayar)}</span>
                                                <span className="text-orange-500">Sisa: {rupiah(sisaTagihan)}</span>
                                            </div>

                                            <div className="w-full bg-[#27272a] h-2.5 rounded-full overflow-hidden mb-5">
                                                <div className={`h-full transition-all duration-700 ease-out ${persentaseBayar >= 100 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]'}`} style={{ width: `${persentaseBayar}%` }}></div>
                                            </div>

                                            <div className="flex justify-between items-center pt-4 border-t border-[#27272a]">
                                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg border ${persentaseBayar >= 100 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>
                                                    Status: {persentaseBayar >= 100 ? 'LUNAS' : 'BELUM LUNAS'}
                                                </span>
                                                {sisaTagihan > 0 && (
                                                    <button type="button" onClick={() => { setPaymentData('amount', sisaTagihan); setShowPaymentModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest transition-all">
                                                        <PlusCircle size={14} /> Tambah Pembayaran
                                                    </button>
                                                )}
                                            </div>

                                            {order.payments && order.payments.length > 0 && (
                                                <div className="mt-5 pt-5 border-t border-[#27272a]">
                                                    <p className="text-[10px] font-bold text-slate-500 mb-3 tracking-widest uppercase">Riwayat Pembayaran:</p>
                                                    <div className="space-y-2">
                                                        {order.payments.map((pay: any) => (
                                                            <div key={pay.id} className="flex justify-between items-center p-4 bg-[#121214] rounded-xl border border-[#27272a]">
                                                                <div>
                                                                    <p className="text-sm font-bold text-emerald-400">{rupiah(pay.amount)}</p>
                                                                    <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-widest">{new Date(pay.payment_date).toLocaleDateString('id-ID')} • {pay.payment_method}</p>
                                                                </div>
                                                                <button type="button" onClick={() => deletePayment(pay.id)} className="text-red-500 hover:text-white hover:bg-red-500 p-2.5 bg-red-500/10 rounded-lg transition-colors border border-red-500/20" title="Hapus Pembayaran"><Trash2 size={14}/></button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <button type="submit" disabled={processing} className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] active:scale-95">
                                            {processing ? 'Menyimpan...' : 'Simpan Perubahan Data'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* --- MODAL TAMBAH PEMBAYARAN --- */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#121214] border border-[#27272a] rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl">
                        <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tight flex items-center gap-3"><Wallet className="text-emerald-500"/> Tambah Pembayaran</h3>
                        <form onSubmit={submitPayment}>
                            <div className="space-y-5 mb-8">
                                <div>
                                    <label className={labelClass}>Nominal Bayar (Rp)</label>
                                    <input type="number" value={paymentData.amount} onChange={e => setPaymentData('amount', Number(e.target.value))} className={`${inputClass} text-emerald-400 font-black text-xl`} max={sisaTagihan} required />
                                    <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">Sisa Tagihan: <span className="text-orange-500">{rupiah(sisaTagihan)}</span></p>
                                </div>
                                <div><label className={labelClass}>Tanggal Pembayaran</label><input type="date" value={paymentData.payment_date} onChange={e => setPaymentData('payment_date', e.target.value)} className={inputClass} required /></div>
                                <div><label className={labelClass}>Metode Pembayaran</label><select value={paymentData.payment_method} onChange={e => setPaymentData('payment_method', e.target.value)} className={inputClass}><option value="Transfer">Transfer Bank</option><option value="Cash">Tunai (Cash)</option></select></div>
                                <div><label className={labelClass}>Bukti Transfer</label><input type="file" onChange={handleProofChange} className="block w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#27272a] file:text-slate-300 hover:file:bg-[#3f3f46] transition-all cursor-pointer" accept="image/*" /></div>
                                <div><label className={labelClass}>Catatan</label><input type="text" value={paymentData.note} onChange={e => setPaymentData('note', e.target.value)} className={inputClass} placeholder="Contoh: DP 50% atau Pelunasan..." /></div>
                            </div>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setShowPaymentModal(false)} className="flex-1 py-4 bg-[#27272a] text-white font-bold rounded-xl hover:bg-[#3f3f46] text-xs uppercase tracking-widest transition">Batal</button>
                                <button type="submit" disabled={paymentProcessing} className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 text-xs uppercase tracking-widest transition shadow-[0_0_15px_rgba(16,185,129,0.3)]">Simpan Bukti</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL HAPUS ORDER */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#121214] border border-red-500/20 rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl">
                        <div className="w-20 h-20 bg-red-500/10 text-red-500 flex items-center justify-center rounded-full mx-auto mb-6"><Trash2 size={32}/></div>
                        <h3 className="text-2xl font-black text-white text-center mb-2 tracking-tight">Hapus Permanen?</h3>
                        <p className="text-slate-400 text-xs text-center mb-8 leading-relaxed">Aksi ini tidak dapat dibatalkan. Semua data terkait order <span className="text-white font-bold">#{order.order_number}</span> akan dihapus selamanya.</p>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setShowDeleteModal(false)} className="flex-1 py-4 bg-[#27272a] text-white font-bold rounded-xl hover:bg-[#3f3f46] text-xs uppercase tracking-widest transition">Batal</button>
                            <button type="button" onClick={confirmDeleteOrder} className="flex-1 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-500 text-xs uppercase tracking-widest transition shadow-[0_0_15px_rgba(220,38,38,0.3)]">Hapus</button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
