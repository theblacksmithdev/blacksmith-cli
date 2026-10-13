import { screen, renderWithProviders } from '@/__tests__/test-utils'
import NotFoundPage from '../not-found-page'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('NotFoundPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('renders the 404 heading', () => {
    renderWithProviders(<NotFoundPage />)

    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument()
  })

  it('explains what happened', () => {
    renderWithProviders(<NotFoundPage />)

    expect(screen.getByText('Page not found')).toBeInTheDocument()
  })

  it('offers a way back home', () => {
    renderWithProviders(<NotFoundPage />)

    expect(screen.getByRole('button', { name: /back to home/i })).toBeInTheDocument()
  })

  it('navigates home when the button is clicked', async () => {
    const { user } = renderWithProviders(<NotFoundPage />)

    await user.click(screen.getByRole('button', { name: /back to home/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/')
  })
})
