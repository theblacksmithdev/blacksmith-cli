export const iconBtn = (active = false) => ({
  width: '36px',
  height: '36px',
  borderRadius: '8px',
  border: 'none',
  background: active ? 'var(--studio-bg-hover)' : 'transparent',
  color: active ? 'var(--studio-text-primary)' : 'var(--studio-text-tertiary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.12s ease',
  '&:hover': {
    background: active ? 'var(--studio-bg-hover)' : 'var(--studio-bg-surface)',
    color: active ? 'var(--studio-text-primary)' : 'var(--studio-text-secondary)',
  },
})

export const navRow = (active = false) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '9px',
  width: '100%',
  padding: '7px 10px',
  borderRadius: '7px',
  border: 'none',
  background: active ? 'var(--studio-bg-hover)' : 'transparent',
  color: active ? 'var(--studio-text-primary)' : 'var(--studio-text-tertiary)',
  fontSize: '13px',
  fontWeight: active ? 500 : 400,
  cursor: 'pointer',
  transition: 'all 0.1s ease',
  textAlign: 'left' as const,
  '&:hover': {
    background: 'var(--studio-bg-surface)',
    color: 'var(--studio-text-secondary)',
  },
})
