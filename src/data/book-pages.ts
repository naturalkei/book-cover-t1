export interface PageGenInput {
  bookId: string
  title: string
  author: string
  accentColor: string
  count: number
}

export type PageLayout = 'cover' | 'text' | 'figure' | 'colophon'

interface PageMeta {
  index: number
  layout: PageLayout
  block?: string[]
  figure?: FigureKind
}

type FigureKind = 'concentric' | 'columns' | 'horizon' | 'arc' | 'grid'

const LOREM_BLOCKS: string[][] = [
  [
    'The city had been quiet for hours, lit by lampposts',
    'that blinked like distant fireflies in a slow rain.',
    'Somewhere along the avenue a tram bell',
    'sang the late hour to no-one in particular.',
    'And the cartographer turned the page,',
    'pencil paused above a sketch of a square',
    'she had walked, but never named.',
  ],
  [
    'On the high terrace the wind carried only',
    'the rumour of voices — a market two streets',
    'over, a child practising scales, a dog asleep',
    'against a clay wall warmed by the afternoon.',
    'Below, the river had begun its slow argument',
    'with the bridge, and the bridge, as usual,',
    'pretended to hear nothing at all.',
  ],
  [
    'A door is rarely just a door. It is an invitation',
    'and a refusal arguing in the same hinge,',
    'a memory of every hand that paused on its knob',
    'before pushing or turning away.',
    'When you build a street, the writer suggested,',
    'count the doors twice — once for entering',
    'and once for the leaving they will permit.',
  ],
  [
    'Listen, said the old engineer, to the air.',
    'Every room has a frequency, every floorboard',
    'a pitch it prefers; the trick of a quiet house',
    'is not to silence them but to let them tune.',
    'Houses, like instruments, are never finished —',
    'only loved into a key you can live within.',
  ],
  [
    'There is a particular blue that the harbour',
    'wears just before the lamps come on,',
    'a blue not quite of water nor of sky',
    'but of the agreement between them.',
    'Fishermen call it the borrowed colour;',
    'painters call it impossible; and the children',
    'who watch from the seawall simply call it home.',
  ],
  [
    'Maps lie politely. They flatten what bends,',
    'silence what hums, and round the long walk',
    'into a confident inch. Read them as poems,',
    'the cartographer wrote in her notes,',
    'and you will find each city has a meter —',
    'a way of breathing on the page that the streets,',
    'in their wisdom, refuse to translate.',
  ],
  [
    'The lighthouse keeper kept two ledgers.',
    'In the first he wrote what the ships needed:',
    'the weather, the tides, the lamp\u2019s long arc.',
    'In the second, smaller and bound in leather,',
    'he wrote what the lighthouse needed of him:',
    'a little patience, a window left open,',
    'the courage to be useful and unseen.',
  ],
  [
    'A small library opens on a tuesday morning,',
    'three shelves and a kettle, and an old chair',
    'positioned to catch the eleven o\u2019clock sun.',
    'No-one comes for a week. Then a child',
    'leaves a folded paper boat between two novels.',
    'The librarian, retired from a quieter life,',
    'understands at last what she has built.',
  ],
  [
    'Every coast keeps a different alphabet —',
    'pebble, weed, foam, the long vowel of the tide.',
    'You learn to read it by sitting and not asking,',
    'by letting the sentence finish before you breathe.',
    'In a year you will speak it without thinking;',
    'in two you will dream it; in five it will speak',
    'back to you, and you will answer in kind.',
  ],
  [
    'There were six bridges and a thousand stories,',
    'one for each lamp the lamplighter had ever lit.',
    'He could not tell you which stories were true',
    'and which were borrowed from his father,',
    'but he could tell you which bridge fit which mood,',
    'which arch carried laughter best at midnight,',
    'and which one, on cold mornings, carried grief.',
  ],
  [
    'A neighbourhood is a contract written in feet.',
    'Children sign it by chalk; the older residents',
    'by the angle at which they nod from a window.',
    'Strangers, when they arrive, hesitate at first',
    'over the small print of the corner shop\u2019s smile,',
    'but the contract — patient, unsigned — waits',
    'and lets them earn the doorway in their own time.',
  ],
  [
    'On a day with no other event, the harbour rang.',
    'No bell answered; the gulls were silent, even.',
    'Only the boats nodded in their slow agreement',
    'with the swell, as if remembering, between them,',
    'a sound from before they were boats.',
    'The fisherman put down his coil and listened —',
    'a long minute, a longer breath, and then back.',
  ],
]

