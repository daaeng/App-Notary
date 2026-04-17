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
        <div className="min-h-screen bg-gray-200 p-8 flex justify-center font-serif text-slate-800">
            <Head title={`Invoice - ${order.order_number}`} />

            {/* A4 Paper Styling */}
            <div className="bg-white w-full max-w-[210mm] min-h-[297mm] p-12 shadow-2xl border border-gray-300 relative print:shadow-none print:border-none print:p-2">

                {/* HEADER KOP SURAT */}
                <div className="flex justify-between items-start border-b-[3px] border-slate-900 pb-6 mb-8">
                    <div className="w-2/3">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase mb-1">{company?.name || 'KANTOR NOTARIS & PPAT'}</h1>
                        <p className="text-base font-bold text-slate-800 uppercase">{company?.notary_name}</p>
                        {company?.sk_number && (
                            <p className="text-xs font-bold text-slate-600 mb-2 mt-0.5">SK: {company.sk_number}</p>
                        )}
                        <p className="text-xs text-slate-600 leading-relaxed pr-8 mt-2">{company?.address}</p>
                        <p className="text-xs text-slate-600 mt-1">Telp: {company?.phone} &nbsp;|&nbsp; Email: {company?.email}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">INVOICE</h2>
                        <p className="text-sm font-bold text-slate-700">No. {order.order_number}</p>
                        <p className="text-xs text-slate-500 mt-1">Tanggal: {formatDate(order.created_at)}</p>
                    </div>
                </div>

                {/* INFO KLIEN & OBJEK */}
                <div className="flex justify-between mb-8 text-sm">
                    <div className="w-1/2 bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <p className="font-bold text-slate-500 uppercase text-[10px] tracking-widest mb-2">Tagihan Kepada:</p>
                        <p className="font-black text-slate-800 text-lg mb-1">{order.client?.name}</p>
                        <p className="text-slate-600">{order.client?.phone}</p>
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

                {/* PRINT BUTTON (Disembunyikan saat diprint) */}
                <div className="absolute top-12 right-12 print:hidden">
                    <button onClick={() => window.print()} className="px-6 py-3 bg-slate-900 text-white font-bold rounded-lg shadow-lg hover:bg-slate-800 transition-colors flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        Cetak Invoice
                    </button>
                </div>

            </div>
        </div>
    );
}
