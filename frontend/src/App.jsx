import { Routes, Route } from "react-router-dom"
import { Toaster } from "sonner"

import Login from "./pages/Login"
import Homepage from "./pages/Homepage"
import ProtectedRoute from "./components/ProtectedRoute"

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
      </Routes>
    </>
  )
}

export default App