import { type ReactElement, type ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ChakraProvider } from '@chakra-ui/react'
import theme from '@/theme'
import { MemoryRouter } from 'react-router-dom'

/**
 * Creates a fresh QueryClient configured for tests.
 * Disables retries and garbage collection to keep tests fast and deterministic.
 */
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

interface WrapperProps {
  children: ReactNode
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Initial route entries for MemoryRouter (defaults to ["/"]) */
  routerEntries?: string[]
  /** Provide your own QueryClient (a fresh one is created by default) */
  queryClient?: QueryClient
}

/**
 * Custom render that wraps components with all app providers:
 * - ChakraProvider (with theme for consistent snapshots)
 * - QueryClientProvider (with test-friendly defaults)
 * - MemoryRouter (for components that use routing hooks)
 *
 * Also returns a `user` instance from @testing-library/user-event.
 *
 * @example
 *   const { user } = renderWithProviders(<MyComponent />)
 *   await user.click(screen.getByRole('button'))
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    routerEntries = ['/'],
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: CustomRenderOptions = {},
) {
  function Wrapper({ children }: WrapperProps) {
    return (
      <ChakraProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={routerEntries}>
            {children}
          </MemoryRouter>
        </QueryClientProvider>
      </ChakraProvider>
    )
  }

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}

export { createTestQueryClient }

// Re-export everything from @testing-library/react for convenience
export * from '@testing-library/react'
// Override render with our custom version
export { renderWithProviders as render }
