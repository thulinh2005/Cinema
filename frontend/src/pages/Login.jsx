import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Login() {
    const navigate = useNavigate()

    const [tenDangNhap, setTenDangNhap] = useState("")
    const [matKhau, setMatKhau] = useState("")
    const [loading, setLoading] = useState(false)


    const handleForgotPassword = (e) => {
        e.preventDefault();
        toast.info("Đã gửi yêu cầu cấp lại tài khoản cho quản trị viên, vui lòng liên hệ quản lý trực tiếp để được hỗ trợ!");
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch("http://localhost:5000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ten_dang_nhap: tenDangNhap,
                    mat_khau: matKhau,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                toast.error(data.message)
                setLoading(false)
                return
            }

            localStorage.setItem("token", data.token)
            localStorage.setItem("user", JSON.stringify(data.user))

            toast.success("Đăng nhập thành công")

            navigate("/")

        } catch (error) {
            toast.error("Không kết nối được server")
        }

        setLoading(false)
    }

    return (
        <div className="min-h-screen w-full relative bg-white overflow-hidden">

            <div
                className="absolute inset-0 z-0"
                style={{
                    background: "#ffffff",
                    backgroundImage: `
            radial-gradient(
              circle at top left,
              rgba(173, 109, 244, 0.5),
              transparent 70%
            )
          `,
                    filter: "blur(80px)",
                    backgroundRepeat: "no-repeat",
                }}
            />

            <div className="min-h-screen flex items-center justify-center relative z-10 px-4">

                <Card className="w-full max-w-sm shadow-xl border-0">
                    <CardHeader>
                        <CardTitle className="text-center text-2xl font-semibold">
                            Đăng nhập
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-col gap-6">

                                <div className="grid gap-2">
                                    <Label htmlFor="username">Tên đăng nhập</Label>
                                    <Input
                                        id="username"
                                        type="text"
                                        placeholder="Nhập tên đăng nhập"
                                        value={tenDangNhap}
                                        onChange={(e) => setTenDangNhap(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <div className="flex items-center">
                                        <Label htmlFor="password">Mật khẩu</Label>
                                        <a
                                            href="#"
                                            onClick={handleForgotPassword}
                                            className="ml-auto text-sm hover:underline text-purple-600"
                                        >
                                            Quên mật khẩu?
                                        </a>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={matKhau}
                                        onChange={(e) => setMatKhau(e.target.value)}
                                        required
                                    />
                                </div>

                            </div>

                            <CardFooter className="flex-col gap-2 mt-6 px-0">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-purple-600 hover:bg-purple-700"
                                >
                                    {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                                </Button>
                            </CardFooter>
                        </form>
                    </CardContent>

                </Card>
            </div>
        </div>
    )
}