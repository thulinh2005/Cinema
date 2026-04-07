import { useNavigate, Outlet } from "react-router-dom" // Thêm Outlet ở đây
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "@/components/AppSidebar"

export default function Homepage() {
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem("user"))

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        navigate("/login")
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AppSidebar />

                <SidebarInset>
                    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-blue-100 bg-blue-50/70 px-4 backdrop-blur-md">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger className="-ml-1 text-slate-500 hover:text-slate-900" />
                            <Separator orientation="vertical" className="mr-2 h-4" />
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium">Chào, {user?.ten_dang_nhap}</span>
                            <button
                                onClick={handleLogout}
                                className="bg-red-50 hover:bg-red-100 text-red-600 text-xs px-3 py-1.5 rounded-md transition-all font-medium border border-red-100"
                            >
                                Đăng xuất
                            </button>
                        </div>
                    </header>
                    <main className="flex-1 overflow-y-auto bg-slate-50 p-2">
                        <div className="min-h-full rounded-xl bg-white border shadow-sm p-4">
                            <Outlet />
                        </div>
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}