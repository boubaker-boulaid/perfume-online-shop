// The home page's line drawings: maple leaves and a perfume flask. They're only decoration, so
// screen readers skip them. Their lines take the text color, and CSS sets their size and place.

type ArtProps = { className?: string }

const LEAF_OUTLINE =
  'M100 6Q103.8 31.5 109 34Q113.9 39.9 124 26Q117.2 47.5 117 52Q115.1 68.5 119 76Q124.8 71.8 140 60Q136.1 56.7 146 40Q142 55.9 154 58Q154.6 54.2 176 36Q161.3 55.9 170 62Q166.4 67.6 188 64Q166.8 77.7 171 86Q153.3 94.5 156 104Q155.4 102.9 176 106Q172.7 101.2 197 100Q175.2 106.7 182 119Q172.2 120.6 190 133Q164.7 126.9 164 134Q143.7 130.2 140 141Q123.5 135.7 116 147Q106.7 139.5 100 150Q93.3 139.5 84 147Q76.5 135.7 60 141Q56.3 130.2 36 134Q35.3 126.9 10 133Q27.8 120.6 18 119Q24.8 106.7 3 100Q27.3 101.2 24 106Q44.6 102.9 44 104Q46.7 94.5 29 86Q33.2 77.7 12 64Q33.6 67.6 30 62Q38.7 55.9 24 36Q45.4 54.2 46 58Q58 55.9 54 40Q63.9 56.7 60 60Q75.2 71.8 81 76Q84.9 68.5 83 52Q82.8 47.5 76 26Q86.1 39.9 91 34Q96.2 31.5 100 6Z'
const LEAF_STEM = 'M100 150C101 172 105 192 114 212'
const LEAF_VEINS = 'M100 150V14M100 150 174 40M100 150 26 40M100 150 194 101M100 150 6 101'
const LEAF_FINE_VEINS =
  'M100 112 122 30M100 112 78 30M100 84 112 58M100 84 88 58M137 95 150 62M63 95 50 62M150 78 184 66M50 78 16 66M148 126 174 108M52 126 26 108'

// "non-scaling-stroke" keeps every line hair-thin, however large the drawing is shown.
const line = { vectorEffect: 'non-scaling-stroke' } as const

// A leaf fits a 200 × 220 box, with its stem at the bottom.
function Leaf({ filled = false }: { filled?: boolean }) {
  return (
    <>
      <path d={LEAF_OUTLINE} fill={filled ? 'currentColor' : 'none'} style={line} />
      <path d={LEAF_STEM} style={line} />
      <g stroke={filled ? 'rgba(16, 11, 8, 0.5)' : undefined}>
        <path d={LEAF_VEINS} strokeWidth={0.75} style={line} />
        <path d={LEAF_FINE_VEINS} strokeWidth={0.5} style={line} />
      </g>
    </>
  )
}

const svgProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

export function MapleLeaf({ className }: ArtProps) {
  return (
    <svg className={className} viewBox="0 0 200 220" {...svgProps}>
      <Leaf />
    </svg>
  )
}

// Two leaves that overlap, a large one and a smaller one behind it.
export function LeafSprig({ className }: ArtProps) {
  return (
    <svg className={className} viewBox="0 0 330 270" {...svgProps}>
      <g transform="translate(150 78) rotate(38 100 110) scale(0.74)">
        <Leaf />
      </g>
      <g transform="translate(14 22) rotate(-20 100 110)">
        <Leaf />
      </g>
    </svg>
  )
}

// The footer's leaves are filled in, like pressed autumn leaves.
export function PressedLeaves({ className }: ArtProps) {
  return (
    <svg className={className} viewBox="0 0 330 330" {...svgProps}>
      <g transform="translate(120 128) rotate(52 100 110) scale(0.8)" opacity={0.7}>
        <Leaf filled />
      </g>
      <g transform="translate(6 10) rotate(-24 100 110) scale(1.1)">
        <Leaf filled />
      </g>
    </svg>
  )
}

// A stoppered perfume flask with two sparkles, sketched in a few lines.
export function Flask({ className }: ArtProps) {
  return (
    <svg className={className} viewBox="0 0 120 180" {...svgProps}>
      <path d="M28 78c0-8 4-12 12-12h40c8 0 12 4 12 12v72c0 9-5 14-14 14H42c-9 0-14-5-14-14Z" style={line} />
      <path d="M35 82v66c0 6 3 9 9 9h32c6 0 9-3 9-9V82" strokeWidth={0.6} style={line} />
      <path d="M35 98c8-4 17 3 25 0s17-4 25 0" strokeWidth={0.6} style={line} />
      <path d="M45 108h30v30H45Z" strokeWidth={0.75} style={line} />
      <path d="M51 117h18M54 123h12M57 129h6" strokeWidth={0.5} style={line} />
      <path d="M51 66v-8h18v8M47 58h26v-6H47Z" style={line} />
      <path d="M50 52 45 25c9-7 21-7 30 0l-5 27" style={line} />
      <path d="M54 52 51 23M66 52l3-29M60 52V20" strokeWidth={0.5} style={line} />
      <path d="M104 30v18M95 39h18M16 56v12M10 62h12" strokeWidth={0.75} style={line} />
    </svg>
  )
}
