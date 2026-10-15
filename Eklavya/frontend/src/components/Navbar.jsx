import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { PALETTE, TapeStrip } from './Theme'

const linkClass =
  'px-4 py-2 text-ink/70 hover:text-ink hover:bg-ink/5 rounded-lg transition font-bold font-sans text-[0.95rem]'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout, isAdmin } = useAuth()

  return (
    <nav className="bg-paper/95 backdrop-blur sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            <img src="/logo.png" alt="Eklavya Art School" className="h-10 w-10 object-contain" />
            <span className="font-display text-xl font-bold text-ink">
              Eklavya <span className="text-paint-coral">Art School</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" className={linkClass}>Home</Link>
            <Link to="/gallery" className={linkClass}>Gallery</Link>
            <Link to="/kids" className={linkClass}>Kids Corner</Link>
            <Link to="/contact" className={linkClass}>Contact</Link>
            <Link to="/payment" className={linkClass}>Payment</Link>
            {isAdmin && (
              <Link
                to="/admin/payments"
                className="px-4 py-2 text-paint-violet hover:text-white hover:bg-paint-violet rounded-lg transition font-bold"
              >
                Admin
              </Link>
            )}
            {user ? (
              <button
                type="button"
                onClick={logout}
                className="ml-2 px-4 py-2 text-sm text-ink/70 hover:text-paint-coral border border-ink/15 hover:border-paint-coral rounded-full transition font-bold"
              >
                Sign out ({user.name.split(' ')[0]})
              </button>
            ) : (
              <>
                <Link to="/login/parent" className="px-3 py-2 text-sm text-ink/60 hover:text-ink font-bold">
                  Parent login
                </Link>
                <Link
                  to="/login/admin"
                  className="ml-2 px-6 py-2 bg-ink text-paper rounded-full hover:bg-paint-coral transition font-bold shadow-sm hover:shadow-paint-coral/40"
                >
                  Admin login
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-ink" aria-label="Toggle menu">
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
          <div className="md:hidden py-4 space-y-1">
            <Link to="/" onClick={() => setIsOpen(false)} className={`block ${linkClass}`}>Home</Link>
            <Link to="/gallery" onClick={() => setIsOpen(false)} className={`block ${linkClass}`}>Gallery</Link>
            <Link to="/kids" onClick={() => setIsOpen(false)} className={`block ${linkClass}`}>Kids Corner</Link>
            <Link to="/contact" onClick={() => setIsOpen(false)} className={`block ${linkClass}`}>Contact</Link>
            <Link to="/payment" onClick={() => setIsOpen(false)} className={`block ${linkClass}`}>Payment</Link>
            {isAdmin && (
              <Link
                to="/admin/payments"
                onClick={() => setIsOpen(false)}
                className="block py-2 px-4 text-paint-violet hover:text-white hover:bg-paint-violet rounded-lg transition font-bold"
              >
                Admin payments
              </Link>
            )}
            {user ? (
              <button
                type="button"
                onClick={() => { logout(); setIsOpen(false) }}
                className="block w-full text-left py-2 px-4 text-ink/70 font-bold"
              >
                Sign out
              </button>
            ) : (
              <>
                <Link to="/login/parent" onClick={() => setIsOpen(false)} className="block py-2 px-4 text-ink/70 font-bold">
                  Parent login
                </Link>
                <Link
                  to="/login/admin"
                  onClick={() => setIsOpen(false)}
                  className="block mx-4 mt-2 py-2 bg-ink text-paper rounded-full text-center font-bold"
                >
                  Admin login
                </Link>
              </>
            )}
          </div>
        )}
      </div>
      <TapeStrip />
    </nav>
  )
}