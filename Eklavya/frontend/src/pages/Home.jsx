import { useState, useEffect } from 'react'
import { getGalleryImages } from '../api/client'
import ImageGrid from '../components/ImageGrid'

export default function Home() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getGalleryImages(6)
      .then(res => setImages(res.data.images))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-blue-950 py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-white">Welcome to</span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Eklavya Art School
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8">Nurturing creativity and artistic excellence</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/gallery" className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full font-semibold hover:shadow-2xl hover:shadow-cyan-500/50 transition transform hover:-translate-y-1">
                View Gallery
              </a>
              <a href="/contact" className="px-8 py-4 bg-slate-800 text-white rounded-full font-semibold hover:bg-slate-700 transition transform hover:-translate-y-1">
                Get Started
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Artwork */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">Featured Artwork</h2>
            <p className="text-slate-600 text-lg">Discover amazing creations from our talented artists</p>
          </div>
          <ImageGrid images={images} loading={loading} />
          <div className="text-center mt-12">
            <a href="/gallery" className="inline-block px-8 py-3 border-2 border-slate-900 text-slate-900 rounded-full font-semibold hover:bg-slate-900 hover:text-white transition">
              View All Artwork →
            </a>
          </div>
        </div>
      </section>

      {/* Info Cards */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Instructor Card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Expert Instruction</h3>
              <p className="text-slate-600 leading-relaxed">
                With over 15 years of experience in art education, our instructors bring passion
                and expertise to every class. Specializing in multiple mediums including painting,
                drawing, and sculpture, we help students of all ages discover their artistic potential.
              </p>
            </div>

            {/* About Card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">About Our School</h3>
              <p className="text-slate-600 leading-relaxed">
              Eklavya Arts was founded by Aparna Sawalkar in 2020. It is dedicated to nurturing creativity and artistic expression among young talents. We provide a platform for children and adults to explore and develop their artistic abilities through various programs and exhibitions.

Our annual Kids’ Art Exhibition is a testament to the creativity and talent of our young artists. The showcase features over 150 artworks, highlighting the diverse skills and imaginative expressions of children aged 4 to 15.

In our inaugural exhibition, approximately 20 young artists participated, presenting around 100 drawings and paintings. This event marked the beginning of our journey to inspire and celebrate the artistic endeavors of children in our community.

At Eklavya Arts, we believe in the transformative power of art and are committed to providing opportunities for young artists to express themselves, develop their skills, and share their creations with the world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-950">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">15+</div>
              <div className="text-blue-300">Years Experience</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">500+</div>
              <div className="text-blue-300">Students Taught</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">50+</div>
              <div className="text-blue-300">Art Exhibitions</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">100%</div>
              <div className="text-blue-300">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
