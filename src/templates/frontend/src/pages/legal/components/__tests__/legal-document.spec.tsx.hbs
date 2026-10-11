import { screen, renderWithProviders } from '@/__tests__/test-utils'
import { SITE } from '@/shared/utils/site-config'
import { LegalDocument } from '../legal-document'

const sections = [
  { title: 'First rule', paragraphs: ['Be kind.'] },
  { title: 'Second rule', paragraphs: ['Ship it.', 'Then ship again.'] },
]

describe('LegalDocument', () => {
  it('renders the title and intro', () => {
    renderWithProviders(<LegalDocument title="Terms of Service" intro="Read me." sections={sections} />)

    expect(screen.getByRole('heading', { level: 1, name: 'Terms of Service' })).toBeInTheDocument()
    expect(screen.getByText('Read me.')).toBeInTheDocument()
  })

  it('numbers each section heading', () => {
    renderWithProviders(<LegalDocument title="Terms" intro="" sections={sections} />)

    expect(screen.getByRole('heading', { level: 2, name: '1. First rule' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: '2. Second rule' })).toBeInTheDocument()
    expect(screen.getByText('Then ship again.')).toBeInTheDocument()
  })

  it('links to the support email', () => {
    renderWithProviders(<LegalDocument title="Terms" intro="" sections={sections} />)

    expect(screen.getByRole('link', { name: SITE.supportEmail })).toHaveAttribute(
      'href',
      `mailto:${SITE.supportEmail}`,
    )
  })

  it('flags the text as a template to replace', () => {
    renderWithProviders(<LegalDocument title="Terms" intro="" sections={sections} />)

    expect(screen.getByText(/not legal advice/i)).toBeInTheDocument()
  })
})
