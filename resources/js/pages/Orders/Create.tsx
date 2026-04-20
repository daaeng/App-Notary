import { useState, useEffect, FormEventHandler } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Upload, FileText, CheckCircle2, Calculator, ShieldCheck, Info, AlertCircle, MapPin, Wallet, ArrowLeft } from 'lucide-react';

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
        completed_requirements: [] as string[],
        files: {} as Record<string, File | null>,
    });

    useEffect(() => {
        const found = serviceTypes.flatMap((t: any) => t.services).find((s: any) => s.id === Number(data.service_id));
        if (found) {
            setSelectedService(found);
            setData('service_price', found.default_price);
            setUploadedFiles({});
            setData('completed_requirements', []);
        } else {
            setSelectedService(null);
            setData('service_price', 0);
        }
    }, [data.service_id]);

    const calculateTotal = () => {
        return Number(data.service_price) + Number(data.plotting_fee) + Number(data.pnbp_fee) +
               Number(data.validation_fee) + Number(data.bphtb_fee) + Number(data.pph_fee) +
               Number(data.measurement_fee) + Number(data.tax_deposit) +
               Number(data.location_check_fee) + Number(data.area_measurement_fee);
    };

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

    const handleInfoChange = (key: string, value: string) => {
        setData('additional_info', { ...data.additional_info, [key]: value });
    };

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

    const renderNote = () => {
        if (!selectedService) return null;
        const name = selectedService.name.toLowerCase();
        if (name.includes('waris') || name.includes('aphw')) {
            return (
                <div className="mt-8 p-6 bg-[#18181b] rounded-2xl border border-amber-900/30 border-l-4 border-l-amber-500 shadow-xl">
                    <h4 className="flex items-center gap-2 text-amber-500 font-bold text-[11px] uppercase tracking-widest mb-3"><AlertCircle size={14} /> Panduan Perhitungan Waris</h4>
                    <ul className="space-y-2 text-[11px] text-slate-400 font-medium leading-relaxed italic">
                        <li>• Waris dapat pengurangan NPOPTKP 300jt bagi yang belum pernah melakukan pengurusan.</li>
                        <li>• Jika tidak dapat pengurangan, hitungan biaya Pajak BPHTB jadi: Nilai NJOP x 5%</li>
                    </ul>
                </div>
            );
        } else if (name.includes('jual beli') || name.includes('ajb') || name.includes('hibah')) {
            return (
                <div className="mt-8 p-6 bg-[#18181b] rounded-2xl border border-cyan-900/30 border-l-4 border-l-cyan-500 shadow-xl">
                    <h4 className="flex items-center gap-2 text-cyan-500 font-bold text-[11px] uppercase tracking-widest mb-3"><AlertCircle size={14} /> Panduan Perhitungan Transaksi</h4>
                    <ul className="space-y-2 text-[11px] text-slate-400 font-medium leading-relaxed italic">
                        <li>• Dapat pengurangan 80jt (NPOPTKP) berlaku untuk yang pertama kali pengurusan BPHTB.</li>
                        <li>• Pajak Pembeli (BPHTB): (Harga Transaksi / Nilai NJOP - 80jt) x 5%</li>
                        <li>• Pajak Penjual (PPh): Harga Transaksi / Nilai NJOP x 2.5%</li>
                    </ul>
                </div>
            );
        }
        return null;
    };

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
                        <div>
                            <h1 className="text-3xl font-black text-black dark:text-white tracking-tight">Order Pekerjaan Baru</h1>
                            <p className="mt-1 text-slate-500 text-sm font-medium">Registrasi layanan, berkas, dan tagihan klien dalam satu halaman.</p>
                        </div>
                        <Link href={route('orders.index')} className="px-5 py-2.5 border border-[#27272a] text-slate-400 hover:text-white hover:bg-[#27272a] rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2">
                            <ArrowLeft size={14} /> Kembali
                        </Link>
                    </div>

                    <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* === KOLOM KIRI === */}
                        <div className="lg:col-span-7 space-y-6">

                            <div className={cardClass}>
                                <h3 className={sectionTitle}><ShieldCheck className="text-indigo-500" size={24}/> 01. Informasi Utama</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelClasses}>Pilih Klien (Pemohon)</label>
                                        <select value={data.client_id} onChange={e => setData('client_id', e.target.value)} className={inputClasses} required>
                                            <option value="">-- Pilih Klien --</option>
                                            {clients.map((c:any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Layanan / Jenis Akta</label>
                                        <select value={data.service_id} onChange={e => setData('service_id', e.target.value)} className={`${inputClasses} font-bold text-white`} required>
                                            <option value="">-- Pilih Layanan --</option>
                                            {serviceTypes.map((t:any) => (
                                                <optgroup key={t.id} label={t.name} className="text-slate-500 font-bold uppercase">
                                                    {t.services.map((s:any) => <option key={s.id} value={s.id} className="text-white normal-case font-medium">{s.name}</option>)}
                                                </optgroup>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {getReqs().uploads.length > 0 && (
                                <div className={`${cardClass} animate-fade-in`}>
                                    <h3 className={sectionTitle}><Upload className="text-indigo-500" size={24}/> 02. Checklist Dokumen Fisik</h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {getReqs().uploads.map((req: string, i: number) => (
                                            <div key={i} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${data.completed_requirements.includes(req) ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-[#27272a] bg-[#09090b]'}`}>
                                                <div className="flex items-center gap-4 w-full pr-4">
                                                    <input type="checkbox" checked={data.completed_requirements.includes(req)} onChange={() => toggleRequirement(req)} className="w-5 h-5 rounded border-[#27272a] bg-[#18181b] text-emerald-500 focus:ring-emerald-500 cursor-pointer shrink-0" />
                                                    <div className={`p-2.5 rounded-xl shrink-0 ${uploadedFiles[req] || data.completed_requirements.includes(req) ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#18181b] text-slate-600'}`}>
                                                        {uploadedFiles[req] || data.completed_requirements.includes(req) ? <CheckCircle2 size={16} /> : <FileText size={16} />}
                                                    </div>
                                                    <span className={`text-[11px] font-bold uppercase tracking-wide leading-snug ${data.completed_requirements.includes(req) ? 'text-emerald-500' : 'text-slate-300'}`}>{req}</span>
                                                </div>
                                                <label className="cursor-pointer p-3 bg-[#18181b] border border-[#27272a] text-slate-300 rounded-xl hover:bg-indigo-600 hover:border-indigo-500 hover:text-white transition-all active:scale-95 shrink-0">
                                                    <Upload size={16} /><input type="file" className="hidden" onChange={e => handleFileChange(req, e.target.files![0])} />
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {getReqs().inputs.length > 0 && (
                                <div className={`${cardClass} animate-fade-in`}>
                                    <h3 className={sectionTitle}><Info className="text-amber-500" size={24}/> 03. Informasi Tambahan</h3>
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

                        {/* === KOLOM KANAN === */}
                        <div className="lg:col-span-5 space-y-6">
                            <div className="sticky top-6 space-y-6">

                                {/* DETAIL OBJEK */}
                                <div className={cardClass}>
                                    <h3 className={sectionTitle}><MapPin className="text-rose-500" size={24}/> Detail Objek Tanah / Bangunan</h3>
                                    <div className="space-y-5">
                                        <div><label className={labelClasses}>Atas Nama (A.n)</label><input type="text" value={data.seller_name} onChange={e => setData('seller_name', e.target.value)} className={inputClasses} placeholder="Nama di sertifikat (Kosongkan jika tidak ada)..." /></div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div><label className={labelClasses}>Luas (M²)</label><input type="number" value={data.land_area} onChange={e => setData('land_area', e.target.value)} className={inputClasses} placeholder="0" /></div>
                                            <div><label className={labelClasses}>Harga Transaksi</label><input type="number" value={data.transaction_value} onChange={e => setData('transaction_value', e.target.value)} className={inputClasses} placeholder="Rp" /></div>
                                            <div><label className={labelClasses}>Total NJOP</label><input type="number" value={data.njop} onChange={e => setData('njop', e.target.value)} className={inputClasses} placeholder="Rp" /></div>
                                        </div>
                                    </div>
                                </div>

                                {/* RINCIAN TAGIHAN */}
                                <div className={cardClass}>
                                    <h3 className={sectionTitle}><Calculator className="text-emerald-500" size={24}/> Rincian Tagihan</h3>
                                    <div className="space-y-5">
                                        <div>
                                            <label className={labelClasses}>Honorarium Jasa / Akta Utama</label>
                                            <input type="number" value={data.service_price} onChange={e => setData('service_price', Number(e.target.value))} className={`${inputClasses} border-emerald-500/30 text-emerald-400 font-black text-lg`} />
                                        </div>

                                        {/* Kolom Biaya Dinamis */}
                                        <div className="grid grid-cols-2 gap-5">
                                            {getActiveFees().includes('plotting') && (<div><label className={labelClasses}>Plotting & Biaya Lain</label><input type="number" value={data.plotting_fee} onChange={e => setData('plotting_fee', Number(e.target.value))} className={inputClasses} /></div>)}
                                            {getActiveFees().includes('penataan_batas') && (<div><label className={labelClasses}>Penataan Batas</label><input type="number" value={data.measurement_fee} onChange={e => setData('measurement_fee', Number(e.target.value))} className={inputClasses} /></div>)}
                                            {getActiveFees().includes('pengecekan_lokasi') && (<div><label className={labelClasses}>Pengecekan Lokasi</label><input type="number" value={data.location_check_fee} onChange={e => setData('location_check_fee', Number(e.target.value))} className={inputClasses} /></div>)}
                                            {getActiveFees().includes('area_measurement_fee') && (<div><label className={labelClasses}>Pengukuran Tanah</label><input type="number" value={data.area_measurement_fee} onChange={e => setData('area_measurement_fee', Number(e.target.value))} className={inputClasses} /></div>)}
                                            {getActiveFees().includes('pnbp') && (<div><label className={labelClasses}>PNBP Negara</label><input type="number" value={data.pnbp_fee} onChange={e => setData('pnbp_fee', Number(e.target.value))} className={inputClasses} /></div>)}
                                            {getActiveFees().includes('validasi_pajak') && (<div><label className={labelClasses}>Validasi Pajak</label><input type="number" value={data.validation_fee} onChange={e => setData('validation_fee', Number(e.target.value))} className={inputClasses} /></div>)}
                                            {getActiveFees().includes('bphtb') && (<div className="col-span-2"><label className={labelClasses}>Pajak Pembeli / Penerima (BPHTB)</label><input type="number" value={data.bphtb_fee} onChange={e => setData('bphtb_fee', Number(e.target.value))} className={inputClasses} /></div>)}
                                            {getActiveFees().includes('pph') && (<div className="col-span-2"><label className={labelClasses}>Pajak Penjual / Pengalih (PPh)</label><input type="number" value={data.pph_fee} onChange={e => setData('pph_fee', Number(e.target.value))} className={inputClasses} /></div>)}
                                            {getActiveFees().includes('tax_deposit') && (<div className="col-span-2"><label className={labelClasses}>Balik Nama SPPT</label><input type="number" value={data.tax_deposit} onChange={e => setData('tax_deposit', Number(e.target.value))} className={inputClasses} /></div>)}
                                        </div>

                                        {/* Total & Submit */}
                                        <div className="pt-6 mt-6 border-t border-[#27272a]">
                                            <div className="flex justify-between items-center mb-6">
                                                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Total Nilai Tagihan</span>
                                                <span className="text-3xl font-black text-indigo-400 tracking-tighter">Rp {calculateTotal().toLocaleString('id-ID')}</span>
                                            </div>
                                            <button type="submit" disabled={processing} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">
                                                {processing ? 'Menyimpan...' : 'Simpan & Daftarkan Order'}
                                            </button>
                                        </div>
                                        {renderNote()}
                                    </div>
                                </div>

                                {/* Info Rekening */}
                                <div className="p-6 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 shadow-sm">
                                    <h4 className="text-emerald-500 font-bold text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2"><Wallet size={14} /> Metode Pembayaran (Dari Pengaturan)</h4>
                                    <div className="space-y-3 text-xs text-slate-400">
                                        <div className="flex justify-between border-b border-emerald-500/10 pb-2"><span>Bank</span><span className="font-bold text-black dark:text-white">{company?.bank_name || '-'}</span></div>
                                        <div className="flex justify-between border-b border-emerald-500/10 pb-2"><span>No. Rekening</span><span className="font-mono font-bold text-emerald-600">{company?.account_number || '-'}</span></div>
                                        <div className="flex justify-between pt-1"><span>Atas Nama</span><span className="font-bold text-black dark:text-white uppercase">{company?.account_name || '-'}</span></div>
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
