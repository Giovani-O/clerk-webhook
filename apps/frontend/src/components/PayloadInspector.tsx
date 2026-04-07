import { useEffect, useState } from 'react'
import { highlight } from '../lib/shiki'

interface Props {
  payload: Record<string, unknown> | null
}

export function PayloadInspector({ payload }: Props) {
  const [html, setHtml] = useState<string | null>(null)

  useEffect(() => {
    if (payload === null) {
      setHtml(null)
      return
    }

    let cancelled = false
    const code = JSON.stringify(payload, null, 2)

    highlight(code).then((result) => {
      if (!cancelled) setHtml(result)
    })

    return () => {
      cancelled = true
    }
  }, [payload])

  if (payload === null) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 text-sm">Select an event to inspect</p>
      </div>
    )
  }

  if (html === null) {
    // Plain text while highlight() is resolving (no flash of unstyled content)
    return (
      <pre className="p-4 text-xs text-gray-300 overflow-auto h-full font-mono">
        {JSON.stringify(payload, null, 2)}
      </pre>
    )
  }

  return (
    <div
      className="h-full overflow-auto text-xs [&_pre]:p-4 [&_pre]:h-full [&_pre]:overflow-auto"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
