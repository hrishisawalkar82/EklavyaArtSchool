export default function ImageGrid({ images, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-ink/5 rounded-3xl h-64"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!images.length) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-white rounded-2xl border border-ink/5 shadow-sm flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-paint-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="font-display text-ink text-lg font-bold">No images available yet</p>
        <p className="text-ink/50 text-sm mt-2">Check back soon for amazing artwork!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {images.map((img, idx) => (
        <div key={idx} className="group relative overflow-hidden rounded-3xl bg-ink/5 border border-ink/5 shadow-sm hover:shadow-xl transition-shadow duration-300">
          <div className="aspect-square overflow-hidden">
            <img
              src={img.url}
              alt={img.name}
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-paper text-sm font-bold truncate">{img.name}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
