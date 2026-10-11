import { screen, renderWithProviders } from '@/__tests__/test-utils'
import { SITE } from '@/shared/utils/site-config'
import SupportPage from '../support'
import { FAQS } from '../content/faqs'

describe('SupportPage', () => {
  it('renders the page heading', () => {
    renderWithProviders(<SupportPage />)

    expect(screen.getByRole('heading', { level: 1, name: 'How can we help?' })).toBeInTheDocument()
  })

  it('offers the support email as a mail link', () => {
    renderWithProviders(<SupportPage />)

    expect(screen.getByRole('link', { name: SITE.supportEmail })).toHaveAttribute(
      'href',
      `mailto:${SITE.supportEmail}`,
    )
  })

  it('links to password reset', () => {
    renderWithProviders(<SupportPage />)

    expect(screen.getByRole('link', { name: 'Reset password' })).toHaveAttribute('href', '/forgot-password')
  })

  it('reveals an answer when its question is opened', async () => {
    const { user } = renderWithProviders(<SupportPage />)
    const [faq] = FAQS

    await user.click(screen.getByRole('button', { name: faq!.question }))

    expect(screen.getByText(faq!.answer)).toBeVisible()
  })
})
