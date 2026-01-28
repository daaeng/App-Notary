import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
} from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    FileText,
    Users,
    Calendar,
    BarChart3,
    Wallet,
    UserCog,
    Settings,
    Activity,
    Building2
} from 'lucide-react';
import { PageProps } from '@/types';
import { route } from 'ziggy-js';

export function AppSidebar() {
    // 1. Ambil Data User yang Login
    const { auth } = usePage<PageProps>().props;
    // Deteksi Role: Jika tidak ada role, anggap string kosong
    const userRole = auth.user.roles?.[0]?.name || '';

    // 2. Definisi Menu
    const menuGroups = [
        {
            label: 'Platform',
            items: [
                {
                    title: 'Dashboard',
                    url: route('dashboard'),
                    icon: LayoutGrid,
                    show: true // Semua role boleh lihat
                },
            ]
        },
        {
            label: 'Operasional',
            items: [
                {
                    title: 'Order Masuk',
                    url: route('orders.index'),
                    icon: FileText,
                    show: ['super_admin', 'staff', 'bos', 'notaris'].includes(userRole)
                },
                {
                    title: 'Data Klien',
                    url: route('clients.index'),
                    icon: Users,
                    show: true
                },
                {
                    title: 'Jadwal & Agenda',
                    url: route('schedules.index'),
                    icon: Calendar,
                    show: true
                },
            ]
        },
        {
            label: 'Keuangan',
            items: [
                {
                    title: 'Laporan & Invoice',
                    url: route('reports.index'),
                    icon: BarChart3,
                    // Staff biasa DILARANG lihat uang
                    show: ['super_admin', 'notaris', 'bos'].includes(userRole)
                },
                {
                    title: 'Pengeluaran',
                    url: route('expenses.index'),
                    icon: Wallet,
                    show: ['super_admin', 'notaris', 'bos'].includes(userRole)
                },
            ]
        },
        {
            label: 'Administrasi',
            items: [
                {
                    title: 'Manajemen User',
                    url: route('users.index'),
                    icon: UserCog,
                    // Hanya Super Admin yang boleh kelola pegawai
                    show: userRole === 'super_admin'
                },
                {
                    title: 'Pengaturan Kantor',
                    url: route('settings.edit'),
                    icon: Settings,
                    // Admin & Bos boleh ganti nama kantor/alamat
                    show: ['super_admin', 'bos'].includes(userRole)
                },
                {
                    title: 'Log Aktivitas',
                    url: route('activity-logs.index'),
                    icon: Activity,
                    show: userRole === 'super_admin'
                },
            ]
        }
    ];

    // Helper: Cek apakah route sedang aktif
    const isRouteActive = (routeName: string) => {
        try {
            return window.location.href.startsWith(routeName);
        } catch (e) {
            return false;
        }
    };

    return (
        <Sidebar collapsible="icon" variant="inset">
            {/* --- HEADER --- */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={route('dashboard')}>
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-slate-900 text-sidebar-primary-foreground">
                                    <Building2 className="size-4 text-white" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-bold">NotarisApp</span>
                                    <span className="truncate text-xs text-slate-500">Workspace</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* --- CONTENT MENU --- */}
            <SidebarContent>
                {menuGroups.map((group, index) => {
                    // Cek apakah di group ini ada minimal 1 menu yang boleh dilihat user
                    const visibleItems = group.items.filter(item => item.show);

                    if (visibleItems.length === 0) return null;

                    return (
                        <SidebarGroup key={index}>
                            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {visibleItems.map((item) => (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton asChild tooltip={item.title} isActive={isRouteActive(item.url)}>
                                                <Link href={item.url}>
                                                    <item.icon />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    );
                })}
            </SidebarContent>

            {/* --- FOOTER (User Profile) --- */}
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
