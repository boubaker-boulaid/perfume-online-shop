import type { ReactNode } from 'react'

type IconProps = { size?: number; strokeWidth?: number }

function Icon({ size = 18, strokeWidth = 1.5, children }: IconProps & { children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  )
}

export const BagIcon = (p: IconProps) => <Icon {...p}><path d="M6 8h12l-1 12H7L6 8Z" /><path d="M9.5 8V6.5a2.5 2.5 0 0 1 5 0V8" /></Icon>
export const MenuIcon = (p: IconProps) => <Icon {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Icon>
export const CloseIcon = (p: IconProps) => <Icon {...p}><path d="M6 6l12 12M18 6L6 18" /></Icon>
export const ArrowRightIcon = (p: IconProps) => <Icon {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Icon>
export const ArrowLeftIcon = (p: IconProps) => <Icon {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></Icon>
export const ShieldIcon = (p: IconProps) => <Icon {...p}><path d="M12 3l7 3v6c0 4.2-2.9 7.8-7 9-4.1-1.2-7-4.8-7-9V6l7-3Z" /><path d="M9 12l2 2 4-4" /></Icon>
export const CalendarIcon = (p: IconProps) => <Icon {...p}><rect x="4" y="5" width="16" height="15" rx="3" /><path d="M8 3v4M16 3v4M4 10h16" /></Icon>
export const HeadsetIcon = (p: IconProps) => <Icon {...p}><path d="M5 14v-2a7 7 0 0 1 14 0v2" /><rect x="3" y="13" width="4" height="6" rx="2" /><rect x="17" y="13" width="4" height="6" rx="2" /></Icon>
export const UserCircleIcon = (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="10" r="3" /><path d="M6.5 18.5a6 6 0 0 1 11 0" /></Icon>
export const MailIcon = (p: IconProps) => <Icon {...p}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M4 7l8 6 8-6" /></Icon>
export const PhoneIcon = (p: IconProps) => <Icon {...p}><path d="M6 3h3l2 5-2.5 1.5a11 11 0 0 0 5 5L15 12l5 2v3a2 2 0 0 1-2.2 2A15 15 0 0 1 4 5.2 2 2 0 0 1 6 3Z" /></Icon>
export const PinIcon = (p: IconProps) => <Icon {...p}><path d="M12 21s7-5.6 7-11a7 7 0 0 0-14 0c0 5.4 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></Icon>
export const ClockIcon = (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7.5V12l3.5 2" /></Icon>
export const SendIcon = (p: IconProps) => <Icon {...p}><path d="M21 4L3 11l7 2.5L12.5 21 21 4Z" /><path d="M10 13.5L21 4" /></Icon>
export const TrashIcon = (p: IconProps) => <Icon {...p}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></Icon>
export const CheckIcon = (p: IconProps) => <Icon {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></Icon>
export const SearchIcon = (p: IconProps) => <Icon {...p}><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></Icon>

export function HeartIcon({ size = 16, filled = false }: { size?: number; filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden="true">
      <path d="M12 20s-7-4.3-7-9.2A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 2.8C19 15.7 12 20 12 20Z" />
    </svg>
  )
}
