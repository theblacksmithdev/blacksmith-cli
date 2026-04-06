interface SettingTextareaProps {
  value: string
  placeholder?: string
  onChange: (value: string) => void
}

export function SettingTextarea({ value, placeholder, onChange }: SettingTextareaProps) {
  return (
    <textarea
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onBlur={(e) => onChange(e.target.value)}
      rows={4}
      style={{
        width: '100%',
        padding: '10px 12px',
        borderRadius: '6px',
        border: '1px solid var(--studio-border)',
        background: 'var(--studio-bg-surface)',
        color: 'var(--studio-text-primary)',
        fontSize: '13px',
        outline: 'none',
        resize: 'vertical',
        fontFamily: 'inherit',
        lineHeight: '1.5',
      }}
    />
  )
}
