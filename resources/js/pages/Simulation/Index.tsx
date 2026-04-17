import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Calculator, ShieldCheck, MapPin, Printer, AlertCircle, FileText, CheckCircle } from 'lucide-react';

export default function SimulationIndex({ serviceTypes, company }: any) {
    const [selectedService, setSelectedService] = useState<any>(null);

    // State biasa karena simulasi tidak simpan ke DB
    const [data, setData] = useState({
        client_name: '',
        phone: '',
        service_id: '',
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
    });

    useEffect(() => {
        const found = serviceTypes.flatMap((t: any) => t.services).find((s: any) => s.id === Number(data.service_id));
        if (found) {
            setSelectedService(found);
            setData(prev => ({ ...prev, service_price: found.default_price }));
        } else {
            setSelectedService(null);
            setData(prev => ({ ...prev, service_price: 0 })); // Reset price if no service selected
        }
    }, [data.service_id]);

    const calculateTotal = () => {
        return Number(data.service_price) + Number(data.plotting_fee) + Number(data.pnbp_fee) +
               Number(data.validation_fee) + Number(data.bphtb_fee) + Number(data.pph_fee) +
               Number(data.measurement_fee) + Number(data.tax_deposit) +
               Number(data.location_check_fee) + Number(data.area_measurement_fee);
    };

    const rupiah = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

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
                <div className="mt-8 p-6 bg-slate-900/40 rounded-2xl border border-amber-900/50 border-l-4 border-l-amber-500 shadow-xl print:hidden animate-fade-in">
                    <h4 className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-widest mb-3"><AlertCircle size={15} /> Panduan Pajak Waris</h4>
                    <ul className="space-y-2 text-[11px] text-slate-400 italic font-medium leading-relaxed">
                        <li>• Pengurangan NPOPTKP sebesar Rp 300.000.000,- bagi waris pertama.</li>
                        <li>• Rumus BPHTB Waris: (Total NJOP - 300jt) x 5%</li>
                    </ul>
                </div>
            );
        } else if (name.includes('jual beli') || name.includes('ajb') || name.includes('hibah')) {
            return (
                <div className="mt-8 p-6 bg-slate-900/40 rounded-2xl border border-cyan-900/50 border-l-4 border-l-cyan-500 shadow-xl print:hidden animate-fade-in">
                    <h4 className="flex items-center gap-2 text-cyan-500 font-bold text-xs uppercase tracking-widest mb-3"><AlertCircle size={15} /> Panduan Pajak Transaksi</h4>
                    <ul className="space-y-2 text-[11px] text-slate-400 italic font-medium leading-relaxed">
                        <li>• Pajak Pembeli (BPHTB): (Harga Transaksi/NJOP - NPOPTKP Kab/Kota*) x 5%</li>
                        <li>• Pajak Penjual (PPh): Harga Transaksi/NJOP x 2.5%</li>
                    </ul>
                </div>
            );
        }
        return null;
    };

    const inputClass = "w-full bg-[#09090b] border border-[#27272a] text-slate-100 text-sm rounded-xl focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 transition-all outline-none print:border-none print:bg-transparent print:text-black print:p-0 shadow-inner";
    const costInputClass = "w-full bg-transparent border-none text-right text-slate-100 text-sm p-0 focus:ring-0 transition-all outline-none print:text-black font-medium";
    const labelClass = "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1 print:text-gray-600 print:text-[8px]";
    const cardClass = "bg-[#121214] border border-[#27272a] rounded-3xl p-8 shadow-2xl print:border-none print:shadow-none print:p-0 print:bg-white";
    const sectionTitle = "text-base font-black text-white mb-8 flex items-center gap-2.5 uppercase tracking-wide print:text-black";

    return (
        <AppLayout breadcrumbs={[{ title: 'Simulasi Biaya', href: '/simulasi' }]}>
            <Head title="Simulasi Perhitungan Biaya Notaris & PPAT" />

            <div className="min-h-screen bg-gray-50 dark:bg-black p-4 lg:p-10 font-sans print:bg-white print:text-black print:p-0">
                <div className="w-full mx-auto space-y-8 print:max-w-full relative">

                    {/* HEADER WEB */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 print:hidden">
                        <div>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20 shadow-lg"><Calculator size={28}/></div>
                                <div>
                                    <h1 className="text-3xl font-black text-black dark:text-white tracking-tight">Simulasi Biaya</h1>
                                    <p className="mt-1 text-slate-500 text-sm font-medium">Hitung estimasi Honorarium, PNBP, dan Pajak untuk klien.</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => window.print()} className="px-7 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all flex items-center gap-2.5 shadow-xl shadow-indigo-600/20 active:scale-95 group">
                            <Printer size={16} className="group-hover:rotate-12 transition-transform"/> Cetak Penawaran
                        </button>
                    </div>

                    {/* HEADER CETAKAN (Hanya muncul saat diprint) */}
                    <div className="hidden print:block border-b-2 border-black pb-6 mb-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-black uppercase tracking-tight">{company?.name || 'KANTOR NOTARIS & PPAT'}</h1>
                                <p className="font-bold text-sm text-gray-800">{company?.notary_name}</p>
                                <p className="text-xs mt-1.5 text-gray-700 max-w-lg leading-relaxed">{company?.address}</p>
                            </div>
                            <div className="text-right text-xs text-gray-600 space-y-0.5">
                                <p>Telp: {company?.phone}</p>
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

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* === KOLOM KIRI (DATA MASUKAN) === */}
                        <div className="lg:col-span-7 space-y-8 print:col-span-12 print:space-y-6">

                            {/* KLIEN & LAYANAN */}
                            <div className={cardClass}>
                                <h3 className={sectionTitle}><ShieldCheck className="text-indigo-500 print:hidden" size={20}/> Informasi Klien & Jenis Layanan</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div><label className={labelClass}>Nama Lengkap Klien</label><input type="text" value={data.client_name} onChange={e => setData(prev => ({...prev, client_name: e.target.value}))} className={inputClass} placeholder="Contoh: Bpk. Junaedi" /></div>
                                    <div><label className={labelClass}>Nomor Telepon / WhatsApp</label><input type="text" value={data.phone} onChange={e => setData(prev => ({...prev, phone: e.target.value}))} className={inputClass} placeholder="0812XXXXXX" /></div>
                                </div>
                                <div className="mb-2">
                                    <label className={labelClass}>Pilih Jenis Layanan / Akta</label>
                                    <select value={data.service_id} onChange={e => setData(prev => ({...prev, service_id: e.target.value}))} className={`${inputClass} font-bold text-white print:appearance-none`}>
                                        <option value="">-- Pilih Layanan untuk Menghitung --</option>
                                        {serviceTypes.map((type: any) => (
                                            <optgroup key={type.id} label={type.name} className="font-bold text-slate-500 text-xs uppercase mt-2">
                                                {type.services.map((svc: any) => <option key={svc.id} value={svc.id} className="font-medium text-slate-100 text-sm normal-case">{svc.name}</option>)}
                                            </optgroup>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* OBJEK */}
                            <div className={cardClass}>
                                <h3 className={sectionTitle}><MapPin className="text-rose-500 print:hidden" size={20}/> Detail Objek Tanah / Bangunan</h3>
                                <div className="space-y-6">
                                    <div><label className={labelClass}>Sertifikat Atas Nama (A.n)</label><input type="text" value={data.seller_name} onChange={e => setData(prev => ({...prev, seller_name: e.target.value}))} className={inputClass} placeholder="Nama yang tertera di Sertifikat..." /></div>
                                    <div className="grid grid-cols-3 gap-5">
                                        <div><label className={labelClass}>Luas Tanah (M²)</label><input type="number" value={data.land_area} onChange={e => setData(prev => ({...prev, land_area: e.target.value}))} className={inputClass} placeholder="M²" /></div>
                                        <div><label className={labelClass}>Nilai Transaksi (Rp)</label><input type="number" value={data.transaction_value} onChange={e => setData(prev => ({...prev, transaction_value: e.target.value}))} className={inputClass} placeholder="Rp" /></div>
                                        <div><label className={labelClass}>Total NJOP (Rp)</label><input type="number" value={data.njop} onChange={e => setData(prev => ({...prev, njop: e.target.value}))} className={inputClass} placeholder="Rp" /></div>
                                    </div>
                                </div>
                            </div>

                            {/* CHECKLIST PERSYARATAN */}
                            {getReqs().uploads.length > 0 && (
                                <div className={`${cardClass} print:mt-10 animate-fade-in`}>
                                    <h3 className={`${sectionTitle} mb-3`}><FileText className="text-amber-500 print:hidden" size={20}/> Dokumen Persyaratan</h3>
                                    <p className="text-xs text-slate-500 mb-6 print:text-black font-medium leading-relaxed">Berikut adalah daftar berkas yang wajib disiapkan oleh klien sebelum proses tandatangan akta:</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 print:grid-cols-2">
                                        {getReqs().uploads.map((req: string, i: number) => (
                                            <div key={i} className="flex items-center gap-3 p-4 bg-[#09090b] rounded-xl border border-[#27272a] print:border-none print:bg-transparent print:p-1.5 print:border-b print:border-gray-100">
                                                <div className="flex-shrink-0 text-slate-600 print:hidden"><CheckCircle size={16}/></div>
                                                <div className="hidden print:block w-3.5 h-3.5 border border-black rounded-sm shrink-0"></div>
                                                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wide print:text-black print:text-[10px] print:normal-case">{req}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* === KOLOM KANAN (PERHITUNGAN) === */}
                        <div className="lg:col-span-5 space-y-8 print:col-span-12 print:mt-10">
                            <div className={`${cardClass} sticky top-6 print:border-2 print:border-black print:p-8 print:relative print:top-0`}>
                                <h3 className={`${sectionTitle} print:text-lg`}><Calculator className="text-emerald-500 print:hidden" size={20}/> Perincian Biaya</h3>

                                <div className="space-y-2 mb-8 print:space-y-2">
                                    {/* Item Item ala Invoice */}
                                    {[
                                        { label: 'Honorarium Jasa (Utama)', value: data.service_price, key: 'service_price', active: true, primary: true },
                                        { label: 'Plotting Sertifikat', value: data.plotting_fee, key: 'plotting_fee', active: getActiveFees().includes('plotting') },
                                        { label: 'Penataan Batas', value: data.measurement_fee, key: 'measurement_fee', active: getActiveFees().includes('penataan_batas') },
                                        { label: 'PNBP (Negara)', value: data.pnbp_fee, key: 'pnbp_fee', active: getActiveFees().includes('pnbp') },
                                        { label: 'Validasi Pajak', value: data.validation_fee, key: 'validation_fee', active: getActiveFees().includes('validasi_pajak') },
                                        { label: 'Pajak Pembeli (BPHTB)', value: data.bphtb_fee, key: 'bphtb_fee', active: getActiveFees().includes('bphtb') },
                                        { label: 'Pajak Penjual (PPh)', value: data.pph_fee, key: 'pph_fee', active: getActiveFees().includes('pph') },
                                        { label: 'Lain-lain / SPPT / Saksi', value: data.tax_deposit, key: 'tax_deposit', active: true },
                                    ].filter(item => item.active).map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center gap-4 py-2 border-b border-[#27272a]/50 print:border-gray-200 print:pb-1.5">
                                            <span className={`text-[11px] font-bold uppercase tracking-widest ${item.primary ? 'text-emerald-400 print:text-black' : 'text-slate-500 print:text-gray-700'}`}>
                                                {item.label}
                                            </span>
                                            <div className={`flex items-center gap-1.5 p-2 rounded-lg ${item.primary ? 'bg-emerald-500/10 border border-emerald-900 print:bg-transparent print:border-none' : 'bg-black/30 print:bg-transparent'}`}>
                                                <span className="text-xs font-medium text-slate-600 print:text-black">Rp</span>
                                                <input
                                                    type="number"
                                                    value={item.value}
                                                    onChange={e => setData(prev => ({...prev, [item.key]: Number(e.target.value)}))}
                                                    className={`${costInputClass} ${item.primary ? 'font-black text-emerald-400 text-sm' : ''} w-32`}
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* TOTAL BOX */}
                                <div className="p-6 bg-[#09090b] rounded-2xl border border-[#27272a] shadow-inner mb-6 print:border-none print:bg-white print:p-0 print:border-t-2 print:border-black print:rounded-none print:pt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest print:text-black print:text-sm">Total Estimasi</span>
                                        <div className="text-right">
                                            <span className="text-3xl font-black text-indigo-400 print:text-black tracking-tighter">{rupiah(calculateTotal())}</span>
                                            <p className="text-[10px] text-slate-600 mt-1 print:hidden font-medium">*Biaya di atas belum termasuk biaya tambahan tak terduga.</p>
                                        </div>
                                    </div>
                                </div>

                                {renderNote()}
                            </div>

                            {/* FOOTER CETAKAN (Tanda Tangan) */}
                            <div className="hidden print:flex justify-between mt-20 text-xs font-medium text-black">
                                <div className="text-center w-1/3 space-y-24">
                                    <p>Menyetujui Klien,</p>
                                    <div className="border-t border-black w-48 mx-auto"></div>
                                    <p className="font-bold text-sm">({data.client_name || ' ................................... '})</p>
                                </div>
                                <div className="text-center w-1/3 space-y-24">
                                    <p>Hormat Kami, Notaris/PPAT</p>
                                    <div className="border-t border-black w-48 mx-auto"></div>
                                    <p className="font-bold text-sm">{company?.notary_name}</p>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* WATERMARK SIMULASI print:hidden */}
                    <div className="fixed bottom-4 right-4 text-[10px] font-mono text-slate-800 pointer-events-none print:hidden">
                        Simulation Mode v1.0 | Not Saving Data
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
