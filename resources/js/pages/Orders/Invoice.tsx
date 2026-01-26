import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useEffect } from 'react';

// Definisikan tipe data yang kita kirim dari controller
interface OrderData {
    id: number;
    order_number: string;
    created_at: string;
    description: string;
    service_price: number;
    tax_deposit: number;
    total_amount: number;
    client: { name: string; address: string; phone: string };
    service: { name: string };
    ppat_detail?: { object_address: string; certificate_number: string };
}

interface InvoiceProps extends PageProps {
    order: OrderData;
    company: { name: string; notary_name: string; address: string; phone: string; email: string };
}

export default function Invoice({ order, company }: InvoiceProps) {

    // Format Tanggal Indonesia
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    // Format Rupiah
    const rupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8 flex justify-center font-serif text-slate-800">
            <Head title={`Invoice #${order.order_number}`} />

            {/* KERTAS A4 */}
            <div className="bg-white w-[21cm] min-h-[29.7cm] p-12 shadow-2xl relative">

                {/* TOMBOL PRINT (Hilang saat diprint) */}
                <div className="absolute top-4 right-4 flex gap-2 print:hidden">
                    <button onClick={() => window.print()} className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition shadow-lg text-sm font-bold flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        Cetak / PDF
                    </button>
                    <button onClick={() => window.history.back()} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-bold">
                        Kembali
                    </button>
                </div>

                {/* KOP SURAT */}
                <div className="text-center border-b-4 border-double border-slate-800 pb-6 mb-8">
                    <h1 className="text-3xl font-bold tracking-wider uppercase text-slate-900">{company.name}</h1>
                    <h2 className="text-xl font-semibold mt-1">{company.notary_name}</h2>
                    <p className="text-sm text-slate-600 mt-2">{company.address}</p>
                    <p className="text-sm text-slate-600">Telp: {company.phone} | Email: {company.email}</p>
                </div>

                {/* JUDUL DOKUMEN */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h3 className="text-4xl font-black text-slate-200 uppercase tracking-tighter">Invoice</h3>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-slate-500">Nomor Invoice</p>
                        <p className="text-lg font-bold font-mono">{order.order_number}</p>
                        <p className="text-sm text-slate-500 mt-1">Tanggal</p>
                        <p className="font-medium">{formatDate(order.created_at)}</p>
                    </div>
                </div>

                {/* INFO KLIEN */}
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mb-8">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ditagihkan Kepada:</p>
                    <p className="text-lg font-bold text-slate-800">{order.client.name}</p>
                    <p className="text-slate-600 whitespace-pre-line">{order.client.address}</p>
                    <p className="text-slate-600 mt-1">{order.client.phone}</p>
                </div>

                {/* TABEL RINCIAN */}
                <table className="w-full mb-8">
                    <thead>
                        <tr className="border-b-2 border-slate-800">
                            <th className="text-left py-3 font-bold uppercase text-sm">Deskripsi Layanan</th>
                            <th className="text-right py-3 font-bold uppercase text-sm">Jumlah (IDR)</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-700">
                        <tr className="border-b border-slate-200">
                            <td className="py-4">
                                <p className="font-bold text-lg">{order.service.name}</p>
                                <p className="text-sm text-slate-500 mt-1">{order.description}</p>
                                {order.ppat_detail && (
                                    <p className="text-xs text-slate-400 mt-1 italic">
                                        Objek: {order.ppat_detail.object_address} ({order.ppat_detail.certificate_number})
                                    </p>
                                )}
                            </td>
                            <td className="py-4 text-right font-medium align-top">
                                {rupiah(Number(order.service_price))}
                            </td>
                        </tr>
                        {Number(order.tax_deposit) > 0 && (
                            <tr className="border-b border-slate-200">
                                <td className="py-4">
                                    <p className="font-bold">Titipan Biaya / Pajak / PNBP</p>
                                    <p className="text-sm text-slate-500">Reimbursement biaya pengurusan negara</p>
                                </td>
                                <td className="py-4 text-right font-medium align-top">
                                    {rupiah(Number(order.tax_deposit))}
                                </td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td className="pt-4 text-right pr-8 font-bold text-slate-500">Total Tagihan</td>
                            <td className="pt-4 text-right font-black text-2xl text-slate-900">
                                {rupiah(order.total_amount)}
                            </td>
                        </tr>
                    </tfoot>
                </table>

                {/* FOOTER & TTD */}
                <div className="flex justify-between mt-16 break-inside-avoid">
                    <div className="w-1/2 pr-8 text-sm text-slate-500">
                        <p className="font-bold text-slate-800 mb-2">Metode Pembayaran:</p>
                        <p>Transfer Bank BCA</p>
                        <p>No. Rek: 123-456-7890</p>
                        <p>A.n: Orista Miranti Irpada Adam, S.H., M.Kn.</p>
                        <p className="mt-4 italic">Mohon menyertakan nomor invoice dalam berita acara transfer.</p>
                    </div>
                    <div className="w-1/3 text-center">
                        <p className="mb-20">Hormat Kami,</p>
                        <div className="border-b border-slate-800"></div>
                        <p className="mt-2 font-bold">{company.notary_name}</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
