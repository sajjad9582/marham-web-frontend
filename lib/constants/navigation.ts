export const MARHAM_HOME_URL = "https://www.marham.pk"

export type NavChildLink = {
  label: string
  href: string
}

export type NavLinkItem = {
  label: string
  href: string
  hasDropdown?: boolean
  children?: NavChildLink[]
}

export const MAIN_NAV_LINKS: NavLinkItem[] = [
  {
    label: "Find Doctors",
    href: `${MARHAM_HOME_URL}/doctors`,
    hasDropdown: true,
  },
  {
    label: "Hospitals",
    href: `${MARHAM_HOME_URL}/hospitals`,
    hasDropdown: true,
  },
  {
    label: "Surgeries",
    href: `${MARHAM_HOME_URL}/surgeries`,
  },
  {
    label: "Medicines",
    href: `${MARHAM_HOME_URL}/medicines`,
    hasDropdown: true,
  },
  {
    label: "Labs",
    href: `${MARHAM_HOME_URL}/labs`,
    hasDropdown: true,
  },
  {
    label: "Health Hub",
    href: `${MARHAM_HOME_URL}/health-hub`,
  },
  {
    label: "Forum",
    href: `${MARHAM_HOME_URL}/forum`,
  },
  {
    label: "Join as Doctor",
    href: `${MARHAM_HOME_URL}/join-as-doctor`,
  },
]

export const NAV_ACTIONS = {
  call: {
    href: "tel:+923111234567",
    label: "Call Marham",
    ariaLabel: "Call Marham support",
  },
  login: {
    href: `${MARHAM_HOME_URL}/login`,
    label: "Login",
  },
} as const
