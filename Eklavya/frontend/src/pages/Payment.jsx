import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createPayment, listMyPayments } from '../api/client'
import { useAuth } from '../context/AuthContext'

const PAYMENT_MODES = [
  { value: 'venmo', label: 'Venmo' },
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'check', label: 'Check' },
  { value: 'cash', label: 'Cash' },
  { value: 'other', label: 'Other' },
]

function ParentPaymentPortal() {
  const { user, isParent } = useAuth()
  const [entries, setEntries] = useState([])
  const [loadingList, setLoadingList] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    student_name: '',
    parent_name: user?.name || '',
    amount: '',
    payment_mode: 'venmo',
  })

  useEffect(() => {
    if (user?.name) {
      setForm((f) => ({ ...f, parent_name: f.parent_name || user.name }))
    }
  }, [user?.name])

  const loadEntries = async () => {
    setLoadingList(true)
    try {
      const res = await listMyPayments()
      setEntries(res.data)
    } catch {
      setError('Could not load your payment entries.')
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    if (isParent) loadEntries()
  }, [isParent])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')
    setError('')
    try {
      await createPayment({
        ...form,
        amount: parseFloat(form.amount),
      })
      setMessage('Payment notification sent. Status is pending until the school confirms receipt.')
      setForm((f) => ({ ...f, student_name: '', amount: '' }))
      await loadEntries()
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not submit payment notification.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isParent) {
    return (
      <div className="container mx-auto px-4 -mt-8 relative z-10 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Notify us about your payment</h2>
          <p className="text-gray-600 text-sm mb-4">
            After you pay via Venmo or bank transfer, parents can log in and tell us the student name,
            amount, and payment method. The school will mark it as received once confirmed.
          </p>
          <Link
            to="/login/parent"
            className="inline-flex px-5 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700"
          >
            Parent login / register
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 -mt-8 relative z-10 max-w-4xl space-y-8">
      <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6 md:p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Submit planned payment</h2>
        <p className="text-gray-600 text-sm mb-6">
          Signed in as {user.email}. We&apos;ll email the admin and show status below.
        </p>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student name</label>
            <input
              required
              value={form.student_name}
              onChange={(e) => setForm({ ...form, student_name: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parent name</label>
            <input
              required
              value={form.parent_name}
              onChange={(e) => setForm({ ...form, parent_name: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (USD)</label>
            <input
              required
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment mode</label>
            <select
              value={form.payment_mode}
              onChange={(e) => setForm({ ...form, payment_mode: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none bg-white"
            >
              {PAYMENT_MODES.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            {message && <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2 mb-3">{message}</p>}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3">
                {typeof error === 'string' ? error : JSON.stringify(error)}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-60"
            >
              {submitting ? 'Sending…' : 'Notify school (pending)'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Your payment entries</h3>
        {loadingList ? (
          <p className="text-gray-500 text-sm">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="text-gray-500 text-sm">No entries yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {entries.map((entry) => (
              <li key={entry.id} className="py-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-gray-800">{entry.student_name}</p>
                  <p className="text-sm text-gray-600">
                    ${Number(entry.amount).toFixed(2)} · {entry.payment_mode.replace(/_/g, ' ')}
                  </p>
                  <p className="text-xs text-gray-400">{new Date(entry.created_at).toLocaleString()}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    entry.status === 'received'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {entry.status === 'received' ? 'Received' : 'Pending'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default function Payment() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Payment Information</h1>
          <p className="text-green-100 text-lg">Pay via Venmo or bank transfer, then notify the school</p>
        </div>
      </div>

      <ParentPaymentPortal />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Venmo Payment */}
          <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Venmo Payment</h2>
                <p className="text-gray-600">Quick & Easy Mobile Payment</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 w-full">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 text-center">
                  <div className="w-48 h-48 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                    <div className="text-center">
                      <div className="text-5xl mb-2">📱</div>
                      <p className="text-gray-500 text-sm mb-2">Scan QR Code</p>
                      <p className="text-2xl font-bold text-blue-600">@EklavyaArt</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 text-sm font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Open Venmo App</h3>
                      <p className="text-gray-600 text-sm">Launch the Venmo app on your phone</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 text-sm font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Scan or Search</h3>
                      <p className="text-gray-600 text-sm">Scan QR code or search <span className="font-semibold">@EklavyaArt</span></p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 text-sm font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Send Payment</h3>
                      <p className="text-gray-600 text-sm">Enter amount and include your name</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bank Transfer */}
          <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Bank Transfer Details</h2>
                <p className="text-gray-600">Direct Bank Account Transfer</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Bank Name</p>
                    <p className="text-lg font-semibold text-gray-800">First National Bank</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Account Name</p>
                    <p className="text-lg font-semibold text-gray-800">Eklavya Art School</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Account Type</p>
                    <p className="text-lg font-semibold text-gray-800">Checking</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Account Number</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-mono font-semibold text-gray-800">1234567890</p>
                      <button className="text-green-600 hover:text-green-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Routing Number</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-mono font-semibold text-gray-800">123456789</p>
                      <button className="text-green-600 hover:text-green-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Important Note */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-amber-900 mb-2">Important Note</h3>
                <p className="text-sm text-amber-800">
                  We do not process payments directly on this website. Use Venmo or bank transfer above,
                  then log in as a parent to submit student name, amount, and payment mode. Entries stay
                  pending until an admin marks them received.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
