import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

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
            <Link to="/payment" className="ml-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition font-medium">Payment</Link>
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
            <Link to="/payment" onClick={() => setIsOpen(false)} className="block py-2 px-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg text-center font-medium">Payment</Link>
          </div>
        )}
      </div>
    </nav>
  )
}