const FIGURES: FigureKind[] = ['concentric', 'columns', 'horizon', 'arc', 'grid']

const PAPER_BG = '<rect width="600" height="800" fill="#faf6ee"/><g opacity="0.5"><circle cx="120" cy="120" r="0.6" fill="#e7dccb"/><circle cx="280" cy="60" r="0.6" fill="#e7dccb"/><circle cx="440" cy="180" r="0.6" fill="#e7dccb"/><circle cx="80" cy="320" r="0.6" fill="#e7dccb"/><circle cx="520" cy="380" r="0.6" fill="#e7dccb"/><circle cx="200" cy="500" r="0.6" fill="#e7dccb"/><circle cx="400" cy="600" r="0.6" fill="#e7dccb"/><circle cx="160" cy="700" r="0.6" fill="#e7dccb"/><circle cx="500" cy="740" r="0.6" fill="#e7dccb"/></g>'

const escapeText = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const buildFigure = (kind: FigureKind, accent: string, soft: string): string => {
  switch (kind) {
    case 'concentric':
      return `<g opacity="0.85"><circle cx="300" cy="430" r="170" fill="none" stroke="${accent}" stroke-width="3"/><circle cx="300" cy="430" r="120" fill="none" stroke="${accent}" stroke-width="2" opacity="0.7"/><circle cx="300" cy="430" r="70" fill="${soft}" opacity="0.5"/><circle cx="300" cy="430" r="22" fill="${accent}"/></g>`
    case 'columns':
      return `<g opacity="0.9"><rect x="150" y="280" width="50" height="320" fill="${accent}" opacity="0.85"/><rect x="240" y="220" width="50" height="380" fill="${accent}" opacity="0.6"/><rect x="330" y="320" width="50" height="280" fill="${accent}" opacity="0.4"/><rect x="420" y="260" width="50" height="340" fill="${accent}" opacity="0.7"/><line x1="120" y1="600" x2="500" y2="600" stroke="#94a3b8" stroke-width="2"/></g>`
    case 'horizon':
      return `<g><rect x="80" y="260" width="440" height="180" fill="${soft}" opacity="0.55"/><circle cx="430" cy="320" r="40" fill="${accent}"/><path d="M80 440 L200 410 L320 425 L440 405 L520 420 L520 600 L80 600 Z" fill="${accent}" opacity="0.35"/><path d="M80 600 L520 600" stroke="#475569" stroke-width="1.5"/></g>`
    case 'arc':
      return `<g><path d="M120 600 A180 180 0 0 1 480 600" fill="none" stroke="${accent}" stroke-width="6"/><path d="M170 600 A130 130 0 0 1 430 600" fill="none" stroke="${accent}" stroke-width="4" opacity="0.6"/><path d="M220 600 A80 80 0 0 1 380 600" fill="${soft}" opacity="0.5"/><line x1="80" y1="600" x2="520" y2="600" stroke="#475569" stroke-width="1.5"/></g>`
    case 'grid':
      return `<g opacity="0.85">${gridCells(accent, soft)}</g>`
  }
}

const gridCells = (accent: string, soft: string): string => {
  const cols = 5
  const rows = 4
  const cellW = 80
  const cellH = 80
  const startX = 100
  const startY = 270
  const palette = [accent, soft, '#cbd5e1', accent, soft]
  let out = ''
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = startX + c * cellW
      const y = startY + r * cellH
      const fill = palette[(r * cols + c) % palette.length]
      const op = ((r + c) % 3) === 0 ? 0.85 : 0.45
      out += `<rect x="${x}" y="${y}" width="${cellW - 6}" height="${cellH - 6}" rx="4" fill="${fill}" opacity="${op}"/>`
    }
  }
  return out
}

const planPages = (count: number): PageMeta[] => {
  const result: PageMeta[] = []
  for (let i = 0; i < count; i++) {
    if (i === 0) {
      result.push({ index: i, layout: 'cover' })
      continue
    }
    if (i === count - 1) {
      result.push({ index: i, layout: 'colophon' })
      continue
    }
    if (i % 5 === 0) {
      result.push({
        index: i,
        layout: 'figure',
        figure: FIGURES[Math.floor(i / 5) % FIGURES.length],
      })
      continue
    }
    result.push({
      index: i,
      layout: 'text',
      block: LOREM_BLOCKS[(i - 1) % LOREM_BLOCKS.length],
    })
  }
  return result
}

