'use client'

// YouTube video ID for Aubrey Marcus Podcast #521: "No Such Thing As Evil? (SHOCKING DEBATE) | Dr. John Demartini"
// TODO: Replace with actual YouTube video ID once available
const YOUTUBE_VIDEO_ID = 'dQw4w9WgXcQ'

/**
 * Formats seconds into MM:SS or HH:MM:SS format
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

interface TimecodeLinkProps {
  seconds: number
  className?: string
}

/**
 * A clickable timecode that links to the YouTube video at the specified timestamp.
 * Uses monospace font and tertiary ink color with hover state.
 */
export function TimecodeLink({ seconds, className = '' }: TimecodeLinkProps) {
  const formatted = formatTime(seconds)
  const href = `https://www.youtube.com/watch?v=${YOUTUBE_VIDEO_ID}&t=${Math.floor(seconds)}s`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        font-mono text-xs text-ink-tertiary
        hover:text-ink-secondary hover:underline hover:decoration-dotted
        transition-colors duration-instant
        ${className}
      `.trim()}
    >
      {formatted}
    </a>
  )
}
