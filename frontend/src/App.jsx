
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Homepage from "./pages/Homepage"
import Login from "./pages/Login"
import Phim from "./pages/Phim"
import SuatChieu from "./pages/SuatChieu"
import NotFound from "./pages/NotFound"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/phim" element={<Phim />} />
        <Route path="/suatchieu" element={<SuatChieu />} />

        {/* Route bắt tất cả đường dẫn sai */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App