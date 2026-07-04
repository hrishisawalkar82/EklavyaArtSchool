import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: `${API_URL}/api`
})

export const getGalleryImages = (count = 12) => 
  api.get(`/images/gallery?count=${count}`)

export const getKidsImages = (count = 12) => 
  api.get(`/images/kids?count=${count}`)

export const submitContact = (data) => 
  api.post('/contact', data)
