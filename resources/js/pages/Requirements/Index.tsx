import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage, useForm } from '@inertiajs/react';
import { FileText, Search, BookOpenCheck, CheckCircle2, Info, ArrowRight, X, MousePointerClick, Printer, Edit, Trash2, PlusCircle, Save, Calculator } from 'lucide-react';

export default function RequirementsIndex({ serviceTypes = [] }: any) {
    const { auth } = usePage<any>().props;
    const [searchTerm, setSearchTerm] = useState('');

    // Deteksi Super Admin
    const isSuperAdmin = auth?.user?.roles?.some((r: any) => r.name === 'super_admin') || auth?.user?.role === 'super_admin';

    // --- STATE UNTUK MODAL & EDIT ---
    const [selectedService, setSelectedService] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const { data, setData, put, processing, reset } = useForm({
        uploads: [] as string[],
        inputs: [] as string[]
    });

    const filteredServiceTypes = (serviceTypes || []).map((type: any) => {
        const filteredServices = (type.services || []).filter((svc: any) =>
            svc.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return { ...type, services: filteredServices };
    }).filter((type: any) => type.services.length > 0);

    const getReqs = (reqString: string) => {
        if (!reqString) return { uploads: [], inputs: [] };
        try {
            return typeof reqString === 'string' ? JSON.parse(reqString) : reqString;
        } catch (e) {
            return { uploads: [], inputs: [] };
        }
    };

    const getActiveFees = (feeString: string) => {
        if (!feeString) return [];
        try {
            return typeof feeString === 'string' ? JSON.parse(feeString) : feeString;
        } catch (e) {
            return [];
        }
    };

    const feeLabels: any = {
        'plotting': 'Plotting & Biaya Lainnya', 'penataan_batas': 'Penataan Batas', 'pnbp': 'PNBP (Negara)',
        'validasi_pajak': 'Biaya Validasi Pajak', 'bphtb': 'Pajak Pembeli (BPHTB)', 'pph': 'Pajak Penjual (PPh)',
        'measurement_fee': 'Biaya Pengukuran', 'location_check_fee': 'Pengecekan Lokasi',
        'area_measurement_fee': 'Pengukuran Tanah', 'tax_deposit': 'Balik Nama SPPT',
    };

    const rupiah = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

    const openModal = (svc: any, categoryName: string) => {
        const reqs = getReqs(svc.requirements);
        setSelectedService({ ...svc, category_name: categoryName });
        setData({
            uploads: reqs.uploads || [],
            inputs: reqs.inputs || []
        });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => {
            setSelectedService(null);
            setIsEditing(false);
            reset();
        }, 200);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/persyaratan/${selectedService.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditing(false);
                setSelectedService((prev: any) => ({
                    ...prev,
                    requirements: JSON.stringify({ uploads: data.uploads, inputs: data.inputs })
                }));
            }
        });
    };

    // Class dinamis untuk input mode edit
    const editInputClasses = "flex-1 bg-white dark:bg-[#09090b] border border-gray-300 dark:border-[#27272a] text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3 transition-all outline-none";

    return (
        <AppLayout breadcrumbs={[{ title: 'Kamus Persyaratan', href: '/persyaratan' }]}>
            <Head title="Kamus Persyaratan Layanan" />

            {/* CSS KHUSUS PRINT: SAPU JAGAT (MEMAKSA PUTIH BERSIH 100%) */}
            <style>{`
                @media print {
                    @page { size: A4 portrait; margin: 1cm; }

                    /* 1. MATIKAN COLOR SCHEME DARK BAWAAN BROWSER */
                    :root, html, body {
                        color-scheme: light !important;
                        background-color: #ffffff !important;
                    }

                    /* 2. SEMBUNYIKAN SEMUA ELEMEN DI LAYAR */
                    body * { visibility: hidden !important; }

                    /* 3. TAMPILKAN HANYA MODAL BESERTA ISINYA */
                    #printable-modal, #printable-modal * {
                        visibility: visible !important;
                    }

                    /* 4. PAKSA MODAL MENJADI PUTIH BERSIH (MENCEGAH KOTAK HITAM) */
                    #printable-modal {
                        position: absolute !important; left: 0 !important; top: 0 !important;
                        width: 100% !important; margin: 0 !important; padding: 0 !important;
                        background-color: #ffffff !important;
                    }

                    /* 5. PAKSA WRAPPER KONTEN MENJADI PUTIH */
                    #printable-content-wrapper {
                        position: absolute !important; left: 0 !important; top: 0 !important;
                        width: 100% !important; border: none !important; border-radius: 0 !important;
                        padding: 0 !important; background-color: #ffffff !important;
                        box-shadow: none !important;
                    }

                    /* 6. SAPU JAGAT: MENGHANCURKAN SEMUA KELAS DARK MODE TAILWIND */
                    #printable-content-wrapper * {
                        background-color: transparent !important;
                        color: #000000 !important;
                    }

                    /* 7. KEMBALIKAN WARNA BORDER KE HITAM */
                    #printable-content-wrapper .border,
                    #printable-content-wrapper .border-t,
                    #printable-content-wrapper .border-t-2,
                    #printable-content-wrapper .border-b,
                    #printable-content-wrapper .border-b-2,
                    #printable-content-wrapper .border-r,
                    #printable-content-wrapper .border-l,
                    #printable-content-wrapper .border-black {
                        border-color: #000000 !important;
                    }

                    /* 8. PENGECUALIAN TABEL (AGAR HEADER TETAP ABU-ABU) */
                    table { border-collapse: collapse !important; width: 100% !important; border: 1px solid black !important; }
                    th, td { border: 1px solid black !important; padding: 8px !important; color: #000000 !important; }
                    th {
                        background-color: #f3f4f6 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    .print-formal-text, .print-formal-text * { font-family: 'Times New Roman', Times, serif !important; color: #000000 !important; }
                    tr, td, th { page-break-inside: avoid !important; }
                    li, div { page-break-inside: avoid; }
                    ::-webkit-scrollbar { display: none !important; }
                }
            `}</style>

            {/* TEMA UI DEFAULT (DINAMIS GRAY/WHITE/DARK) */}
            <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] font-sans transition-colors duration-300 p-4 lg:p-8 print:hidden">
                <div className="w-full mx-auto space-y-8 max-w-[1400px]">

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl border border-indigo-500/20 shadow-lg"><BookOpenCheck size={28}/></div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Kamus Persyaratan</h1>
                                <p className="mt-1 text-slate-500 text-sm font-medium">Panduan lengkap SOP dokumen untuk setiap jenis layanan/akta.</p>
                            </div>
                        </div>
                        <div className="relative w-full md:w-96">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search className="text-slate-500" size={18} /></div>
                            <input type="text" placeholder="Cari layanan (Cth: Waris, AJB)..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white dark:bg-[#121214] border border-gray-200 dark:border-[#27272a] text-slate-900 dark:text-white text-sm rounded-2xl focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 block pl-11 p-3.5 transition-all outline-none shadow-sm"/>
                        </div>
                    </div>

                    {filteredServiceTypes.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-[#121214] border border-gray-200 dark:border-[#27272a] rounded-[2rem] shadow-xl"><FileText size={48} className="mx-auto text-slate-400 mb-4 opacity-50" /><h3 className="text-lg font-bold text-slate-500">Layanan tidak ditemukan</h3></div>
                    ) : (
                        <div className="space-y-12">
                            {filteredServiceTypes.map((type: any) => (
                                <div key={type.id}>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 pb-2 border-b-2 border-gray-200 dark:border-[#27272a] inline-block">Kategori: {type.name}</h2>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                        {type.services.map((svc: any) => (
                                            <div key={svc.id} onClick={() => openModal(svc, type.name)} className="bg-white dark:bg-[#121214] border border-gray-200 dark:border-[#27272a] rounded-[2rem] p-6 shadow-xl dark:shadow-none hover:border-indigo-500/50 hover:shadow-indigo-500/10 transition-all hover:-translate-y-1 cursor-pointer group flex flex-col justify-center items-center text-center min-h-[140px]">
                                                <h3 className="text-base font-black text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-500 transition-colors mb-3 line-clamp-3 leading-tight">{svc.name}</h3>
                                                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-indigo-500 transition-colors bg-gray-50 dark:bg-[#09090b] px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#27272a]"><MousePointerClick size={14}/> Lihat Syarat</span>
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
            {isModalOpen && selectedService && (
                <div id="printable-modal" className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-opacity print:!p-0 print:!bg-white print:dark:!bg-white">

                    {/* WRAPPER MODAL */}
                    <div id="printable-content-wrapper" className="bg-white dark:bg-[#121214] border border-gray-200 dark:border-[#27272a] rounded-[2.5rem] shadow-2xl max-w-3xl w-full p-8 max-h-[90vh] flex flex-col relative animate-fade-in-up print:!bg-white print:dark:!bg-white print:!shadow-none print:!border-none print:!rounded-none print:!p-0 print:!max-h-none print:!h-auto">

                        {/* TOMBOL AKSI */}
                        <div className="absolute top-6 right-6 flex gap-2 print:hidden">
                            {isSuperAdmin && !isEditing && (
                                <button onClick={() => setIsEditing(true)} className="p-2.5 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 rounded-full transition-colors shadow-sm" title="Edit Persyaratan"><Edit size={20} /></button>
                            )}
                            <button onClick={() => window.print()} className="p-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 rounded-full transition-colors shadow-sm" title="Cetak Persyaratan"><Printer size={20} /></button>
                            <button onClick={closeModal} className="p-2.5 bg-gray-100 dark:bg-[#27272a] text-slate-500 hover:text-red-500 rounded-full transition-colors shadow-sm" title="Tutup Modal"><X size={20} /></button>
                        </div>

                        {/* HEADER MODAL */}
                        <div className="mb-6 pr-32 print:pr-0 border-b border-gray-200 dark:border-[#27272a] print:!border-black print:!border-b-2 pb-4 shrink-0 print-formal-text">
                            <div className="hidden print:block mb-4 text-center border-b-2 border-black pb-4"><h1 className="text-lg font-black uppercase tracking-widest text-black">PERSYARATAN BERKAS LAYANAN</h1><p className="text-xs font-bold text-black mt-1 uppercase">Kantor Notaris & PPAT</p></div>
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-3 inline-block print:hidden">{isEditing ? 'Mode Edit Data' : 'Detail SOP'}</span>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white print:!text-black leading-tight uppercase">LAYANAN: {selectedService.name}</h2>
                        </div>

                        {/* ISI KONTEN */}
                        <div id="printable-scroll-area" className="overflow-y-auto pr-2 custom-scrollbar space-y-8 flex-1 print:overflow-visible print:h-auto print:block print:pr-0 print-formal-text print:space-y-4">

                            {/* DOKUMEN FISIK */}
                            <div>
                                <h4 className="text-xs font-black text-slate-900 dark:text-white print:!text-black uppercase tracking-widest mb-4 flex items-center gap-2 bg-gray-50 dark:bg-[#09090b] p-3 rounded-xl border border-gray-200 dark:border-[#27272a] print:!bg-transparent print:!border-none print:!p-0 print:mb-3"><FileText size={16} className="text-emerald-500 print:hidden"/> Dokumen Fisik / Scan:</h4>

                                {isEditing ? (
                                    <div className="space-y-3 px-2 print:hidden">
                                        {data.uploads.map((req: string, i: number) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <input type="text" value={req} onChange={e => { const newArr = [...data.uploads]; newArr[i] = e.target.value; setData('uploads', newArr); }} className={editInputClasses} placeholder="Nama dokumen..." />
                                                <button onClick={() => setData('uploads', data.uploads.filter((_, index) => index !== i))} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                                            </div>
                                        ))}
                                        <button onClick={() => setData('uploads', [...data.uploads, ''])} className="w-full p-3 border border-dashed border-gray-300 dark:border-[#27272a] text-slate-500 hover:border-emerald-500 hover:text-emerald-600 rounded-xl text-xs font-bold uppercase tracking-widest flex justify-center items-center gap-2 transition-all"><PlusCircle size={16}/> Tambah Dokumen</button>
                                    </div>
                                ) : (
                                    getReqs(selectedService.requirements).uploads.length > 0 ? (
                                        <ul className="space-y-3 px-2 print:px-0 print:space-y-3">
                                            {getReqs(selectedService.requirements).uploads.map((req: string, i: number) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300 print:!text-black font-medium leading-relaxed print:text-sm">
                                                    <div className="print:hidden mt-0.5"><CheckCircle2 size={18} className="text-emerald-500 shrink-0" /></div>
                                                    <div className="hidden print:block w-[14px] h-[14px] border-[1.5px] border-black shrink-0 mt-[3px]"></div>
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

                                {isEditing ? (
                                    <div className="space-y-3 px-2 print:hidden">
                                        {data.inputs.map((req: string, i: number) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <input type="text" value={req} onChange={e => { const newArr = [...data.inputs]; newArr[i] = e.target.value; setData('inputs', newArr); }} className={editInputClasses} placeholder="Nama info/isian..." />
                                                <button onClick={() => setData('inputs', data.inputs.filter((_, index) => index !== i))} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                                            </div>
                                        ))}
                                        <button onClick={() => setData('inputs', [...data.inputs, ''])} className="w-full p-3 border border-dashed border-gray-300 dark:border-[#27272a] text-slate-500 hover:border-amber-500 hover:text-amber-600 rounded-xl text-xs font-bold uppercase tracking-widest flex justify-center items-center gap-2 transition-all"><PlusCircle size={16}/> Tambah Info</button>
                                    </div>
                                ) : (
                                    getReqs(selectedService.requirements).inputs.length > 0 ? (
                                        <ul className="space-y-3 px-2 print:px-0 print:space-y-3 print:pl-2">
                                            {getReqs(selectedService.requirements).inputs.map((req: string, i: number) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400 print:!text-black leading-relaxed print:text-sm">
                                                    <ArrowRight size={18} className="text-amber-500 shrink-0 mt-0.5 print:hidden" />
                                                    <div className="hidden print:block w-[14px] h-[14px] border-[1.5px] border-black shrink-0 mt-[3px]"></div>
                                                    <span className="hidden print:inline-block font-black text-sm mr-1 text-black">-</span>
                                                    <span className="print:mt-0 flex-1">{req}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (<p className="text-sm text-slate-500 italic px-2 print:!text-black">Tidak ada info tambahan khusus.</p>)
                                )}
                            </div>

                            {/* TABEL BIAYA */}
                            {/* {selectedService.category_name?.toLowerCase() !== 'notaris' && !isEditing && (
                                <div className="print:mt-6">
                                    <h4 className="text-xs font-black text-slate-900 dark:text-white print:!text-black uppercase tracking-widest mb-4 flex items-center gap-2 bg-gray-50 dark:bg-[#09090b] p-3 rounded-xl border border-gray-200 dark:border-[#27272a] print:!bg-transparent print:!border-none print:!p-0 print:mb-2"><Calculator size={16} className="text-blue-500 print:hidden"/> DAFTAR RINCIAN BIAYA:</h4>
                                    <div className="border border-gray-200 dark:border-[#27272a] print:!border-black rounded-xl print:!rounded-none overflow-hidden">
                                        <table className="w-full text-left border-collapse bg-white dark:bg-[#121214] print:!bg-white">
                                            <thead>
                                                <tr className="bg-gray-50 dark:bg-[#09090b] border-b border-gray-200 dark:border-[#27272a] print:!border-black">
                                                    <th className="p-3 text-xs font-black text-slate-700 dark:text-slate-400 uppercase print:!text-black print:text-sm print:p-1.5 border-r border-gray-200 dark:border-[#27272a] print:!border-black w-2/3">Deskripsi Tagihan</th>
                                                    <th className="p-3 text-xs font-black text-slate-700 dark:text-slate-400 uppercase print:!text-black print:text-sm print:p-1.5 text-right w-1/3">Harga</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-[#27272a] print:!divide-black">
                                                <tr>
                                                    <td className="p-3 text-sm text-slate-700 dark:text-slate-300 font-medium print:!text-black print:text-sm border-r border-gray-200 dark:border-[#27272a] print:!border-black print:p-1.5">Honorarium Jasa / Akta Utama</td>
                                                    <td className="p-3 text-right print:p-1.5"><span className="font-black text-emerald-600 dark:text-emerald-400 print:hidden">{selectedService.default_price > 0 ? rupiah(selectedService.default_price) : '-'}</span><span className="hidden print:block text-sm font-bold whitespace-nowrap text-black">Rp. {selectedService.default_price > 0 ? selectedService.default_price.toLocaleString('id-ID') : '......................'}</span></td>
                                                </tr>
                                                {getActiveFees(selectedService.active_fee_fields).map((fee: string, i: number) => (
                                                    <tr key={i}>
                                                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400 print:!text-black print:text-sm border-r border-gray-200 dark:border-[#27272a] print:!border-black print:p-1.5">{feeLabels[fee] || fee}</td>
                                                        <td className="p-3 text-right print:p-1.5"><span className="text-xs italic text-slate-400 print:hidden">Menyesuaikan Objek</span><span className="hidden print:block text-sm font-bold whitespace-nowrap text-black">Rp. ......................</span></td>
                                                    </tr>
                                                ))}
                                                <tr className="bg-gray-50 dark:bg-[#09090b] print:!bg-transparent border-t-2 border-gray-200 dark:border-[#27272a] print:!border-black print:!border-t-[2px]">
                                                    <td className="p-3 text-sm font-black text-slate-900 dark:text-white print:!text-black print:text-sm text-right border-r border-gray-200 dark:border-[#27272a] print:!border-black print:p-1.5 uppercase">TOTAL</td>
                                                    <td className="p-3 text-right print:p-1.5"><span className="font-black text-indigo-600 dark:text-indigo-400 print:hidden">Auto-Kalkulasi</span><span className="hidden print:block text-sm font-black whitespace-nowrap text-black">Rp. ......................</span></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )} */}

                        </div>

                        {/* FOOTER MODAL (Sembunyi saat diprint) */}
                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-[#27272a] shrink-0 print:hidden flex gap-4">
                            {isEditing ? (
                                <>
                                    <button onClick={() => setIsEditing(false)} className="flex-1 py-4 bg-gray-100 dark:bg-[#27272a] text-slate-700 dark:text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all">Batal</button>
                                    <button onClick={handleSave} disabled={processing} className="flex-[2] py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                        <Save size={16}/> {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => window.print()} className="flex-1 py-4 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl text-xs uppercase tracking-widest transition-all flex justify-center items-center gap-2"><Printer size={16}/> Cetak Persyaratan</button>
                                    <button onClick={closeModal} className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]">Tutup</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
