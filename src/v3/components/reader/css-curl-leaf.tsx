import clsx from 'clsx'

import { sampleCurl, type TFlipDirection } from '@v3/lib/curl-model'

export const CURL_SEGMENT_COUNT = 12

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
  const segmentWidth = 100 / CURL_SEGMENT_COUNT

  return (
    <div
      data-testid={testId}
      aria-hidden="true"
      className={clsx('absolute inset-0', roundClass)}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {Array.from({ length: CURL_SEGMENT_COUNT }, (_, index) => {
        const u = (index + 0.5) / CURL_SEGMENT_COUNT
        const sample = sampleCurl(u, progress, direction)
        const rotateY = (sample.angle * 180) / Math.PI
        const translateZ = sample.lift * 140

        return (
          <div
            key={index}
            className="absolute top-0 h-full overflow-hidden"
            style={{
              left: `${index * segmentWidth}%`,
              width: `${segmentWidth}%`,
              transformOrigin: pivot === 'left' ? 'left center' : 'right center',
              transform: `rotateY(${rotateY}deg) translateZ(${translateZ}px)`,
              backfaceVisibility: 'hidden',
            }}
          >
            <img
              src={src}
              alt=""
              decoding="async"
              className="h-full max-w-none object-cover"
              style={{
                width: `${CURL_SEGMENT_COUNT * 100}%`,
                marginLeft: pivot === 'left'
                  ? `-${index * segmentWidth}%`
                  : `-${(CURL_SEGMENT_COUNT - 1 - index) * segmentWidth}%`,
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
