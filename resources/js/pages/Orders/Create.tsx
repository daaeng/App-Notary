import { useState, useEffect, FormEventHandler } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Upload, FileText, CheckCircle2, Calculator, ShieldCheck, Info, AlertCircle, MapPin, Wallet } from 'lucide-react';

interface Props {
    clients: any[];
    serviceTypes: any[];
    company: any;
}

export default function OrderCreate({ clients, serviceTypes, company }: Props) {
    const [selectedService, setSelectedService] = useState<any>(null);
    const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({});

    const { data, setData, post, processing, errors } = useForm({
        client_id: '',
        service_id: '',
        description: '',
        seller_name: '',
        land_area: '',
        transaction_value: '',
        njop: '',
        service_price: 0,
        plotting_fee: 0,
        pnbp_fee: 0,
        validation_fee: 0,
        bphtb_fee: 0,
        pph_fee: 0,
        measurement_fee: 0,
        location_check_fee: 0,
        area_measurement_fee: 0,
        tax_deposit: 0,
        additional_info: {} as Record<string, string>,
        completed_requirements: [] as string[], // Status Checklist
        files: {} as Record<string, File | null>,
    });

    useEffect(() => {
        const found = serviceTypes.flatMap((t: any) => t.services).find((s: any) => s.id === Number(data.service_id));
        if (found) {
            setSelectedService(found);
            setData('service_price', found.default_price);
            setUploadedFiles({});
            setData('completed_requirements', []); // Reset checklist saat ganti layanan
        }
    }, [data.service_id]);

    const calculateTotal = () => {
        return Number(data.service_price) + Number(data.plotting_fee) + Number(data.pnbp_fee) +
               Number(data.validation_fee) + Number(data.bphtb_fee) + Number(data.pph_fee) +
               Number(data.measurement_fee) + Number(data.tax_deposit) +
               Number(data.location_check_fee) + Number(data.area_measurement_fee);
    };

    // Fungsi Toggle Checklist Berkas
    const toggleRequirement = (reqName: string) => {
        const current = data.completed_requirements || [];
        if (current.includes(reqName)) {
            setData('completed_requirements', current.filter(item => item !== reqName));
        } else {
            setData('completed_requirements', [...current, reqName]);
        }
    };

    const handleFileChange = (reqName: string, file: File | null) => {
        const newFiles = { ...uploadedFiles, [reqName]: file };
        setUploadedFiles(newFiles);
        setData('files', newFiles);

        // Auto-check jika file diupload
        if (file && !data.completed_requirements.includes(reqName)) {
            toggleRequirement(reqName);
        }
    };

    const handleInfoChange = (key: string, value: string) => {
        setData('additional_info', { ...data.additional_info, [key]: value });
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('orders.store'), { forceFormData: true });
    };

    const inputClasses = "mt-1 block w-full rounded-xl bg-slate-900/60 border border-slate-800 text-slate-100 py-2.5 px-4 focus:ring-cyan-500 text-sm transition-all shadow-inner";
    const labelClasses = "block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1";

    const getReqs = () => {
        if (!selectedService?.requirements) return { uploads: [], inputs: [] };
        return typeof selectedService.requirements === 'string' ? JSON.parse(selectedService.requirements) : selectedService.requirements;
    };

    const getActiveFees = () => {
        if (!selectedService?.active_fee_fields) return [];
        return typeof selectedService.active_fee_fields === 'string' ? JSON.parse(selectedService.active_fee_fields) : selectedService.active_fee_fields;
    };

    const renderNote = () => {
        if (!selectedService) return null;
        const name = selectedService.name.toLowerCase();
        if (name.includes('waris') || name.includes('aphw')) {
            return (
                <div className="mt-8 p-6 bg-slate-900/40 rounded-[1.5rem] border border-slate-800 border-l-4 border-l-amber-500 shadow-xl">
                    <h4 className="flex items-center gap-2 text-amber-500 font-black text-[11px] uppercase tracking-widest mb-3"><AlertCircle size={14} /> Panduan Perhitungan Waris</h4>
                    <ul className="space-y-2 text-[11px] text-slate-400 font-medium leading-relaxed italic">
                        <li>• Pengurangan 300jt bagi pengurusan pertama.</li>
                        <li>• Pajak BPHTB: (NJOP - 300jt) x 5%</li>
                    </ul>
                </div>
            );
        }
        return null;
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Order', href: '/orders' }, { title: 'Buat Baru', href: '#' }]}>
            <Head title="Pendaftaran Pekerjaan" />
            <div className="min-h-screen bg-gray-50 dark:bg-black p-6 lg:p-8 font-sans">
                <div className="w-full mx-auto space-y-8">
                    <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        <div className="lg:col-span-7 space-y-6">
                            {/* 01. INFO UTAMA */}
                            <div className="bg-slate-950 p-8 rounded-[2.5rem] border border-slate-800/50 shadow-2xl">
                                <h3 className="text-white font-black text-xl mb-8 flex items-center gap-3 uppercase"><ShieldCheck className="text-cyan-500" size={24}/> 01. Informasi Utama</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className={labelClasses}>Pilih Klien Utama</label>
                                        <select value={data.client_id} onChange={e => setData('client_id', e.target.value)} className={inputClasses} required>
                                            <option value="">-- Pilih Klien --</option>
                                            {clients.map((c:any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Layanan / Jenis Akta</label>
                                        <select value={data.service_id} onChange={e => setData('service_id', e.target.value)} className={inputClasses} required>
                                            <option value="">-- Pilih Layanan --</option>
                                            {serviceTypes.map((t:any) => (
                                                <optgroup key={t.id} label={t.name}>
                                                    {t.services.map((s:any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                </optgroup>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* 02. CHECKLIST BERKAS & UPLOAD */}
                            {getReqs().uploads.length > 0 && (
                                <div className="bg-slate-950 p-8 rounded-[2.5rem] border border-slate-800/50 shadow-2xl animate-fade-in">
                                    <h3 className="text-white font-black text-xl mb-8 flex items-center gap-3 uppercase"><Upload className="text-indigo-500" size={24}/> 02. Checklist Dokumen Fisik</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {getReqs().uploads.map((req: string, i: number) => (
                                            <div key={i} className={`flex items-center justify-between p-4 bg-slate-900/40 border rounded-2xl transition-all ${data.completed_requirements.includes(req) ? 'border-emerald-500/50 bg-emerald-900/10' : 'border-slate-800/80 hover:border-cyan-500/30'}`}>
                                                <div className="flex items-center gap-3 overflow-hidden pr-2 w-full">
                                                    <input type="checkbox" checked={data.completed_requirements.includes(req)} onChange={() => toggleRequirement(req)} className="w-5 h-5 rounded-md border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 cursor-pointer shrink-0" />
                                                    <div className={`p-2.5 rounded-xl shrink-0 ${uploadedFiles[req] || data.completed_requirements.includes(req) ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
                                                        {uploadedFiles[req] || data.completed_requirements.includes(req) ? <CheckCircle2 size={18} /> : <FileText size={18} />}
                                                    </div>
                                                    <span className={`text-[11px] font-bold uppercase truncate ${data.completed_requirements.includes(req) ? 'text-emerald-400' : 'text-slate-300'}`}>{req}</span>
                                                </div>
                                                <label className="cursor-pointer p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all active:scale-90 shrink-0">
                                                    <Upload size={16} /><input type="file" className="hidden" onChange={e => handleFileChange(req, e.target.files![0])} />
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 03. INFORMASI TAMBAHAN */}
                            {getReqs().inputs.length > 0 && (
                                <div className="bg-slate-950 p-8 rounded-[2.5rem] border border-slate-800/50 shadow-2xl">
                                    <h3 className="text-white font-black text-xl mb-8 flex items-center gap-3 uppercase"><Info className="text-amber-500" size={24}/> 03. Informasi Tambahan</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {getReqs().inputs.map((label: string, i: number) => (
                                            <div key={i}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <input type="checkbox" checked={data.completed_requirements.includes(label)} onChange={() => toggleRequirement(label)} className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500" />
                                                    <label className={labelClasses}>{label}</label>
                                                </div>
                                                <input type="text" className={inputClasses} placeholder={`Ketik ${label.toLowerCase()}...`} onChange={e => handleInfoChange(label, e.target.value)} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* PANEL KANAN: OBJEK & BIAYA */}
                        <div className="lg:col-span-5 space-y-6">
                            <div className="sticky top-8 space-y-6">
                                <div className="bg-slate-950 p-8 rounded-[2.5rem] border border-slate-800/50 shadow-2xl">
                                    <h3 className="text-white font-black text-xl mb-6 flex items-center gap-3 uppercase"><MapPin className="text-rose-500" size={24}/> Detail Objek</h3>
                                    <div className="space-y-5">
                                        <div><label className={labelClasses}>Atas Nama (A.n)</label><input type="text" value={data.seller_name} onChange={e => setData('seller_name', e.target.value)} className={inputClasses} placeholder="Nama di sertifikat..." /></div>
                                        <div className="grid grid-cols-2 gap-5">
                                            <div><label className={labelClasses}>Luas (M²)</label><input type="number" value={data.land_area} onChange={e => setData('land_area', e.target.value)} className={inputClasses} /></div>
                                            <div><label className={labelClasses}>Total NJOP (Rp)</label><input type="number" value={data.njop} onChange={e => setData('njop', e.target.value)} className={inputClasses} /></div>
                                        </div>
                                        <div className="mt-8 p-6 bg-emerald-950/20 rounded-[1.5rem] border border-emerald-900/50 shadow-inner">
                                            <h4 className="text-emerald-500 font-black text-[11px] uppercase tracking-widest mb-4 flex items-center gap-2"><Wallet size={16} /> Metode Pembayaran</h4>
                                            <div className="space-y-3 text-[12px] text-slate-300 font-medium">
                                                <div className="flex justify-between border-b border-emerald-900/30 pb-2"><span className="text-slate-500">Bank</span><span className="font-bold text-white">{company?.bank_name || '-'}</span></div>
                                                <div className="flex justify-between border-b border-emerald-900/30 pb-2"><span className="text-slate-500">No. Rekening</span><span className="font-mono font-bold text-emerald-400 tracking-wider">{company?.account_number || '-'}</span></div>
                                                <div className="flex justify-between pt-1"><span className="text-slate-500">Atas Nama</span><span className="font-bold text-white uppercase">{company?.account_name || '-'}</span></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-950 p-8 rounded-[2.5rem] border border-slate-800/50 shadow-2xl">
                                    <h3 className="text-white font-black text-xl mb-8 flex items-center gap-3 uppercase"><Calculator className="text-emerald-500" size={24}/> Rincian Tagihan</h3>
                                    <div className="space-y-5">
                                        <div><label className={labelClasses}>Honorarium Utama</label><input type="number" value={data.service_price} onChange={e => setData('service_price', Number(e.target.value))} className={`${inputClasses} border-emerald-900/30 text-emerald-400 font-black text-lg`} /></div>
                                        <div className="grid grid-cols-2 gap-5">
                                            {getActiveFees().includes('plotting') && (<div><label className={labelClasses}>Plotting</label><input type="number" value={data.plotting_fee} onChange={e => setData('plotting_fee', Number(e.target.value))} className={inputClasses} /></div>)}
                                            {getActiveFees().includes('pnbp') && (<div><label className={labelClasses}>PNBP</label><input type="number" value={data.pnbp_fee} onChange={e => setData('pnbp_fee', Number(e.target.value))} className={inputClasses} /></div>)}
                                            {getActiveFees().includes('bphtb') && (<div className="col-span-2"><label className={labelClasses}>BPHTB</label><input type="number" value={data.bphtb_fee} onChange={e => setData('bphtb_fee', Number(e.target.value))} className={inputClasses} /></div>)}
                                        </div>
                                        <div className="pt-8 mt-4 border-t border-slate-800">
                                            <div className="flex justify-between items-center mb-8">
                                                <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Total Tagihan</span>
                                                <span className="text-4xl font-black text-white tracking-tighter">Rp {calculateTotal().toLocaleString('id-ID')}</span>
                                            </div>
                                            <button type="submit" disabled={processing} className="w-full py-5 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-cyan-900/20 hover:-translate-y-1 transition-all">
                                                {processing ? 'Menyimpan...' : 'Simpan Pekerjaan'}
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
