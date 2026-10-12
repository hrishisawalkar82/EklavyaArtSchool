import { useCallback, useEffect, useState } from 'react'
import { approvePayment, listAllPayments } from '../api/client'

function StatusBadge({ status }) {
  const received = status === 'received'
  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
        received ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
      }`}
    >
      {received ? 'Received' : 'Pending'}
    </span>
  )
}

function formatMode(mode) {
  return mode.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function AdminPayments() {
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Payment approvals</h1>
          <p className="text-slate-300 mt-2">Mark parent notifications as received when payment arrives.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'all', label: 'All' },
            { id: 'pending', label: 'Pending' },
            { id: 'received', label: 'Received' },
          ].map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                filter === id ? 'bg-slate-800 text-white' : 'bg-white border border-gray-200 text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
        )}

        {loading ? (
          <p className="text-gray-600">Loading…</p>
        ) : payments.length === 0 ? (
          <p className="text-gray-600 bg-white rounded-2xl shadow p-8 text-center">No payment entries yet.</p>
        ) : (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
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
                <tbody className="divide-y divide-gray-100">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{p.student_name}</td>
                      <td className="px-4 py-3 text-gray-700">{p.parent_name}</td>
                      <td className="px-4 py-3">${Number(p.amount).toFixed(2)}</td>
                      <td className="px-4 py-3">{formatMode(p.payment_mode)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(p.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        {p.status === 'pending' ? (
                          <button
                            type="button"
                            disabled={actionId === p.id}
                            onClick={() => handleApprove(p.id)}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 disabled:opacity-50"
                          >
                            {actionId === p.id ? '…' : 'Mark received'}
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
