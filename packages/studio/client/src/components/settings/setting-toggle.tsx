import { Box } from '@chakra-ui/react'

interface SettingToggleProps {
  value: boolean
  onChange: (value: boolean) => void
}

export function SettingToggle({ value, onChange }: SettingToggleProps) {
  return (
    <Box
      as="button"
      onClick={() => onChange(!value)}
      css={{
        width: '40px',
        height: '22px',
        borderRadius: '11px',
        border: 'none',
        background: value ? 'var(--studio-green)' : 'var(--studio-bg-hover-strong)',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background 0.2s ease',
        flexShrink: 0,
      }}
    >
      <Box
        css={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          background: '#fff',
          position: 'absolute',
          top: '3px',
          left: value ? '21px' : '3px',
          transition: 'left 0.2s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      />
    </Box>
  )
}
