import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage, useForm, router } from '@inertiajs/react';
// [PERBAIKAN]: Menambahkan kembali Calculator ke dalam import
import { FileText, Search, BookOpenCheck, CheckCircle2, Info, ArrowRight, X, MousePointerClick, Printer, Edit, Trash2, PlusCircle, Save, Send, Plus, Calculator } from 'lucide-react';

export default function RequirementsIndex({ serviceTypes = [] }: any) {
    const { auth } = usePage<any>().props;
    const [searchTerm, setSearchTerm] = useState('');

    // Deteksi Role
    const isSuperAdmin = auth?.user?.roles?.some((r: any) => r.name === 'super_admin') || auth?.user?.role === 'super_admin';
    const canViewPrices = auth?.user?.roles?.some((r: any) => ['super_admin', 'admin', 'bos'].includes(r.name?.toLowerCase())) || ['super_admin', 'admin', 'bos'].includes(auth?.user?.role?.toLowerCase());

    // --- STATE UNTUK MODAL (View / Edit / Add / PriceList) ---
    const [modalMode, setModalMode] = useState<'closed' | 'view' | 'edit' | 'add' | 'priceList'>('closed');
    const [selectedService, setSelectedService] = useState<any>(null);

    const { data, setData, post, put, processing, reset } = useForm({
        name: '',
        service_type_id: '',
        default_price: 0,
        uploads: [] as string[],
        inputs: [] as string[],
        active_fee_fields: [] as string[]
    });

    const filteredServiceTypes = (serviceTypes || []).map((type: any) => {
        const filteredServices = (type.services || []).filter((svc: any) =>
            svc.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return { ...type, services: filteredServices };
    }).filter((type: any) => type.services.length > 0);

    const getReqs = (reqString: string | object) => {
        if (!reqString) return { uploads: [], inputs: [] };
        try {
            return typeof reqString === 'string' ? JSON.parse(reqString) : reqString;
        } catch (e) {
            return { uploads: [], inputs: [] };
        }
    };

    const rupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    // Daftar Lengkap Biaya Opsional (Khusus PPAT)
    const availableFees = [
        { value: 'plotting', label: 'Plotting & Biaya Lainnya' },
        { value: 'penataan_batas', label: 'Penataan Batas' },
        { value: 'pnbp', label: 'PNBP (Negara)' },
        { value: 'validasi_pajak', label: 'Biaya Validasi Pajak' },
        { value: 'bphtb', label: 'Pajak Pembeli (BPHTB)' },
        { value: 'pph', label: 'Pajak Penjual (PPh)' },
        { value: 'measurement_fee', label: 'Biaya Pengukuran' },
        { value: 'location_check_fee', label: 'Pengecekan Lokasi' },
        { value: 'area_measurement_fee', label: 'Pengukuran Tanah' },
        { value: 'tax_deposit', label: 'Balik Nama SPPT' }
    ];

    const openViewModal = (svc: any, categoryName: string) => {
        const reqs = getReqs(svc.requirements);
        setSelectedService({ ...svc, category_name: categoryName });
        setData({
            name: svc.name,
            service_type_id: svc.service_type_id,
            default_price: svc.default_price,
            uploads: reqs.uploads || [],
            inputs: reqs.inputs || [],
            active_fee_fields: typeof svc.active_fee_fields === 'string' ? JSON.parse(svc.active_fee_fields) : (svc.active_fee_fields || [])
        });
        setModalMode('view');
    };

    const openAddModal = () => {
        setSelectedService(null);
        reset();
        setModalMode('add');
    };

    const closeModal = () => {
        setModalMode('closed');
        setTimeout(() => {
            setSelectedService(null);
            reset();
        }, 200);
    };

    const toggleFeeField = (feeValue: string) => {
        if (data.active_fee_fields.includes(feeValue)) {
            setData('active_fee_fields', data.active_fee_fields.filter(f => f !== feeValue));
        } else {
            setData('active_fee_fields', [...data.active_fee_fields, feeValue]);
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        if (modalMode === 'add') {
            post('/persyaratan', {
                preserveScroll: true,
                onSuccess: () => closeModal()
            });
        } else if (modalMode === 'edit') {
            put(`/persyaratan/${selectedService.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setModalMode('view');
                    // Update state lokal agar tidak perlu refresh halaman
                    setSelectedService((prev: any) => ({
                        ...prev,
                        name: data.name,
                        default_price: data.default_price,
                        requirements: JSON.stringify({ uploads: data.uploads, inputs: data.inputs }),
                        active_fee_fields: JSON.stringify(data.active_fee_fields)
                    }));
                }
            });
        }
    };

    const handleDelete = () => {
        if (confirm(`Apakah Anda yakin ingin menghapus layanan "${selectedService.name}" secara permanen?`)) {
            router.delete(`/persyaratan/${selectedService.id}`, {
                preserveScroll: true,
                onSuccess: () => closeModal()
            });
        }
    };

    const sendToWhatsApp = () => {
        if (!selectedService) return;
        const reqs = getReqs(selectedService.requirements);
        let waText = `*PERSYARATAN BERKAS LAYANAN*\n*KANTOR NOTARIS & PPAT*\n-----------------------------------\n\n*LAYANAN:* ${selectedService.name}\n\n`;

        if (reqs.uploads && reqs.uploads.length > 0) {
            waText += `*DOKUMEN FISIK / SCAN:*\n`;
            reqs.uploads.forEach((req: string, i: number) => { waText += `${i + 1}. ${req}\n`; });
            waText += `\n`;
        }

        if (reqs.inputs && reqs.inputs.length > 0) {
            waText += `*INFO TAMBAHAN:*\n`;
            reqs.inputs.forEach((req: string) => { waText += `- ${req}\n`; });
            waText += `\n`;
        }

        waText += `_Pesan ini dikirim otomatis dari sistem NotarisApp._`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`, '_blank');
    };

    const editInputClasses = "flex-1 bg-white dark:bg-[#09090b] border border-gray-300 dark:border-[#27272a] text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3 transition-all outline-none";
    const labelClasses = "block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1";

    // Cek apakah jenis layanan yang dipilih di Add Mode adalah PPAT
    const isAddingPPAT = modalMode === 'add' && serviceTypes.find((t: any) => t.id === Number(data.service_type_id))?.slug === 'ppat';

    return (
        <AppLayout breadcrumbs={[{ title: 'Kamus Persyaratan', href: '/persyaratan' }]}>
            <Head title="Kamus Persyaratan Layanan" />

            {/* CSS PRINT SAPU JAGAT */}
            <style>{`
                @media print {
                    @page { size: A4 portrait; margin: 1.2cm; }
                    html, body, #app { height: auto !important; min-height: auto !important; overflow: visible !important; position: static !important; background-color: #ffffff !important; }
                    body > * { display: none !important; }
                    #printable-modal-container { display: block !important; }
                    
                    .no-print, .no-print * { display: none !important; }
                    
                    /* Tampilkan tabel dengan baik */
                    table { page-break-inside: auto; width: 100%; }
                    tr { page-break-inside: avoid; page-break-after: auto; }
                    thead { display: table-header-group; }
                    tfoot { display: table-footer-group; }
                    
                    /* Reset container */
                    #printable-modal { position: static !important; width: 100% !important; height: auto !important; background-color: transparent !important; }
                    #printable-content-wrapper { position: static !important; width: 100% !important; height: auto !important; max-height: none !important; overflow: visible !important; box-shadow: none !important; border: none !important; padding: 0 !important; }
                    #printable-scroll-area { overflow: visible !important; height: auto !important; max-height: none !important; }
                    
                    .print-formal-text, .print-formal-text * { font-family: 'Times New Roman', Times, serif !important; color: #000000 !important; }
                    .print-formal-text table td, .print-formal-text table th { font-size: 10pt !important; padding: 4px 8px !important; }
                    .print-formal-text h1 { font-size: 14pt !important; }
                    .print-formal-text p { font-size: 10pt !important; }
                    ::-webkit-scrollbar { display: none !important; }
                }
            `}</style>

            <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] font-sans transition-colors duration-300 p-4 lg:p-8 print:hidden">
                <div className="w-full mx-auto space-y-8">

                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-8 relative z-20">
                        <div className="flex items-center gap-5">
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full"></div>
                                <div className="relative p-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-xl border border-indigo-400/30">
                                    <BookOpenCheck size={28} strokeWidth={2} />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Kamus Persyaratan</h1>
                                <p className="mt-1.5 text-slate-500 dark:text-slate-400 text-sm font-medium">Panduan lengkap SOP dokumen untuk setiap jenis layanan/akta.</p>
                            </div>
                        </div>
                        <div className="flex w-full lg:w-auto gap-3">
                            <div className="relative w-full lg:w-80 group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} /></div>
                                <input type="text" placeholder="Cari layanan..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] text-slate-900 dark:text-white text-sm rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 block pl-11 p-3.5 transition-all outline-none shadow-sm dark:placeholder-slate-500"/>
                            </div>
                            {/* TOMBOL DAFTAR HARGA (KHUSUS ADMIN/BOS) */}
                            {canViewPrices && (
                                <button onClick={() => setModalMode('priceList')} className="flex-shrink-0 px-5 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center gap-2 active:scale-95 border border-emerald-400/20">
                                    <Printer size={16} /> Daftar Harga
                                </button>
                            )}
                            {/* TOMBOL TAMBAH LAYANAN (KHUSUS SUPER ADMIN) */}
                            {isSuperAdmin && (
                                <button onClick={openAddModal} className="flex-shrink-0 px-5 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] flex items-center gap-2 active:scale-95 border border-indigo-400/20">
                                    <Plus size={16} /> Tambah
                                </button>
                            )}
                        </div>
                    </div>

                    {filteredServiceTypes.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-[#121214] border border-gray-200 dark:border-[#27272a] rounded-[2rem] shadow-xl"><FileText size={48} className="mx-auto text-slate-400 mb-4 opacity-50" /><h3 className="text-lg font-bold text-slate-500">Layanan tidak ditemukan</h3></div>
                    ) : (
                        <div className="space-y-16">
                            {filteredServiceTypes.map((type: any) => (
                                <div key={type.id} className="animate-fade-in-up">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 relative">
                                            <div className="absolute inset-0 bg-indigo-500/20 blur-md rounded-xl"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.8)] relative z-10"></div>
                                        </div>
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-wide">
                                            <span className="text-slate-400 dark:text-slate-500 font-medium mr-2 uppercase text-xs tracking-widest">Kategori</span> 
                                            <br className="sm:hidden" />
                                            {type.name}
                                        </h2>
                                        <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-white/10 to-transparent ml-4 hidden sm:block"></div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {type.services.map((svc: any) => (
                                            <div 
                                                key={svc.id} 
                                                onClick={() => openViewModal(svc, type.name)} 
                                                className="group relative overflow-hidden bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.05] rounded-[24px] p-6 hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all duration-500 cursor-pointer flex flex-col justify-between min-h-[160px] shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgba(79,70,229,0.1)]"
                                            >
                                                {/* Decorative blur circles for hover effect */}
                                                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-indigo-500/20 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                                                <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-purple-500/20 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                                                <div className="relative z-10 flex flex-col gap-5 h-full">
                                                    {/* Icon & Badge Row */}
                                                    <div className="flex justify-between items-start">
                                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-sm">
                                                            <FileText strokeWidth={1.5} size={22} />
                                                        </div>
                                                        
                                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
                                                            <ArrowRight size={14} className="-rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Title */}
                                                    <div className="mt-auto">
                                                        <h3 className="text-[15px] font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors leading-snug line-clamp-2">
                                                            {svc.name}
                                                        </h3>
                                                    </div>
                                                </div>
                                                
                                                {/* Bottom subtle indicator line */}
                                                <div className="absolute bottom-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-1 group-hover:translate-y-0"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODAL POPUP --- */}
            {modalMode !== 'closed' && typeof document !== 'undefined' && createPortal(
                <div id="printable-modal-container">
                    <div id="printable-modal" className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-opacity print:!p-0 print:!bg-white print:dark:!bg-white">
                    <div id="printable-content-wrapper" className="bg-white dark:bg-[#121214] border border-gray-200 dark:border-[#27272a] rounded-[2.5rem] shadow-2xl max-w-3xl w-full p-8 max-h-[90vh] flex flex-col relative animate-fade-in-up print:!bg-white print:dark:!bg-white print:!shadow-none print:!border-none print:!rounded-none print:!p-0 print:!max-h-none print:!h-auto">

                        {modalMode === 'priceList' ? (
                            <>
                                <div className="absolute top-6 right-6 flex gap-2 print:hidden no-print">
                                    <button onClick={() => window.print()} className="p-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 rounded-full transition-colors shadow-sm" title="Cetak Daftar Harga"><Printer size={20} /></button>
                                    <button onClick={closeModal} className="p-2.5 bg-gray-100 dark:bg-[#27272a] text-slate-500 hover:text-red-500 rounded-full transition-colors shadow-sm" title="Tutup Modal"><X size={20} /></button>
                                </div>
                                <div className="mb-6 border-b border-gray-200 dark:border-[#27272a] print:!border-black print:!border-b-2 pb-4 shrink-0 print-formal-text text-center">
                                    <h1 className="text-xl font-black uppercase tracking-widest text-slate-900 dark:text-white print:!text-black">DAFTAR HARGA LAYANAN / AKTA</h1>
                                    <p className="text-sm font-bold text-slate-500 print:!text-black mt-1 uppercase">Kantor Notaris & PPAT</p>
                                </div>
                                <div id="printable-scroll-area" className="overflow-y-auto pr-2 custom-scrollbar space-y-6 flex-1 print:overflow-visible print:h-auto print:block print:pr-0 print-formal-text">
                                    <table className="w-full text-left text-sm border-collapse">
                                        <thead>
                                            <tr className="border-b-2 border-black print:!border-black">
                                                <th className="py-2 px-4 font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 print:!text-black">Kategori / Layanan</th>
                                                <th className="py-2 px-4 font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 print:!text-black text-right w-48">Harga Dasar</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {serviceTypes.map((type: any) => (
                                                <React.Fragment key={type.id}>
                                                    <tr className="bg-gray-100 dark:bg-[#18181b] print:!bg-gray-200">
                                                        <td colSpan={2} className="py-2 px-4 font-bold text-slate-900 dark:text-white print:!text-black uppercase tracking-widest">{type.name}</td>
                                                    </tr>
                                                    {type.services.map((svc: any) => (
                                                        <tr key={svc.id} className="border-b border-gray-200 dark:border-[#27272a] print:!border-gray-400">
                                                            <td className="py-3 px-4 text-slate-700 dark:text-slate-300 print:!text-black">{svc.name}</td>
                                                            <td className="py-3 px-4 text-slate-900 dark:text-white print:!text-black font-bold text-right">{rupiah(svc.default_price)}</td>
                                                        </tr>
                                                    ))}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-[#27272a] shrink-0 print:hidden no-print flex gap-4">
                                    <button onClick={closeModal} className="flex-1 py-4 bg-gray-100 dark:bg-[#27272a] text-slate-700 dark:text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all">Tutup</button>
                                    <button onClick={() => window.print()} className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.3)]"><Printer size={16}/> Cetak</button>
                                </div>
                            </>
                        ) : (
                            <>
                        {/* TOMBOL AKSI ATAS KANAN */}
                        <div className="absolute top-6 right-6 flex gap-2 print:hidden no-print">
                            {isSuperAdmin && modalMode === 'view' && (
                                <button onClick={() => setModalMode('edit')} className="p-2.5 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 rounded-full transition-colors shadow-sm" title="Edit Layanan"><Edit size={20} /></button>
                            )}
                            {modalMode === 'view' && (
                                <>
                                    <button onClick={sendToWhatsApp} className="p-2.5 bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 rounded-full transition-colors shadow-sm" title="Kirim ke WhatsApp"><Send size={20} /></button>
                                    <button onClick={() => window.print()} className="p-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 rounded-full transition-colors shadow-sm" title="Cetak Persyaratan"><Printer size={20} /></button>
                                </>
                            )}
                            <button onClick={closeModal} className="p-2.5 bg-gray-100 dark:bg-[#27272a] text-slate-500 hover:text-red-500 rounded-full transition-colors shadow-sm" title="Tutup Modal"><X size={20} /></button>
                        </div>

                        {/* HEADER MODAL */}
                        <div className="mb-6 pr-44 print:pr-0 border-b border-gray-200 dark:border-[#27272a] print:!border-black print:!border-b-2 pb-4 shrink-0 print-formal-text">
                            <div className="hidden print:block mb-4 text-center border-b-2 border-black pb-4"><h1 className="text-lg font-black uppercase tracking-widest text-black">PERSYARATAN BERKAS LAYANAN</h1><p className="text-xs font-bold text-black mt-1 uppercase">Kantor Notaris & PPAT</p></div>

                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3 inline-block print:hidden ${modalMode === 'add' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : (modalMode === 'edit' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20')}`}>
                                {modalMode === 'add' ? 'Tambah Layanan Baru' : (modalMode === 'edit' ? 'Mode Edit Data' : 'Detail SOP')}
                            </span>

                            {modalMode === 'view' ? (
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white print:!text-black leading-tight uppercase">LAYANAN: {selectedService?.name}</h2>
                            ) : (
                                <div>
                                    <label className={labelClasses}>Nama Layanan / Akta</label>
                                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className={`${editInputClasses} w-full text-lg font-bold`} placeholder="Ketik nama layanan..." required />
                                </div>
                            )}
                        </div>

                        {/* ISI KONTEN (SCROLL AREA) */}
                        <div id="printable-scroll-area" className="overflow-y-auto pr-2 custom-scrollbar space-y-8 flex-1 print:overflow-visible print:h-auto print:block print:pr-0 print-formal-text print:space-y-4">

                            {/* PENGATURAN KATEGORI & HARGA (HANYA MUNCUL DI ADD & EDIT) */}
                            {(modalMode === 'edit' || modalMode === 'add') && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {modalMode === 'add' && (
                                        <div>
                                            <label className={labelClasses}>Kategori Layanan</label>
                                            <select value={data.service_type_id} onChange={e => setData('service_type_id', e.target.value)} className={editInputClasses} required>
                                                <option value="">-- Pilih Kategori --</option>
                                                {serviceTypes.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                            </select>
                                        </div>
                                    )}
                                    <div className={modalMode === 'edit' ? 'col-span-2' : ''}>
                                        <label className={labelClasses}>Harga / Honorarium Utama (Rp)</label>
                                        <input type="number" value={data.default_price} onChange={e => setData('default_price', Number(e.target.value))} className={`${editInputClasses} font-black text-emerald-500`} required />
                                    </div>
                                </div>
                            )}

                            {/* DOKUMEN FISIK */}
                            <div>
                                <h4 className="text-xs font-black text-slate-900 dark:text-white print:!text-black uppercase tracking-widest mb-4 flex items-center gap-2 bg-gray-50 dark:bg-[#09090b] p-3 rounded-xl border border-gray-200 dark:border-[#27272a] print:!bg-transparent print:!border-none print:!p-0 print:mb-3"><FileText size={16} className="text-emerald-500 print:hidden"/> Dokumen Fisik / Scan:</h4>

                                {modalMode === 'edit' || modalMode === 'add' ? (
                                    <div className="space-y-3 px-2 print:hidden">
                                        {data.uploads.map((req: string, i: number) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <input type="text" value={req} onChange={e => { const newArr = [...data.uploads]; newArr[i] = e.target.value; setData('uploads', newArr); }} className={editInputClasses} placeholder="Nama dokumen..." />
                                                <button onClick={() => setData('uploads', data.uploads.filter((_, index) => index !== i))} type="button" className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                                            </div>
                                        ))}
                                        <button onClick={() => setData('uploads', [...data.uploads, ''])} type="button" className="w-full p-3 border border-dashed border-gray-300 dark:border-[#27272a] text-slate-500 hover:border-emerald-500 hover:text-emerald-600 rounded-xl text-xs font-bold uppercase tracking-widest flex justify-center items-center gap-2 transition-all"><PlusCircle size={16}/> Tambah Dokumen</button>
                                    </div>
                                ) : (
                                    data.uploads.length > 0 ? (
                                        <ul className="space-y-3 px-2 print:px-0 print:space-y-3">
                                            {data.uploads.map((req: string, i: number) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300 print:!text-black font-medium leading-relaxed print:text-sm">
                                                    <div className="print:hidden mt-0.5"><CheckCircle2 size={18} className="text-emerald-500 shrink-0" /></div>
                                                    <div className="hidden print:block font-bold text-sm shrink-0 w-4 text-black">{i + 1}.</div>
                                                    <span className="print:mt-0 flex-1">{req}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (<p className="text-sm text-slate-500 italic px-2 print:!text-black">Tidak ada syarat dokumen khusus.</p>)
                                )}
                            </div>

                            {/* INFO TAMBAHAN */}
                            <div className="print:mt-4">
                                <h4 className="text-xs font-black text-slate-900 dark:text-white print:!text-black uppercase tracking-widest mb-4 flex items-center gap-2 bg-gray-50 dark:bg-[#09090b] p-3 rounded-xl border border-gray-200 dark:border-[#27272a] print:!bg-transparent print:!border-none print:!p-0 print:mb-3"><Info size={16} className="text-amber-500 print:hidden"/> INFO TAMBAHAN:</h4>

                                {modalMode === 'edit' || modalMode === 'add' ? (
                                    <div className="space-y-3 px-2 print:hidden">
                                        {data.inputs.map((req: string, i: number) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <input type="text" value={req} onChange={e => { const newArr = [...data.inputs]; newArr[i] = e.target.value; setData('inputs', newArr); }} className={editInputClasses} placeholder="Nama info/isian..." />
                                                <button onClick={() => setData('inputs', data.inputs.filter((_, index) => index !== i))} type="button" className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                                            </div>
                                        ))}
                                        <button onClick={() => setData('inputs', [...data.inputs, ''])} type="button" className="w-full p-3 border border-dashed border-gray-300 dark:border-[#27272a] text-slate-500 hover:border-amber-500 hover:text-amber-600 rounded-xl text-xs font-bold uppercase tracking-widest flex justify-center items-center gap-2 transition-all"><PlusCircle size={16}/> Tambah Info</button>
                                    </div>
                                ) : (
                                    data.inputs.length > 0 ? (
                                        <ul className="space-y-3 px-2 print:px-0 print:space-y-3 print:pl-2">
                                            {data.inputs.map((req: string, i: number) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400 print:!text-black leading-relaxed print:text-sm">
                                                    <ArrowRight size={18} className="text-amber-500 shrink-0 mt-0.5 print:hidden" />
                                                    <span className="hidden print:inline-block font-black text-sm mr-1 text-black">-</span>
                                                    <span className="print:mt-0 flex-1">{req}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (<p className="text-sm text-slate-500 italic px-2 print:!text-black">Tidak ada info tambahan khusus.</p>)
                                )}
                            </div>

                            {/* PENGATURAN RINCIAN BIAYA (KHUSUS MODE ADD & EDIT PPAT) */}
                            {(modalMode === 'edit' || modalMode === 'add') && (isAddingPPAT || selectedService?.category_name?.toLowerCase() === 'ppat') && (
                                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-[#27272a]">
                                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2"><Calculator size={16} className="text-blue-500"/> Item Biaya Layanan Ini:</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-2">
                                        {availableFees.map((fee, i) => (
                                            <label key={i} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-[#27272a] rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-[#18181b] transition-all">
                                                <input type="checkbox" checked={data.active_fee_fields.includes(fee.value)} onChange={() => toggleFeeField(fee.value)} className="w-4 h-4 rounded border-gray-300 dark:border-[#27272a] text-indigo-600 focus:ring-indigo-500" />
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{fee.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* FOOTER MODAL (AKSI SIMPAN / TUTUP) */}
                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-[#27272a] shrink-0 print:hidden no-print flex gap-4">
                            {modalMode === 'edit' || modalMode === 'add' ? (
                                <>
                                    {modalMode === 'edit' && (
                                        <button onClick={handleDelete} type="button" className="py-4 px-5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-bold rounded-xl transition-all shadow-sm" title="Hapus Permanen"><Trash2 size={20}/></button>
                                    )}
                                    <button onClick={closeModal} type="button" className="flex-1 py-4 bg-gray-100 dark:bg-[#27272a] text-slate-700 dark:text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all">Batal</button>
                                    <button onClick={handleSave} disabled={processing} type="button" className="flex-[2] py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                        <Save size={16}/> {processing ? 'Menyimpan...' : 'Simpan Layanan'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={sendToWhatsApp} className="flex-1 py-4 bg-green-50 dark:bg-green-500/10 hover:bg-green-100 dark:hover:bg-green-500/20 text-green-600 dark:text-green-400 font-bold rounded-xl text-xs uppercase tracking-widest transition-all flex justify-center items-center gap-2"><Send size={16}/> Kirim ke WA</button>
                                    <button onClick={() => window.print()} className="flex-1 py-4 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl text-xs uppercase tracking-widest transition-all flex justify-center items-center gap-2"><Printer size={16}/> Cetak</button>
                                    <button onClick={closeModal} className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]">Tutup</button>
                                </>
                            )}
                        </div>
                            </>
                        )}
                    </div>
                </div>
                </div>,
                document.body
            )}
        </AppLayout>
    );
}
