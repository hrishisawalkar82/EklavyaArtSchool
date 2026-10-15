import { useCallback, useEffect, useState } from 'react'
import {
  approvePayment,
  listAllPayments,
  listParents,
  listStudents,
  createStudent,
  deleteStudent,
  listPaymentDues,
  createPaymentDue,
  updatePaymentDue,
  deletePaymentDue,
} from '../api/client'
import { PageHeader, inputClass, labelClass } from '../components/Theme'

function StatusBadge({ status }) {
  const received = status === 'received'
  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
        received ? 'bg-paint-teal/15 text-ink' : 'bg-paint-marigold/20 text-ink'
      }`}
    >
      {received ? 'Received' : 'Pending'}
    </span>
  )
}

function DueBadge({ status }) {
  const styles =
    status === 'paid'
      ? 'bg-paint-teal/15 text-ink'
      : status === 'waiting_confirmation'
      ? 'bg-paint-marigold/20 text-ink'
      : 'bg-paint-coral/15 text-ink'
  const label =
    status === 'paid'
      ? 'Paid'
      : status === 'waiting_confirmation'
      ? 'Waiting'
      : 'Due'
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${styles}`}>
      {label}
    </span>
  )
}

function formatMode(mode) {
  return mode.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString()
}

const tabClass = (active) =>
  `px-4 py-2 rounded-xl text-sm font-bold transition ${
    active ? 'bg-ink text-paper' : 'bg-white border border-ink/10 text-ink/70 hover:border-ink/40'
  }`

const actionButtonClass =
  'px-3 py-1.5 rounded-lg text-xs font-bold transition disabled:opacity-50'

export default function AdminPayments() {
  const [tab, setTab] = useState('approvals')

  return (
    <div className="min-h-screen bg-paper">
      <PageHeader
        eyebrow="Studio management"
        eyebrowColor="text-paint-violet"
        title="Admin Dashboard"
        subtitle="Manage students, assign payment dues, and approve parent notifications."
      />

      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'approvals', label: 'Payment approvals' },
            { id: 'students', label: 'Students' },
            { id: 'dues', label: 'Payment dues' },
          ].map(({ id, label }) => (
            <button key={id} type="button" onClick={() => setTab(id)} className={tabClass(tab === id)}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'approvals' && <ApprovalsTab />}
        {tab === 'students' && <StudentsTab />}
        {tab === 'dues' && <DuesTab />}
      </div>
    </div>
  )
}

