const variants = {
  primary:
    'bg-accent text-ink hover:bg-[#8a6cff] border-transparent shadow-[0_10px_24px_-16px_rgba(121,87,255,0.9)]',
  secondary:
    'bg-transparent text-ink border-line hover:border-muted/40 hover:bg-white/[0.03]',
  ghost: 'bg-transparent border-transparent text-muted hover:text-ink hover:bg-white/[0.04]',
  danger: 'bg-danger/10 text-danger border-danger/20 hover:bg-danger/15',
}

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-sm',
}

export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) {
  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 rounded-lg border font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}
