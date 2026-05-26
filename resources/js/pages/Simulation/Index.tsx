import { useState, useEffect, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Calculator, ShieldCheck, MapPin, CheckCircle2, Printer, AlertCircle, FileText, Info, ArrowRight, X } from 'lucide-react';

export default function SimulationIndex({ serviceTypes = [], company }: any) {
    const [selectedService, setSelectedService] = useState<any>(null);
    const isFirstRun = useRef(true);

    // State menggunakan useState karena Simulasi tidak disimpan ke Database
    const [data, setData] = useState({
        client_name: '', phone: '', service_id: '', seller_name: '', land_area: '', transaction_value: '', njop: '',
        service_price: 0, plotting_fee: 0, pnbp_fee: 0, validation_fee: 0, bphtb_fee: 0, pph_fee: 0, measurement_fee: 0, location_check_fee: 0, area_measurement_fee: 0, tax_deposit: 0,
        completed_requirements: [] as string[], additional_info: {} as Record<string, string>
    });

    const updateData = (field: string, value: any) => setData(prev => ({ ...prev, [field]: value }));

    useEffect(() => {
        const found = (serviceTypes || []).flatMap((t: any) => t.services || []).find((s: any) => s.id === Number(data.service_id));
        if (found) {
            setSelectedService(found);
            updateData('service_price', found.default_price);
            updateData('completed_requirements', []);
        } else {
            setSelectedService(null);
            updateData('service_price', 0);
        }
    }, [data.service_id, serviceTypes]);

    // --- LOGIKA AUTO-KALKULASI PAJAK (BPHTB & PPh) DINAMIS ---
    useEffect(() => {
        if (isFirstRun.current) { isFirstRun.current = false; return; }

        const transVal = Number(data.transaction_value) || 0;
        const njopVal = Number(data.njop) || 0;
        const N = Math.max(transVal, njopVal); // Ambil nilai tertinggi

        const calculatedPph = N > 0 ? N * 0.025 : 0;

        let currentNpoptkp = 0;
        const sName = selectedService?.name?.toLowerCase() || '';
        if (sName.includes('waris') || sName.includes('aphw')) { currentNpoptkp = 300000000; }
        else if (sName.includes('jual beli') || sName.includes('ajb') || sName.includes('hibah')) { currentNpoptkp = 80000000; }

        const calculatedBphtb = N > currentNpoptkp ? (N - currentNpoptkp) * 0.05 : 0;

        setData(prev => ({ ...prev, pph_fee: calculatedPph, bphtb_fee: calculatedBphtb }));
    }, [data.transaction_value, data.njop, selectedService]);

    const selectedCategory = (serviceTypes || []).find((t: any) => (t.services || []).some((s: any) => s.id === Number(data.service_id)));
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

    const toggleRequirement = (reqName: string) => {
        const current = data.completed_requirements || [];
        if (current.includes(reqName)) updateData('completed_requirements', current.filter(item => item !== reqName));
        else updateData('completed_requirements', [...current, reqName]);
    };

    const getReqs = () => {
        if (!selectedService?.requirements) return { uploads: [], inputs: [] };
        return typeof selectedService.requirements === 'string' ? JSON.parse(selectedService.requirements) : selectedService.requirements;
    };
    const getActiveFees = () => {
        if (!selectedService?.active_fee_fields) return [];
        return typeof selectedService.active_fee_fields === 'string' ? JSON.parse(selectedService.active_fee_fields) : selectedService.active_fee_fields;
    };

    // STYLING DISAMAKAN DENGAN CREATE.TSX
    const inputClasses = "w-full bg-[#09090b] border border-[#27272a] text-slate-200 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 transition-all outline-none shadow-inner print:border-none print:bg-transparent print:text-black print:font-bold print:p-0 print:shadow-none";
    const labelClasses = "block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1 print:text-gray-600 print:mb-0 print:text-xs";
    const cardClass = "bg-[#121214] border border-[#27272a] rounded-[2rem] p-8 shadow-xl print:border-none print:shadow-none print:p-0 print:bg-transparent print:mb-6";
    const sectionTitle = "text-lg font-black text-white mb-8 flex items-center gap-3 uppercase tracking-wide print:text-black print:mb-4 print:text-base print:border-b print:border-black print:pb-2";

    const renderNote = () => {
        if (!selectedService) return null;
        if (sNameDisplay.includes('waris') || sNameDisplay.includes('aphw')) {
            return (
                <div className="mt-8 p-6 bg-[#18181b] rounded-2xl border border-amber-900/30 border-l-4 border-l-amber-500 shadow-xl print:hidden">
                    <h4 className="flex items-center gap-2 text-amber-500 font-bold text-[11px] uppercase tracking-widest mb-3"><AlertCircle size={14} /> Panduan Perhitungan Waris</h4>
                    <ul className="space-y-2 text-[11px] text-slate-400 italic font-medium leading-relaxed">
                        <li>• Waris dapat pengurangan NPOPTKP 300jt bagi yang belum pernah melakukan pengurusan.</li>
                        <li>• Jika tidak dapat pengurangan, hitungan biaya Pajak BPHTB jadi: Nilai NJOP x 5%</li>
                    </ul>
                </div>
            );
        } else if (sNameDisplay.includes('jual beli') || sNameDisplay.includes('ajb') || sNameDisplay.includes('hibah')) {
            return (
                <div className="mt-8 p-6 bg-[#18181b] rounded-2xl border border-cyan-900/30 border-l-4 border-l-cyan-500 shadow-xl print:hidden">
                    <h4 className="flex items-center gap-2 text-cyan-500 font-bold text-[11px] uppercase tracking-widest mb-3"><AlertCircle size={14} /> Panduan Perhitungan Transaksi</h4>
                    <ul className="space-y-2 text-[11px] text-slate-400 italic font-medium leading-relaxed">
                        <li>• Dapat pengurangan 80jt (NPOPTKP) berlaku untuk yang pertama kali pengurusan BPHTB.</li>
                        <li>• Pajak Pembeli (BPHTB): (Harga Transaksi / Nilai NJOP - 80jt) x 5%</li>
                        <li>• Pajak Penjual (PPh): Harga Transaksi / Nilai NJOP x 2.5%</li>
                    </ul>
                </div>
            );
        }
        return null;
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Simulasi Biaya', href: '/simulasi' }]}>
            <Head title="Simulasi Perhitungan Biaya Notaris & PPAT" />

            {/* CSS KHUSUS PRINT */}
            <style>{`
                @media print {
                    @page { size: A4 portrait; margin: 1cm; }
                    body * { visibility: hidden; }
                    #printable-simulation, #printable-simulation * { visibility: visible; }
                    #printable-simulation {
                        position: absolute !important; left: 0 !important; top: 0 !important;
                        width: 100% !important; height: auto !important; background: white !important;
                        margin: 0 !important; padding: 0 !important; overflow: visible !important; display: block !important;
                    }
                    tr, td, th { page-break-inside: avoid !important; }
                    li, div { page-break-inside: avoid; }
                    ::-webkit-scrollbar { display: none; }
                }
            `}</style>

            <div className="min-h-screen bg-gray-50 dark:bg-black p-4 lg:p-8 font-sans print:bg-white print:text-black print:p-0">
                <div className="w-full mx-auto space-y-8 print:max-w-full relative">

                    <div className="flex justify-between items-center mb-8 print:hidden">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20 shadow-lg"><Calculator size={28}/></div>
                                <div>
                                    <h1 className="text-3xl font-black text-black dark:text-white tracking-tight">Simulasi Biaya</h1>
                                    <p className="mt-1 text-slate-500 text-sm font-medium">Hitung estimasi Honorarium, PNBP, dan Pajak untuk klien.</p>
                                </div>
                            </div>
                        <button onClick={() => window.print()} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all flex items-center gap-2.5 shadow-xl shadow-indigo-600/20 active:scale-95 group">
                            <Printer size={16} className="group-hover:rotate-12 transition-transform"/> Cetak Estimasi
                        </button>
                    </div>

                    <div id="printable-simulation">
                        {/* HEADER CETAKAN */}
                        <div className="hidden print:block border-b-2 border-black pb-6 mb-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-2xl font-black uppercase tracking-tight">{company?.name || 'KANTOR NOTARIS & PPAT'}</h1>
                                    <p className="font-bold text-sm text-gray-800">{company?.notary_name}</p>
                                    <p className="text-xs mt-1.5 text-gray-700 max-w-lg leading-relaxed">{company?.address}</p>
                                </div>
                                <div className="text-right text-xs text-gray-600 space-y-0.5"><p>Telp: {company?.phone}</p><p>Email: {company?.email}</p><p>Website: {company?.website || '-'}</p></div>
                            </div>
                            <div className="mt-10 text-center relative">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
                                <h2 className="text-xl font-black uppercase relative bg-white px-5 inline-block tracking-tight text-gray-950">Estimasi Perhitungan Biaya Layanan</h2>
                                <p className="text-xs mt-1 relative">Ref. Tanggal: <span className="font-bold text-black">{new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</span></p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:flex print:flex-col print:gap-4">

                            {/* === KOLOM KIRI === */}
                            <div className="lg:col-span-7 space-y-6 print:w-full print:space-y-4">
                                <div className={cardClass}>
                                    <h3 className={sectionTitle}><ShieldCheck className="text-indigo-500 print:hidden" size={24}/> 01. Informasi Klien & Layanan</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:flex print:justify-between print:gap-2">
                                        <div className="print:w-1/2">
                                            <label className={labelClasses}>Nama Lengkap Klien</label>
                                            <input type="text" value={data.client_name} onChange={e => updateData('client_name', e.target.value)} className={inputClasses} placeholder="Contoh: Bpk. Junaedi" />
                                        </div>
                                        <div className="print:w-1/2">
                                            <label className={labelClasses}>No. Telepon / WA</label>
                                            <input type="text" value={data.phone} onChange={e => updateData('phone', e.target.value)} className={inputClasses} placeholder="0812XXXXXX" />
                                        </div>
                                        <div className="md:col-span-2 print:w-full print:mt-2">
                                            <label className={labelClasses}>Jenis Layanan / Akta</label>
                                            <select value={data.service_id} onChange={e => updateData('service_id', e.target.value)} className={`${inputClasses} font-bold text-white print:hidden`}>
                                                <option value="">-- Pilih Layanan untuk Menghitung --</option>
                                                {(serviceTypes || []).map((t:any) => (<optgroup key={t.id} label={t.name} className="text-slate-500 font-bold uppercase">{(t.services || []).map((s:any) => <option key={s.id} value={s.id} className="text-white normal-case font-medium">{s.name}</option>)}</optgroup>))}
                                            </select>
                                            <span className="hidden print:block font-black text-lg uppercase pt-1 text-black">{selectedService?.name || '- Belum Ditentukan -'}</span>
                                        </div>
                                    </div>
                                </div>

                                {getReqs().uploads.length > 0 && (
                                    <div className={`${cardClass} animate-fade-in`}>
                                        <h3 className={sectionTitle}><FileText className="text-indigo-500 print:hidden" size={24}/> 02. Checklist Dokumen Fisik</h3>
                                        <div className="grid grid-cols-1 gap-3 print:grid-cols-2 print:gap-2">
                                            {getReqs().uploads.map((req: string, i: number) => {
                                                const isChecked = data.completed_requirements.includes(req);
                                                return (
                                                <div key={i} className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border transition-all print:p-0 print:border-none ${isChecked ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-[#27272a] bg-[#09090b]'}`}>
                                                    <div className="flex items-center gap-4 w-full pr-4">
                                                        <input type="checkbox" checked={isChecked} onChange={() => toggleRequirement(req)} className="w-5 h-5 rounded border-[#27272a] bg-[#18181b] text-emerald-500 focus:ring-emerald-500 cursor-pointer shrink-0 print:border-black print:bg-white" />
                                                        <div className={`p-2.5 rounded-xl shrink-0 print:hidden ${isChecked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#18181b] text-slate-600'}`}>{isChecked ? <CheckCircle2 size={16} /> : <FileText size={16} />}</div>
                                                        <span className={`text-[11px] font-bold uppercase tracking-wide leading-snug print:text-black print:normal-case print:text-xs ${isChecked ? 'text-emerald-500' : 'text-slate-300'}`}>{req}</span>
                                                    </div>
                                                </div>
                                            )})}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* === KOLOM KANAN === */}
                            <div className="lg:col-span-5 space-y-6 print:w-full print:space-y-4">
                                <div className="sticky top-6 space-y-6 print:relative print:top-0 print:space-y-4">
                                    {isPPAT && (
                                        <div className={`${cardClass} animate-fade-in-up`}>
                                            <h3 className={sectionTitle}><MapPin className="text-rose-500 print:hidden" size={24}/> Detail Objek Tanah / Bangunan</h3>
                                            <div className="space-y-5 print:space-y-2">
                                                <div className="print:flex print:justify-between print:border-b print:border-gray-200 print:pb-1">
                                                    <label className={labelClasses}>Atas Nama (A.n)</label>
                                                    <input type="text" value={data.seller_name} onChange={e => updateData('seller_name', e.target.value)} className={inputClasses} placeholder="Nama di sertifikat..." />
                                                </div>
                                                <div className="grid grid-cols-3 gap-4 print:flex print:flex-col print:gap-2">
                                                    <div className="print:flex print:justify-between print:border-b print:border-gray-200 print:pb-1">
                                                        <label className={labelClasses}>Luas (M²)</label>
                                                        <input type="number" value={data.land_area} onChange={e => updateData('land_area', e.target.value)} className={inputClasses} placeholder="0" />
                                                    </div>
                                                    <div className="print:flex print:justify-between print:border-b print:border-gray-200 print:pb-1">
                                                        <label className={labelClasses}>Harga Transaksi</label>
                                                        <input type="number" value={data.transaction_value} onChange={e => updateData('transaction_value', e.target.value)} className={inputClasses} placeholder="Rp" />
                                                    </div>
                                                    <div className="print:flex print:justify-between print:border-b print:border-gray-200 print:pb-1">
                                                        <label className={labelClasses}>Total NJOP</label>
                                                        <input type="number" value={data.njop} onChange={e => updateData('njop', e.target.value)} className={inputClasses} placeholder="Rp" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className={cardClass}>
                                        <h3 className={sectionTitle}><Calculator className="text-emerald-500 print:hidden" size={24}/> Rincian Tagihan</h3>
                                        <div className="space-y-5 print:space-y-2">
                                            <div className="print:flex print:justify-between print:border-b print:border-gray-200 print:pb-1 print:items-center">
                                                <label className={labelClasses}>Honorarium Utama</label>
                                                <div className="flex items-center gap-2">
                                                    <span className="hidden print:block font-bold text-sm">Rp</span>
                                                    <input type="number" value={data.service_price} onChange={e => updateData('service_price', Number(e.target.value))} className={`${inputClasses} border-emerald-500/30 text-emerald-400 font-black text-lg print:text-right print:w-32`} />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-5 print:flex print:flex-col print:gap-2">
                                                {getActiveFees().includes('plotting') && (<div className="print:flex print:justify-between print:border-b print:border-gray-200 print:pb-1 print:items-center"><label className={labelClasses}>Plotting & Biaya Lain</label><div className="flex items-center gap-2"><span className="hidden print:block font-bold text-sm">Rp</span><input type="number" value={data.plotting_fee} onChange={e => updateData('plotting_fee', Number(e.target.value))} className={`${inputClasses} print:text-right print:w-32`} /></div></div>)}
                                                {getActiveFees().includes('penataan_batas') && (<div className="print:flex print:justify-between print:border-b print:border-gray-200 print:pb-1 print:items-center"><label className={labelClasses}>Penataan Batas</label><div className="flex items-center gap-2"><span className="hidden print:block font-bold text-sm">Rp</span><input type="number" value={data.measurement_fee} onChange={e => updateData('measurement_fee', Number(e.target.value))} className={`${inputClasses} print:text-right print:w-32`} /></div></div>)}
                                                {getActiveFees().includes('pnbp') && (<div className="print:flex print:justify-between print:border-b print:border-gray-200 print:pb-1 print:items-center"><label className={labelClasses}>PNBP Negara</label><div className="flex items-center gap-2"><span className="hidden print:block font-bold text-sm">Rp</span><input type="number" value={data.pnbp_fee} onChange={e => updateData('pnbp_fee', Number(e.target.value))} className={`${inputClasses} print:text-right print:w-32`} /></div></div>)}
                                                {getActiveFees().includes('validasi_pajak') && (<div className="print:flex print:justify-between print:border-b print:border-gray-200 print:pb-1 print:items-center"><label className={labelClasses}>Validasi Pajak</label><div className="flex items-center gap-2"><span className="hidden print:block font-bold text-sm">Rp</span><input type="number" value={data.validation_fee} onChange={e => updateData('validation_fee', Number(e.target.value))} className={`${inputClasses} print:text-right print:w-32`} /></div></div>)}

                                                {/* BPHTB */}
                                                {getActiveFees().includes('bphtb') && (
                                                    <div className="col-span-2 print:flex print:flex-col print:border-b print:border-gray-200 print:pb-1">
                                                        <div className="flex justify-between items-end mb-2 print:mb-0 print:items-center">
                                                            <label className={`${labelClasses} !mb-0`}>Pajak Pembeli (BPHTB)</label>
                                                            {nilaiTertinggi > 0 && (
                                                                <div className="text-[10px] text-emerald-400 font-bold hidden bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20 text-right print:hidden">
                                                                    <span className="block text-slate-500 text-[8px] mb-0.5 uppercase tracking-widest">Acuan: {labelNilai} ({rupiah(nilaiTertinggi)})</span>
                                                                    5% × ({rupiah(nilaiTertinggi)} - {rupiah(npoptkpDisplay)})
                                                                </div>
                                                            )}
                                                            <div className="hidden print:flex items-center gap-2">
                                                                <span className="font-bold text-sm">Rp</span>
                                                                <input type="number" value={data.bphtb_fee} onChange={e => updateData('bphtb_fee', Number(e.target.value))} className={`${inputClasses} print:text-right print:w-32`} />
                                                            </div>
                                                        </div>
                                                        <input type="number" value={data.bphtb_fee} onChange={e => updateData('bphtb_fee', Number(e.target.value))} className={`${inputClasses} print:hidden`} />
                                                    </div>
                                                )}

                                                {/* PPh */}
                                                {getActiveFees().includes('pph') && (
                                                    <div className="col-span-2 print:flex print:flex-col print:border-b print:border-gray-200 print:pb-1">
                                                        <div className="flex justify-between items-end mb-2 print:mb-0 print:items-center">
                                                            <label className={`${labelClasses} !mb-0`}>Pajak Penjual (PPh)</label>
                                                            {nilaiTertinggi > 0 && (
                                                                <div className="text-[10px] text-emerald-400 font-bold hidden bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20 text-right print:hidden">
                                                                    <span className="block text-slate-500 text-[8px] mb-0.5 uppercase tracking-widest">Acuan: {labelNilai} ({rupiah(nilaiTertinggi)})</span>
                                                                    2.5% × {rupiah(nilaiTertinggi)}
                                                                </div>
                                                            )}
                                                            <div className="hidden print:flex items-center gap-2">
                                                                <span className="font-bold text-sm">Rp</span>
                                                                <input type="number" value={data.pph_fee} onChange={e => updateData('pph_fee', Number(e.target.value))} className={`${inputClasses} print:text-right print:w-32`} />
                                                            </div>
                                                        </div>
                                                        <input type="number" value={data.pph_fee} onChange={e => updateData('pph_fee', Number(e.target.value))} className={`${inputClasses} print:hidden`} />
                                                    </div>
                                                )}
                                                {getActiveFees().includes('tax_deposit') && (<div className="col-span-2 print:flex print:justify-between print:border-b print:border-gray-200 print:pb-1 print:items-center"><label className={labelClasses}>Balik Nama SPPT</label><div className="flex items-center gap-2"><span className="hidden print:block font-bold text-sm">Rp</span><input type="number" value={data.tax_deposit} onChange={e => updateData('tax_deposit', Number(e.target.value))} className={`${inputClasses} print:text-right print:w-32`} /></div></div>)}
                                            </div>

                                            <div className="pt-6 mt-6 border-t border-[#27272a] print:border-t-2 print:border-black print:pt-4">
                                                <div className="flex justify-between items-center mb-6 print:mb-0">
                                                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest print:text-black print:text-sm">Total Nilai Tagihan</span>
                                                    <span className="text-3xl font-black text-indigo-400 tracking-tighter print:text-black print:text-xl">Rp {calculateTotal().toLocaleString('id-ID')}</span>
                                                </div>
                                            </div>
                                            {renderNote()}
                                        </div>
                                    </div>
                                </div>

                                {/* FOOTER CETAKAN */}
                                <div className="hidden print:flex justify-between mt-20 text-xs font-medium text-black">
                                    <div className="text-center w-1/3 space-y-24"><p>Menyetujui Klien,</p><div className="border-t border-black w-48 mx-auto"></div><p className="font-bold text-sm">({data.client_name || ' ................................... '})</p></div>
                                    <div className="text-center w-1/3 space-y-24"><p>Hormat Kami, Notaris/PPAT</p><div className="border-t border-black w-48 mx-auto"></div><p className="font-bold text-sm">{company?.notary_name}</p></div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
