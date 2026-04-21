import { Head, Link, usePage } from '@inertiajs/react';
import { Building2, ArrowRight, ShieldCheck, FileText, Scale, Sparkles } from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<any>().props;

    return (
        <>
            <Head title="Selamat Datang - NotarisApp" />

            {/* CSS ANIMASI KHUSUS */}
            <style>{`
                @keyframes fadeInUp {
                    0% { opacity: 0; transform: translateY(40px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeInDown {
                    0% { opacity: 0; transform: translateY(-20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulseGlow {
                    0% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.05); }
                    100% { opacity: 0.3; transform: scale(1); }
                }
                .animate-fade-in-up { animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-fade-in-down { animation: fadeInDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-glow { animation: pulseGlow 4s ease-in-out infinite; }

                .delay-100 { animation-delay: 100ms; }
                .delay-200 { animation-delay: 200ms; }
                .delay-300 { animation-delay: 300ms; }
                .delay-500 { animation-delay: 500ms; }
                .delay-600 { animation-delay: 600ms; }
                .delay-700 { animation-delay: 700ms; }
            `}</style>

            <div className="min-h-screen bg-[#09090b] text-slate-300 font-sans selection:bg-indigo-500/30 flex flex-col relative overflow-hidden">

                {/* Efek Background Grid & Glow (Mewah) */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none animate-glow"></div>

                {/* Navbar (Turun dari atas) */}
                <header className="relative z-10 py-6 px-8 flex justify-between items-center max-w-[1400px] mx-auto w-full border-b border-white/5 opacity-0 animate-fade-in-down">
                    <div className="flex items-center gap-3 group cursor-default">
                        <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-all duration-500">
                            <Building2 className="text-indigo-500" size={24} />
                        </div>
                        <span className="text-xl font-black text-white tracking-tight uppercase">Notaris<span className="text-indigo-500">App</span></span>
                    </div>
                </header>

                {/* Hero Section */}
                <main className="flex-1 flex flex-col justify-center items-center text-center px-4 relative z-10 max-w-4xl mx-auto mt-10 lg:mt-0">

                    {/* Badge (Muncul Pertama) */}
                    <div className="opacity-0 animate-fade-in-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-8 backdrop-blur-md shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Sistem Internal Terenkripsi
                    </div>

                    {/* Judul Utama (Muncul Kedua) */}
                    <h1 className="opacity-0 animate-fade-in-up delay-100 text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6 drop-shadow-2xl">
                        Manajemen Digital <br />
                        <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400">
                            Kantor Notaris & PPAT
                            <Sparkles className="absolute -top-6 -right-8 text-cyan-400/50 animate-pulse hidden md:block" size={32}/>
                        </span>
                    </h1>

                    {/* Deskripsi (Muncul Ketiga) */}
                    <p className="opacity-0 animate-fade-in-up delay-200 text-base md:text-lg text-slate-400 mb-12 max-w-2xl leading-relaxed font-medium">
                        Platform manajemen operasional, administrasi akta, simulasi pajak, dan pelaporan keuangan terpadu khusus untuk staf dan pimpinan kantor.
                    </p>

                    {/* Tombol Login (Muncul Keempat) */}
                    <div className="opacity-0 animate-fade-in-up delay-300 flex flex-col sm:flex-row gap-4 items-center justify-center relative">
                        {/* Glow dibelakang tombol */}
                        <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse"></div>

                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="group relative px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all duration-300 hover:shadow-[0_0_40px_rgba(79,70,229,0.5)] hover:-translate-y-1 flex items-center gap-3 uppercase tracking-widest text-sm"
                            >
                                Masuk ke Dashboard
                                <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                            </Link>
                        ) : (
                            <Link
                                href={route('login')}
                                className="group relative px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all duration-300 hover:shadow-[0_0_40px_rgba(79,70,229,0.5)] hover:-translate-y-1 flex items-center gap-3 uppercase tracking-widest text-sm"
                            >
                                Login ke Sistem
                                <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                            </Link>
                        )}
                    </div>
                </main>

                {/* Features Highlight (Muncul Berurutan dari kiri ke kanan) */}
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1200px] mx-auto w-full px-6 pb-20 mt-20">

                    {/* Card 1 */}
                    <div className="opacity-0 animate-fade-in-up delay-500 group p-8 rounded-[2rem] bg-[#121214]/80 border border-[#27272a] hover:border-blue-500/30 backdrop-blur-md text-center hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.2)] transition-all duration-500">
                        <div className="w-14 h-14 mx-auto bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-500">
                            <FileText size={26} />
                        </div>
                        <h3 className="text-white font-black mb-3 uppercase tracking-widest text-xs">Manajemen Berkas</h3>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Kelola dokumen klien, lacak status akta, dan integrasi riwayat persyaratan secara digital.</p>
                    </div>

                    {/* Card 2 (Perbaikan Animasi) */}
                    <div className="opacity-0 animate-fade-in-up delay-600 group p-8 rounded-[2rem] bg-[#121214]/80 border border-[#27272a] hover:border-emerald-500/30 backdrop-blur-md text-center hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.2)] transition-all duration-500">
                        <div className="w-14 h-14 mx-auto bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-500">
                            <Scale size={26} />
                        </div>
                        <h3 className="text-white font-black mb-3 uppercase tracking-widest text-xs">Kalkulasi Cerdas</h3>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Perhitungan otomatis untuk BPHTB, PPh, PNBP, dan honorarium sesuai standar PPAT & Notaris.</p>
                    </div>

                    {/* Card 3 */}
                    <div className="opacity-0 animate-fade-in-up delay-700 group p-8 rounded-[2rem] bg-[#121214]/80 border border-[#27272a] hover:border-rose-500/30 backdrop-blur-md text-center hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(244,63,94,0.2)] transition-all duration-500">
                        <div className="w-14 h-14 mx-auto bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mb-6 border border-rose-500/20 group-hover:scale-110 group-hover:bg-rose-500/20 transition-all duration-500">
                            <ShieldCheck size={26} />
                        </div>
                        <h3 className="text-white font-black mb-3 uppercase tracking-widest text-xs">Keamanan Data</h3>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Akses terenkripsi khusus untuk staf internal yang terdaftar. Fitur registrasi umum dinonaktifkan.</p>
                    </div>

                </div>

                {/* Footer */}
                <footer className="opacity-0 animate-fade-in-up delay-700 relative z-10 text-center py-8 border-t border-white/5 text-[10px] uppercase tracking-[0.2em] text-slate-600 font-bold">
                    &copy; {new Date().getFullYear()} NotarisApp. Hak Cipta Dilindungi.
                </footer>
            </div>
        </>
    );
}
