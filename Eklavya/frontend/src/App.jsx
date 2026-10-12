import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import Gallery from './pages/Gallery'
import Kids from './pages/Kids'
import Contact from './pages/Contact'
import Payment from './pages/Payment'
import Login from './pages/Login'
import AdminPayments from './pages/AdminPayments'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/kids" element={<Kids />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/login/parent" element={<Login mode="parent" />} />
            <Route path="/login/admin" element={<Login mode="admin" />} />
            <Route
              path="/admin/payments"
              element={
                <ProtectedRoute role="admin">
                  <AdminPayments />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}

export default App
