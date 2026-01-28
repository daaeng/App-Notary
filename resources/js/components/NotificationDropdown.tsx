import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';

export default function NotificationDropdown() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Ambil data notifikasi saat komponen muncul
    const fetchNotifications = () => {
        setLoading(true);
        axios.get(route('notifications.data'))
            .then(res => {
                setNotifications(res.data.notifications);
                setCount(res.data.count);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    // Auto-refresh setiap 60 detik (Realtime-ish)
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-800">
                    <Bell className="h-5 w-5" />

                    {/* Badge Merah jika ada notif */}
                    {count > 0 && (
                        <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white"></span>
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80 p-0 rounded-xl shadow-xl border-slate-100">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center rounded-t-xl">
                    <h3 className="font-bold text-sm text-slate-800">Agenda Terdekat</h3>
                    <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                        {count}
                    </span>
                </div>

                <div className="max-h-[300px] overflow-y-auto">
                    {loading && notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400">Memuat...</div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-2xl mb-2">☕</p>
                            <p className="text-sm font-bold text-slate-600">Santai Sejenak</p>
                            <p className="text-xs text-slate-400 mt-1">Tidak ada agenda dalam 3 hari ke depan.</p>
                        </div>
                    ) : (
                        notifications.map((notif: any) => (
                            <DropdownMenuItem key={notif.id} className="p-0 focus:bg-slate-50 cursor-pointer">
                                <Link href={route('schedules.index')} className="flex w-full px-4 py-3 gap-3 items-start border-b border-slate-50 last:border-0">
                                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${notif.is_today ? 'bg-red-500 animate-pulse' : 'bg-cyan-500'}`}></div>
                                    <div>
                                        <p className={`text-sm font-bold ${notif.is_today ? 'text-red-600' : 'text-slate-700'}`}>
                                            {notif.title}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {notif.is_today ? '🔥 HARI INI' : '📅 ' + notif.time}
                                        </p>
                                    </div>
                                </Link>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>

                <div className="p-2 bg-slate-50 border-t border-slate-100 rounded-b-xl text-center">
                    <Link href={route('schedules.index')} className="text-xs font-bold text-cyan-600 hover:text-cyan-700">
                        Lihat Kalender Penuh &rarr;
                    </Link>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
