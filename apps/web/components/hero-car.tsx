export function HeroCar() {
  return (
    <div className="hero-art" aria-label="A freshly washed yellow sports car illustration" role="img">
      <div className="sun-disc" />
      <div className="speed-line speed-one" />
      <div className="speed-line speed-two" />
      <div className="sparkles" aria-hidden="true">✦　✧</div>
      <svg viewBox="0 0 760 390" className="car-svg" aria-hidden="true">
        <defs>
          <linearGradient id="carPaint" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffe36a" />
            <stop offset="0.56" stopColor="#f7c600" />
            <stop offset="1" stopColor="#bc8500" />
          </linearGradient>
          <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6b787d" />
            <stop offset="1" stopColor="#121617" />
          </linearGradient>
        </defs>
        <ellipse cx="391" cy="322" rx="318" ry="36" fill="#050505" opacity=".72" />
        <path d="M91 256c18-36 57-59 110-70l76-15 70-85c17-20 39-30 66-30h111c29 0 53 10 73 31l73 78 55 14c34 9 57 31 65 66l6 31c4 21-12 40-34 40H120c-28 0-46-29-34-54l5-6Z" fill="url(#carPaint)" stroke="#0b0c0d" strokeWidth="7" />
        <path d="M342 91c14-15 29-22 48-22h121c24 0 42 8 58 26l58 65-335 3 50-72Z" fill="url(#glass)" stroke="#0b0c0d" strokeWidth="6" />
        <path d="M465 71v91M288 164h374M384 178l-45 71h219l65-70" fill="none" stroke="#2a2404" strokeWidth="5" opacity=".48" />
        <path d="M106 251h109c23 0 40 18 40 41v19H112c-24 0-38-25-27-46l21-14ZM642 218l78 24 8 34h-96l10-58Z" fill="#171717" />
        <path d="M112 246h92l19 28h-127l16-28ZM643 219l62 21-8 29h-65l11-50Z" fill="#fff6c7" stroke="#0b0c0d" strokeWidth="4" />
        <path d="M291 214h208" stroke="#ffed8a" strokeWidth="9" strokeLinecap="round" opacity=".65" />
        <g>
          <circle cx="234" cy="304" r="64" fill="#111" stroke="#060606" strokeWidth="8" />
          <circle cx="234" cy="304" r="37" fill="#656565" stroke="#d5d5d5" strokeWidth="5" />
          <circle cx="234" cy="304" r="12" fill="#f7c600" />
        </g>
        <g>
          <circle cx="610" cy="304" r="64" fill="#111" stroke="#060606" strokeWidth="8" />
          <circle cx="610" cy="304" r="37" fill="#656565" stroke="#d5d5d5" strokeWidth="5" />
          <circle cx="610" cy="304" r="12" fill="#f7c600" />
        </g>
        <path d="M329 286h217M123 204l-36 7M673 186l40 4" stroke="#0b0c0d" strokeWidth="7" strokeLinecap="round" />
      </svg>
      <div className="water-swoosh" />
    </div>
  );
}