function ApprovalsTab() {
  const [payments, setPayments] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = filter === 'all' ? {} : { status_filter: filter }
      const res = await listAllPayments(params)
      setPayments(res.data)
    } catch {
      setError('Could not load payments.')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    load()
  }, [load])

  const handleApprove = async (id) => {
    setActionId(id)
    try {
      await approvePayment(id)
      await load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not update payment.')
    } finally {
      setActionId(null)
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: 'all', label: 'All' },
          { id: 'pending', label: 'Pending' },
          { id: 'received', label: 'Received' },
        ].map(({ id, label }) => (
          <button key={id} type="button" onClick={() => setFilter(id)} className={tabClass(filter === id)}>
            {label}
          </button>
        ))}
      </div>

      {error && (
        <p className="mb-4 text-sm text-paint-coral bg-paint-coral/10 border border-paint-coral/20 rounded-lg px-3 py-2">{error}</p>
      )}

      {loading ? (
        <p className="text-ink/60">Loading…</p>
      ) : payments.length === 0 ? (
        <p className="text-ink/60 bg-white rounded-2xl shadow-sm border border-ink/5 p-8 text-center">No payment entries yet.</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-ink/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-paper text-ink/50 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Parent</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-paper/60">
                    <td className="px-4 py-3 font-medium text-ink">{p.student_name}</td>
                    <td className="px-4 py-3 text-ink/70">{p.parent_name}</td>
                    <td className="px-4 py-3">${Number(p.amount).toFixed(2)}</td>
                    <td className="px-4 py-3">{formatMode(p.payment_mode)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-ink/50">
                      {new Date(p.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {p.status === 'pending' ? (
                        <button
                          type="button"
                          disabled={actionId === p.id}
                          onClick={() => handleApprove(p.id)}
                          className={`${actionButtonClass} bg-ink text-paper hover:bg-paint-teal`}
                        >
                          {actionId === p.id ? '…' : 'Mark received'}
                        </button>
                      ) : (
                        <span className="text-ink/30 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}

function StudentsTab() {
  const [students, setStudents] = useState([])
  const [parents, setParents] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ name: '', parent_user_id: '' })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [studentsRes, parentsRes] = await Promise.all([listStudents(), listParents()])
      setStudents(studentsRes.data)
      setParents(parentsRes.data)
    } catch {
      setError('Could not load students.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setMessage('')
    try {
      const res = await createStudent({
        name: form.name.trim(),
        parent_user_id: Number(form.parent_user_id),
      })
      setMessage(`Student added with ID ${res.data.student_code}.`)
      setForm({ name: '', parent_user_id: '' })
      await load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not add student.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student and all their payment dues?')) return
    try {
      await deleteStudent(id)
      await load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not delete student.')
    }
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border border-ink/5 p-6 md:p-8">
        <h2 className="font-display text-lg font-bold text-ink mb-4">Add student</h2>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Student name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Associated parent</label>
            <select
              required
              value={form.parent_user_id}
              onChange={(e) => setForm({ ...form, parent_user_id: e.target.value })}
              className={`${inputClass} bg-white`}
            >
              <option value="" disabled>
                Select a parent
              </option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.email})
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            {message && <p className="text-sm text-ink bg-paint-teal/10 rounded-lg px-3 py-2 mb-3">{message}</p>}
            {error && <p className="text-sm text-paint-coral bg-paint-coral/10 rounded-lg px-3 py-2 mb-3">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-ink text-paper rounded-xl font-bold hover:bg-paint-coral transition-all duration-300 disabled:opacity-60 shadow-sm"
            >
              {submitting ? 'Saving…' : 'Add student'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-ink/5 overflow-hidden">
        {loading ? (
          <p className="p-8 text-ink/60">Loading…</p>
        ) : students.length === 0 ? (
          <p className="p-8 text-ink/60 text-center">No students yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-paper text-ink/50 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Student ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Parent</th>
                  <th className="px-4 py-3">Added</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-paper/60">
                    <td className="px-4 py-3 font-mono font-medium text-ink">{s.student_code}</td>
                    <td className="px-4 py-3 text-ink">{s.name}</td>
                    <td className="px-4 py-3 text-ink/70">{s.parent_name || '—'}</td>
                    <td className="px-4 py-3 text-ink/50">{formatDate(s.created_at)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleDelete(s.id)}
                        className={`${actionButtonClass} bg-paint-coral/10 text-paint-coral hover:bg-paint-coral hover:text-white`}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function DuesTab() {
  const [dues, setDues] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ student_id: '', title: '', amount: '', due_date: '' })

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [duesRes, studentsRes] = await Promise.all([listPaymentDues(), listStudents()])
      setDues(duesRes.data)
      setStudents(studentsRes.data)
    } catch {
      setError('Could not load payment dues.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setMessage('')
    try {
      await createPaymentDue({
        student_id: Number(form.student_id),
        title: form.title.trim(),
        amount: parseFloat(form.amount),
        due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
      })
      setMessage('Payment due added.')
      setForm({ student_id: '', title: '', amount: '', due_date: '' })
      await load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not add payment due.')
    } finally {
      setSubmitting(false)
    }
  }

  const setStatus = async (due, status) => {
    try {
      await updatePaymentDue(due.id, { status })
      await load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not update payment due.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payment due?')) return
    try {
      await deletePaymentDue(id)
      await load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not delete payment due.')
    }
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border border-ink/5 p-6 md:p-8">
        <h2 className="font-display text-lg font-bold text-ink mb-4">Add payment due</h2>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-4 gap-4">
          <div>
            <label className={labelClass}>Student</label>
            <select
              required
              value={form.student_id}
              onChange={(e) => setForm({ ...form, student_id: e.target.value })}
              className={`${inputClass} bg-white`}
            >
              <option value="" disabled>
                Select a student
              </option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.student_code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Monthly Tuition"
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
            <label className={labelClass}>Due date</label>
            <input
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="md:col-span-4">
            {message && <p className="text-sm text-ink bg-paint-teal/10 rounded-lg px-3 py-2 mb-3">{message}</p>}
            {error && <p className="text-sm text-paint-coral bg-paint-coral/10 rounded-lg px-3 py-2 mb-3">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-ink text-paper rounded-xl font-bold hover:bg-paint-coral transition-all duration-300 disabled:opacity-60 shadow-sm"
            >
              {submitting ? 'Saving…' : 'Add payment due'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-ink/5 overflow-hidden">
        {loading ? (
          <p className="p-8 text-ink/60">Loading…</p>
        ) : dues.length === 0 ? (
          <p className="p-8 text-ink/60 text-center">No payment dues yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-paper text-ink/50 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Due date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {dues.map((d) => (
                  <tr key={d.id} className="hover:bg-paper/60">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{d.student_name || '—'}</p>
                      <p className="text-xs text-ink/40 font-mono">{d.student_code}</p>
                    </td>
                    <td className="px-4 py-3 text-ink/70">{d.title}</td>
                    <td className="px-4 py-3">${Number(d.amount).toFixed(2)}</td>
                    <td className="px-4 py-3 text-ink/50">{formatDate(d.due_date)}</td>
                    <td className="px-4 py-3">
                      <DueBadge status={d.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {d.status !== 'paid' && (
                          <button
                            type="button"
                            onClick={() => setStatus(d, 'paid')}
                            className={`${actionButtonClass} bg-paint-teal/10 text-ink hover:bg-paint-teal hover:text-white`}
                          >
                            {d.status === 'waiting_confirmation' ? 'Confirm paid' : 'Mark paid'}
                          </button>
                        )}
                        {d.status !== 'due' && (
                          <button
                            type="button"
                            onClick={() => setStatus(d, 'due')}
                            className={`${actionButtonClass} bg-paint-marigold/20 text-ink hover:bg-paint-marigold`}
                          >
                            Mark due
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(d.id)}
                          className={`${actionButtonClass} bg-paint-coral/10 text-paint-coral hover:bg-paint-coral hover:text-white`}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}