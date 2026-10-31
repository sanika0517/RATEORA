import { ROLE_LABELS } from '../../utils/constants'

const tones = {
  ADMIN: 'text-lavender bg-lavender/10 border-lavender/20',
  NORMAL_USER: 'text-cyan bg-cyan/10 border-cyan/20',
  STORE_OWNER: 'text-warm bg-warm/10 border-warm/20',
  default: 'text-muted bg-white/5 border-line',
}

export default function Badge({ role, children, className = '' }) {
  const tone = tones[role] || tones.default

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${tone} ${className}`}
    >
      {children || ROLE_LABELS[role] || role}
    </span>
  )
}
