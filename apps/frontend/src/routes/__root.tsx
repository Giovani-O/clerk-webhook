import { createRootRoute, Outlet } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ClerkProvider } from '@clerk/react'

const queryClient = new QueryClient()

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined

function RootLayout() {
  const content = (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  )

  if (!PUBLISHABLE_KEY) {
    return content
  }

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      {content}
    </ClerkProvider>
  )
}

export const Route = createRootRoute({
  component: RootLayout,
})
