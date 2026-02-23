'use client'

interface TimelineSegment {
  speaker: 'marcus' | 'demartini'
  start: number
  end: number
}

interface TimelineBarProps {
  segments: TimelineSegment[]
  totalDuration: number
  currentTime: number
  onSeek: (time: number) => void
  isPlaying?: boolean
  onPlayPause?: () => void
}

export function TimelineBar({
  segments,
  totalDuration,
  currentTime,
  onSeek,
  isPlaying = false,
  onPlayPause,
}: TimelineBarProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = (currentTime / totalDuration) * 100

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 bg-field border-t border-border"
      style={{ height: 'var(--timeline-height)' }}
    >
      <div className="max-w-content mx-auto h-full px-space-6 flex items-center gap-space-4">
        {/* Play/Pause button */}
        {onPlayPause && (
          <button
            onClick={onPlayPause}
            className="btn-ghost w-8 h-8 flex items-center justify-center"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        )}

        {/* Speaker minimap */}
        <div
          className="flex-1 h-[4px] bg-field-deep rounded-full relative cursor-pointer overflow-hidden"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const x = e.clientX - rect.left
            const percent = x / rect.width
            onSeek(percent * totalDuration)
          }}
        >
          {/* Speaker segments */}
          {segments.map((seg, i) => {
            const left = (seg.start / totalDuration) * 100
            const width = ((seg.end - seg.start) / totalDuration) * 100
            return (
              <div
                key={i}
                className={`absolute top-0 h-full ${
                  seg.speaker === 'marcus'
                    ? 'bg-marcus-faint'
                    : 'bg-demartini-faint'
                }`}
                style={{ left: `${left}%`, width: `${width}%` }}
              />
            )
          })}

          {/* Progress indicator */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-ink rounded-full shadow-sm"
            style={{ left: `${progress}%`, marginLeft: '-6px' }}
          />
        </div>

        {/* Timestamp */}
        <span className="font-mono text-xs text-ink-tertiary min-w-[80px] text-right">
          {formatTime(currentTime)} / {formatTime(totalDuration)}
        </span>
      </div>
    </div>
  )
}
