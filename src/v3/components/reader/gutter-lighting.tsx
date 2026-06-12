import { sampleGutterLighting, type TFlipDirection } from '@v3/lib/curl-model'

interface IGutterLightingProps {
  progress: number
  direction: TFlipDirection
  active: boolean
}

export default function GutterLighting({
  progress,
  direction,
  active,
}: IGutterLightingProps) {
  const sample = sampleGutterLighting(active ? progress : 0)
  const castWidth = 8 + sample.castWidth * 56
  const castToRight = direction === 'backward'

  return (
    <div
      aria-hidden="true"
      data-testid="page-flip-gutter"
      data-flip-phase={active ? 'active' : 'idle'}
      className="pointer-events-none absolute inset-y-0 left-1/2 z-[5] w-0"
    >
      <span
        data-testid="page-flip-gutter-crease"
        className="absolute inset-y-0 left-0 w-4 -translate-x-1/2"
        style={{
          background: 'linear-gradient(to right, transparent, rgba(0, 0, 0, 0.72), transparent)',
          opacity: sample.creaseAo,
        }}
      />
      <span
        data-testid="page-flip-gutter-cast"
        className="absolute inset-y-0"
        style={{
          left: castToRight ? 0 : undefined,
          right: castToRight ? undefined : 0,
          width: `${castWidth}px`,
          background: castToRight
            ? 'linear-gradient(to right, rgba(0, 0, 0, 0.68), transparent)'
            : 'linear-gradient(to left, rgba(0, 0, 0, 0.68), transparent)',
          opacity: active ? sample.castOpacity : 0,
        }}
      />
      <span
        data-testid="page-flip-gutter-ridge"
        className="absolute inset-y-0 w-1"
        style={{
          left: castToRight ? undefined : 1,
          right: castToRight ? 1 : undefined,
          background: 'rgba(255, 255, 255, 0.9)',
          opacity: active ? sample.ridgeLight : 0,
        }}
      />
    </div>
  )
}