const hexToRgb = (hex: string): { r: number, g: number, b: number } => {
  const clean = hex.replace('#', '')
  const v = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean
  return {
    r: Number.parseInt(v.slice(0, 2), 16),
    g: Number.parseInt(v.slice(2, 4), 16),
    b: Number.parseInt(v.slice(4, 6), 16),
  }
}

const softenAccent = (hex: string): string => {
  const { r, g, b } = hexToRgb(hex)
  const blend = (channel: number) => Math.round(channel + (255 - channel) * 0.55)
  return `rgb(${blend(r)}, ${blend(g)}, ${blend(b)})`
}

const buildSvg = (
  meta: PageMeta,
  total: number,
  ctx: { title: string; author: string; accent: string; soft: string },
): string => {
  const { title, author, accent, soft } = ctx
  const number = meta.index + 1
  const titleSafe = escapeText(title)
  const authorSafe = escapeText(author)
  const header = `<rect x="0" y="0" width="600" height="32" fill="${accent}"/><rect x="0" y="32" width="600" height="2" fill="${soft}"/>`
  const footer = `<g font-family="ui-serif, Georgia, serif" font-size="13" fill="#64748b"><text x="60" y="760">${titleSafe} · ${authorSafe}</text><text x="540" y="760" text-anchor="end">${number} / ${total}</text></g>`

  let body = ''
  if (meta.layout === 'cover') {
    const authorUpper = escapeText(author.toUpperCase())
    body = `<g font-family="ui-serif, Georgia, serif" text-anchor="middle"><text x="300" y="320" font-size="44" fill="#0f172a" font-weight="700">${titleSafe}</text><text x="300" y="370" font-size="20" fill="#475569" letter-spacing="6">${authorUpper}</text><line x1="240" y1="410" x2="360" y2="410" stroke="${accent}" stroke-width="3"/><text x="300" y="560" font-size="14" fill="#94a3b8" letter-spacing="3">VOLUME ONE</text></g>`
  }
  else if (meta.layout === 'colophon') {
    body = `<g font-family="ui-serif, Georgia, serif" text-anchor="middle"><text x="300" y="360" font-size="22" fill="#0f172a">— colophon —</text><text x="300" y="420" font-size="15" fill="#475569">${titleSafe}</text><text x="300" y="445" font-size="13" fill="#94a3b8">by ${authorSafe}</text><text x="300" y="520" font-size="12" fill="#94a3b8" letter-spacing="3">set in ui-serif · printed at the flipbook press</text></g>`
  }
  else if (meta.layout === 'figure') {
    const fig = buildFigure(meta.figure ?? 'concentric', accent, soft)
    body = `<g font-family="ui-serif, Georgia, serif"><text x="60" y="120" font-size="13" fill="#94a3b8" letter-spacing="5">FIGURE ${number}</text></g>${fig}<g font-family="ui-serif, Georgia, serif" font-size="13" fill="#64748b" text-anchor="middle"><text x="300" y="660">fig. ${number} — a study in ${describeFigure(meta.figure ?? 'concentric')}</text></g>`
  }
  else {
    const lines = meta.block ?? []
    let textTspans = ''
    let y = 220
    for (const line of lines) {
      textTspans += `<text x="80" y="${y}" font-family="ui-serif, Georgia, serif" font-size="20" fill="#1e293b">${escapeText(line)}</text>`
      y += 36
    }
    body = `<g font-family="ui-serif, Georgia, serif"><text x="80" y="120" font-size="13" fill="#94a3b8" letter-spacing="5">CHAPTER ${Math.ceil(number / 4)}</text><text x="80" y="160" font-size="22" fill="#0f172a">${titleSafe}</text></g>${textTspans}<line x1="80" y1="${y + 12}" x2="520" y2="${y + 12}" stroke="${soft}" stroke-width="2"/>`
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" role="img" aria-label="${titleSafe} page ${number}">${PAPER_BG}${header}${body}${footer}</svg>`
}

const describeFigure = (kind: FigureKind): string => {
  switch (kind) {
    case 'concentric': return 'orbits and centres'
    case 'columns': return 'thresholds and weights'
    case 'horizon': return 'a far line at dusk'
    case 'arc': return 'a bridge in three parts'
    case 'grid': return 'a square city, listened to'
  }
}

const toDataUri = (svg: string): string =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`

export const createBookPages = (input: PageGenInput): string[] => {
  const { title, author, accentColor, count } = input
  const soft = softenAccent(accentColor)
  const metas = planPages(count)
  return metas.map(meta =>
    toDataUri(buildSvg(meta, count, { title, author, accent: accentColor, soft })),
  )
}
