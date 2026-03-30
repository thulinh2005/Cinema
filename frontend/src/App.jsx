import { Routes, Route } from "react-router-dom"
import { Toaster } from "sonner"
import Login from "./pages/Login"
import Homepage from "./pages/Homepage"
import Rooms from "./pages/Rooms"
import Employee from "./pages/employee"
import SeatMap from "./pages/SeatMap"
import ProtectedRoute from "./components/ProtectedRoute"
import NotFound from "./pages/NotFound"
import Customers from "./pages/Customers"
import Invoices from "./pages/Invoices"
import Tickets from "./pages/Tickets"

function App() {
  return (
    <>
      <Toaster richColors position="top-right" />

      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Cấu trúc Route lồng nhau (Nested Routes) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Homepage />
            </ProtectedRoute>
          }
        >
          {/* Các trang con sẽ hiển thị tại vị trí <Outlet /> trong Homepage */}
          <Route path="admin/rooms" element={<Rooms />} />
          <Route path="admin/rooms/:id/seats" element={<SeatMap />} />
          <Route path="/admin/customers" element={<Customers />} />
          <Route path="/admin/invoices" element={<Invoices />} />
          <Route path="admin/employee" element={<Employee />} />
          <Route path="admin/employee/:id/seats" element={<SeatMap />} />
          <Route path="admin/tickets" element={<Tickets />} />

          {/* Em có thể thêm các trang khác ở đây sau này */}
          {/* <Route path="movies" element={<Movies />} /> */}
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App