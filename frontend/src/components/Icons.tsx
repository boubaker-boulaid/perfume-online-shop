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
export const CalendarIcon = (p: IconProps) => <Icon {...p}><rect x="4" y="5" width="16" height="15" rx="3" /><path d="M8 3v4M16 3v4M4 10h16" /></Icon>
export const MailIcon = (p: IconProps) => <Icon {...p}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M4 7l8 6 8-6" /></Icon>
export const PinIcon = (p: IconProps) => <Icon {...p}><path d="M12 21s7-5.6 7-11a7 7 0 0 0-14 0c0 5.4 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></Icon>
export const ClockIcon = (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7.5V12l3.5 2" /></Icon>
export const SendIcon = (p: IconProps) => <Icon {...p}><path d="M21 4L3 11l7 2.5L12.5 21 21 4Z" /><path d="M10 13.5L21 4" /></Icon>
export const TrashIcon = (p: IconProps) => <Icon {...p}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></Icon>
export const CheckIcon = (p: IconProps) => <Icon {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></Icon>
export const SearchIcon = (p: IconProps) => <Icon {...p}><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></Icon>

// Three icons of the home page's feature bar come from Lucide (lucide.dev), v1.71.0.
// ISC License. Copyright (c) 2026 Lucide Icons and Contributors.
export const BadgeCheckIcon = (p: IconProps) => <Icon {...p}><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" /><path d="m16 9-5.5 5.5L8 12" /></Icon>
export const TruckIcon = (p: IconProps) => <Icon {...p}><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" /><circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" /></Icon>
export const BanknoteIcon = (p: IconProps) => <Icon {...p}><rect width="20" height="12" x="2" y="6" rx="2" /><circle cx="12" cy="12" r="2" /><path d="M6 12h.01M18 12h.01" /></Icon>

export function HeartIcon({ size = 16, filled = false }: { size?: number; filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden="true">
      <path d="M12 20s-7-4.3-7-9.2A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 2.8C19 15.7 12 20 12 20Z" />
    </svg>
  )
}

// The WhatsApp logo comes from Simple Icons (simpleicons.org), v16.37.0, CC0 1.0. It's a filled shape,
// so it's drawn a little smaller than the line icons to look the same weight next to them.
export function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}
