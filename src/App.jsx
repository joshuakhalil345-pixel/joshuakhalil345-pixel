import React, { useEffect, useState, useRef } from 'react'

const rand = (a,b) => Math.random()*(b-a)+a

// Tunable constants
const HEART_INTERVAL = 320           // ms between spawn attempts
const HEART_LIFETIME = 9000         // ms before removal
const RING_PROB = 0.26              // probability per spawn to create a ring
const STAR_COUNT = 110

function Heart({h}){
  // render an inline SVG heart for consistent shape
  const style = {
    left: `${h.left}%`,
    width: `${h.size}px`,
    height: `${h.size}px`,
    animationDuration: `${h.duration}s`,
    opacity: h.opacity,
    transform: `rotate(${h.rotate}deg)`
  }
  return (
    <div className="heart-svg" style={style}>
      <svg viewBox="0 0 32 29" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={`g${h.id}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#ffd6e6" />
            <stop offset="100%" stopColor="#ff6ea6" />
          </linearGradient>
        </defs>
        <path d="M23.6 2c-2.5 0-4.6 1.6-5.6 3.2C16 3.6 13.9 2 11.4 2 7 2 4 5 4 9.3c0 8.2 12.6 14.6 12.6 14.6S29.2 17.5 29.2 9.3C29.2 5 26.2 2 23.6 2z" fill={`url(#g${h.id})`} />
      </svg>
    </div>
  )
}

function Ring({r}){
  return (
    <div className="ring" style={{left:`${r.left}%`, bottom:`${r.bottom}%`, animationDuration:`${r.duration}s`, transform:`scale(${r.scale})`}}>
      <svg viewBox="0 0 32 29" width="28" height="28" style={{display:'block'}}>
        <path d="M23.6 2c-2.5 0-4.6 1.6-5.6 3.2C16 3.6 13.9 2 11.4 2 7 2 4 5 4 9.3c0 8.2 12.6 14.6 12.6 14.6S29.2 17.5 29.2 9.3C29.2 5 26.2 2 23.6 2z" fill="#ff9acb" />
      </svg>
    </div>
  )
}

function BloomSVG(){
  // SVG-based petals for crisper shapes and nicer gradients
  return (
    <svg className="bloom-svg" viewBox="0 0 200 180" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="petalGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#ffd6e6" stopOpacity="1" />
          <stop offset="100%" stopColor="#ff6ea6" stopOpacity="1" />
        </linearGradient>
        <radialGradient id="centerGrad" cx="35%" cy="35%">
          <stop offset="0%" stopColor="#fff2b8" />
          <stop offset="60%" stopColor="#ffd77a" />
          <stop offset="100%" stopColor="#ffc65a" />
        </radialGradient>
      </defs>

      <g className="petals" transform="translate(100,92)">
        <ellipse className="svg-p" cx="-36" cy="-12" rx="28" ry="42" fill="url(#petalGrad)" transform="rotate(-18)" />
        <ellipse className="svg-p" cx="36" cy="-12" rx="28" ry="42" fill="url(#petalGrad)" transform="rotate(18)" />
        <ellipse className="svg-p" cx="0" cy="-36" rx="34" ry="44" fill="url(#petalGrad)" transform="rotate(0)" />
        <ellipse className="svg-p" cx="0" cy="10" rx="36" ry="40" fill="url(#petalGrad)" transform="rotate(0)" />
        <circle cx="0" cy="-2" r="18" fill="url(#centerGrad)" className="svg-center" />
      </g>
    </svg>
  )
}

function Flower({left=50, scale=1, delay=0, grow=false}){
  return (
    <div className={"flower" + (grow? ' grown':'')} style={{left:`${left}%`, transform:`scale(${scale})`, animationDelay:`${delay}s`}}>
      <div className="foliage">
        <div className="leaf big l1" />
        <div className="leaf big l2" />
        <div className="leaf med l3" />
        <div className="leaf med l4" />
        <div className="leaf sm l5" />
      </div>
      <div className="stem" />
      <div className="bloom">
        <BloomSVG />
      </div>
    </div>
  )
}

export default function App(){
  const [hearts, setHearts] = useState([])
  const [rings, setRings] = useState([])
  const [accepted, setAccepted] = useState(false)
  const [rejected, setRejected] = useState(false)
  const [typed, setTyped] = useState('')
  const [flowers, setFlowers] = useState([
    {left:28, scale:1.02, delay:0},
    {left:44, scale:1.15, delay:0.35},
    {left:60, scale:0.94, delay:-0.16},
    {left:74, scale:0.88, delay:0.22}
  ])
  const idRef = useRef(1)
  const fullText = 'Roses are pink and stars softly gleam — my heart blooms brighter because of you. Will you hold it forever?'
  const [isPhone, setIsPhone] = useState(typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width:420px)').matches)

  // background music nodes for React app
  const musicRef = useRef(null)
  const audioRef = useRef(null)
  const [muted, setMuted] = useState(false)
  useEffect(()=>{
    try{
      audioRef.current = new Audio('videos/ariana-grande-tattooed-heart-live-from-london.mp3')
      audioRef.current.loop = true
      audioRef.current.volume = 0.45
    }catch(e){ audioRef.current = null }
    return ()=>{ if(audioRef.current){ try{ audioRef.current.pause(); audioRef.current = null }catch(e){} } }
  }, [])
  function startMusic(){
    if(musicRef.current) return
    try{
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const master = ctx.createGain(); master.gain.setValueAtTime(0.0001, ctx.currentTime)
      master.connect(ctx.destination)
      const oscA = ctx.createOscillator(); oscA.type='sine'; oscA.frequency.setValueAtTime(220, ctx.currentTime)
      const oscB = ctx.createOscillator(); oscB.type='sine'; oscB.frequency.setValueAtTime(277.18, ctx.currentTime)
      const gA = ctx.createGain(); gA.gain.setValueAtTime(0.12, ctx.currentTime)
      const gB = ctx.createGain(); gB.gain.setValueAtTime(0.09, ctx.currentTime)
      const filter = ctx.createBiquadFilter(); filter.type='lowpass'; filter.frequency.setValueAtTime(1200, ctx.currentTime)
      oscA.connect(gA); oscB.connect(gB); gA.connect(filter); gB.connect(filter); filter.connect(master)
      oscA.start(); oscB.start();
      if(muted) master.gain.setValueAtTime(0.0001, ctx.currentTime)
      else master.gain.exponentialRampToValueAtTime(0.55, ctx.currentTime+0.6)
      function playBell(){ const o = ctx.createOscillator(); o.type='triangle'; const gg = ctx.createGain(); const freqs=[440,554.37,659.25]; o.frequency.setValueAtTime(freqs[Math.floor(Math.random()*freqs.length)], ctx.currentTime); gg.gain.setValueAtTime(0, ctx.currentTime); gg.gain.linearRampToValueAtTime(0.12, ctx.currentTime+0.01); gg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+1.1); o.connect(gg); gg.connect(master); o.start(); setTimeout(()=>{ try{o.stop()}catch(e){} },1200) }
      const bellIv = setInterval(playBell, 1600 + Math.random()*600)
      musicRef.current = {ctx, master, oscA, oscB, gA, gB, filter, bellIv}
    }catch(e){}
  }
  function stopMusic(){ if(!musicRef.current) return; try{ musicRef.current.master.gain.exponentialRampToValueAtTime(0.0001, musicRef.current.ctx.currentTime+0.6) }catch(e){}; setTimeout(()=>{ try{ musicRef.current.oscA.stop(); musicRef.current.oscB.stop(); clearInterval(musicRef.current.bellIv); musicRef.current.ctx.close() }catch(e){}; musicRef.current=null },900) }

  // reflect muted state to audio endpoints
  useEffect(()=>{
    try{ if(audioRef.current) audioRef.current.muted = muted }catch(e){}
    try{ if(musicRef.current && musicRef.current.master){ musicRef.current.master.gain.exponentialRampToValueAtTime(muted?0.0001:0.55, musicRef.current.ctx.currentTime+0.2) } }catch(e){}
  },[muted])

  // update `isPhone` on viewport changes so spawn logic adapts without reload
  useEffect(()=>{
    if(typeof window === 'undefined' || !window.matchMedia) return
    const mql = window.matchMedia('(max-width:420px)')
    const handler = (e)=> setIsPhone(!!e.matches)
    if(typeof mql.addEventListener === 'function') mql.addEventListener('change', handler)
    else if(typeof mql.addListener === 'function') mql.addListener(handler)
    return ()=>{ if(typeof mql.removeEventListener === 'function') mql.removeEventListener('change', handler); else if(typeof mql.removeListener === 'function') mql.removeListener(handler) }
  },[])

  useEffect(()=>{
    const FLOWER_POSITIONS = isPhone ? [32,44,56,68] : [28,44,60,74]
    const iv = setInterval(()=>{
      const id = idRef.current++
      // pick a flower base and add a small random offset so hearts cluster around blooms
      const base = FLOWER_POSITIONS[Math.floor(Math.random()*FLOWER_POSITIONS.length)]
      const vw = typeof window !== 'undefined' ? (window.innerWidth || document.documentElement.clientWidth) : 1200
      const device = vw <= 420 ? 'phone' : (vw <= 900 ? 'tablet' : 'desktop')
      const offsetRange = device === 'phone' ? 3 : (device === 'tablet' ? 4 : 5)
      let left = base + rand(-offsetRange, offsetRange)
      // compute dynamic clamp band from flower positions
      const minFlower = Math.min.apply(null, FLOWER_POSITIONS)
      const maxFlower = Math.max.apply(null, FLOWER_POSITIONS)
      const margin = device === 'phone' ? 2 : (device === 'tablet' ? 3 : 4)
      const clampMin = Math.max(20, minFlower - margin)
      const clampMax = Math.min(80, maxFlower + margin)
      left = Math.max(clampMin, Math.min(clampMax, left))
      const h = { id, left, size: rand(10,28), duration: rand(3.5,6.5), opacity: rand(0.6,1), rotate: rand(-30,30) }
      setHearts(s => [...s, h])
      setTimeout(()=> setHearts(s => s.filter(x=>x.id!==h.id)), HEART_LIFETIME)

      if(Math.random() < RING_PROB){
        const rOffset = device === 'phone' ? 6 : (device === 'tablet' ? 8 : 10)
        let rleft = base + rand(-rOffset, rOffset)
        rleft = Math.max(clampMin, Math.min(clampMax, rleft))
        const r = { id: `r${id}`, left: rleft, bottom: rand(12,38), duration: rand(3.2,5.8), scale: rand(0.7,1.4) }
        setRings(s=>[...s,r])
        setTimeout(()=> setRings(s => s.filter(x=>x.id!==r.id)), 7200)
      }
    }, HEART_INTERVAL)
    return ()=> clearInterval(iv)
  },[isPhone])

  // typed text when accepted
  useEffect(()=>{
    if(!accepted) return
    setTyped('')
    let idx = 0
    const t = setInterval(()=>{
      idx++
      setTyped(fullText.slice(0, idx))
      if(idx >= fullText.length) clearInterval(t)
    }, 36)
    return ()=> clearInterval(t)
  },[accepted])

  // keep big-heart visible when the letter grows: reposition on typed changes and resize
  useEffect(()=>{
    if(!accepted) return
    function updateBigHeartPosition(){
      const bh = document.querySelector('.big-heart')
      const paper = document.querySelector('.letter .paper')
      if(!bh || !paper) return
      const paperRect = paper.getBoundingClientRect()
      const bhRect = bh.getBoundingClientRect()
      const desiredTop = Math.max(window.innerHeight * 0.08, paperRect.top - (bhRect.height * 0.55))
      bh.style.top = desiredTop + 'px'
    }
    updateBigHeartPosition()
    window.addEventListener('resize', updateBigHeartPosition)
    return ()=> window.removeEventListener('resize', updateBigHeartPosition)
  }, [accepted, typed])

  const toggleMuted = ()=> setMuted(m=>!m)

  // when accepted, append extra flowers so they appear and rise
  useEffect(()=>{
    if(!accepted) return
    const extra = [
      {left:30, scale:0.9, delay:0},
      {left:50, scale:1.02, delay:0.1},
      {left:66, scale:1.12, delay:0.2}
    ]
    // add them slightly staggered so their animationDelay takes effect
    setTimeout(()=> setFlowers(f => [...f, ...extra]), 80)
  }, [accepted])

  // play a small chime when accepted
  useEffect(()=>{
    if(!accepted) return
    try{
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      // layered sounds: bell + warm pad
      const osc1 = ctx.createOscillator(); const g1 = ctx.createGain()
      osc1.type = 'sine'; osc1.frequency.setValueAtTime(540, ctx.currentTime)
      g1.gain.setValueAtTime(0, ctx.currentTime); g1.gain.linearRampToValueAtTime(0.12, ctx.currentTime+0.02)

      const osc2 = ctx.createOscillator(); const g2 = ctx.createGain();
      osc2.type = 'triangle'; osc2.frequency.setValueAtTime(220, ctx.currentTime)
      g2.gain.setValueAtTime(0, ctx.currentTime); g2.gain.linearRampToValueAtTime(0.06, ctx.currentTime+0.03)

      osc1.connect(g1); g1.connect(ctx.destination); osc1.start()
      osc2.connect(g2); g2.connect(ctx.destination); osc2.start()

      osc1.frequency.linearRampToValueAtTime(760, ctx.currentTime+0.45)
      g1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.9)
      g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+1.6)

      setTimeout(()=>{ osc1.stop(); osc2.stop(); ctx.close() }, 1400)
    }catch(e){/* ignore audio errors */}
    // start background music: try file playback first, fallback to WebAudio
    try{
      if(audioRef.current){
        const p = audioRef.current.play()
        if(p && typeof p.catch === 'function') p.catch(()=> startMusic())
      }else{
        startMusic()
      }
    }catch(e){ try{ startMusic() }catch(e){} }
  },[accepted])

  return (
    <div className={"scene" + (accepted? ' accepted':'')}>
      <button onClick={toggleMuted} aria-pressed={muted} style={{position:'fixed',top:12,right:12,zIndex:60,padding:'8px 10px',borderRadius:10,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.04)',color:'#ffdfe9',backdropFilter:'blur(4px)'}}>{muted? '🔇':'🔊'}</button>
      <VideoPanel />
      {/* Valentine overlay */}
      {!accepted && !rejected && (
        <div className="valentine-overlay">
          <div className="card">
            <h1>Will you be my Valentine?</h1>
            <div style={{display:'flex',gap:12,justifyContent:'center'}}>
              <button className="btn-yes" onClick={()=>setAccepted(true)}>Yes</button>
              <button className="btn-ofcourse" onClick={()=>{ setRejected(true); setTimeout(()=>setRejected(false),1400)}}>Of course</button>
            </div>
          </div>
        </div>
      )}
      <div className="vignette" />
      <div className="stars">
        {Array.from({length:STAR_COUNT}).map((_,i)=> (
          <div key={i} className="star" style={{left:`${Math.random()*100}%`, top:`${Math.random()*60}%`, animationDelay:`${Math.random()*3}s`, opacity: Math.random()}}/>
        ))}
      </div>

      <div className="hearts">
        {hearts.map(h=> <Heart key={h.id} h={h} />)}
        {rings.map(r=> <Ring key={r.id} r={r} />)}
      </div>

      <div className="field">
        {flowers.map((f, i) => (
          <Flower key={i} left={f.left} scale={f.scale} delay={f.delay} grow={accepted} />
        ))}
        <div className="grass" />
      </div>

      {/* Big heart and letter shown after acceptance */}
      {accepted && (
        <>
          <div className="big-heart">
            <svg viewBox="0 0 32 29" width="240" height="220">
              <defs>
                <linearGradient id="bigG" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#ff9acb" />
                  <stop offset="100%" stopColor="#ff4b9a" />
                </linearGradient>
              </defs>
              <path d="M23.6 2c-2.5 0-4.6 1.6-5.6 3.2C16 3.6 13.9 2 11.4 2 7 2 4 5 4 9.3c0 8.2 12.6 14.6 12.6 14.6S29.2 17.5 29.2 9.3C29.2 5 26.2 2 23.6 2z" fill="url(#bigG)" />
            </svg>
          </div>
          <div className="letter">
            <div className="envelope" />
              <div className="paper">
                <h2>BABA</h2>
                <p id="typed">{typed}</p>
              </div>
          </div>
        </>
      )}
    </div>
  )
}
