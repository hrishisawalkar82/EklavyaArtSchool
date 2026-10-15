import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { createPayment, listMyStudents } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { PageHeader, inputClass, labelClass, cardClass } from '../components/Theme'

const PAYMENT_MODES = [
  { value: 'venmo', label: 'Venmo' },
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'check', label: 'Check' },
  { value: 'cash', label: 'Cash' },
  { value: 'other', label: 'Other' },
]

function ParentPaymentPortal() {
  const { user, isParent } = useAuth()
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
      loadStudentDues()
    }
  }, [isParent])

  // Auto-refresh so status changes made by an admin (e.g. confirming a
  // "waiting for confirmation" due as paid) reflect without a manual reload.
  useEffect(() => {
    if (!isParent) return undefined
    const interval = setInterval(() => {
      loadStudentDues()
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
        <div className={`${cardClass} shadow-lg p-6 md:p-8`}>
          <h2 className="font-display text-xl font-bold text-ink mb-2">Notify us about your payment</h2>
          <p className="text-ink/60 text-sm mb-4">
            After you pay via Venmo or Zelle, parents can log in and tell us the student name,
            amount, and payment method. The school will mark it as received once confirmed.
          </p>
          <Link
            to="/login/parent"
            className="inline-flex px-5 py-2.5 bg-ink text-paper rounded-full font-bold hover:bg-paint-coral transition-all duration-300 shadow-sm"
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
      <div ref={submitFormRef} className={`${cardClass} shadow-lg p-6 md:p-8`}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-xl font-bold text-ink">Submit planned payment</h2>
          <button
            type="button"
            onClick={() => setShowSubmitForm(false)}
            className="text-sm text-ink/50 font-medium hover:text-paint-coral hover:underline"
          >
            Hide
          </button>
        </div>
        <p className="text-ink/60 text-sm mb-6">
          Signed in as {user.email}. We'll email the admin and show status below.
        </p>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Student name</label>
            <input
              required
              value={form.student_name}
              onChange={(e) => setForm({ ...form, student_name: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Parent name</label>
            <input
              required
              value={form.parent_name}
              onChange={(e) => setForm({ ...form, parent_name: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Amount (USD)</label>
            <input
              required
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Payment mode</label>
            <select
              value={form.payment_mode}
              onChange={(e) => setForm({ ...form, payment_mode: e.target.value })}
              className={`${inputClass} bg-white`}
            >
              {PAYMENT_MODES.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            {message && <p className="text-sm text-ink bg-paint-teal/10 rounded-lg px-3 py-2 mb-3">{message}</p>}
            {error && (
              <p className="text-sm text-paint-coral bg-paint-coral/10 rounded-lg px-3 py-2 mb-3">
                {typeof error === 'string' ? error : JSON.stringify(error)}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-ink text-paper rounded-xl font-bold hover:bg-paint-coral transition-all duration-300 disabled:opacity-60 shadow-sm"
            >
              {submitting ? 'Sending…' : 'Notify school (pending)'}
            </button>
          </div>
        </form>
      </div>
      )}

      <div className={`${cardClass} shadow-lg p-6 md:p-8`}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
          <h3 className="font-display text-lg font-bold text-ink">My students & payment due</h3>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={loadStudentDues}
              className="text-sm text-paint-violet font-bold hover:underline"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={() => openSubmitForm()}
              className="px-4 py-2 bg-ink text-paper rounded-full text-sm font-bold hover:bg-paint-coral transition-all duration-300 shadow-sm"
            >
              Submit a payment
            </button>
          </div>
        </div>
        <p className="text-ink/60 text-sm mb-6">
          Students linked to your account, the amounts the school has assigned to each, and the
          payment you submitted for each due.
        </p>

        {loadingDues ? (
          <p className="text-ink/50 text-sm">Loading…</p>
        ) : studentDues.length === 0 ? (
          <p className="text-ink/50 text-sm">
            No students are linked to your account yet. Please contact the school.
          </p>
        ) : (
          <div className="space-y-6">
            {studentDues.map(({ student, dues, total_due, total_paid }) => (
              <div key={student.id} className="border border-ink/5 rounded-2xl overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-paper px-5 py-4">
                  <div>
                    <p className="font-display font-bold text-ink">{student.name}</p>
                    <p className="text-xs text-ink/50 font-mono">ID: {student.student_code}</p>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <p className="text-ink/50">Total due</p>
                      <p className="font-bold text-paint-coral">${Number(total_due).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-ink/50">Total paid</p>
                      <p className="font-bold text-paint-teal">${Number(total_paid).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                {dues.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-ink/50">No payment dues assigned.</p>
                ) : (
                  <ul className="divide-y divide-ink/5">
                    {dues.map((due) => (
                      <li key={due.id} className="px-5 py-4 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-medium text-ink">{due.title}</p>
                          <p className="text-xs text-ink/40">
                            {due.due_date
                              ? `Due ${new Date(due.due_date).toLocaleDateString()}`
                              : 'No due date'}
                          </p>
                          {due.payment_mode && (
                            <p className="text-xs text-ink/60 mt-1">
                              Payment type:{' '}
                              <span className="font-semibold text-ink">
                                {due.payment_mode.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                              </span>
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-semibold text-ink">
                            ${Number(due.amount).toFixed(2)}
                          </span>
                          {due.payment_status === 'received' && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-paint-teal/15 text-ink">
                              Received
                            </span>
                          )}
                          {due.payment_status === 'pending' && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-paint-sky/15 text-ink">
                              Submitted
                            </span>
                          )}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              due.status === 'paid'
                                ? 'bg-paint-teal/15 text-ink'
                                : due.status === 'waiting_confirmation'
                                ? 'bg-paint-marigold/20 text-ink'
                                : 'bg-paint-coral/15 text-ink'
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
                              className="px-3 py-1.5 bg-ink text-paper rounded-lg text-xs font-bold hover:bg-paint-coral transition"
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
    <div className="min-h-screen bg-paper">
      <PageHeader
        eyebrow="Simple & secure"
        eyebrowColor="text-paint-teal"
        title="Payment Information"
        subtitle="Pay via Venmo or Zelle, then notify the school so we can track your receipt."
      />

      <ParentPaymentPortal />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Payment QR Codes */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Venmo QR */}
            <div className="bg-white rounded-[2rem] shadow-lg border border-ink/5 p-8 hover:shadow-xl transition">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-paint-sky rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-ink">Venmo QR</h2>
                  <p className="text-ink/60">Quick & Easy Mobile Payment</p>
                </div>
              </div>

              <div className="bg-paper rounded-2xl p-8 text-center">
                <div className="w-48 h-48 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-lg border border-ink/5">
                  <div className="text-center">
                    <div className="text-5xl mb-2">📱</div>
                    <p className="text-ink/50 text-sm mb-2">Scan QR Code</p>
                    <p className="text-2xl font-bold text-paint-sky">@EklavyaArt</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Zelle QR */}
            <div className="bg-white rounded-[2rem] shadow-lg border border-ink/5 p-8 hover:shadow-xl transition">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-paint-violet rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-ink">Zelle QR</h2>
                  <p className="text-ink/60">Fast & Secure Bank Payment</p>
                </div>
              </div>

              <div className="bg-paper rounded-2xl p-8 text-center">
                <div className="w-48 h-48 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-lg border border-ink/5">
                  <div className="text-center">
                    <div className="text-5xl mb-2">📲</div>
                    <p className="text-ink/50 text-sm mb-2">Scan QR Code</p>
                    <p className="text-2xl font-bold text-paint-violet">@EklavyaArt</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Important Note */}
          <div className="bg-paint-marigold/10 border border-paint-marigold/40 rounded-2xl p-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-paint-marigold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-display font-bold text-ink mb-2">Important Note</h3>
                <p className="text-sm text-ink/70">
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