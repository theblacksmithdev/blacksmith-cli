import { Box } from '@chakra-ui/react'

interface SettingSelectProps {
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}

export function SettingSelect({ value, options, onChange }: SettingSelectProps) {
  return (
    <Box
      as="select"
      value={value}
      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
      css={{
        padding: '6px 28px 6px 10px',
        borderRadius: '6px',
        border: '1px solid var(--studio-border)',
        background: 'var(--studio-bg-surface)',
        color: 'var(--studio-text-primary)',
        fontSize: '13px',
        cursor: 'pointer',
        outline: 'none',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 8px center',
        '&:hover': { borderColor: 'var(--studio-border-hover)' },
        '&:focus': { borderColor: 'var(--studio-border-hover)' },
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </Box>
  )
}
