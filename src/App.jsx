import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase'
import { LINKS, REELS } from './data'

function Toast({ toast }) {
  if (!toast) return null
  const ok = toast.type === 'ok'
  return (
    <div role="status" className={`fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl border px-5 py-3 text-sm font-medium backdrop-blur-md ${ok ? 'border-cyan/50 bg-cyan/10 text-cyan shadow-cyan' : 'border-red-400/50 bg-red-500/10 text-red-300'}`}>
      {toast.msg}
    </div>
  )
}

function useToast() {
  const [toast, setToast] = useState(null)
  const show = useCallback((msg, type = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])
  return [toast, show]
}

function Hero() {
  return (
    <header className="relative overflow-hidden px-5 pb-20 pt-6 sm:px-8">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-cyan/20 blur-[140px]" />
      <div className="pointer-events-none absolute right-0 top-40 h-72 w-72 rounded-full bg-amber/10 blur-[120px]" />
      <nav className="relative mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan font-display text-lg font-bold text-ink shadow-cyan">K</div>
          <span className="font-display text-lg font-bold tracking-wide">Kashi Devs</span>
        </div>
        <span className="glass flex items-center gap-2 px-3 py-1.5 text-xs text-white/80">
          <span className="live-dot h-2 w-2 rounded-full bg-amber" /> Taking new creator projects
        </span>
      </nav>
      <div className="relative mx-auto mt-20 max-w-4xl sm:mt-28">
        <h1 className="font-display text-4xl font-bold leading-[1.05] sm:text-6xl">
          Custom Streamer Web Apps &amp; Viral Shorts for Indian Creators
        </h1>
        <p className="mt-6 max-w-xl text-base text-white/65 sm:text-lg">
          Your own Creator HQ with clip submissions and live polls, plus scroll-stopping CapCut edits for BGMI, Valorant, GTA RP and more.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <a href="#pricing" className="btn-cyan shadow-cyan">Launch Your Creator HQ</a>
          <a href="#demo" className="btn-ghost">Try the live demo</a>
        </div>
        <div className="mt-10 flex flex-wrap gap-2">
          {[['Instagram', LINKS.instagram], ['Discord', LINKS.discord], ['YouTube', LINKS.youtube], ['WhatsApp / UPI inquiry', LINKS.whatsapp]].map(([n, h]) => (
            <a key={n} href={h} target="_blank" rel="noreferrer" className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:border-cyan hover:text-cyan">{n}</a>
          ))}
        </div>
      </div>
    </header>
  )
}

