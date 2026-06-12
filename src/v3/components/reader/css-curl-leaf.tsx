import clsx from 'clsx'

import { sampleCurl, type TFlipDirection } from '@v3/lib/curl-model'

interface ICssCurlLeafProps {
  src: string
  progress: number
  direction: TFlipDirection
  pivot: 'left' | 'right'
  roundClass?: string
  testId?: string
}

export default function CssCurlLeaf({
  src,
  progress,
  direction,
  pivot,
  roundClass = '',
  testId = 'page-flip-outgoing',
}: ICssCurlLeafProps) {
  const sample = sampleCurl(0.68, progress, direction)
  const rotateY = (sample.angle * 180) / Math.PI
  const directionSign = direction === 'forward' ? -1 : 1
  const translateX = directionSign * sample.lift * 8
  const translateZ = sample.lift * 120
  const shadowOpacity = Math.min(0.45, sample.lift * 2.2)

  return (
    <img
      src={src}
      alt=""
      data-testid={testId}
      aria-hidden="true"
      decoding="async"
      className={clsx(
        'absolute inset-0 h-full w-full object-cover will-change-transform',
        roundClass,
      )}
      style={{
        transformOrigin: pivot === 'left' ? 'left center' : 'right center',
        transform: `translateX(${translateX}%) translateZ(${translateZ}px) rotateY(${rotateY}deg)`,
        backfaceVisibility: 'hidden',
        boxShadow: `${directionSign * 20}px 12px 36px rgba(0, 0, 0, ${shadowOpacity})`,
      }}
    />
  )
}
