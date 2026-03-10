import * as React from "react"
import { Link } from "react-router-dom" // Import Link để chuyển trang mượt
import {
    Projector,
    Users,
    Film,
    Calendar,
    Ticket,
    UserRound,
    House,
    FileText,
    ChartSpline,
    Popcorn
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarRail,
} from "@/components/ui/sidebar"

const data = {
    navMain: [
        { title: "Phim", url: "/movies", icon: Film },
        { title: "Suất chiếu", url: "/showtimes", icon: Calendar },
        { title: "Phòng chiếu", url: "/admin/rooms", icon: Projector },
        { title: "Sản phẩm", url: "/products", icon: Popcorn },
        { title: "Vé", url: "/tickets", icon: Ticket },
        { title: "Hóa đơn", url: "/invoices", icon: FileText },
        { title: "Nhân viên", url: "/staff", icon: Users },
        { title: "Khách hàng", url: "/customers", icon: UserRound },
        { title: "Thống kê", url: "/statistics", icon: ChartSpline },
    ],
}

export function AppSidebar({ ...props }) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            {/* Dùng Link thay cho thẻ a */}
                            <Link to="/">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <House className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">Trang chủ</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        {data.navMain.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild tooltip={item.title}>
                                    {/* Dùng Link to={...} giúp app không bị load lại trang */}
                                    <Link to={item.url} className="flex items-center gap-3">
                                        <item.icon className="size-4" />
                                        <span className="font-medium">{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}