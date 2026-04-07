import { createHighlighter } from 'shiki'

// Initialised once at module load — never re-created on component mount/unmount
const highlighterPromise = createHighlighter({
  themes: ['github-dark'],
  langs: ['json'],
})

/**
 * Returns Shiki-highlighted HTML for the given JSON string.
 * The highlighter is a module-level singleton; this function is safe to call
 * multiple times without creating multiple highlighter instances.
 */
export async function highlight(code: string): Promise<string> {
  const highlighter = await highlighterPromise
  return highlighter.codeToHtml(code, { lang: 'json', theme: 'github-dark' })
}
