import { useState, FormEventHandler } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage, useForm, router, Link } from '@inertiajs/react';
import Modal from '@/components/ui/modal';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Package, Plus, Minus, Edit, Trash2, Search, CheckCircle2, History, User } from 'lucide-react';

const MySwal = withReactContent(Swal);

export default function InventoryIndex({ inventories, logs }: any) {
    const { auth } = usePage<any>().props;
    const [search, setSearch] = useState('');
    const [showItemModal, setShowItemModal] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedItem, setSelectedItem] = useState<any>(null);

    const filteredItems = inventories.filter((item: any) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    const canManage = auth.user.roles?.some((r: any) => r.name === 'super_admin' || r.name === 'notaris') || auth.user.role === 'super_admin';
    const isSuperAdmin = auth.user.roles?.some((r: any) => r.name === 'super_admin') || auth.user.role === 'super_admin';

    const { data: itemData, setData: setItemData, post: postItem, put: putItem, processing: itemProcessing, reset: resetItem } = useForm({
        name: '', unit: 'pcs', stock: 0,
        date: new Date().toISOString().split('T')[0],
        actor_name: auth.user.name,
    });

    const alertStyle = { background: '#121214', color: '#f1f5f9', confirmButtonColor: '#4f46e5', cancelButtonColor: '#27272a' };

    // [PERBAIKAN]: Fungsi khusus agar tombol ENTER di keyboard langsung men-trigger tombol Konfirmasi/Simpan
    const enableEnterKeyToSubmit = () => {
        const popup = Swal.getPopup();
        if (popup) {
            const inputs = popup.querySelectorAll('input');
            inputs.forEach(input => {
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault(); // Mencegah reload halaman
                        Swal.clickConfirm(); // Memencet tombol aksi secara otomatis
                    }
                });
            });
        }
    };

    const openAddModal = () => { setModalMode('add'); resetItem(); setShowItemModal(true); };
    const openEditModal = (item: any) => { setModalMode('edit'); setSelectedItem(item); setItemData({ ...itemData, name: item.name, unit: item.unit, stock: item.stock }); setShowItemModal(true); };

    const submitManage: FormEventHandler = (e) => {
        e.preventDefault();
        const action = modalMode === 'edit' ? putItem : postItem;
        const url = modalMode === 'edit' ? route('inventories.update', selectedItem.id) : route('inventories.store');
        action(url, {
            onSuccess: () => { setShowItemModal(false); resetItem(); MySwal.fire({ icon: 'success', title: 'Berhasil!', timer: 1500, showConfirmButton: false, ...alertStyle }); }
        });
    };

    const deleteItem = (item: any) => {
        MySwal.fire({ title: 'Hapus Barang?', text: `Data "${item.name}" beserta riwayatnya akan dihapus permanen.`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Hapus', cancelButtonText: 'Batal', ...alertStyle })
        .then((res) => { if (res.isConfirmed) router.delete(route('inventories.destroy', item.id), { onSuccess: () => MySwal.fire({ title: 'Terhapus!', icon: 'success', timer: 1500, showConfirmButton: false, ...alertStyle }) }); });
    };

    const handleActionStock = async (item: any, action: 'take' | 'add') => {
        const today = new Date().toISOString().split('T')[0];
        const defaultName = auth.user.name;

        const { value: formValues } = await MySwal.fire({
            title: action === 'take' ? 'Ambil Barang' : 'Setor (Tambah) Barang',
            html: `
                <div class="text-left text-sm mb-2 text-slate-400 border-b border-[#27272a] pb-4">
                    Barang: <b class="text-white">${item.name}</b> <br/>
                    Stok Saat Ini: <b class="${item.stock > 0 ? 'text-emerald-400' : 'text-red-500'}">${item.stock} ${item.unit}</b>
                </div>
                <div class="space-y-4 text-left mt-5">
                    <div>
                        <label class="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Tanggal Transaksi</label>
                        <input id="swal-date" type="date" value="${today}" class="w-full bg-[#09090b] border border-[#27272a] text-white text-sm rounded-xl p-3.5 outline-none focus:border-indigo-500 transition-colors mt-1.5">
                    </div>
                    <div class="flex gap-3">
                        <div class="w-1/3">
                            <label class="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Jumlah</label>
                            <input id="swal-qty" type="number" class="w-full bg-[#09090b] border border-[#27272a] text-white text-sm rounded-xl p-3.5 outline-none focus:border-indigo-500 transition-colors mt-1.5" placeholder="${item.unit}" min="1" ${action === 'take' ? `max="${item.stock}"` : ''} autofocus>
                        </div>
                        <div class="w-2/3">
                            <label class="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Nama Pelaku</label>
                            <input id="swal-actor" type="text" value="${defaultName}" class="w-full bg-[#09090b] border border-[#27272a] text-white text-sm rounded-xl p-3.5 outline-none focus:border-indigo-500 transition-colors mt-1.5" placeholder="Pengambil / Penyetor...">
                        </div>
                    </div>
                    <div>
                        <label class="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Keterangan</label>
                        <input id="swal-notes" type="text" class="w-full bg-[#09090b] border border-[#27272a] text-white text-sm rounded-xl p-3.5 outline-none focus:border-indigo-500 transition-colors mt-1.5" placeholder="Keperluan / Asal Barang...">
                    </div>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: action === 'take' ? 'Konfirmasi Ambil' : 'Konfirmasi Setor',
            cancelButtonText: 'Batal',
            ...alertStyle,
            didOpen: enableEnterKeyToSubmit, // Panggil fungsi keydown listener di sini
            preConfirm: () => {
                const date = (document.getElementById('swal-date') as HTMLInputElement).value;
                const qty = (document.getElementById('swal-qty') as HTMLInputElement).value;
                const actor_name = (document.getElementById('swal-actor') as HTMLInputElement).value;
                const notes = (document.getElementById('swal-notes') as HTMLInputElement).value;

                if (!date) return Swal.showValidationMessage('Tanggal wajib diisi!');
                if (!qty || Number(qty) < 1) return Swal.showValidationMessage('Jumlah tidak valid!');
                if (action === 'take' && Number(qty) > item.stock) return Swal.showValidationMessage('Stok tidak mencukupi!');
                if (!actor_name) return Swal.showValidationMessage('Nama pelaku wajib diisi!');
                if (!notes) return Swal.showValidationMessage('Keterangan wajib diisi!');

                return { date, qty: Number(qty), actor_name, notes };
            }
        });

        if (formValues) {
            const endpoint = action === 'take' ? route('inventories.take', item.id) : route('inventories.add_stock', item.id);
            router.post(endpoint, formValues, {
                preserveScroll: true,
                onSuccess: () => MySwal.fire({ title: 'Tercatat!', text: `Stok berhasil di${action === 'take' ? 'ambil' : 'tambahkan'}.`, icon: 'success', timer: 1500, showConfirmButton: false, ...alertStyle })
            });
        }
    };

    const handleEditLog = async (log: any) => {
        const dateVal = new Date(log.created_at).toISOString().split('T')[0];

        const { value: formValues } = await MySwal.fire({
            title: 'Edit Riwayat Transaksi',
            html: `
                <div class="space-y-4 text-left mt-2">
                    <div>
                        <label class="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Tanggal</label>
                        <input id="edit-log-date" type="date" value="${dateVal}" class="w-full bg-[#09090b] border border-[#27272a] text-white text-sm rounded-xl p-3.5 outline-none focus:border-indigo-500 transition-colors mt-1.5">
                    </div>
                    <div class="flex gap-3">
                        <div class="w-1/3">
                            <label class="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Jumlah</label>
                            <input id="edit-log-qty" type="number" value="${log.qty}" class="w-full bg-[#09090b] border border-[#27272a] text-white text-sm rounded-xl p-3.5 outline-none focus:border-indigo-500 transition-colors mt-1.5" min="1" autofocus>
                        </div>
                        <div class="w-2/3">
                            <label class="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Nama Pelaku</label>
                            <input id="edit-log-actor" type="text" value="${log.actor_name}" class="w-full bg-[#09090b] border border-[#27272a] text-white text-sm rounded-xl p-3.5 outline-none focus:border-indigo-500 transition-colors mt-1.5">
                        </div>
                    </div>
                    <div>
                        <label class="text-[10px] font-bold uppercase text-slate-500 tracking-widest ml-1">Keterangan</label>
                        <input id="edit-log-notes" type="text" value="${log.notes}" class="w-full bg-[#09090b] border border-[#27272a] text-white text-sm rounded-xl p-3.5 outline-none focus:border-indigo-500 transition-colors mt-1.5">
                    </div>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Simpan Perubahan',
            cancelButtonText: 'Batal',
            ...alertStyle,
            didOpen: enableEnterKeyToSubmit, // Panggil fungsi keydown listener di sini
            preConfirm: () => {
                const date = (document.getElementById('edit-log-date') as HTMLInputElement).value;
                const qty = (document.getElementById('edit-log-qty') as HTMLInputElement).value;
                const actor_name = (document.getElementById('edit-log-actor') as HTMLInputElement).value;
                const notes = (document.getElementById('edit-log-notes') as HTMLInputElement).value;

                if (!date || !qty || Number(qty) < 1 || !actor_name || !notes) {
                    Swal.showValidationMessage('Semua kolom wajib diisi!');
                    return false;
                }
                return { date, qty: Number(qty), actor_name, notes };
            }
        });

        if (formValues) {
            router.put(route('inventories.logs.update', log.id), formValues, {
                preserveScroll: true,
                onSuccess: () => MySwal.fire({ title: 'Tersimpan!', text: 'Riwayat mutasi berhasil diperbarui.', icon: 'success', timer: 1500, showConfirmButton: false, ...alertStyle }),
                onError: (errors: any) => MySwal.fire({ title: 'Gagal!', text: errors.error || 'Terjadi kesalahan sistem.', icon: 'error', ...alertStyle })
            });
        }
    };

    const inputClasses = "w-full bg-[#09090b] border border-[#27272a] text-slate-200 text-sm rounded-xl focus:ring-indigo-500 block p-3.5 outline-none";
    const getInitials = (name: string) => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

    return (
        <AppLayout breadcrumbs={[{ title: 'Inventaris', href: '/inventaris' }]}>
            <Head title="Inventaris Kantor" />

            <div className="min-h-screen bg-gray-50 dark:bg-black font-sans p-4 lg:p-8">
                <div className="w-full mx-auto space-y-8">

                    {/* HEADER */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl border border-indigo-500/20"><Package size={28}/></div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Inventaris Kantor</h1>
                                <p className="mt-1 text-slate-500 text-sm font-medium">Pantau stok dan riwayat mutasi barang operasional.</p>
                            </div>
                        </div>
                        <div className="flex w-full md:w-auto gap-3">
                            <div className="relative w-full md:w-72">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search className="text-slate-500" size={18} /></div>
                                <input type="text" placeholder="Cari barang..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-white dark:bg-[#121214] border border-gray-200 dark:border-[#27272a] text-slate-900 dark:text-white text-sm rounded-2xl focus:ring-indigo-500 block pl-11 p-3.5 outline-none shadow-sm"/>
                            </div>
                            {canManage && (
                                <button onClick={openAddModal} className="shrink-0 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] flex items-center gap-2">
                                    <Plus size={16} /> Barang Baru
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

                        {/* BAGIAN KIRI: DAFTAR KARTU BARANG */}
                        <div className="xl:col-span-4 space-y-4">
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-4 ml-1 flex items-center gap-2"><Package size={16}/> Daftar Stok Barang</h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                                {filteredItems.length === 0 ? (
                                    <div className="col-span-full py-12 text-center bg-[#121214] rounded-3xl border border-[#27272a]">
                                        <Package size={32} className="mx-auto text-slate-600 mb-2" />
                                        <p className="text-slate-400 font-bold text-sm">Tidak ada barang.</p>
                                    </div>
                                ) : (
                                    filteredItems.map((item: any) => (
                                        <div key={item.id} className="bg-[#121214] border border-[#27272a] rounded-[2rem] p-6 shadow-lg relative group hover:border-indigo-500/30 transition-all flex flex-col">
                                            {item.stock === 0 && (<div className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg border-2 border-[#121214]">Habis</div>)}

                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <h3 className="text-base font-black text-white leading-tight">{item.name}</h3>
                                                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[9px] font-bold uppercase tracking-widest border border-[#27272a]">{item.unit}</span>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Sisa Stok</p>
                                                    <p className={`text-3xl font-black tracking-tighter ${item.stock > 10 ? 'text-emerald-400' : item.stock > 0 ? 'text-amber-400' : 'text-red-500'}`}>{item.stock}</p>
                                                </div>
                                            </div>

                                            <div className="mt-auto pt-4 border-t border-[#27272a] flex flex-wrap gap-2">
                                                <button onClick={() => handleActionStock(item, 'take')} disabled={item.stock === 0} className="flex-1 py-2.5 bg-orange-500/10 hover:bg-orange-500 disabled:bg-[#27272a] disabled:text-slate-600 text-orange-500 hover:text-white font-bold rounded-xl text-[10px] uppercase tracking-widest transition-all flex justify-center items-center gap-1 border border-orange-500/20"><Minus size={14}/> Ambil</button>

                                                {canManage && (
                                                    <button onClick={() => handleActionStock(item, 'add')} className="flex-1 py-2.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white font-bold rounded-xl text-[10px] uppercase tracking-widest transition-all flex justify-center items-center gap-1 border border-emerald-500/20"><Plus size={14}/> Setor</button>
                                                )}

                                                {canManage && (
                                                    <div className="flex gap-2 w-full mt-1">
                                                        <button onClick={() => openEditModal(item)} className="flex-1 py-2 bg-[#18181b] hover:bg-[#27272a] text-slate-400 rounded-lg transition border border-[#27272a] text-[10px] font-bold uppercase tracking-wider flex justify-center items-center gap-1"><Edit size={12}/> Edit</button>
                                                        <button onClick={() => deleteItem(item)} className="px-3 bg-[#18181b] hover:bg-red-500/20 text-slate-500 hover:text-red-500 rounded-lg transition border border-[#27272a]"><Trash2 size={14}/></button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* BAGIAN KANAN: TABEL RIWAYAT TRANSAKSI */}
                        <div className="xl:col-span-8">
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-4 ml-1 flex items-center gap-2"><History size={16}/> Tabel Riwayat Mutasi Barang</h2>

                            <div className="bg-white dark:bg-[#121214] rounded-[2rem] border border-gray-200 dark:border-[#27272a] shadow-xl overflow-hidden flex flex-col">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y dark:divide-[#27272a]">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-[#09090b]">
                                                <th className="px-5 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">1. Tanggal</th>
                                                <th className="px-5 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">2. Nama Barang</th>
                                                <th className="px-4 py-4 text-center text-[10px] font-black text-emerald-500 uppercase tracking-widest">3. Masuk</th>
                                                <th className="px-4 py-4 text-center text-[10px] font-black text-orange-500 uppercase tracking-widest">4. Keluar</th>
                                                <th className="px-4 py-4 text-center text-[10px] font-black text-indigo-400 uppercase tracking-widest">5. Sisa</th>
                                                <th className="px-5 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">6. Pelaku</th>
                                                <th className="px-5 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">7. Keterangan</th>
                                                <th className="px-5 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">8. Paraf & Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y dark:divide-[#27272a]">
                                            {logs.data.length === 0 ? (
                                                <tr><td colSpan={8} className="px-6 py-12 text-center text-sm font-bold text-slate-500">Belum ada riwayat transaksi.</td></tr>
                                            ) : (
                                                logs.data.map((log: any) => (
                                                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-[#18181b] transition-colors group">
                                                        {/* 1. Tanggal */}
                                                        <td className="px-5 py-4 whitespace-nowrap">
                                                            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{new Date(log.created_at).toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'})}</div>
                                                            <div className="text-[10px] text-slate-400 font-mono">{new Date(log.created_at).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}</div>
                                                        </td>
                                                        {/* 2. Nama Barang */}
                                                        <td className="px-5 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-bold text-slate-900 dark:text-white">{log.inventory?.name || 'Barang Dihapus'}</div>
                                                            <div className="text-[10px] text-slate-400 uppercase tracking-widest">{log.inventory?.unit || '-'}</div>
                                                        </td>
                                                        {/* 3. Masuk */}
                                                        <td className="px-4 py-4 whitespace-nowrap text-center">
                                                            {log.type === 'in' ? <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20">+{log.qty}</span> : <span className="text-slate-600">-</span>}
                                                        </td>
                                                        {/* 4. Keluar */}
                                                        <td className="px-4 py-4 whitespace-nowrap text-center">
                                                            {log.type === 'out' ? <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-black text-orange-500 bg-orange-500/10 border border-orange-500/20">-{log.qty}</span> : <span className="text-slate-600">-</span>}
                                                        </td>
                                                        {/* 5. Sisa */}
                                                        <td className="px-4 py-4 whitespace-nowrap text-center">
                                                            <span className="text-sm font-black text-indigo-400">{log.remaining_stock}</span>
                                                        </td>
                                                        {/* 6. Pelaku */}
                                                        <td className="px-5 py-4 whitespace-nowrap">
                                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                                                                <User size={14} className="text-slate-500"/> {log.actor_name}
                                                            </div>
                                                        </td>
                                                        {/* 7. Keterangan */}
                                                        <td className="px-5 py-4">
                                                            <span className="text-xs text-slate-400 line-clamp-2 max-w-[150px]" title={log.notes}>{log.notes}</span>
                                                        </td>
                                                        {/* 8. Paraf & Aksi */}
                                                        <td className="px-5 py-4 whitespace-nowrap text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <div className="w-8 h-8 rounded-full bg-[#27272a] text-slate-400 flex items-center justify-center text-[10px] font-black shadow-inner border border-[#3f3f46]" title={log.actor_name}>
                                                                    {getInitials(log.actor_name)}
                                                                </div>
                                                                {isSuperAdmin && (
                                                                    <button onClick={() => handleEditLog(log)} className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition-colors border border-transparent hover:border-indigo-500/30 opacity-0 group-hover:opacity-100" title="Edit Riwayat">
                                                                        <Edit size={14}/>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Pagination Logs */}
                                {logs.links && logs.links.length > 3 && (
                                    <div className="p-4 border-t border-[#27272a] bg-[#09090b] flex justify-center gap-1">
                                        {logs.links.map((link: any, i: number) => (
                                            <Link key={i} href={link.url || '#'} dangerouslySetInnerHTML={{ __html: link.label }} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${link.active ? 'bg-indigo-600 text-white' : 'bg-[#18181b] text-slate-400 hover:bg-[#27272a] hover:text-white border border-[#27272a]'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* MODAL FORM TAMBAH / EDIT MASTER */}
            <Modal show={showItemModal} onClose={() => setShowItemModal(false)}>
                <div className="p-8 bg-[#121214] border border-[#27272a] rounded-[2.5rem]">
                    <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tight flex items-center gap-3">
                        <Package className="text-indigo-500"/> {modalMode === 'add' ? 'Tambah Master Barang' : 'Edit Master Barang'}
                    </h3>
                    <form onSubmit={submitManage} className="space-y-5">
                        <div><label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Nama Barang</label><input type="text" value={itemData.name} onChange={e => setItemData('name', e.target.value)} className={inputClasses} placeholder="Cth: Kertas A4 80gr" required /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Satuan</label><input type="text" value={itemData.unit} onChange={e => setItemData('unit', e.target.value)} className={inputClasses} placeholder="Cth: Rim, Pcs" required /></div>
                            {modalMode === 'add' && (
                                <div><label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Stok Awal</label><input type="number" value={itemData.stock} onChange={e => setItemData('stock', Number(e.target.value))} className={`${inputClasses} font-black text-emerald-400`} min="0" required /></div>
                            )}
                        </div>

                        {/* FORM TAMBAHAN UNTUK BACKDATE SAAT TAMBAH BARANG BARU */}
                        {modalMode === 'add' && (
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#27272a] mt-4">
                                <div><label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Tanggal Masuk</label><input type="date" value={itemData.date} onChange={e => setItemData('date', e.target.value)} className={inputClasses} required /></div>
                                <div><label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Nama Penyetor</label><input type="text" value={itemData.actor_name} onChange={e => setItemData('actor_name', e.target.value)} className={inputClasses} placeholder="Nama pelaku..." required /></div>
                            </div>
                        )}

                        <div className="flex gap-4 mt-8 pt-6 border-t border-[#27272a]">
                            <button type="button" onClick={() => setShowItemModal(false)} className="flex-1 py-4 bg-[#27272a] text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-[#3f3f46] transition">Batal</button>
                            <button type="submit" disabled={itemProcessing} className="flex-[2] py-4 bg-indigo-600 text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)] transition flex justify-center items-center gap-2"><CheckCircle2 size={16}/> Simpan</button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AppLayout>
    );
}
