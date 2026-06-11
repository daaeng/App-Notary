import { useState, useEffect, FormEventHandler, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Upload, FileText, CheckCircle2, Calculator, ShieldCheck, Info, MapPin, ArrowLeft, X, Trash2, PlusCircle } from 'lucide-react';

interface Props { clients: any[]; serviceTypes: any[]; company: any; }

export default function OrderCreate({ clients, serviceTypes, company }: Props) {
    const [selectedService, setSelectedService] = useState<any>(null);
    const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({});
    const isFirstRun = useRef(true);

    // --- STATE UNTUK DOKUMEN TAMBAHAN ---
    const [customDocName, setCustomDocName] = useState('');
    const [customDocFile, setCustomDocFile] = useState<File | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        client_id: '', service_id: '', description: '', seller_name: '', land_area: '', transaction_value: '', njop: '', znt: '',
        service_price: 0, plotting_fee: 0, pnbp_fee: 0, validation_fee: 0, bphtb_fee: 0, pph_fee: 0, measurement_fee: 0, location_check_fee: 0, area_measurement_fee: 0, tax_deposit: 0,
        additional_info: {} as Record<string, string>, completed_requirements: [] as string[], files: {} as Record<string, File | null>,
    });

    useEffect(() => {
        const found = serviceTypes.flatMap((t: any) => t.services).find((s: any) => s.id === Number(data.service_id));
        if (found) {
            setSelectedService(found); setData('service_price', found.default_price);
            setData('completed_requirements', []); setData('files', {});
        } else {
            setSelectedService(null); setData('service_price', 0);
        }
    }, [data.service_id]);

    // --- LOGIKA AUTO-KALKULASI PAJAK (BPHTB & PPh) DINAMIS ---
    useEffect(() => {
        if (isFirstRun.current) { isFirstRun.current = false; return; }
        const transVal = Number(data.transaction_value) || 0;
        const njopVal = Number(data.njop) || 0;
        const luas = Number(data.land_area) || 0;
        const zntVal = Number(data.znt) || 0;

        const N = Math.max(transVal, njopVal);
        const calculatedPph = N > 0 ? N * 0.025 : 0;

        let currentNpoptkp = 0;
        const sName = selectedService?.name?.toLowerCase() || '';
        if (sName.includes('waris') || sName.includes('aphw')) { currentNpoptkp = 300000000; }
        else if (sName.includes('jual beli') || sName.includes('ajb') || sName.includes('hibah')) { currentNpoptkp = 80000000; }

        const calculatedBphtb = N > currentNpoptkp ? (N - currentNpoptkp) * 0.05 : 0;
        
        // Perhitungan Ploting: Luas Tanah x ZNT / 1000 + 350.000
        let calculatedPlotting = 0;
        if (luas > 0 || zntVal > 0) {
            calculatedPlotting = ((luas * zntVal) / 1000) + 350000;
        }

        setData(prev => ({ ...prev, pph_fee: calculatedPph, bphtb_fee: calculatedBphtb, plotting_fee: calculatedPlotting }));
    }, [data.transaction_value, data.njop, data.land_area, data.znt, selectedService]);

    const selectedCategory = serviceTypes.find((t: any) => t.services.some((s: any) => s.id === Number(data.service_id)));
    const isPPAT = selectedCategory?.slug === 'ppat' || selectedCategory?.name?.toLowerCase() === 'ppat';

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

    const toggleRequirement = (reqName: string) => {
        const current = data.completed_requirements || [];
        if (current.includes(reqName)) setData('completed_requirements', current.filter(item => item !== reqName));
        else setData('completed_requirements', [...current, reqName]);
    };

    const handleFileChange = (reqName: string, file: File | null) => {
        const newFiles = { ...data.files };
        if (file) newFiles[reqName] = file;
        else delete newFiles[reqName];

        setData('files', newFiles);
        if (file && !data.completed_requirements.includes(reqName)) toggleRequirement(reqName);
    };

    // --- FUNGSI TAMPUNG DOKUMEN TAMBAHAN SEMENTARA ---
    const addCustomDoc = () => {
        if (!customDocName || !customDocFile) return;
        const safeName = customDocName.trim();
        const newFiles = { ...data.files, [safeName]: customDocFile };
        setData('files', newFiles);

        setCustomDocName('');
        setCustomDocFile(null);

        const fileInput = document.getElementById('customFile') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const removeCustomDoc = (name: string) => {
        const newFiles = { ...data.files };
        delete newFiles[name];
        setData('files', newFiles);
    };

    const handleInfoChange = (key: string, value: string) => { setData('additional_info', { ...data.additional_info, [key]: value }); };

    // Submit form (Menggunakan post dari useForm sudah otomatis handle FormData)
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('orders.store'), { forceFormData: true });
    };

    const getReqs = () => {
        if (!selectedService?.requirements) return { uploads: [], inputs: [] };
        return typeof selectedService.requirements === 'string' ? JSON.parse(selectedService.requirements) : selectedService.requirements;
    };
    const getActiveFees = () => {
        if (!selectedService?.active_fee_fields) return [];
        return typeof selectedService.active_fee_fields === 'string' ? JSON.parse(selectedService.active_fee_fields) : selectedService.active_fee_fields;
    };

    const requiredUploads = getReqs().uploads || [];
    const customUploadKeys = Object.keys(data.files).filter(k => !requiredUploads.includes(k));

    const inputClasses = "w-full bg-white dark:bg-[#09090b]/50 border border-gray-200 dark:border-white/[0.05] text-gray-900 dark:text-slate-200 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 block p-3.5 transition-all outline-none";
    const labelClasses = "block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1";
    const stickyReceipt = "bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.05] rounded-[2.5rem] p-8 shadow-xl dark:shadow-2xl relative overflow-hidden backdrop-blur-md";
    const sectionTitle = "text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-3";

    return (
        <AppLayout breadcrumbs={[{ title: 'Order Masuk', href: '/orders' }, { title: 'Buat Order Baru', href: '#' }]}>
            <Head title="Pendaftaran Pekerjaan" />
            <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] p-4 lg:p-8 font-sans relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="w-full mx-auto space-y-8 relative z-10">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Order Pekerjaan Baru</h1>
                            <p className="mt-1 text-gray-500 dark:text-slate-400 text-sm font-medium">Registrasi layanan, berkas, dan tagihan klien dalam satu halaman.</p>
                        </div>
                        <Link href={route('orders.index')} className="px-5 py-3 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] text-gray-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/[0.08] rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2">
                            <ArrowLeft size={16} /> Kembali
                        </Link>
                    </div>

                    <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                        {/* === KOLOM KIRI (FORM SEAMLESS) === */}
                        <div className="lg:col-span-7 space-y-10">
                            
                            {/* SECTION: Informasi Utama */}
                            <section className="animate-fade-in-up">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20"><ShieldCheck size={20}/></div>
                                    <h3 className={sectionTitle}>Informasi Utama</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className={labelClasses}>Pilih Klien</label><select value={data.client_id} onChange={e => setData('client_id', e.target.value)} className={inputClasses} required><option value="" className="bg-white dark:bg-[#09090b] text-gray-500 dark:text-slate-300">-- Pilih Klien --</option>{clients.map((c:any) => <option key={c.id} value={c.id} className="bg-white dark:bg-[#09090b] text-gray-900 dark:text-white">{c.name}</option>)}</select></div>
                                    <div><label className={labelClasses}>Jenis Akta</label><select value={data.service_id} onChange={e => setData('service_id', e.target.value)} className={`${inputClasses} font-bold text-gray-900 dark:text-white`} required><option value="" className="bg-white dark:bg-[#09090b] text-gray-500 dark:text-slate-300">-- Pilih Layanan --</option>{serviceTypes.map((t:any) => (<optgroup key={t.id} label={t.name} className="bg-white dark:bg-[#09090b] text-indigo-600 dark:text-indigo-400 font-bold uppercase">{t.services.map((s:any) => <option key={s.id} value={s.id} className="bg-white dark:bg-[#09090b] text-gray-900 dark:text-white normal-case font-medium">{s.name}</option>)}</optgroup>))}</select></div>
                                </div>
                            </section>

                            {/* SECTION: Checklist Dokumen */}
                            {getReqs().uploads.length > 0 && (
                                <section className="pt-8 border-t border-gray-200 dark:border-white/[0.05] animate-fade-in-up">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20"><FileText size={20}/></div>
                                        <h3 className={sectionTitle}>Checklist Dokumen Fisik</h3>
                                    </div>

                                    {/* DOKUMEN WAJIB */}
                                    <div className="grid grid-cols-1 gap-3">
                                        {getReqs().uploads.map((req: string, i: number) => {
                                            const isChecked = data.completed_requirements.includes(req) || !!data.files[req];
                                            return (
                                            <div key={i} className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border transition-all ${isChecked ? 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/5' : 'border-gray-200 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.02] hover:bg-gray-100 dark:hover:bg-white/[0.04]'}`}>
                                                <label className="flex items-center gap-4 w-full pr-4 cursor-pointer">
                                                    <input type="checkbox" checked={isChecked} onChange={() => toggleRequirement(req)} className="w-5 h-5 rounded border-gray-300 dark:border-[#27272a] bg-white dark:bg-[#18181b] text-emerald-500 focus:ring-emerald-500 cursor-pointer shrink-0" />
                                                    <div className={`p-2 rounded-lg shrink-0 ${isChecked ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-gray-200 dark:bg-white/5 text-gray-500 dark:text-slate-500'}`}>{isChecked ? <CheckCircle2 size={14} /> : <FileText size={14} />}</div>
                                                    <span className={`text-xs font-semibold uppercase tracking-wide leading-snug ${isChecked ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-slate-300'}`}>{req}</span>
                                                </label>
                                                <div className="flex items-center gap-3 shrink-0 pl-14 md:pl-0">
                                                    {isChecked ? (<span className="px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"><CheckCircle2 size={14}/> Ada</span>) : (<span className="px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-500/20 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"><X size={14}/> Belum</span>)}
                                                    <label className="cursor-pointer px-4 py-2 bg-white dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.05] text-gray-700 dark:text-slate-300 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 dark:hover:bg-indigo-600 dark:hover:text-white dark:hover:border-indigo-500 transition-all active:scale-95 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"><Upload size={14} /> Upload <input type="file" className="hidden" onChange={e => handleFileChange(req, e.target.files![0])} /></label>
                                                </div>
                                            </div>
                                        )})}
                                    </div>

                                    {/* DOKUMEN TAMBAHAN */}
                                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/[0.05]">
                                        <p className="text-[10px] font-bold text-gray-500 dark:text-slate-500 mb-4 tracking-widest uppercase">Dokumen Tambahan / Lainnya (Opsional):</p>
                                        {customUploadKeys.length > 0 && (
                                            <div className="space-y-3 mb-5">
                                                {customUploadKeys.map(key => (
                                                    <div key={key} className="flex justify-between items-center p-4 bg-indigo-50 dark:bg-indigo-500/5 rounded-xl border border-indigo-200 dark:border-indigo-500/30">
                                                        <div className="flex items-center gap-4">
                                                            <CheckCircle2 size={18} className="text-indigo-600 dark:text-indigo-400 shrink-0"/>
                                                            <div>
                                                                <p className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider leading-snug">{key}</p>
                                                                <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5 truncate max-w-[200px] md:max-w-xs">{data.files[key]?.name}</p>
                                                            </div>
                                                        </div>
                                                        <button type="button" onClick={() => removeCustomDoc(key)} className="p-2.5 text-red-500 hover:text-white bg-red-50 dark:bg-red-500/10 hover:bg-red-500 rounded-lg transition-all"><Trash2 size={16}/></button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex flex-col md:flex-row gap-3 items-end">
                                            <div className="w-full md:w-2/5">
                                                <label className={labelClasses}>Nama Dokumen</label>
                                                <input type="text" value={customDocName} onChange={e => setCustomDocName(e.target.value)} placeholder="Cth: KTP Pasangan..." className={inputClasses} />
                                            </div>
                                            <div className="w-full md:w-2/5">
                                                <label className={labelClasses}>Pilih File</label>
                                                <input type="file" id="customFile" className="hidden" onChange={e => setCustomDocFile(e.target.files ? e.target.files[0] : null)} />
                                                <label htmlFor="customFile" className="flex items-center justify-between px-4 py-[14px] bg-white dark:bg-[#09090b]/50 border border-gray-200 dark:border-white/[0.05] text-gray-700 dark:text-slate-300 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all cursor-pointer text-xs">
                                                    <span className="truncate max-w-[150px]">{customDocFile ? customDocFile.name : 'Belum ada file...'}</span>
                                                    <Upload size={14} className="text-gray-400 dark:text-slate-500 shrink-0"/>
                                                </label>
                                            </div>
                                            <button type="button" onClick={addCustomDoc} disabled={!customDocName || !customDocFile} className="w-full md:w-1/5 py-[14px] bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-500 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20">
                                                <PlusCircle size={16}/> Tambah
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-gray-500 dark:text-slate-500 italic mt-3">*Dokumen tambahan akan terunggah otomatis saat Anda mengklik tombol "Simpan & Daftarkan Order".</p>
                                    </div>
                                </section>
                            )}

                            {/* SECTION: Info Tambahan */}
                            {getReqs().inputs.length > 0 && (
                                <section className="pt-8 border-t border-gray-200 dark:border-white/[0.05] animate-fade-in-up">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20"><Info size={20}/></div>
                                        <h3 className={sectionTitle}>Info Tambahan</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {getReqs().inputs.map((label: string, i: number) => (
                                            <div key={i}>
                                                <label className="flex items-center gap-2 mb-2 ml-1 cursor-pointer">
                                                    <input type="checkbox" checked={data.completed_requirements.includes(label)} onChange={() => toggleRequirement(label)} className="w-4 h-4 rounded border-gray-300 dark:border-[#27272a] bg-white dark:bg-[#18181b] text-amber-500 focus:ring-amber-500 cursor-pointer" />
                                                    <span className="block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">{label}</span>
                                                </label>
                                                <input type="text" className={inputClasses} placeholder={`Ketik isi ${label.toLowerCase()}...`} onChange={e => handleInfoChange(label, e.target.value)} />
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* === KOLOM KANAN (STICKY RECEIPT) === */}
                        <div className="lg:col-span-5 space-y-6">
                            <div className="sticky top-6 space-y-6">
                                {isPPAT && (
                                    <div className={`${stickyReceipt} animate-fade-in-up`}>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500 border border-rose-200 dark:border-rose-500/20"><MapPin size={20}/></div>
                                            <h3 className={sectionTitle}>Detail Objek Tanah / Bangunan</h3>
                                        </div>
                                        <div className="space-y-5">
                                            <div><label className={labelClasses}>Atas Nama (A.n)</label><input type="text" value={data.seller_name} onChange={e => setData('seller_name', e.target.value)} className={inputClasses} placeholder="Nama di sertifikat..." /></div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div><label className={labelClasses}>Luas (M²)</label><input type="number" value={data.land_area} onChange={e => setData('land_area', e.target.value)} className={inputClasses} placeholder="0" /></div>
                                                <div><label className={labelClasses}>ZNT (NJOP/m)</label><input type="number" value={data.znt} onChange={e => setData('znt', e.target.value)} className={inputClasses} placeholder="Rp" /></div>
                                                <div><label className={labelClasses}>Harga Transaksi</label><input type="number" value={data.transaction_value} onChange={e => setData('transaction_value', e.target.value)} className={inputClasses} placeholder="Rp" /></div>
                                                <div><label className={labelClasses}>Total NJOP</label><input type="number" value={data.njop} onChange={e => setData('njop', e.target.value)} className={inputClasses} placeholder="Rp" /></div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className={stickyReceipt}>
                                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-emerald-500/10 blur-[40px] pointer-events-none"></div>
                                    <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-indigo-500/10 blur-[40px] pointer-events-none"></div>
                                    
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-white/[0.05]">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-emerald-100 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"><Calculator size={20}/></div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">Rincian Tagihan</h3>
                                            </div>
                                        </div>

                                        <div className="space-y-5">
                                            <div>
                                                <label className={labelClasses}>Honorarium Utama</label>
                                                <div className="flex items-center gap-2 relative">
                                                    <span className="absolute left-4 text-gray-500 dark:text-slate-500 font-bold text-sm">Rp</span>
                                                    <input type="number" value={data.service_price} onChange={e => setData('service_price', Number(e.target.value))} className={`${inputClasses} pl-10 text-emerald-600 dark:text-emerald-400 font-black text-lg border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5`} />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                {getActiveFees().includes('plotting') && (
                                                    <div className="col-span-2 md:col-span-1">
                                                        <div className="flex justify-between items-end mb-2">
                                                            <label className={`${labelClasses} !mb-0`}>Plotting / Lainnya</label>
                                                            {(Number(data.land_area) > 0 || Number(data.znt) > 0) && (
                                                                <div className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-200 dark:border-indigo-500/20 text-right">
                                                                    (L×ZNT/1K)+350rb
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-3.5 text-gray-500 dark:text-slate-500 font-bold text-sm">Rp</span>
                                                            <input type="number" value={data.plotting_fee} onChange={e => setData('plotting_fee', Number(e.target.value))} className={`${inputClasses} pl-9`} />
                                                        </div>
                                                    </div>
                                                )}
                                                {getActiveFees().includes('penataan_batas') && (<div><label className={labelClasses}>Penataan Batas</label><div className="relative"><span className="absolute left-3 top-3.5 text-gray-500 dark:text-slate-500 font-bold text-sm">Rp</span><input type="number" value={data.measurement_fee} onChange={e => setData('measurement_fee', Number(e.target.value))} className={`${inputClasses} pl-9`} /></div></div>)}
                                                {getActiveFees().includes('pnbp') && (<div><label className={labelClasses}>PNBP Negara</label><div className="relative"><span className="absolute left-3 top-3.5 text-gray-500 dark:text-slate-500 font-bold text-sm">Rp</span><input type="number" value={data.pnbp_fee} onChange={e => setData('pnbp_fee', Number(e.target.value))} className={`${inputClasses} pl-9`} /></div></div>)}
                                                {getActiveFees().includes('validasi_pajak') && (<div><label className={labelClasses}>Validasi Pajak</label><div className="relative"><span className="absolute left-3 top-3.5 text-gray-500 dark:text-slate-500 font-bold text-sm">Rp</span><input type="number" value={data.validation_fee} onChange={e => setData('validation_fee', Number(e.target.value))} className={`${inputClasses} pl-9`} /></div></div>)}

                                                {/* BPHTB DENGAN INFO RUMUS YANG TRANSPARAN */}
                                                {getActiveFees().includes('bphtb') && (
                                                    <div className="col-span-2">
                                                        <div className="flex justify-between items-end mb-2">
                                                            <label className={`${labelClasses} !mb-0`}>Pajak Pembeli (BPHTB)</label>
                                                            {nilaiTertinggi > 0 && (
                                                                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-500/20 text-right">
                                                                    <span className="block text-gray-400 dark:text-slate-500 text-[8px] mb-0.5 uppercase tracking-widest">Acuan: {labelNilai} ({rupiah(nilaiTertinggi)})</span>
                                                                    5% × ({rupiah(nilaiTertinggi)} - {rupiah(npoptkpDisplay)})
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-3.5 text-gray-500 dark:text-slate-500 font-bold text-sm">Rp</span>
                                                            <input type="number" value={data.bphtb_fee} onChange={e => setData('bphtb_fee', Number(e.target.value))} className={`${inputClasses} pl-9`} />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* PPh DENGAN INFO RUMUS YANG TRANSPARAN */}
                                                {getActiveFees().includes('pph') && (
                                                    <div className="col-span-2">
                                                        <div className="flex justify-between items-end mb-2">
                                                            <label className={`${labelClasses} !mb-0`}>Pajak Penjual (PPh)</label>
                                                            {nilaiTertinggi > 0 && (
                                                                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-500/20 text-right">
                                                                    <span className="block text-gray-400 dark:text-slate-500 text-[8px] mb-0.5 uppercase tracking-widest">Acuan: {labelNilai} ({rupiah(nilaiTertinggi)})</span>
                                                                    2.5% × {rupiah(nilaiTertinggi)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-3.5 text-gray-500 dark:text-slate-500 font-bold text-sm">Rp</span>
                                                            <input type="number" value={data.pph_fee} onChange={e => setData('pph_fee', Number(e.target.value))} className={`${inputClasses} pl-9`} />
                                                        </div>
                                                    </div>
                                                )}
                                                {getActiveFees().includes('tax_deposit') && (<div className="col-span-2"><label className={labelClasses}>Balik Nama SPPT</label><div className="relative"><span className="absolute left-3 top-3.5 text-gray-500 dark:text-slate-500 font-bold text-sm">Rp</span><input type="number" value={data.tax_deposit} onChange={e => setData('tax_deposit', Number(e.target.value))} className={`${inputClasses} pl-9`} /></div></div>)}
                                            </div>

                                            <div className="pt-6 mt-6 border-t border-gray-200 dark:border-white/[0.05]">
                                                <div className="flex justify-between items-center mb-6">
                                                    <span className="text-[11px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest">Total Nilai Tagihan</span>
                                                    <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">Rp {calculateTotal().toLocaleString('id-ID')}</span>
                                                </div>
                                                <button type="submit" disabled={processing} className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
                                                    {processing ? 'Menyimpan...' : 'Simpan & Daftarkan Order'}
                                                </button>
                                            </div>
                                        </div>
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
