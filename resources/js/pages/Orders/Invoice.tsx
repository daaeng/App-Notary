import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';

interface OrderData {
    id: number;
    order_number: string;
    created_at: string;
    description: string;

    // Rincian Biaya
    service_price: number;
    plotting_fee: number;
    pnbp_fee: number;
    validation_fee: number;
    bphtb_fee: number;
    pph_fee: number;
    measurement_fee: number;
    location_check_fee: number;
    area_measurement_fee: number;
    tax_deposit: number;
    total_amount: number;

    client: { name: string; address: string; phone: string } | null;
    service: { name: string } | null;
    ppat_detail?: {
        object_address: string;
        certificate_number: string;
        seller_name: string;
        land_area: number;
        transaction_value: number;
        njop: number;
    };
}

interface InvoiceProps extends PageProps {
    order: OrderData;
    company: {
        name: string;
        notary_name: string;
        sk_number: string;
        address: string;
        phone: string;
        email: string;
        bank_name: string;
        account_number: string;
        account_name: string;
    };
}

export default function Invoice({ order, company }: InvoiceProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const rupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    return (
        <div className="min-h-screen bg-gray-200 print:bg-white print:p-0 flex justify-center font-serif text-slate-800 print:block">
            <Head title={`Invoice - ${order.order_number}`} />
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body, html { background: white !important; margin: 0; padding: 0; }
                    .min-h-screen, .bg-gray-200 { background-color: white !important; min-height: 0 !important; }
                    .min-h-\\[297mm\\] { min-height: 0 !important; }
                    .min-h-\\[400px\\] { min-height: 0 !important; }
                    @page { margin: 10mm; }
                    .print-reset { margin: 0 !important; border: none !important; box-shadow: none !important; }
                }
            `}</style>

            {/* PRINT BUTTON (Dipindah ke luar kertas agar tidak menimpa kop) */}
            <div className="fixed top-8 right-8 z-50 no-print">
                <button onClick={() => window.print()} className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-2xl hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-sm border-2 border-slate-700">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    Cetak Invoice
                </button>
            </div>

            {/* A4 Paper Styling */}
            <div className="bg-white w-full max-w-[210mm] min-h-[297mm] p-12 shadow-2xl border border-gray-300 relative print-reset print:p-0 mx-auto mt-16 print:mt-0">

                {/* HEADER KOP SURAT */}
                <div className="border-b-[3px] border-double border-slate-900 pb-3 mb-5 text-center flex flex-col items-center">
                    <img src="/storage/Garuda_logo.png" alt="Garuda" className="h-20 mb-2 object-contain" />
                    <h1 className="text-[16px] font-black text-slate-900 tracking-tight uppercase">NOTARIS</h1>
                    <h2 className="text-[18px] font-black text-slate-900 uppercase mt-0.5">{company?.notary_name || 'ORISTA MIRANTI IRPADA ADAM, S.H., M.Kn.'}</h2>
                    <p className="text-[10px] font-bold text-slate-800 mt-1">SK. KEMENKUM RI No. {company?.sk_number || 'AHU-111.AH.02.01 TAHUN 2026'}</p>
                    <p className="text-[10px] text-slate-800 mt-0.5">Kedudukan Kabupaten Natuna, Wilayah Jabatan Provinsi Kepulauan Riau</p>
                    <p className="text-[10px] text-slate-800 mt-0.5">{company?.address || 'Jl. Sudirman, RT.03 RW. 01 Air Kolek, Nomor 050, Kelurahan Ranai, Kabupaten Natuna'}</p>
                    <p className="text-[10px] text-slate-800 mt-0.5">Telp : {company?.phone || '+62 812-3001-5677'} || Email : {company?.email || 'oristanotaris@gmail.com'}</p>
                </div>

                {/* TITLE INVOICE DIPISAH DARI KOP SURAT */}
                <div className="text-center mb-8">
                    <h2 className="text-[16px] font-black text-slate-900 mb-1 tracking-tighter uppercase underline decoration-2 underline-offset-4">Invoice</h2>
                    <p className="text-sm font-bold text-slate-700">No. {order.order_number}</p>
                    <p className="text-xs text-slate-500 mt-1">Tanggal: {formatDate(order.created_at)}</p>
                </div>

                {/* INFO KLIEN & OBJEK */}
                <div className="flex justify-between mb-8 text-[12px]">
                    <div className="w-1/2 bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <p className="font-bold text-slate-500 uppercase text-[10px] tracking-widest mb-2">Tagihan Kepada:</p>
                        <p className="font-black text-slate-800 text-lg mb-1">{order.client?.name}</p>
                        {/* <p className="text-slate-600">{order.client?.phone}</p> */}
                        <p className="text-slate-600 mt-1 line-clamp-2">{order.client?.address}</p>
                    </div>
                    <div className="w-1/2 text-right">
                        <p className="font-bold text-slate-500 uppercase text-[10px] tracking-widest mb-2">Pekerjaan & Objek:</p>
                        <p className="font-black text-slate-800 text-lg mb-1">{order.service?.name}</p>
                        {order.ppat_detail?.seller_name && <p className="text-slate-600">A.n: {order.ppat_detail.seller_name}</p>}
                        {order.ppat_detail?.land_area > 0 && <p className="text-slate-600">Luas: {order.ppat_detail.land_area} M²</p>}
                    </div>
                </div>

                {/* TABEL RINCIAN BIAYA DINAMIS */}
                <div className="min-h-[400px]">
                    <table className="w-full text-sm mb-8">
                        <thead>
                            <tr className="border-b-2 border-slate-800 text-left">
                                <th className="pb-3 font-bold uppercase tracking-wider text-xs">Deskripsi Tagihan</th>
                                <th className="pb-3 font-bold uppercase tracking-wider text-xs text-right w-48">Jumlah (Rp)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">

                            {/* Hanya tampilkan biaya yang nominalnya lebih dari 0 */}
                            {Number(order.service_price) > 0 && (
                                <tr><td className="py-4 text-slate-800">Honorarium Jasa / Notaris</td><td className="py-4 text-right font-medium text-slate-800">{rupiah(order.service_price)}</td></tr>
                            )}

                            {Number(order.plotting_fee) > 0 && (
                                <tr><td className="py-4 text-slate-600">Biaya Plotting & Lainnya</td><td className="py-4 text-right font-medium text-slate-600">{rupiah(order.plotting_fee)}</td></tr>
                            )}

                            {Number(order.measurement_fee) > 0 && (
                                <tr><td className="py-4 text-slate-600">Biaya Penataan Batas</td><td className="py-4 text-right font-medium text-slate-600">{rupiah(order.measurement_fee)}</td></tr>
                            )}

                            {Number(order.location_check_fee) > 0 && (
                                <tr><td className="py-4 text-slate-600">Biaya Pengecekan Lokasi</td><td className="py-4 text-right font-medium text-slate-600">{rupiah(order.location_check_fee)}</td></tr>
                            )}

                            {Number(order.area_measurement_fee) > 0 && (
                                <tr><td className="py-4 text-slate-600">Biaya Pengukuran</td><td className="py-4 text-right font-medium text-slate-600">{rupiah(order.area_measurement_fee)}</td></tr>
                            )}

                            {Number(order.pnbp_fee) > 0 && (
                                <tr><td className="py-4 text-slate-600">PNBP (Penerimaan Negara Bukan Pajak)</td><td className="py-4 text-right font-medium text-slate-600">{rupiah(order.pnbp_fee)}</td></tr>
                            )}

                            {Number(order.validation_fee) > 0 && (
                                <tr><td className="py-4 text-slate-600">Biaya Validasi Pajak</td><td className="py-4 text-right font-medium text-slate-600">{rupiah(order.validation_fee)}</td></tr>
                            )}

                            {Number(order.bphtb_fee) > 0 && (
                                <tr><td className="py-4 text-slate-600">Pajak Pembeli / Penerima (BPHTB)</td><td className="py-4 text-right font-medium text-slate-600">{rupiah(order.bphtb_fee)}</td></tr>
                            )}

                            {Number(order.pph_fee) > 0 && (
                                <tr><td className="py-4 text-slate-600">Pajak Penjual / Pengalih (PPh)</td><td className="py-4 text-right font-medium text-slate-600">{rupiah(order.pph_fee)}</td></tr>
                            )}

                            {Number(order.tax_deposit) > 0 && (
                                <tr><td className="py-4 text-slate-600">Biaya Pengurusan Balik Nama SPPT</td><td className="py-4 text-right font-medium text-slate-600">{rupiah(order.tax_deposit)}</td></tr>
                            )}

                        </tbody>
                        <tfoot>
                            <tr>
                                <td className="pt-6 text-right pr-8 font-black uppercase tracking-widest text-slate-800 text-sm">Total Nilai Tagihan</td>
                                <td className="pt-6 text-right font-black text-2xl text-slate-900 border-t-[3px] border-slate-900">
                                    {rupiah(order.total_amount)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* FOOTER & REKENING (DINAMIS DARI DATABASE) */}
                <div className="flex justify-between mt-12 pt-8 border-t border-gray-200 break-inside-avoid">
                    <div className="w-1/2 pr-8 text-sm">
                        <p className="font-black text-slate-800 mb-3 uppercase tracking-widest text-[11px]">Informasi Pembayaran</p>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <p className="text-slate-600 mb-1">Bank: <strong className="text-slate-800">{company?.bank_name || '-'}</strong></p>
                            <p className="text-slate-600 mb-1">No. Rekening: <strong className="text-slate-900 font-mono tracking-wider">{company?.account_number || '-'}</strong></p>
                            <p className="text-slate-600">Atas Nama: <strong className="text-slate-800 uppercase">{company?.account_name || '-'}</strong></p>
                        </div>
                        <p className="mt-4 italic text-xs text-slate-500">* Mohon menyertakan nomor invoice pada berita acara transfer.</p>
                    </div>
                    <div className="w-1/3 text-center flex flex-col justify-end">
                        <p className="mb-24 text-slate-800">Hormat Kami,</p>
                        <div className="border-b border-slate-800 w-full mb-2"></div>
                        <p className="font-bold text-slate-900">{company?.notary_name}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
