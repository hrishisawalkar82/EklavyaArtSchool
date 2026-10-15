import { useState, useEffect } from 'react'
import { getKidsImages } from '../api/client'
import ImageGrid from '../components/ImageGrid'
import { PageHeader } from '../components/Theme'

export default function Kids() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)

  const loadImages = () => {
    setLoading(true)
    getKidsImages(12)
      .then(res => setImages(res.data.images))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadImages()
  }, [])

  return (
    <div className="min-h-screen bg-paper">
      <PageHeader
        eyebrow="Small hands, big imaginations"
        eyebrowColor="text-paint-marigold"
        title="Kids Corner"
        subtitle="Amazing artwork created by our young artists aged 4 to 15 — every piece framed in pride."
      />

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <p className="text-ink/60">
            Showing <span className="font-semibold text-ink">{images.length}</span> masterpieces
          </p>
          <button
            onClick={loadImages}
            className="px-6 py-3 bg-ink text-paper rounded-full hover:bg-paint-marigold hover:text-ink transition-all duration-300 font-bold flex items-center gap-2 shadow-sm hover:-translate-y-0.5">
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
