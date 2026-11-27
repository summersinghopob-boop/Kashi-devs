import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { PIN_KEY } from './data'

const fmt = (d) => new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })

export default function Admin() {
  const [pin, setPin] = useState('')
  const [data, setData] = useState(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [tab, setTab] = useState('clips')

  async function load(p) {
    setBusy(true); setErr('')
    const { data, error } = await supabase.rpc('admin_dashboard', { p_pin: p })
    setBusy(false)
    if (error) { setData(null); sessionStorage.removeItem(PIN_KEY); return setErr('Wrong PIN. Try again.') }
    sessionStorage.setItem(PIN_KEY, p)
    setData(data)
  }

  useEffect(() => { const p = sessionStorage.getItem(PIN_KEY); if (p) load(p) }, [])

  if (!data) {
    return (
      <div className="grid min-h-screen place-items-center px-5">
        <form onSubmit={(e) => { e.preventDefault(); load(pin) }} className="glass w-full max-w-sm space-y-4 p-7">
          <h1 className="font-display text-2xl font-bold">Admin access</h1>
          <input type="password" className="field" placeholder="Enter admin PIN" value={pin} onChange={(e) => setPin(e.target.value)} autoFocus />
          {err && <p className="text-sm text-red-300">{err}</p>}
          <button className="btn-cyan w-full" disabled={busy || !pin}>{busy ? 'Checking...' : 'Open dashboard'}</button>
        </form>
      </div>
    )
  }

  const tabs = [['clips', `Clips (${data.clips.length})`], ['polls', 'Poll results'], ['inquiries', `Inquiries (${data.inquiries.length})`]]
  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">Kashi Devs admin</h1>
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={() => load(sessionStorage.getItem(PIN_KEY))}>Refresh</button>
          <button className="btn-ghost" onClick={() => { sessionStorage.removeItem(PIN_KEY); setData(null); setPin('') }}>Lock</button>
        </div>
      </div>
      <div className="mt-6 flex gap-2 overflow-x-auto">
        {tabs.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm ${tab === k ? 'bg-cyan text-ink font-semibold' : 'border border-white/10 text-white/70'}`}>{l}</button>
        ))}
      </div>
      <div className="mt-5 space-y-3">
        {tab === 'clips' && (data.clips.length === 0 ? <p className="text-white/50">No clips yet.</p> : data.clips.map((c) => (
          <div key={c.id} className="glass p-4 text-sm">
            <a href={c.video_url} target="_blank" rel="noreferrer" className="break-all text-cyan underline">{c.video_url}</a>
            <p className="mt-2 text-white/70">{c.timestamp_label && <>At {c.timestamp_label}. </>}{c.notes}</p>
            <p className="mt-2 text-xs text-white/40">{c.submitter_name || 'Anonymous'} · {fmt(c.created_at)}</p>
          </div>
        )))}
        {tab === 'polls' && data.polls.map((p) => {
          const total = p.options.reduce((s, o) => s + (o.votes || 0), 0)
          return (
            <div key={p.id} className="glass p-4 text-sm">
              <p className="font-display text-lg font-semibold">{p.question} <span className="text-xs font-normal text-white/40">({total} votes)</span></p>
              <div className="mt-3 space-y-2">
                {p.options.map((o, i) => (
                  <div key={i} className="relative overflow-hidden rounded-lg border border-white/10 px-3 py-2">
                    <span className="absolute inset-y-0 left-0 bg-amber/20" style={{ width: (total ? (o.votes / total) * 100 : 0) + '%' }} />
                    <span className="relative flex justify-between"><span>{o.label}</span><span>{o.votes}</span></span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
        {tab === 'inquiries' && (data.inquiries.length === 0 ? <p className="text-white/50">No inquiries yet.</p> : data.inquiries.map((i) => (
          <div key={i.id} className="glass p-4 text-sm">
            <p className="font-semibold">{i.name} <span className="font-normal text-cyan">{i.contact}</span></p>
            <p className="mt-1 text-xs text-white/50">{i.package}{i.budget && ` · ${i.budget}`} · {fmt(i.created_at)}</p>
            <p className="mt-2 whitespace-pre-wrap text-white/80">{i.message}</p>
          </div>
        )))}
      </div>
    </div>
  )
}
