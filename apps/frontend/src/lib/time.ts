/**
 * Returns a human-readable relative time string.
 * e.g. "just now", "30 seconds ago", "2 minutes ago", "1 hour ago"
 */
export function formatRelativeTime(ms: number): string {
  const seconds = Math.floor((Date.now() - ms) / 1000)

  if (seconds < 10) return 'just now'
  if (seconds < 60) return `${seconds} seconds ago`

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`

  const hours = Math.floor(minutes / 60)
  return hours === 1 ? '1 hour ago' : `${hours} hours ago`
}
