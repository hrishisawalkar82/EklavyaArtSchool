import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout, isAdmin } = useAuth()

  return (
    <nav className="bg-blue-950 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            <img src="/logo.png" alt="Eklavya Art School" className="h-10 w-10 object-contain" />
            <span className="text-xl font-bold text-white">Eklavya Art School</span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" className="px-4 py-2 text-blue-200 hover:text-white hover:bg-blue-900 rounded-lg transition font-medium">Home</Link>
            <Link to="/gallery" className="px-4 py-2 text-blue-200 hover:text-white hover:bg-blue-900 rounded-lg transition font-medium">Gallery</Link>
            <Link to="/kids" className="px-4 py-2 text-blue-200 hover:text-white hover:bg-blue-900 rounded-lg transition font-medium">Kids Corner</Link>
            <Link to="/contact" className="px-4 py-2 text-blue-200 hover:text-white hover:bg-blue-900 rounded-lg transition font-medium">Contact</Link>
            <Link to="/payment" className="px-4 py-2 text-blue-200 hover:text-white hover:bg-blue-900 rounded-lg transition font-medium">Payment</Link>
            {isAdmin && (
              <Link to="/admin/payments" className="px-4 py-2 text-amber-200 hover:text-white hover:bg-blue-900 rounded-lg transition font-medium">Admin</Link>
            )}
            {user ? (
              <button
                type="button"
                onClick={logout}
                className="ml-2 px-4 py-2 text-sm text-blue-200 hover:text-white border border-blue-700 rounded-lg"
              >
                Sign out ({user.name.split(' ')[0]})
              </button>
            ) : (
              <>
                <Link to="/login/parent" className="px-3 py-2 text-sm text-blue-200 hover:text-white">Parent login</Link>
                <Link to="/login/admin" className="ml-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition font-medium">Admin login</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-blue-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-2">
            <Link to="/" onClick={() => setIsOpen(false)} className="block py-2 text-blue-200 hover:text-white hover:bg-blue-900 rounded-lg px-3 transition font-medium">Home</Link>
            <Link to="/gallery" onClick={() => setIsOpen(false)} className="block py-2 text-blue-200 hover:text-white hover:bg-blue-900 rounded-lg px-3 transition font-medium">Gallery</Link>
            <Link to="/kids" onClick={() => setIsOpen(false)} className="block py-2 text-blue-200 hover:text-white hover:bg-blue-900 rounded-lg px-3 transition font-medium">Kids Corner</Link>
            <Link to="/contact" onClick={() => setIsOpen(false)} className="block py-2 text-blue-200 hover:text-white hover:bg-blue-900 rounded-lg px-3 transition font-medium">Contact</Link>
            <Link to="/payment" onClick={() => setIsOpen(false)} className="block py-2 text-blue-200 hover:text-white hover:bg-blue-900 rounded-lg px-3 transition font-medium">Payment</Link>
            {isAdmin && (
              <Link to="/admin/payments" onClick={() => setIsOpen(false)} className="block py-2 text-amber-200 hover:text-white hover:bg-blue-900 rounded-lg px-3 transition font-medium">Admin payments</Link>
            )}
            {user ? (
              <button
                type="button"
                onClick={() => { logout(); setIsOpen(false) }}
                className="block w-full text-left py-2 px-3 text-blue-200"
              >
                Sign out
              </button>
            ) : (
              <>
                <Link to="/login/parent" onClick={() => setIsOpen(false)} className="block py-2 px-3 text-blue-200">Parent login</Link>
                <Link to="/login/admin" onClick={() => setIsOpen(false)} className="block py-2 px-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg text-center font-medium">Admin login</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
