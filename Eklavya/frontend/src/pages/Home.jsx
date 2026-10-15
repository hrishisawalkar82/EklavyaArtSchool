import { useState, useEffect } from 'react'
import { getGalleryImages } from '../api/client'
import ImageGrid from '../components/ImageGrid'
import { PALETTE, Blob, BrushStroke, WaveDivider } from '../components/Theme'

const PROGRAMS = [
  {
    title: 'Drawing & Sketching',
    text: 'Pencil, charcoal and ink fundamentals — shapes, shading, perspective and observational drawing.',
    color: '#7B61FF',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.5l4 4L7 21H3v-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    title: 'Painting Studio',
    text: 'Watercolor, acrylic and mixed media. Colour theory, composition and finding your own style.',
    color: '#FF6B6B',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3a9 9 0 00-9 9c0 1.6.5 3 1.4 4.2.5.7.6 1.5.3 2.3l-.6 1.7c-.2.5.3 1 .8.8l1.7-.6c.8-.3 1.6-.2 2.3.3A8.96 8.96 0 0012 21a9 9 0 000-18zm-3 9h.01M12 8h.01M15 12h.01"
        />
      </svg>
    ),
  },
  {
    title: "Kids' Art Corner",
    text: 'Playful, confidence-building classes for ages 4–15 — messy hands, big imaginations, proud smiles.',
    color: '#F7B32B',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21a9 9 0 100-18 9 9 0 000 18zM8.5 10.5h.01M15.5 10.5h.01M8.5 14.5c1 1.2 2.1 1.8 3.5 1.8s2.5-.6 3.5-1.8"
        />
      </svg>
    ),
  },
  {
    title: 'Crafts & Sculpture',
    text: 'Clay, papier-mâché and 3D projects that turn ideas into things you can hold and take home.',
    color: '#2EC4B6',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zM12 12l8-4.5M12 12v9M12 12L4 7.5"
        />
      </svg>
    ),
  },
]

const STATS = [
  { value: '15+', label: 'Years of teaching', color: '#F7B32B' },
  { value: '500+', label: 'Students taught', color: '#FF6B6B' },
  { value: '50+', label: 'Art exhibitions', color: '#2EC4B6' },
  { value: '100%', label: 'Happy families', color: '#A78BFA' },
]

