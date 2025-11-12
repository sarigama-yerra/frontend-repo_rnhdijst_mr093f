import { useEffect, useMemo, useState } from 'react'

function App() {
  const baseUrl = useMemo(() => import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000', [])
  const [loading, setLoading] = useState(true)
  const [plots, setPlots] = useState([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [selectedPlot, setSelectedPlot] = useState(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    preferred_date: '',
    preferred_time: '',
    guests: 1,
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadPlots()
  }, [])

  const loadPlots = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${baseUrl}/api/plots`)
      if (!res.ok) throw new Error(`Failed to load plots (${res.status})`)
      const data = await res.json()
      if (Array.isArray(data) && data.length === 0) {
        setMessage('No plots found. You can load sample plots below.')
      } else {
        setMessage('')
      }
      setPlots(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const seed = async () => {
    setError('')
    setMessage('')
    try {
      const res = await fetch(`${baseUrl}/api/seed`, { method: 'POST' })
      if (!res.ok) throw new Error('Seeding failed')
      await loadPlots()
      setMessage('Loaded sample plots')
    } catch (e) {
      setError(e.message)
    }
  }

  const openForm = (plot) => {
    setSelectedPlot(plot)
    setForm({
      name: '',
      email: '',
      phone: '',
      preferred_date: '',
      preferred_time: '',
      guests: 1,
      notes: ''
    })
  }

  const submitRequest = async (e) => {
    e.preventDefault()
    if (!selectedPlot) return
    setSubmitting(true)
    setError('')
    setMessage('')
    try {
      const payload = {
        plot_id: selectedPlot.id,
        ...form,
      }
      const res = await fetch(`${baseUrl}/api/visit-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'Failed to create visit request')
      }
      setMessage('Your visit request has been submitted! We will contact you shortly.')
      setSelectedPlot(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-500 text-white grid place-items-center font-bold">P</div>
            <span className="text-xl font-semibold text-gray-800">Plot Visits</span>
          </div>
          <a href="/test" className="text-sm text-gray-600 hover:text-gray-900">System Check</a>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Visit your future plot with ease
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Browse available plots, explore details, and book an on-site visit in just a few clicks.
            </p>
            <div className="mt-6 flex gap-3">
              <a href="#plots" className="px-5 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">Explore Plots</a>
              <button onClick={loadPlots} className="px-5 py-3 bg-white text-gray-800 rounded-lg border hover:bg-gray-50 transition">Refresh</button>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-xl">
              <img src="https://images.unsplash.com/photo-1629460455571-c943339c4f23?ixid=M3w3OTkxMTl8MHwxfHNlYXJjaHwxfHxHcmVlbiUyMHBsb3R8ZW58MHwwfHx8MTc2MjkzOTg2Nnww&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80" alt="Green plot" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Alerts */}
      <div className="max-w-6xl mx-auto px-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-800 p-4">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 p-4">
            {message}
          </div>
        )}
      </div>

      {/* Plots */}
      <section id="plots" className="max-w-6xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Available Plots</h2>
          {plots.length === 0 && (
            <button onClick={seed} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Load Sample Plots</button>
          )}
        </div>

        {loading ? (
          <div className="text-gray-600">Loading plots...</div>
        ) : plots.length === 0 ? (
          <div className="text-gray-600">No plots found.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {plots.map((plot) => (
              <div key={plot.id} className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden flex flex-col">
                <div className="relative h-40">
                  <img src={plot.image_url || 'https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?q=80&w=1200&auto=format&fit=crop'} alt={plot.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-900">{plot.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{plot.location}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-700">
                    <div className="bg-gray-50 rounded p-2">
                      <span className="block text-xs text-gray-500">Size</span>
                      <span className="font-medium">{plot.size_sqft?.toLocaleString()} sqft</span>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <span className="block text-xs text-gray-500">Price/sqft</span>
                      <span className="font-medium">${plot.price_per_sqft}</span>
                    </div>
                  </div>
                  {plot.description && (
                    <p className="text-sm text-gray-600 mt-3 line-clamp-2">{plot.description}</p>
                  )}
                  <div className="mt-4">
                    <button onClick={() => openForm(plot)} className="w-full px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition">Book a Visit</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal Form */}
      {selectedPlot && (
        <div className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
            <div className="p-5 border-b">
              <h3 className="text-xl font-semibold">Book a Visit - {selectedPlot.title}</h3>
              <p className="text-sm text-gray-600">{selectedPlot.location}</p>
            </div>
            <form onSubmit={submitRequest} className="p-5 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Full Name</label>
                  <input required value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} className="w-full rounded-md border-gray-300 focus:ring-emerald-500 focus:border-emerald-500" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} className="w-full rounded-md border-gray-300 focus:ring-emerald-500 focus:border-emerald-500" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Phone</label>
                  <input required value={form.phone} onChange={(e)=>setForm({...form, phone:e.target.value})} className="w-full rounded-md border-gray-300 focus:ring-emerald-500 focus:border-emerald-500" placeholder="(555) 123-4567" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Guests</label>
                  <input type="number" min={1} max={10} value={form.guests} onChange={(e)=>setForm({...form, guests:Number(e.target.value)})} className="w-full rounded-md border-gray-300 focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Preferred Date</label>
                  <input type="date" required value={form.preferred_date} onChange={(e)=>setForm({...form, preferred_date:e.target.value})} className="w-full rounded-md border-gray-300 focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Preferred Time</label>
                  <input type="time" required value={form.preferred_time} onChange={(e)=>setForm({...form, preferred_time:e.target.value})} className="w-full rounded-md border-gray-300 focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Notes</label>
                <textarea value={form.notes} onChange={(e)=>setForm({...form, notes:e.target.value})} className="w-full rounded-md border-gray-300 focus:ring-emerald-500 focus:border-emerald-500" rows={3} placeholder="Anything we should know?" />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={()=>setSelectedPlot(null)} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200">Cancel</button>
                <button disabled={submitting} type="submit" className="px-5 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60">
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-600">
        <div className="max-w-6xl mx-auto px-6">
          © {new Date().getFullYear()} Plot Visits. Book tours with confidence.
        </div>
      </footer>
    </div>
  )
}

export default App
