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

    const inputClasses = "w-full bg-[#09090b] border border-[#27272a] text-slate-200 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 transition-all outline-none shadow-inner";
    const labelClasses = "block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1";
    const cardClass = "bg-[#121214] border border-[#27272a] rounded-[2rem] p-8 shadow-xl";
    const sectionTitle = "text-lg font-black text-white mb-8 flex items-center gap-3 uppercase tracking-wide";

    return (
        <AppLayout breadcrumbs={[{ title: 'Order Masuk', href: '/orders' }, { title: 'Buat Order Baru', href: '#' }]}>
            <Head title="Pendaftaran Pekerjaan" />
            <div className="min-h-screen bg-gray-50 dark:bg-black p-4 lg:p-8 font-sans">
                <div className="w-full mx-auto space-y-8">
                    <div className="flex justify-between items-center mb-8">
                        <div><h1 className="text-3xl font-black text-black dark:text-white tracking-tight">Order Pekerjaan Baru</h1><p className="mt-1 text-slate-500 text-sm font-medium">Registrasi layanan, berkas, dan tagihan klien dalam satu halaman.</p></div>
                        <Link href={route('orders.index')} className="px-5 py-2.5 border border-[#27272a] text-slate-400 hover:text-white hover:bg-[#27272a] rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2"><ArrowLeft size={14} /> Kembali</Link>
                    </div>

                    <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-7 space-y-6">
                            <div className={cardClass}>
                                <h3 className={sectionTitle}><ShieldCheck className="text-indigo-500" size={24}/> 01. Informasi Utama</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className={labelClasses}>Pilih Klien</label><select value={data.client_id} onChange={e => setData('client_id', e.target.value)} className={inputClasses} required><option value="">-- Pilih Klien --</option>{clients.map((c:any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                                    <div><label className={labelClasses}>Jenis Akta</label><select value={data.service_id} onChange={e => setData('service_id', e.target.value)} className={`${inputClasses} font-bold text-white`} required><option value="">-- Pilih Layanan --</option>{serviceTypes.map((t:any) => (<optgroup key={t.id} label={t.name} className="text-slate-500 font-bold uppercase">{t.services.map((s:any) => <option key={s.id} value={s.id} className="text-white normal-case font-medium">{s.name}</option>)}</optgroup>))}</select></div>
                                </div>
                            </div>

                            {getReqs().uploads.length > 0 && (
                                <div className={`${cardClass} animate-fade-in`}>
                                    <h3 className={sectionTitle}><Upload className="text-indigo-500" size={24}/> 02. Checklist Dokumen Fisik</h3>

                                    {/* DOKUMEN WAJIB SESUAI SOP */}
                                    <div className="grid grid-cols-1 gap-3">
                                        {getReqs().uploads.map((req: string, i: number) => {
                                            const isChecked = data.completed_requirements.includes(req) || !!data.files[req];
                                            return (
                                            <div key={i} className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border transition-all ${isChecked ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-[#27272a] bg-[#09090b]'}`}>
                                                <div className="flex items-center gap-4 w-full pr-4">
                                                    <input type="checkbox" checked={isChecked} onChange={() => toggleRequirement(req)} className="w-5 h-5 rounded border-[#27272a] bg-[#18181b] text-emerald-500 focus:ring-emerald-500 cursor-pointer shrink-0" />
                                                    <div className={`p-2.5 rounded-xl shrink-0 ${isChecked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#18181b] text-slate-600'}`}>{isChecked ? <CheckCircle2 size={16} /> : <FileText size={16} />}</div>
                                                    <span className={`text-[11px] font-bold uppercase tracking-wide leading-snug ${isChecked ? 'text-emerald-500' : 'text-slate-300'}`}>{req}</span>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0 pl-14 md:pl-0">
                                                    {isChecked ? (<span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"><CheckCircle2 size={14}/> Ada</span>) : (<span className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"><X size={14}/> Belum</span>)}
                                                    <label className="cursor-pointer px-4 py-2 bg-[#18181b] border border-[#27272a] text-slate-300 rounded-lg hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all active:scale-95 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"><Upload size={14} /> Upload <input type="file" className="hidden" onChange={e => handleFileChange(req, e.target.files![0])} /></label>
                                                </div>
                                            </div>
                                        )})}
                                    </div>

                                    {/* DOKUMEN TAMBAHAN (OPSIONAL) */}
                                    <div className="mt-8 pt-6 border-t border-[#27272a]">
                                        <p className="text-[10px] font-bold text-slate-500 mb-4 tracking-widest uppercase">Dokumen Tambahan / Lainnya (Opsional):</p>

                                        {customUploadKeys.length > 0 && (
                                            <div className="space-y-3 mb-5">
                                                {customUploadKeys.map(key => (
                                                    <div key={key} className="flex justify-between items-center p-4 bg-[#18181b] rounded-xl border border-indigo-500/30">
                                                        <div className="flex items-center gap-4">
                                                            <CheckCircle2 size={18} className="text-indigo-500 shrink-0"/>
                                                            <div>
                                                                <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider leading-snug">{key}</p>
                                                                <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[200px] md:max-w-xs">{data.files[key]?.name}</p>
                                                            </div>
                                                        </div>
                                                        <button type="button" onClick={() => removeCustomDoc(key)} className="p-2.5 text-red-500 hover:text-white bg-red-500/10 hover:bg-red-500 rounded-lg transition-all"><Trash2 size={16}/></button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex flex-col md:flex-row gap-3 items-end">
                                            <div className="w-full md:w-2/5">
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Nama Dokumen</label>
                                                <input type="text" value={customDocName} onChange={e => setCustomDocName(e.target.value)} placeholder="Cth: KTP Pasangan..." className={inputClasses} />
                                            </div>
                                            <div className="w-full md:w-2/5">
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Pilih File</label>
                                                <input type="file" id="customFile" className="hidden" onChange={e => setCustomDocFile(e.target.files ? e.target.files[0] : null)} />
                                                <label htmlFor="customFile" className="flex items-center justify-between px-4 py-[14px] bg-[#09090b] border border-[#27272a] text-slate-300 rounded-xl hover:bg-[#18181b] transition-all cursor-pointer text-xs">
                                                    <span className="truncate max-w-[150px]">{customDocFile ? customDocFile.name : 'Belum ada file...'}</span>
                                                    <Upload size={14} className="text-slate-500 shrink-0"/>
                                                </label>
                                            </div>
                                            <button type="button" onClick={addCustomDoc} disabled={!customDocName || !customDocFile} className="w-full md:w-1/5 py-[14px] bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-500 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.2)]">
                                                <PlusCircle size={16}/> Tambah
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-slate-500 italic mt-3">*Dokumen tambahan akan terunggah otomatis saat Anda mengklik tombol "Simpan & Daftarkan Order".</p>
                                    </div>
                                </div>
                            )}

                            {getReqs().inputs.length > 0 && (
                                <div className={`${cardClass} animate-fade-in`}>
                                    <h3 className={sectionTitle}><Info className="text-amber-500" size={24}/> 03. Info Tambahan</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {getReqs().inputs.map((label: string, i: number) => (
                                            <div key={i}>
                                                <div className="flex items-center gap-2 mb-2 ml-1">
                                                    <input type="checkbox" checked={data.completed_requirements.includes(label)} onChange={() => toggleRequirement(label)} className="w-4 h-4 rounded border-[#27272a] bg-[#18181b] text-amber-500 focus:ring-amber-500 cursor-pointer" />
                                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</label>
                                                </div>
                                                <input type="text" className={inputClasses} placeholder={`Ketik isi ${label.toLowerCase()}...`} onChange={e => handleInfoChange(label, e.target.value)} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-5 space-y-6">
                            <div className="sticky top-6 space-y-6">
                                {isPPAT && (
                                    <div className={`${cardClass} animate-fade-in-up`}>
                                        <h3 className={sectionTitle}><MapPin className="text-rose-500" size={24}/> Detail Objek Tanah / Bangunan</h3>
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

                                <div className={cardClass}>
                                    <h3 className={sectionTitle}><Calculator className="text-emerald-500" size={24}/> Rincian Tagihan</h3>
                                    <div className="space-y-5">
                                        <div><label className={labelClasses}>Honorarium Utama</label><input type="number" value={data.service_price} onChange={e => setData('service_price', Number(e.target.value))} className={`${inputClasses} border-emerald-500/30 text-emerald-400 font-black text-lg`} /></div>

                                        <div className="grid grid-cols-2 gap-5">
                                            {getActiveFees().includes('plotting') && (
                                                <div className="col-span-2 md:col-span-1">
                                                    <div className="flex justify-between items-end mb-2">
                                                        <label className={`${labelClasses} !mb-0`}>Plotting / Lainnya</label>
                                                        {(Number(data.land_area) > 0 || Number(data.znt) > 0) && (
                                                            <div className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-1.5 rounded-lg border border-indigo-500/20 text-right">
                                                                (L × ZNT / 1.000) + 350rb
                                                            </div>
                                                        )}
                                                    </div>
                                                    <input type="number" value={data.plotting_fee} onChange={e => setData('plotting_fee', Number(e.target.value))} className={inputClasses} />
                                                </div>
                                            )}
                                            {getActiveFees().includes('penataan_batas') && (<div><label className={labelClasses}>Penataan Batas</label><input type="number" value={data.measurement_fee} onChange={e => setData('measurement_fee', Number(e.target.value))} className={inputClasses} /></div>)}
                                            {getActiveFees().includes('pnbp') && (<div><label className={labelClasses}>PNBP Negara</label><input type="number" value={data.pnbp_fee} onChange={e => setData('pnbp_fee', Number(e.target.value))} className={inputClasses} /></div>)}
                                            {getActiveFees().includes('validasi_pajak') && (<div><label className={labelClasses}>Validasi Pajak</label><input type="number" value={data.validation_fee} onChange={e => setData('validation_fee', Number(e.target.value))} className={inputClasses} /></div>)}

                                            {/* BPHTB DENGAN INFO RUMUS YANG TRANSPARAN */}
                                            {getActiveFees().includes('bphtb') && (
                                                <div className="col-span-2">
                                                    <div className="flex justify-between items-end mb-2">
                                                        <label className={`${labelClasses} !mb-0`}>Pajak Pembeli (BPHTB)</label>
                                                        {nilaiTertinggi > 0 && (
                                                            <div className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20 text-right">
                                                                <span className="block text-slate-500 text-[8px] mb-0.5 uppercase tracking-widest">Acuan: {labelNilai} ({rupiah(nilaiTertinggi)})</span>
                                                                5% × ({rupiah(nilaiTertinggi)} - {rupiah(npoptkpDisplay)})
                                                            </div>
                                                        )}
                                                    </div>
                                                    <input type="number" value={data.bphtb_fee} onChange={e => setData('bphtb_fee', Number(e.target.value))} className={inputClasses} />
                                                </div>
                                            )}

                                            {/* PPh DENGAN INFO RUMUS YANG TRANSPARAN */}
                                            {getActiveFees().includes('pph') && (
                                                <div className="col-span-2">
                                                    <div className="flex justify-between items-end mb-2">
                                                        <label className={`${labelClasses} !mb-0`}>Pajak Penjual (PPh)</label>
                                                        {nilaiTertinggi > 0 && (
                                                            <div className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20 text-right">
                                                                <span className="block text-slate-500 text-[8px] mb-0.5 uppercase tracking-widest">Acuan: {labelNilai} ({rupiah(nilaiTertinggi)})</span>
                                                                2.5% × {rupiah(nilaiTertinggi)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <input type="number" value={data.pph_fee} onChange={e => setData('pph_fee', Number(e.target.value))} className={inputClasses} />
                                                </div>
                                            )}
                                            {getActiveFees().includes('tax_deposit') && (<div className="col-span-2"><label className={labelClasses}>Balik Nama SPPT</label><input type="number" value={data.tax_deposit} onChange={e => setData('tax_deposit', Number(e.target.value))} className={inputClasses} /></div>)}
                                        </div>

                                        <div className="pt-6 mt-6 border-t border-[#27272a]">
                                            <div className="flex justify-between items-center mb-6">
                                                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Total Nilai Tagihan</span>
                                                <span className="text-3xl font-black text-indigo-400 tracking-tighter">Rp {calculateTotal().toLocaleString('id-ID')}</span>
                                            </div>
                                            <button type="submit" disabled={processing} className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">
                                                {processing ? 'Menyimpan...' : 'Simpan & Daftarkan Order'}
                                            </button>
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