export default function Home() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getGalleryImages(6)
      .then((res) => setImages(res.data.images))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="bg-paper font-sans text-ink">
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-paper pt-14 pb-24 md:pt-20 md:pb-32">
        <Blob color="#FF6B6B" className="top-[-6rem] left-[-4rem] w-[26rem] h-[26rem]" />
        <Blob color="#F7B32B" className="top-10 right-[-6rem] w-[30rem] h-[30rem]" />
        <Blob color="#7B61FF" className="bottom-[-8rem] left-1/3 w-[24rem] h-[24rem]" />

        {/* floating palette dots */}
        <div className="hidden md:flex absolute top-24 left-10 flex-col gap-3" aria-hidden="true">
          {PALETTE.map((c) => (
            <span
              key={c}
              className="w-4 h-4 rounded-full shadow-md animate-bounce"
              style={{ backgroundColor: c, animationDelay: `${PALETTE.indexOf(c) * 0.15}s` }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <p className="font-hand text-3xl md:text-4xl text-paint-coral mb-2 -rotate-2">
              Welcome to the studio of
            </p>

            <h1 className="font-display font-black text-5xl md:text-7xl lg:text-8xl leading-[1.05] text-ink">
              Eklavya{' '}
              <span className="relative inline-block">
                <span className="relative z-10">Art School</span>
                <BrushStroke className="absolute -bottom-3 left-0 w-full h-6 md:h-7 text-paint-teal/80" />
              </span>
            </h1>

            <p className="mt-8 text-lg md:text-xl text-ink/70 max-w-2xl mx-auto leading-relaxed">
              Drawing, painting and craft classes where every child (and adult!) learns to see the
              world like an artist — one brushstroke at a time.
            </p>

            {/* paint palette row */}
            <div className="flex justify-center gap-2 mt-8" aria-hidden="true">
              {PALETTE.map((c) => (
                <span key={c} className="w-7 h-7 rounded-full ring-4 ring-white shadow-md" style={{ backgroundColor: c }} />
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-10">
              <a
                href="/contact"
                className="px-8 py-4 bg-ink text-paper rounded-full font-bold tracking-wide hover:bg-paint-coral transition-all duration-300 shadow-lg hover:shadow-paint-coral/40 hover:-translate-y-1"
              >
                Book a Trial Class
              </a>
              <a
                href="/gallery"
                className="px-8 py-4 bg-white text-ink rounded-full font-bold tracking-wide border-2 border-ink/10 hover:border-ink transition-all duration-300 hover:-translate-y-1 shadow-sm"
              >
                View the Gallery →
              </a>
            </div>
          </div>
        </div>

        {/* brush tape strip */}
        <div className="absolute bottom-0 left-0 right-0 h-2 flex" aria-hidden="true">
          {PALETTE.map((c) => (
            <span key={c} className="flex-1" style={{ backgroundColor: c }} />
          ))}
        </div>
      </section>

      {/* ============ PROGRAMS ============ */}
      <section className="py-20 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="font-hand text-2xl text-paint-violet">What we teach</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-ink mt-1">
              Classes for every kind of artist
            </h2>
            <BrushStroke className="w-32 h-4 text-paint-marigold mx-auto mt-4" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {PROGRAMS.map((p) => (
              <article
                key={p.title}
                className="group bg-paper rounded-3xl p-7 border border-ink/5 shadow-sm hover:-translate-y-2 hover:shadow-xl transition-all duration-300"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-white shadow-md group-hover:rotate-6 transition-transform"
                  style={{ backgroundColor: p.color }}
                >
                  {p.icon}
                </div>
                <h3 className="font-display text-xl font-bold text-ink mb-2">{p.title}</h3>
                <p className="text-ink/65 text-sm leading-relaxed">{p.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURED ARTWORK ============ */}
      <section className="py-20 md:py-24 bg-paper">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="font-hand text-2xl text-paint-rose">Fresh from the easel</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-ink mt-1">Featured Artwork</h2>
            <BrushStroke className="w-32 h-4 text-paint-coral mx-auto mt-4" />
          </div>
          <ImageGrid images={images} loading={loading} />
          <div className="text-center mt-12">
            <a
              href="/gallery"
              className="inline-block px-8 py-3.5 bg-white border-2 border-ink/10 text-ink rounded-full font-bold hover:bg-ink hover:text-paper transition-all duration-300 shadow-sm"
            >
              See all artwork →
            </a>
          </div>
        </div>
      </section>

      {/* ============ ABOUT / INSTRUCTOR ============ */}
      <section className="py-20 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="font-hand text-2xl text-paint-teal">Our story</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-ink mt-1">
              Founded by an artist, run with heart
            </h2>
            <BrushStroke className="w-32 h-4 text-paint-violet mx-auto mt-4" />
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="relative bg-paper rounded-[2rem] p-8 md:p-10 shadow-sm border border-ink/5 overflow-hidden">
              <span className="absolute top-6 right-6 w-10 h-10 rounded-full bg-paint-marigold/20" aria-hidden="true" />
              <div className="w-14 h-14 rounded-2xl bg-paint-coral text-white flex items-center justify-center shadow-md mb-6">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.5l4 4L7 21H3v-4L16.5 3.5z" />
                </svg>
              </div>
              <h3 className="font-display text-2xl font-bold text-ink mb-4">Expert Instruction</h3>
              <p className="text-ink/70 leading-relaxed">
                With over 15 years of experience in art education, our instructors bring passion and
                expertise to every class. Specializing in multiple mediums including painting,
                drawing, and sculpture, we help students of all ages discover their artistic
                potential.
              </p>
            </div>

            <div className="relative bg-paper rounded-[2rem] p-8 md:p-10 shadow-sm border border-ink/5 overflow-hidden">
              <span className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-paint-teal/15" aria-hidden="true" />
              <div className="w-14 h-14 rounded-2xl bg-paint-violet text-white flex items-center justify-center shadow-md mb-6">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="font-display text-2xl font-bold text-ink mb-4">About Our School</h3>
              <div className="text-ink/70 leading-relaxed space-y-4">
                <p>
                  Eklavya Arts was founded by Aparna Sawalkar in 2020. It is dedicated to nurturing
                  creativity and artistic expression among young talents. We provide a platform for
                  children and adults to explore and develop their artistic abilities through various
                  programs and exhibitions.
                </p>
                <p>
                  Our annual Kids' Art Exhibition is a testament to the creativity and talent of our
                  young artists — over 150 artworks by children aged 4 to 15. In our inaugural
                  exhibition, approximately 20 young artists presented around 100 drawings and
                  paintings.
                </p>
                <p>
                  At Eklavya Arts, we believe in the transformative power of art and are committed to
                  giving young artists the space to express themselves and share their creations with
                  the world.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <WaveDivider from="#ffffff" to="#22262F" />
      <section className="bg-ink py-14 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
            {STATS.map((s) => (
              <div key={s.label}>
                <div
                  className="font-display text-4xl md:text-5xl font-black mb-2"
                  style={{ color: s.color }}
                >
                  {s.value}
                </div>
                <div className="text-slate-300 text-sm md:text-base">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="bg-ink pb-20 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="relative max-w-4xl mx-auto rounded-[2.5rem] bg-gradient-to-br from-paint-coral via-paint-rose to-paint-violet p-10 md:p-14 text-center overflow-hidden shadow-2xl">
            <div
              className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/15 blur-2xl"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-20 -left-10 w-64 h-64 rounded-full bg-white/10 blur-2xl"
              aria-hidden="true"
            />
            <p className="font-hand text-3xl text-white/90 mb-2">Grab your brushes —</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-6">
              Start your artistic journey today
            </h2>
            <p className="text-white/85 max-w-xl mx-auto mb-8">
              Book a trial class, meet the instructors, and see why hundreds of families choose
              Eklavya Art School every year.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/contact"
                className="px-8 py-4 bg-white text-ink rounded-full font-bold hover:shadow-2xl transition transform hover:-translate-y-1"
              >
                Book a Trial Class
              </a>
              <a
                href="/kids"
                className="px-8 py-4 bg-white/15 text-white border-2 border-white/40 rounded-full font-bold hover:bg-white/25 transition transform hover:-translate-y-1"
              >
                Explore Kids' Corner
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}