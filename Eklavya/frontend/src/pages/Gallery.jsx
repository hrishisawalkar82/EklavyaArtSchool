import { useState, useEffect } from 'react'
import { getGalleryImages } from '../api/client'
import ImageGrid from '../components/ImageGrid'

export default function Gallery() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)

  const loadImages = () => {
    setLoading(true)
    getGalleryImages(12)
      .then(res => setImages(res.data.images))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadImages()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-blue-950 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Art Gallery</h1>
          <p className="text-blue-200 text-lg">Explore our collection of beautiful artwork</p>
        </div>
      </div>

      {/* Gallery Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-slate-600">
              Showing <span className="font-semibold text-slate-900">{images.length}</span> artworks
            </p>
          </div>
          <button 
            onClick={loadImages}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full hover:shadow-lg hover:shadow-cyan-500/50 transition transform hover:-translate-y-0.5 font-medium flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Load More
          </button>
        </div>
        
        <ImageGrid images={images} loading={loading} />
      </div>
    </div>
  )
}