function Reels() {
  const [active, setActive] = useState(null)
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8" id="reels">
      <h2 className="font-display text-3xl font-bold">Reels we have edited</h2>
      <p className="mt-2 text-white/60">Tap a reel to play it.</p>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {REELS.map((r) => (
          <div key={r.id} className="glass group overflow-hidden transition hover:border-cyan/50 hover:shadow-cyan">
            <div className="relative aspect-[9/16] bg-black">
              {active === r.id ? (
                <iframe className="absolute inset-0 h-full w-full" src={`https://youtube.com{r.id}?autoplay=1&rel=0&playsinline=1`} title={r.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
              ) : (
                <button onClick={() => setActive(r.id)} className="absolute inset-0 h-full w-full" aria-label={`Play ${r.title}`}>
                  <img src={`https://ytimg.com{r.id}/hqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover opacity-80 transition group-hover:opacity-100" />
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="grid h-14 w-14 place-items-center rounded-full bg-cyan text-ink shadow-cyan">▶</span>
                  </span>
                </button>
              )}
            </div>
            <p className="px-3 py-2 text-sm text-white/80">{r.title}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function ClipForm({ notify }) {
  const [f, setF] = useState({ video_url: '', timestamp_label: '', notes: '', submitter_name: '' })
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    if (!/^https?:\/\/\S+$/i.test(f.video_url.trim())) return notify('Enter a full video link starting with https://', 'err')
    setBusy(true)
    const { error } = await supabase.from('clip_submissions').insert({
      video_url: f.video_url.trim(),
      timestamp_label: f.timestamp_label.trim() || null,
      notes: f.notes.trim() || null,
      submitter_name: f.submitter_name.trim() || null
    })
    setBusy(false)
    if (error) return notify('Could not send your clip. Please try again.', 'err')
    setF({ video_url: '', timestamp_label: '', notes: '', submitter_name: '' })
    notify('Clip sent! The streamer will review it.')
  }

  return (
    <form onSubmit={submit} className="glass space-y-3 p-6">
      <h3 className="font-display text-xl font-semibold">Submit a clip</h3>
      <p className="text-sm text-white/55">Paste a stream or Google Drive link and tell us where the moment happens.</p>
      <input className="field" placeholder="Video or Drive link (https://...)" value={f.video_url} onChange={set('video_url')} required maxLength={500} />
      <div className="grid grid-cols-2 gap-3">
        <input className="field" placeholder="Timestamp (e.g. 1:23:45)" value={f.timestamp_label} onChange={set('timestamp_label')} maxLength={40} />
        <input className="field" placeholder="Your name (optional)" value={f.submitter_name} onChange={set('submitter_name')} maxLength={80} />
      </div>
      <textarea className="field min-h-[90px]" placeholder="Notes: what happens in this clip?" value={f.notes} onChange={set('notes')} maxLength={1000} />
      <button className="btn-cyan w-full" disabled={busy}>{busy ? 'Sending...' : 'Send clip'}</button>
    </form>
  )
}

function Poll({ notify }) {
  const [poll, setPoll] = useState(null)
  const [voted, setVoted] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data } = await supabase.from('polls').select('*').eq('is_active', true).order('created_at', { ascending: true }).limit(1).maybeSingle()
    if (data) { setPoll(data); setVoted(localStorage.getItem('kd_voted_' + data.id)) }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const t = setInterval(load, 8000)
    return () => clearInterval(t)
  }, [load])

  async function vote(i) {
    if (voted !== null) return
    const { data, error } = await supabase.rpc('cast_vote', { p_poll_id: poll.id, p_option_index: i })
    if (error) return notify('Vote failed. Please try again.', 'err')
    try { localStorage.setItem('kd_voted_' + poll.id, String(i)) } catch {}
    setVoted(String(i))
    setPoll({ ...poll, options: data })
    notify('Vote counted!')
  }

  if (loading) return <div className="glass p-6 text-white/60">Loading poll...</div>
  if (!poll) return <div className="glass p-6 text-white/60">No active poll right now.</div>
  const total = poll.options.reduce((s, o) => s + (o.votes || 0), 0) || 1

  return (
    <div className="glass space-y-3 p-6">
      <h3 className="font-display text-xl font-semibold">{poll.question}</h3>
      <p className="text-sm text-white/55">{voted !== null ? 'Thanks for voting. Results update live.' : 'Pick one to see the results.'}</p>
      {poll.options.map((o, i) => {
        const pct = Math.round(((o.votes || 0) / total) * 100)
        const mine = voted === String(i)
        return (
          <button key={i} onClick={() => vote(i)} disabled={voted !== null}
            className={`relative w-full overflow-hidden rounded-xl border px-4 py-3 text-left text-sm transition ${mine ? 'border-amber shadow-amber' : 'border-white/10 hover:border-cyan'}`}>
            <span className="absolute inset-y-0 left-0 bg-cyan/15 transition-all duration-700" style={{ width: voted !== null ? pct + '%' : '0%' }} />
            <span className="relative flex justify-between">
              <span className="font-medium">{o.label}</span>
              {voted !== null && <span className="text-white/70">{pct}% · {o.votes}</span>}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function Demo({ notify }) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8" id="demo">
      <h2 className="font-display text-3xl font-bold">Test your Creator HQ</h2>
      <p className="mt-2 max-w-xl text-white/60">This is a working demo. Everything you send is saved to a real database, just like your fans' clips and votes would be.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <ClipForm notify={notify} />
        <Poll notify={notify} />
      </div>
    </section>
  )
}

function Pricing({ notify }) {
  const [f, setF] = useState({ name: '', contact: '', budget: '', message: '' })
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    const { error } = await supabase.from('sponsor_inquiries').insert({
      name: f.name.trim(), contact: f.contact.trim(), package: 'Starter Bundle',
      budget: f.budget || null, message: f.message.trim()
    })
    setBusy(false)
    if (error) return notify('Could not send your inquiry. Please try again.', 'err')
       setF({ name: '', contact: '', budget: '', message: '' })
    notify('Inquiry sent! We will reply within 24 hours.')
  }

  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8" id="pricing">
      <h2 className="font-display text-3xl font-bold">Start with one bundle</h2>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="relative rounded-2xl border border-amber/60 bg-white/[0.04] p-7 shadow-amber backdrop-blur-md">
          <h3 className="font-display text-xl font-semibold">Starter Bundle</h3>
          <p className="mt-3 font-display text-5xl font-bold text-amber">₹2,999</p>
          <p className="mt-1 text-sm text-white/55">One-time. UPI accepted.</p>
          <ul className="mt-6 space-y-3 text-sm text-white/80">
            {['Custom creator web app with your branding', 'Clip submission form and live fan polls', '5 viral CapCut Reels / Shorts', 'Deployed on your own link, mobile-first', 'Delivery in 7 days'].map((t) => (
              <li key={t} className="flex gap-3"><span className="text-cyan">✓</span>{t}</li>
            ))}
          </ul>
          <a href={LINKS.whatsapp} target="_blank" rel="noreferrer" className="btn-ghost mt-8 w-full">Chat on WhatsApp</a>
        </div>
        <form onSubmit={submit} className="glass space-y-3 p-7">
          <h3 className="font-display text-xl font-semibold">Project inquiry</h3>
          <input className="field" placeholder="Your name or channel" value={f.name} onChange={set('name')} required maxLength={100} />
          <input className="field" placeholder="WhatsApp number, Discord or email" value={f.contact} onChange={set('contact')} required minLength={3} maxLength={150} />
          <select className="field" value={f.budget} onChange={set('budget')}>
            <option value="">Budget (optional)</option>
            <option>Under ₹3,000</option><option>₹3,000 – ₹10,000</option><option>₹10,000+</option>
          </select>
          <textarea className="field min-h-[110px]" placeholder="Tell us about your channel and what you want built" value={f.message} onChange={set('message')} required maxLength={2000} />
          <button className="btn-cyan w-full" disabled={busy}>{busy ? 'Sending...' : 'Send inquiry'}</button>
        </form>
      </div>
    </section>
  )
}

export default function App() {
  const [toast, notify] = useToast()
  return (
    <div className="min-h-screen">
      <Hero />
      <Reels />
      <Demo notify={notify} />
      <Pricing notify={notify} />
      <footer className="border-t border-white/10 px-5 py-8 text-center text-sm text-white/45">
        © {new Date().getFullYear()} Kashi Devs. Built for Indian creators.
      </footer>
      <Toast toast={toast} />
    </div>
  )
}
  
