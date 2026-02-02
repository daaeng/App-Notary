import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import type { BreadcrumbItem } from '@/types';
import SearchBar from '@/Components/SearchBar';            // <--- IMPORT SEARCH
import NotificationDropdown from '@/Components/NotificationDropdown'; // <--- IMPORT NOTIFIKASI

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItem[] }) {
    return (
        <header className="flex dark:bg-neutral-800 h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-white/50 backdrop-blur-sm sticky top-0 z-10">

            {/* BAGIAN KIRI: Tombol Sidebar & Breadcrumbs */}
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            {/* BAGIAN KANAN: Search Bar & Lonceng */}
            <div className="flex items-center gap-4">

                {/* 1. Search Bar (Hanya muncul di layar agak besar) */}
                <div className="hidden md:block w-80 lg:w-96">
                    <SearchBar />
                </div>

                {/* 2. Lonceng Notifikasi */}
                <div className="relative">
                    <NotificationDropdown />
                </div>

            </div>
        </header>
    );
}
