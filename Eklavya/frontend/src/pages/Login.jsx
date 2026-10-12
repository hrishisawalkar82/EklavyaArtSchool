import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { loginAdmin, loginParent, registerParent } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Login({ mode = 'parent' }) {
  const isAdmin = mode === 'admin'
  const navigate = useNavigate()
  const location = useLocation()
  const { loginSuccess } = useAuth()
  const [registerMode, setRegisterMode] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const redirectTo =
    location.state?.from || (isAdmin ? '/admin/payments' : '/payment')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      let res
      if (registerMode) {
        res = await registerParent(form)
      } else if (isAdmin) {
        res = await loginAdmin({ email: form.email, password: form.password })
      } else {
        res = await loginParent({ email: form.email, password: form.password })
      }
      loginSuccess(res.data)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16">
      <div className="container mx-auto px-4 max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {isAdmin ? 'Admin Login' : registerMode ? 'Parent Registration' : 'Parent Login'}
          </h1>
          <p className="text-gray-600 text-sm mb-6">
            {isAdmin
              ? 'Review and approve payment notifications from parents.'
              : 'Log in to notify the school about a payment you plan to send.'}
          </p>

          {!isAdmin && (
            <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => setRegisterMode(false)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                  !registerMode ? 'bg-white shadow text-gray-800' : 'text-gray-600'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setRegisterMode(true)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                  registerMode ? 'bg-white shadow text-gray-800' : 'text-gray-600'
                }`}
              >
                Register
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {registerMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                minLength={registerMode ? 6 : undefined}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {typeof error === 'string' ? error : JSON.stringify(error)}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-60"
            >
              {loading ? 'Please wait…' : registerMode ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            {isAdmin ? (
              <Link to="/login/parent" className="text-green-700 font-medium hover:underline">
                Parent login instead
              </Link>
            ) : (
              <Link to="/login/admin" className="text-green-700 font-medium hover:underline">
                Admin login
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
