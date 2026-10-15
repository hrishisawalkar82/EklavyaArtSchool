import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { loginAdmin, loginParent, registerParent } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Blob, inputClass, labelClass } from '../components/Theme'

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
    <div className="relative min-h-screen bg-paper py-16 overflow-hidden">
      <Blob color="#2EC4B6" className="top-[-6rem] right-[-5rem] w-[22rem] h-[22rem]" />
      <Blob color="#F7B32B" className="bottom-[-8rem] left-[-6rem] w-[24rem] h-[24rem]" />
      <div className="container mx-auto px-4 max-w-md relative z-10">
        <div className="bg-white rounded-[2rem] shadow-xl border border-ink/5 p-8">
          <h1 className="font-display text-2xl font-bold text-ink mb-2">
            {isAdmin ? 'Admin Login' : registerMode ? 'Parent Registration' : 'Parent Login'}
          </h1>
          <p className="text-ink/60 text-sm mb-6">
            {isAdmin
              ? 'Review and approve payment notifications from parents.'
              : 'Log in to notify the school about a payment you plan to send.'}
          </p>

          {!isAdmin && (
            <div className="flex gap-2 mb-6 p-1 bg-paper rounded-xl">
              <button
                type="button"
                onClick={() => setRegisterMode(false)}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${
                  !registerMode ? 'bg-white shadow text-ink' : 'text-ink/50'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setRegisterMode(true)}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${
                  registerMode ? 'bg-white shadow text-ink' : 'text-ink/50'
                }`}
              >
                Register
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {registerMode && (
              <div>
                <label className={labelClass}>Your name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputClass}
                />
              </div>
            )}
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Password</label>
              <input
                type="password"
                required
                minLength={registerMode ? 6 : undefined}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={inputClass}
              />
            </div>

            {error && (
              <p className="text-sm text-paint-coral bg-paint-coral/10 border border-paint-coral/20 rounded-lg px-3 py-2">
                {typeof error === 'string' ? error : JSON.stringify(error)}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-ink text-paper rounded-xl font-bold hover:bg-paint-coral transition-all duration-300 disabled:opacity-60 shadow-sm"
            >
              {loading ? 'Please wait…' : registerMode ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-ink/60">
            {isAdmin ? (
              <Link to="/login/parent" className="text-paint-violet font-bold hover:underline">
                Parent login instead
              </Link>
            ) : (
              <Link to="/login/admin" className="text-paint-violet font-bold hover:underline">
                Admin login
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
