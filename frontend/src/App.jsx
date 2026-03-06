import { Routes, Route } from "react-router-dom"
import { Toaster } from "sonner"

import Login from "./pages/Login"
import Homepage from "./pages/Homepage"
import ProtectedRoute from "./components/ProtectedRoute"
import NotFound from "./pages/NotFound"

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
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App