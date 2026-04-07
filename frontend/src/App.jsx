import { Routes, Route } from "react-router-dom"
import { Toaster } from "sonner"
import Login from "./pages/Login"
import Homepage from "./pages/Homepage"
import Rooms from "./pages/Rooms"
import Employee from "./pages/employee"
import SeatMap from "./pages/SeatMap"
import Movies from "./pages/Movies"
import Showtimes from "./pages/Showtimes"
import ProtectedRoute from "./components/ProtectedRoute"
import NotFound from "./pages/NotFound"
import Customers from "./pages/Customers"
import Invoices from "./pages/Invoices"
import Tickets from "./pages/Tickets"
import Products from "./pages/Products"
import InvoiceStatistics from "./pages/InvoiceStatistics"


function App() {
  return (
    <>
      <Toaster richColors position="top-right" />

      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Homepage />
            </ProtectedRoute>
          }
        >
          <Route path="admin/rooms" element={<Rooms />} />
          <Route path="admin/rooms/:id/seats" element={<SeatMap />} />
          <Route path="/admin/customers" element={<Customers />} />
          <Route path="/admin/invoices" element={<Invoices />} />
          <Route path="admin/employee" element={<Employee />} />
          <Route path="admin/employee/:id/seats" element={<SeatMap />} />
          <Route path="admin/tickets" element={<Tickets />} />
          <Route path="products" element={<Products />} />
          <Route path="statistics" element={<InvoiceStatistics />} />
          <Route path="movies" element={<Movies />} />
          <Route path="showtimes" element={<Showtimes />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App