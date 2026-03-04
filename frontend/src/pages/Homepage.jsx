import { useNavigate } from "react-router-dom"

export default function Homepage() {
    const navigate = useNavigate()

    const user = JSON.parse(localStorage.getItem("user"))

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        navigate("/login")
    }

    return (
        <div className="min-h-screen p-10">
            <h1 className="text-3xl font-bold mb-4">
                Trang chủ
            </h1>

            <p className="mb-4">
                Xin chào: <b>{user?.ten_dang_nhap}</b>
            </p>

            <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded"
            >
                Đăng xuất
            </button>
        </div>
    )
}