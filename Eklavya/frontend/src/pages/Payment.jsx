import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { createPayment, listMyPayments, listMyStudents } from '../api/client'
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
  const [studentDues, setStudentDues] = useState([])
  const [loadingDues, setLoadingDues] = useState(false)
  const [showSubmitForm, setShowSubmitForm] = useState(false)
  const [activeDueId, setActiveDueId] = useState(null)
  const submitFormRef = useRef(null)

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

  const loadStudentDues = async () => {
    setLoadingDues(true)
    try {
      const res = await listMyStudents()
      setStudentDues(res.data)
    } catch {
      // Non-fatal: dues panel simply stays empty
    } finally {
      setLoadingDues(false)
    }
  }

  const openSubmitForm = (studentName = '', amount = '', dueId = null) => {
    setForm((f) => ({
      ...f,
      student_name: studentName,
      amount: amount !== '' && amount != null ? String(amount) : '',
    }))
    setActiveDueId(dueId)
    setMessage('')
    setError('')
    setShowSubmitForm(true)
    setTimeout(() => {
      submitFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  useEffect(() => {
    if (isParent) {
      loadEntries()
      loadStudentDues()
    }
  }, [isParent])

  // Auto-refresh so status changes made by an admin (e.g. confirming a
  // "waiting for confirmation" due as paid) reflect without a manual reload.
  useEffect(() => {
    if (!isParent) return undefined
    const interval = setInterval(() => {
      loadStudentDues()
      loadEntries()
    }, 15000)
    return () => clearInterval(interval)
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
        due_id: activeDueId,
      })
      setMessage('Payment notification sent. Status is pending until the school confirms receipt.')
      setForm((f) => ({ ...f, student_name: '', amount: '' }))
      setActiveDueId(null)
      await loadEntries()
      await loadStudentDues()
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
            After you pay via Venmo or Zelle, parents can log in and tell us the student name,
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
      {showSubmitForm && (
      <div ref={submitFormRef} className="bg-white rounded-2xl shadow-lg border border-green-100 p-6 md:p-8">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-bold text-gray-800">Submit planned payment</h2>
          <button
            type="button"
            onClick={() => setShowSubmitForm(false)}
            className="text-sm text-gray-500 font-medium hover:underline"
          >
            Hide
          </button>
        </div>
        <p className="text-gray-600 text-sm mb-6">
          Signed in as {user.email}. We'll email the admin and show status below.
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
      )}

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

      <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6 md:p-8">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-bold text-gray-800">My students & payment due</h3>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={loadStudentDues}
              className="text-sm text-green-700 font-medium hover:underline"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={() => openSubmitForm()}
              className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700"
            >
              Submit a payment
            </button>
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-6">
          Students linked to your account and the amounts the school has assigned to each.
        </p>

        {loadingDues ? (
          <p className="text-gray-500 text-sm">Loading…</p>
        ) : studentDues.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No students are linked to your account yet. Please contact the school.
          </p>
        ) : (
          <div className="space-y-6">
            {studentDues.map(({ student, dues, total_due, total_paid }) => (
              <div key={student.id} className="border border-gray-100 rounded-2xl overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50 px-5 py-4">
                  <div>
                    <p className="font-semibold text-gray-800">{student.name}</p>
                    <p className="text-xs text-gray-500 font-mono">ID: {student.student_code}</p>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <p className="text-gray-500">Total due</p>
                      <p className="font-bold text-rose-600">${Number(total_due).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total paid</p>
                      <p className="font-bold text-green-600">${Number(total_paid).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                {dues.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-gray-500">No payment dues assigned.</p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {dues.map((due) => (
                      <li key={due.id} className="px-5 py-4 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-medium text-gray-800">{due.title}</p>
                          <p className="text-xs text-gray-400">
                            {due.due_date
                              ? `Due ${new Date(due.due_date).toLocaleDateString()}`
                              : 'No due date'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-800">
                            ${Number(due.amount).toFixed(2)}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              due.status === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : due.status === 'waiting_confirmation'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {due.status === 'paid'
                              ? 'Paid'
                              : due.status === 'waiting_confirmation'
                              ? 'Waiting for confirmation'
                              : 'Due'}
                          </span>
                          {due.status === 'due' && (
                            <button
                              type="button"
                              onClick={() => openSubmitForm(student.name, due.amount, due.id)}
                              className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700"
                            >
                              Pay
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
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
          <p className="text-green-100 text-lg">Pay via Venmo or Zelle, then notify the school</p>
        </div>
      </div>

      <ParentPaymentPortal />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Payment QR Codes */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Venmo QR */}
            <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Venmo QR</h2>
                  <p className="text-gray-600">Quick & Easy Mobile Payment</p>
                </div>
              </div>

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

            {/* Zelle QR */}
            <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Zelle QR</h2>
                  <p className="text-gray-600">Fast & Secure Bank Payment</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 text-center">
                <div className="w-48 h-48 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                  <div className="text-center">
                    <div className="text-5xl mb-2">📲</div>
                    <p className="text-gray-500 text-sm mb-2">Scan QR Code</p>
                    <p className="text-2xl font-bold text-purple-600">@EklavyaArt</p>
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
                  We do not process payments directly on this website. Use Venmo or Zelle above,
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
