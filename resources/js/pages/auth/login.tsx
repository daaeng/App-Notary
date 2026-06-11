import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Head, useForm, Link } from '@inertiajs/react';
import { Building2, LockKeyhole, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { FormEventHandler } from 'react';

export default function Login({ status, canResetPassword }: { status?: string; canResetPassword: boolean }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-slate-300 font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <Head title="Masuk ke Sistem" />

            {/* Efek Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="w-full max-w-[420px] relative z-10">

                {/* Logo & Header */}
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
                        <div className="flex items-center justify-center p-2 w-16 h-16 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-xl overflow-hidden group-hover:scale-105 group-hover:bg-indigo-500/20 transition-all">
                            <img src="/logo-notalis.svg" alt="Notalis Logo" className="w-full h-full object-cover" />
                        </div>
                    </Link>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase">
                        Notalis
                    </h1>
                    <p className="text-sm text-slate-500 mt-2 font-medium">
                        Silakan masuk untuk mengelola operasional kantor.
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-[#121214] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl shadow-black/50">
                    {status && (
                        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-bold text-center uppercase tracking-widest">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                                Alamat Email
                            </Label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600 group-focus-within:text-indigo-500 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    autoComplete="username"
                                    className="w-full bg-[#09090b] border border-[#27272a] text-white text-sm rounded-2xl focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 block pl-12 p-4 transition-all outline-none shadow-inner placeholder:text-slate-700"
                                    placeholder="nama@email.com"
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                            </div>
                            <InputError message={errors.email} className="mt-2 text-[10px] font-bold uppercase tracking-wide" />
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <Label htmlFor="password" className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                    Kata Sandi
                                </Label>
                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-[10px] font-bold text-slate-600 hover:text-indigo-400 transition-colors uppercase tracking-widest"
                                    >
                                        Lupa Sandi?
                                    </Link>
                                )}
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600 group-focus-within:text-indigo-500 transition-colors">
                                    <LockKeyhole size={18} />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    autoComplete="current-password"
                                    className="w-full bg-[#09090b] border border-[#27272a] text-white text-sm rounded-2xl focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 block pl-12 p-4 transition-all outline-none shadow-inner placeholder:text-slate-700"
                                    placeholder="••••••••"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                            </div>
                            <InputError message={errors.password} className="mt-2 text-[10px] font-bold uppercase tracking-wide" />
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center gap-3 px-1">
                            <Checkbox
                                id="remember"
                                name="remember"
                                checked={data.remember}
                                onCheckedChange={(checked) => setData('remember', checked as boolean)}
                                className="border-[#27272a] data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                            />
                            <Label htmlFor="remember" className="text-xs font-bold text-slate-500 cursor-pointer select-none">
                                Ingat saya di perangkat ini
                            </Label>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex justify-center items-center gap-2 group"
                        >
                            {processing ? (
                                <Spinner className="w-4 h-4" />
                            ) : (
                                <>
                                    Masuk Sekarang
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Security Note */}
                <div className="mt-8 flex items-center justify-center gap-2 text-slate-600">
                    <ShieldCheck size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Enkripsi Keamanan Berlapis</span>
                </div>
            </div>

            {/* Copyright */}
            <footer className="absolute bottom-8 text-[10px] uppercase tracking-widest text-slate-800 font-bold">
                &copy; {new Date().getFullYear()} Notalis. Hak Cipta Dilindungi. Scymithar
            </footer>
        </div>
    );
}
