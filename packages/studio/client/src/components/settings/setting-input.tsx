interface SettingInputProps {
  value: string | number
  type?: 'text' | 'number'
  placeholder?: string
  onChange: (value: string | number) => void
}

export function SettingInput({ value, type = 'text', placeholder, onChange }: SettingInputProps) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
      style={{
        padding: '6px 10px',
        borderRadius: '6px',
        border: '1px solid var(--studio-border)',
        background: 'var(--studio-bg-surface)',
        color: 'var(--studio-text-primary)',
        fontSize: '13px',
        outline: 'none',
        width: type === 'number' ? '80px' : '200px',
      }}
    />
  )
}
