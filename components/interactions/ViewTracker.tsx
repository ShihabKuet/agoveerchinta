'use client'

import { useEffect } from 'react'

// This component renders nothing visible — it just fires a silent API call
// to increment the view count when someone opens a post page.
// WHY A CLIENT COMPONENT? useEffect only runs in the browser, not on the server.
// This ensures we don't count server-side renders as views.
export default function ViewTracker({ postId }: { postId: string }) {
  useEffect(() => {
    // Small delay to avoid counting bots that leave immediately
    const timer = setTimeout(async () => {
      try {
        await fetch(`/api/views`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId }),
        })
      } catch {
        // Silently fail — view count is not critical
      }
    }, 3000)  // 3 seconds = likely a real reader

    return () => clearTimeout(timer)
  }, [postId])

  return null  // Renders nothing
}
