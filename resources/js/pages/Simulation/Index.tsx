import { useState, useEffect, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { Calculator, ShieldCheck, MapPin, CheckCircle2, Printer, AlertCircle, FileText, Info, ArrowRight, X } from 'lucide-react';

export default function SimulationIndex({ serviceTypes = [], company }: any) {
    const { auth } = usePage<any>().props;
    const [selectedService, setSelectedService] = useState<any>(null);
    const isFirstRun = useRef(true);

    // State menggunakan useState karena Simulasi tidak disimpan ke Database
    const [data, setData] = useState({
        client_name: '', phone: '', service_id: '', seller_name: '', land_area: '', transaction_value: '', njop: '', znt: '',
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
        const luas = Number(data.land_area) || 0;
        const zntVal = Number(data.znt) || 0;
        const N = Math.max(transVal, njopVal); // Ambil nilai tertinggi

        const calculatedPph = N > 0 ? N * 0.025 : 0;

        let currentNpoptkp = 0;
        const sName = selectedService?.name?.toLowerCase() || '';
        if (sName.includes('waris') || sName.includes('aphw')) { currentNpoptkp = 300000000; }
        else if (sName.includes('jual beli') || sName.includes('ajb') || sName.includes('hibah')) { currentNpoptkp = 80000000; }

        const calculatedBphtb = N > currentNpoptkp ? (N - currentNpoptkp) * 0.05 : 0;
        
        let calculatedPlotting = 0;
        if (luas > 0 || zntVal > 0) {
            calculatedPlotting = ((luas * zntVal) / 1000) + 350000;
        }

        setData(prev => ({ ...prev, pph_fee: calculatedPph, bphtb_fee: calculatedBphtb, plotting_fee: calculatedPlotting }));
    }, [data.transaction_value, data.njop, data.land_area, data.znt, selectedService]);

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

    // STYLING BARU SEAMLESS WIZARD & STICKY RECEIPT (ADAPTIF LIGHT/DARK)
    const inputClasses = "w-full bg-white dark:bg-[#09090b]/50 border border-gray-200 dark:border-white/[0.05] text-gray-900 dark:text-slate-200 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 block p-3.5 transition-all outline-none print:!border-none print:!bg-transparent print:!text-black print:!font-bold print:!p-0 print:!shadow-none print:!text-[12pt] print:!h-auto print:!min-h-0 print:!leading-normal";
    const labelClasses = "block text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1 print:!text-black print:!mb-0 print:!text-[12pt] print:!normal-case print:!font-semibold";
    const stickyReceipt = "bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.05] rounded-[2.5rem] p-8 shadow-xl dark:shadow-2xl relative overflow-hidden backdrop-blur-md print:!border-none print:!shadow-none print:!p-0 print:!bg-transparent print:!mb-6 print:!overflow-visible";
    const sectionTitle = "text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider print:!text-black print:!text-[14pt] print:!border-b print:!border-black print:!pb-2";

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
                    /* Sembunyikan Layout Utama selain konten */
                    [data-sidebar="sidebar"], header { display: none !important; }
                    main { padding: 0 !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; display: block !important; background: white !important; }
                    
                    /* Pastikan elemen print tidak bergeser */
                    #printable-simulation {
                        display: block !important;
                        width: 100% !important;
                        position: static !important;
                        background: white !important;
                    }
                    
                    /* Override background jika mode dark ikut nge-print */
                    html, body, #app, [data-slot="app-wrapper"], main, .min-h-screen { 
                        background-color: white !important; 
                        background-image: none !important;
                        color: black !important;
                        height: auto !important;
                        min-height: 0 !important;
                        position: static !important;
                        display: block !important;
                    }
                    
                    /* Paksa transparansi dan warna teks untuk semua elemen form */
                    input, select, textarea {
                        background-color: transparent !important;
                        color: black !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    
                    tr, td, th { page-break-inside: avoid !important; }
                    li { page-break-inside: avoid; }
                    ::-webkit-scrollbar { display: none; }
                }
            `}</style>

            <div className="min-h-screen bg-gray-50 dark:bg-black p-4 lg:p-8 font-sans print:!bg-white print:!text-black print:p-0 print:!min-h-0">
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
                                <div className="text-right text-xs text-gray-600 space-y-0.5">
                                    <p>No. Staff: {(() => {
                                        const staffs = typeof company?.staff_data === 'string' ? JSON.parse(company.staff_data) : (company?.staff_data || []);
                                        const firstStaff = staffs.length > 0 ? staffs[0] : null;
                                        return firstStaff ? `${firstStaff.phone} (${firstStaff.name})` : '-';
                                    })()}</p>
                                    <p>Email: {company?.email}</p>
                                    <p>Website: {company?.website || '-'}</p>
                                </div>
                            </div>
                            <div className="mt-10 text-center relative">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
                                <h2 className="text-xl font-black uppercase relative bg-white px-5 inline-block tracking-tight text-gray-950">Estimasi Perhitungan Biaya Layanan</h2>
                                <p className="text-xs mt-1 relative">Ref. Tanggal: <span className="font-bold text-black">{new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</span></p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 print:flex print:flex-col print:gap-4">

                            {/* === KOLOM KIRI (FORM SEAMLESS) === */}
                            <div className="lg:col-span-7 space-y-10 print:w-full print:space-y-4">
                                <section className="animate-fade-in-up">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20 print:hidden"><ShieldCheck size={20}/></div>
                                        <h3 className={sectionTitle}>Informasi Klien & Layanan</h3>
                                    </div>
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
                                            <select value={data.service_id} onChange={e => updateData('service_id', e.target.value)} className={`${inputClasses} font-bold text-gray-900 dark:text-white print:hidden`}>
                                                <option value="" className="bg-white dark:bg-[#09090b] text-gray-500 dark:text-slate-300">-- Pilih Layanan untuk Menghitung --</option>
                                                {(serviceTypes || []).map((t:any) => (<optgroup key={t.id} label={t.name} className="bg-white dark:bg-[#09090b] text-indigo-600 dark:text-indigo-400 font-bold uppercase">{(t.services || []).map((s:any) => <option key={s.id} value={s.id} className="bg-white dark:bg-[#09090b] text-gray-900 dark:text-white normal-case font-medium">{s.name}</option>)}</optgroup>))}
                                            </select>
                                            <span className="hidden print:block font-black text-lg uppercase pt-1 text-black">{selectedService?.name || '- Belum Ditentukan -'}</span>
                                        </div>
                                    </div>
                                </section>

                                {isPPAT && (
                                    <section className="pt-8 border-t border-white/[0.05] animate-fade-in-up">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400 border border-rose-500/20 print:hidden"><MapPin size={20}/></div>
                                            <h3 className={sectionTitle}>Detail Objek Tanah / Bangunan</h3>
                                        </div>
                                        <div className="space-y-5 print:space-y-2">
                                            <div className="print:flex print:items-center print:gap-4 print:border-b print:border-gray-200 print:pb-1">
                                                <label className={`${labelClasses} print:w-[20%]`}>Atas Nama (A.n)</label>
                                                <input type="text" value={data.seller_name} onChange={e => updateData('seller_name', e.target.value)} className={`${inputClasses} print:w-[80%]`} placeholder="Nama di sertifikat..." />
                                            </div>
                                            <div className="grid grid-cols-2 gap-6 print:grid print:grid-cols-2 print:gap-x-8 print:gap-y-2">
                                                <div className="print:flex print:items-center print:gap-2 print:border-b print:border-gray-200 print:pb-1">
                                                    <label className={`${labelClasses} print:w-[45%]`}>Luas (M²)</label>
                                                    <input type="number" value={data.land_area} onChange={e => updateData('land_area', e.target.value)} className={`${inputClasses} print:w-[55%] print:text-right`} placeholder="0" />
                                                </div>
                                                <div className="print:flex print:items-center print:gap-2 print:border-b print:border-gray-200 print:pb-1">
                                                    <label className={`${labelClasses} print:w-[45%]`}>ZNT (NJOP/m)</label>
                                                    <div className="flex items-center gap-1 w-full print:w-[55%] print:justify-end">
                                                        <span className="hidden print:block font-bold text-[12pt] text-black">Rp</span>
                                                        <input type="number" value={data.znt} onChange={e => updateData('znt', e.target.value)} className={`${inputClasses} print:w-auto print:text-right print:pr-0`} placeholder="Rp" />
                                                    </div>
                                                </div>
                                                <div className="print:flex print:items-center print:gap-2 print:border-b print:border-gray-200 print:pb-1">
                                                    <label className={`${labelClasses} print:w-[45%]`}>Harga Transaksi</label>
                                                    <div className="flex items-center gap-1 w-full print:w-[55%] print:justify-end">
                                                        <span className="hidden print:block font-bold text-[12pt] text-black">Rp</span>
                                                        <input type="number" value={data.transaction_value} onChange={e => updateData('transaction_value', e.target.value)} className={`${inputClasses} print:w-auto print:text-right print:pr-0`} placeholder="Rp" />
                                                    </div>
                                                </div>
                                                <div className="print:flex print:items-center print:gap-2 print:border-b print:border-gray-200 print:pb-1">
                                                    <label className={`${labelClasses} print:w-[45%]`}>Total NJOP</label>
                                                    <div className="flex items-center gap-1 w-full print:w-[55%] print:justify-end">
                                                        <span className="hidden print:block font-bold text-[12pt] text-black">Rp</span>
                                                        <input type="number" value={data.njop} onChange={e => updateData('njop', e.target.value)} className={`${inputClasses} print:w-auto print:text-right print:pr-0`} placeholder="Rp" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                )}

                                {getReqs().uploads.length > 0 && (
                                    <section className="pt-8 border-t border-white/[0.05] animate-fade-in-up">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20 print:hidden"><FileText size={20}/></div>
                                            <h3 className={sectionTitle}>Checklist Dokumen Fisik</h3>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3 print:grid-cols-2 print:gap-2">
                                            {getReqs().uploads.map((req: string, i: number) => {
                                                const isChecked = data.completed_requirements.includes(req);
                                                return (
                                                <label key={i} className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer print:p-0 print:border-none ${isChecked ? 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/5' : 'border-gray-200 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.02] hover:bg-gray-100 dark:hover:bg-white/[0.04]'}`}>
                                                    <input type="checkbox" checked={isChecked} onChange={() => toggleRequirement(req)} className="w-5 h-5 rounded border-gray-300 dark:border-[#27272a] bg-white dark:bg-[#18181b] text-emerald-500 focus:ring-emerald-500 cursor-pointer shrink-0 print:border-black print:bg-white" />
                                                    <div className={`p-2 rounded-lg shrink-0 print:hidden ${isChecked ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-slate-500'}`}>{isChecked ? <CheckCircle2 size={14} /> : <FileText size={14} />}</div>
                                                    <span className={`text-xs font-semibold uppercase tracking-wide leading-snug print:text-black print:normal-case print:text-[12pt] ${isChecked ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-slate-300'}`}>{req}</span>
                                                </label>
                                            )})}
                                        </div>
                                    </section>
                                )}

                                {getReqs().inputs.length > 0 && (
                                    <section className="pt-8 border-t border-white/[0.05] animate-fade-in-up">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400 border border-amber-500/20 print:hidden"><Info size={20}/></div>
                                            <h3 className={sectionTitle}>Informasi Tambahan</h3>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 print:grid-cols-2 print:gap-x-8 print:gap-y-2">
                                            {getReqs().inputs.map((label: string, i: number) => {
                                                const isChecked = data.completed_requirements.includes(label);
                                                return (
                                                <div key={i} className={`p-4 rounded-xl border transition-all print:p-0 print:border-none print:flex print:items-center print:gap-2 ${isChecked ? 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/5' : 'bg-white dark:bg-[#09090b] border-gray-200 dark:border-[#27272a]'}`}>
                                                    <div className="flex justify-between items-center mb-3 print:hidden">
                                                        <div className="flex items-center gap-3">
                                                            <input type="checkbox" checked={isChecked} onChange={() => toggleRequirement(label)} className="w-5 h-5 rounded border-gray-300 dark:border-[#27272a] bg-white dark:bg-[#18181b] text-amber-500 focus:ring-amber-500 cursor-pointer" />
                                                            <label className={`block text-[11px] font-bold uppercase tracking-widest ${isChecked ? 'text-emerald-600 dark:text-emerald-500' : 'text-gray-500 dark:text-slate-400'}`}>{label}</label>
                                                        </div>
                                                    </div>
                                                    <div className="hidden print:flex items-center gap-2 w-full border-b border-gray-200 pb-1">
                                                        <span className="text-[12pt] font-semibold text-black whitespace-nowrap">{label}:</span>
                                                        <span className="text-[12pt] text-black w-full inline-block min-h-[1.5rem]">{data.additional_info?.[label] || ''}</span>
                                                    </div>
                                                    <input type="text" value={data.additional_info?.[label] || ''} className={`${inputClasses} print:hidden`} placeholder={`Ketik isi ${label.toLowerCase()}...`} onChange={e => updateData('additional_info', { ...data.additional_info, [label]: e.target.value })} />
                                                </div>
                                            )})}
                                        </div>
                                    </section>
                                )}
                            </div>

                            {/* === KOLOM KANAN (STICKY RECEIPT) === */}
                            <div className="lg:col-span-5 space-y-6 print:w-full print:space-y-4 print:mt-6">
                                <div className="sticky top-6 print:static">
                                    <div className={stickyReceipt}>
                                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-emerald-500/10 blur-[40px] pointer-events-none print:hidden"></div>
                                        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-indigo-500/10 blur-[40px] pointer-events-none print:hidden"></div>
                                        
                                        <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-white/[0.05] print:border-black print:pb-2 print:mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2.5 bg-emerald-100 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 print:hidden"><Calculator size={20}/></div>
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider print:text-black print:text-[14pt]">Rincian Tagihan</h3>
                                                </div>
                                            </div>

                                            <div className="space-y-5 print:space-y-2">
                                                <div className="print:flex print:justify-between print:border-b print:border-gray-200 print:pb-1 print:items-center">
                                                    <label className={labelClasses}>Honorarium</label>
                                                    <div className="flex items-center gap-2 relative">
                                                        <span className="absolute left-4 text-gray-500 dark:text-slate-500 font-bold text-sm print:relative print:left-0 print:text-[12pt] print:text-black">Rp</span>
                                                        <input type="number" value={data.service_price} onChange={e => updateData('service_price', Number(e.target.value))} className={`${inputClasses} pl-10 text-emerald-600 dark:text-emerald-400 font-black text-lg border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5 print:pl-0 print:text-left`} />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 print:flex print:flex-col print:gap-2">
                                                    {getActiveFees().includes('plotting') && (
                                                        <div className="col-span-2 md:col-span-1 print:flex print:justify-between print:border-b print:border-gray-200 print:pb-1 print:items-center">
                                                            <div className="flex justify-between items-end mb-2 print:mb-0 print:items-center">
                                                                <label className={`${labelClasses} !mb-0`}>Plotting / Lainnya</label>
                                                                {(Number(data.land_area) > 0 || Number(data.znt) > 0) && (
                                                                    <div className="text-[9px] text-indigo-400 font-bold bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20 text-right print:hidden">
                                                                        (L×ZNT/1K)+350rb
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 relative">
                                                                <span className="absolute left-3 text-slate-500 font-bold text-sm print:relative print:left-0 print:text-[12pt] print:text-black">Rp</span>
                                                                <input type="number" value={data.plotting_fee} onChange={e => updateData('plotting_fee', Number(e.target.value))} className={`${inputClasses} pl-9 print:pl-0 print:text-left`} />
                                                            </div>
                                                        </div>
                                                    )}
                                                    {getActiveFees().includes('penataan_batas') && (<div className="print:flex print:justify-between print:border-b print:border-gray-200 print:pb-1 print:items-center"><label className={labelClasses}>Penataan Batas</label><div className="flex items-center gap-2 relative"><span className="absolute left-3 text-slate-500 font-bold text-sm print:relative print:left-0 print:text-[12pt] print:text-black">Rp</span><input type="number" value={data.measurement_fee} onChange={e => updateData('measurement_fee', Number(e.target.value))} className={`${inputClasses} pl-9 print:pl-0 print:text-left`} /></div></div>)}
                                                    {getActiveFees().includes('pnbp') && (<div className="print:flex print:justify-between print:border-b print:border-gray-200 print:pb-1 print:items-center"><label className={labelClasses}>PNBP Negara</label><div className="flex items-center gap-2 relative"><span className="absolute left-3 text-slate-500 font-bold text-sm print:relative print:left-0 print:text-[12pt] print:text-black">Rp</span><input type="number" value={data.pnbp_fee} onChange={e => updateData('pnbp_fee', Number(e.target.value))} className={`${inputClasses} pl-9 print:pl-0 print:text-left`} /></div></div>)}
                                                    {getActiveFees().includes('validasi_pajak') && (<div className="print:flex print:justify-between print:border-b print:border-gray-200 print:pb-1 print:items-center"><label className={labelClasses}>Validasi Pajak</label><div className="flex items-center gap-2 relative"><span className="absolute left-3 text-slate-500 font-bold text-sm print:relative print:left-0 print:text-[12pt] print:text-black">Rp</span><input type="number" value={data.validation_fee} onChange={e => updateData('validation_fee', Number(e.target.value))} className={`${inputClasses} pl-9 print:pl-0 print:text-left`} /></div></div>)}

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
                                                                    <span className="font-bold text-sm print:text-[12pt] print:text-black">Rp</span>
                                                                    <input type="number" value={data.bphtb_fee} onChange={e => updateData('bphtb_fee', Number(e.target.value))} className={`${inputClasses} print:text-left`} />
                                                                </div>
                                                            </div>
                                                            <div className="relative print:hidden">
                                                                <span className="absolute left-3 top-3.5 text-slate-500 font-bold text-sm">Rp</span>
                                                                <input type="number" value={data.bphtb_fee} onChange={e => updateData('bphtb_fee', Number(e.target.value))} className={`${inputClasses} pl-9`} />
                                                            </div>
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
                                                                    <span className="font-bold text-sm print:text-[12pt] print:text-black">Rp</span>
                                                                    <input type="number" value={data.pph_fee} onChange={e => updateData('pph_fee', Number(e.target.value))} className={`${inputClasses} print:text-left`} />
                                                                </div>
                                                            </div>
                                                            <div className="relative print:hidden">
                                                                <span className="absolute left-3 top-3.5 text-slate-500 font-bold text-sm">Rp</span>
                                                                <input type="number" value={data.pph_fee} onChange={e => updateData('pph_fee', Number(e.target.value))} className={`${inputClasses} pl-9`} />
                                                            </div>
                                                        </div>
                                                    )}
                                                    {getActiveFees().includes('tax_deposit') && (<div className="col-span-2 print:flex print:justify-between print:border-b print:border-gray-200 print:pb-1 print:items-center"><label className={labelClasses}>Balik Nama SPPT</label><div className="flex items-center gap-2 relative"><span className="absolute left-3 text-slate-500 font-bold text-sm print:relative print:left-0 print:text-[12pt] print:text-black">Rp</span><input type="number" value={data.tax_deposit} onChange={e => updateData('tax_deposit', Number(e.target.value))} className={`${inputClasses} pl-9 print:pl-0 print:text-left`} /></div></div>)}
                                                </div>

                                                <div className="pt-6 mt-6 border-t border-gray-200 dark:border-white/[0.05] print:border-t-2 print:border-black print:pt-4">
                                                    <div className="flex justify-between items-center mb-6 print:mb-0">
                                                        <span className="text-[11px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest print:text-black print:text-[12pt] print:normal-case">Total Nilai Tagihan</span>
                                                        <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter print:text-black print:text-[14pt]">Rp {calculateTotal().toLocaleString('id-ID')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {renderNote()}
                                </div>


                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
