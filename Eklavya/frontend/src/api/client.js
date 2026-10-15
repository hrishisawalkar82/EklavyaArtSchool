import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: `${API_URL}/api`,
})

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

const stored = (() => {
  try {
    const raw = localStorage.getItem('eklavya_auth')
    return raw ? JSON.parse(raw).token : null
  } catch {
    return null
  }
})()
if (stored) setAuthToken(stored)

export const getGalleryImages = (count = 12) =>
  api.get(`/images/gallery?count=${count}`)

export const getKidsImages = (count = 12) =>
  api.get(`/images/kids?count=${count}`)

export const submitContact = (data) =>
  api.post('/contact', data)

export const loginAdmin = (data) =>
  api.post('/auth/login/admin', data)

export const loginParent = (data) =>
  api.post('/auth/login/parent', data)

export const registerParent = (data) =>
  api.post('/auth/register/parent', data)

export const fetchMe = () =>
  api.get('/auth/me')

export const createPayment = (data) =>
  api.post('/payments', data)

export const listMyPayments = () =>
  api.get('/payments/mine')

export const listAllPayments = (params = {}) =>
  api.get('/payments', { params })

export const approvePayment = (id) =>
  api.patch(`/payments/${id}/approve`)

// Students & payment dues (admin)
export const listParents = () =>
  api.get('/parents')

export const listStudents = () =>
  api.get('/students')

export const createStudent = (data) =>
  api.post('/students', data)

export const updateStudent = (id, data) =>
  api.patch(`/students/${id}`, data)

export const deleteStudent = (id) =>
  api.delete(`/students/${id}`)

export const listPaymentDues = () =>
  api.get('/payment-dues')

export const createPaymentDue = (data) =>
  api.post('/payment-dues', data)

export const updatePaymentDue = (id, data) =>
  api.patch(`/payment-dues/${id}`, data)

export const deletePaymentDue = (id) =>
  api.delete(`/payment-dues/${id}`)

// Parent view
export const listMyStudents = () =>
  api.get('/students/mine')
