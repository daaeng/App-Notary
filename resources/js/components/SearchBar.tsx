import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from '@inertiajs/react';

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Logic: Fetch Data saat mengetik
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.length >= 2) {
                setLoading(true);
                axios.get(route('global.search'), { params: { query } })
                    .then(res => {
                        setResults(res.data);
                        setIsOpen(true);
                        setLoading(false);
                    });
            } else {
                setResults(null);
                setIsOpen(false);
            }
        }, 300); // Delay 300ms agar tidak spam request

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    // Tutup dropdown jika klik di luar
    useEffect(() => {
        function handleClickOutside(event: any) {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [searchRef]);

    return (
        <div className="relative w-full max-w-md" ref={searchRef}>
            {/* INPUT BOX */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {loading ? (
                        <svg className="animate-spin h-5 w-5 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg className="h-5 w-5 text-slate-400 group-focus-within:text-cyan-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                    )}
                </div>
                <input
                    type="text"
                    className="pl-10 pr-4 py-2.5 w-full bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/20 focus:bg-white transition-all placeholder-slate-400"
                    placeholder="Cari Klien, Order, atau Dokumen... (Ctrl+K)"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                />

                {/* Shortcut Hint */}
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-xs text-slate-400 border border-slate-300 rounded px-1.5 py-0.5 hidden sm:block">⌘K</span>
                </div>
            </div>

            {/* DROPDOWN RESULTS */}
            {isOpen && results && (
                <div className="absolute mt-2 w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in-up">

                    {/* 1. HASIL ORDER */}
                    {results.orders.length > 0 && (
                        <div className="py-2">
                            <h3 className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pekerjaan / Akta</h3>
                            {results.orders.map((order: any) => (
                                <Link
                                    key={order.id}
                                    href={route('orders.edit', order.id)}
                                    className="block px-4 py-2 hover:bg-cyan-50 transition border-l-2 border-transparent hover:border-cyan-500"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <div className="text-sm font-bold text-slate-700 truncate">{order.description}</div>
                                    <div className="text-xs text-slate-500 flex gap-2">
                                        <span className="font-mono bg-slate-100 px-1 rounded text-[10px]">{order.order_number}</span>
                                        <span>• {order.client.name}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* 2. HASIL KLIEN */}
                    {results.clients.length > 0 && (
                        <div className="py-2 border-t border-slate-50">
                            <h3 className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Data Klien</h3>
                            {results.clients.map((client: any) => (
                                <Link
                                    key={client.id}
                                    href={route('clients.edit', client.id)} // Asumsi ada route edit klien
                                    className="flex items-center gap-3 px-4 py-2 hover:bg-indigo-50 transition border-l-2 border-transparent hover:border-indigo-500"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                        {client.name.charAt(0)}
                                    </div>
                                    <div className="text-sm font-medium text-slate-700">{client.name}</div>
                                </Link>
                            ))}
                        </div>
                    )}

                     {/* 3. HASIL USER */}
                     {results.users.length > 0 && (
                        <div className="py-2 border-t border-slate-50">
                            <h3 className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pegawai</h3>
                            {results.users.map((user: any) => (
                                <div key={user.id} className="px-4 py-2 flex items-center gap-2 opacity-75">
                                    <div className="w-5 h-5 rounded-full bg-slate-200"></div>
                                    <span className="text-sm text-slate-600">{user.name}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* EMPTY STATE */}
                    {results.orders.length === 0 && results.clients.length === 0 && results.users.length === 0 && (
                        <div className="px-4 py-8 text-center text-slate-400">
                            <p className="text-sm">Tidak ditemukan hasil untuk "{query}"</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
