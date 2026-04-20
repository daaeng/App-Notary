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
    Building2,
    BookOpen,
    Calculator,
    ListChecks
} from 'lucide-react';
import { PageProps } from '@/types';
import { route } from 'ziggy-js';

export function AppSidebar() {
    const { auth } = usePage<PageProps>().props;
    const userRole = auth.user.roles?.[0]?.name || '';

    const menuGroups = [
        {
            label: 'Platform',
            items: [
                {
                    title: 'Dashboard',
                    url: route('dashboard'),
                    icon: LayoutGrid,
                    show: true
                },
            ]
        },
        {
            label: 'Operasional',
            items: [
                {
                    title: 'Syarat & Ketentuan',
                    url: route('requirements.index'),
                    icon: ListChecks,
                    show: ['super_admin', 'staff', 'notaris', 'bos'].includes(userRole)
                },
                {
                    title: 'Order Masuk',
                    url: route('orders.index'),
                    icon: FileText,
                    show: ['super_admin', 'staff', 'bos', 'notaris'].includes(userRole)
                },
                // --- [BARU] MENU SIMULASI BIAYA ---
                {
                    title: 'Simulasi Biaya',
                    url: route('simulasi.index'),
                    icon: Calculator,
                    // Bisa diakses oleh admin, staf front office, notaris, dan bos
                    show: ['super_admin', 'staff', 'notaris', 'bos'].includes(userRole)
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
                {
                    title: 'Buku Register',
                    url: route('registers.index'),
                    icon: BookOpen,
                    show: ['super_admin', 'staff', 'notaris', 'bos'].includes(userRole)
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
                    show: userRole === 'super_admin'
                },
                {
                    title: 'Pengaturan Kantor',
                    url: route('settings.edit'),
                    icon: Settings,
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

    const isRouteActive = (routeName: string) => {
        try {
            return window.location.href.startsWith(routeName);
        } catch (e) {
            return false;
        }
    };

    return (
        <Sidebar collapsible="icon" variant="inset">
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

            <SidebarContent>
                {menuGroups.map((group, index) => {
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

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
