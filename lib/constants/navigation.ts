// navigation.ts

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
    children: [
      { label: "Dermatologist", href: `${MARHAM_HOME_URL}/doctors/dermatologist` },
      { label: "Gynecologist", href: `${MARHAM_HOME_URL}/doctors/gynecologist` },
      { label: "Psychiatrist", href: `${MARHAM_HOME_URL}/doctors/psychiatrist` },
      { label: "Psychologist", href: `${MARHAM_HOME_URL}/doctors/psychologist` },
      { label: "Urologist", href: `${MARHAM_HOME_URL}/doctors/urologist` },
      { label: "General Physician", href: `${MARHAM_HOME_URL}/doctors/general-physician` },
      { label: "Gastroenterologist", href: `${MARHAM_HOME_URL}/doctors/gastroenterologist` },
      { label: "Pediatrician", href: `${MARHAM_HOME_URL}/doctors/pediatrician` },
      { label: "General Practitioner", href: `${MARHAM_HOME_URL}/doctors/general-practitioner` },
      { label: "Nutritionist", href: `${MARHAM_HOME_URL}/doctors/nutritionist` },
      { label: "All Specialities", href: `${MARHAM_HOME_URL}/doctors/all-specialities` },
      { label: "All Diseases", href: `${MARHAM_HOME_URL}/disease` },
    ],
  },
  {
    label: "Hospitals",
    href: `${MARHAM_HOME_URL}/hospitals`,
    hasDropdown: true,
    children: [
      { label: "Hospitals in Karachi", href: `${MARHAM_HOME_URL}/hospitals/karachi` },
      { label: "Hospitals in Lahore", href: `${MARHAM_HOME_URL}/hospitals/lahore` },
      { label: "Hospitals in Islamabad", href: `${MARHAM_HOME_URL}/hospitals/islamabad` },
      { label: "All Hospitals (City wise) ", href: `${MARHAM_HOME_URL}/hospitals` },
  ],
  },
  {
    label: "Surgeries",
    href: `${MARHAM_HOME_URL}/surgeries`,
  },
  {
    label: "Medicines",
    href: `${MARHAM_HOME_URL}/medicines`,
    hasDropdown: true,
    children: [
      { label: "All Medicines", href: `${MARHAM_HOME_URL}/medicines/` },
      { label: "Medicines Delivery", href: `${MARHAM_HOME_URL}/medicines/delivery` },
    ],
  },
  {
    label: "Labs",
    href: `${MARHAM_HOME_URL}/labs`,
    hasDropdown: true,
    children: [
      { label: "Chughtai Lab", href: `${MARHAM_HOME_URL}/labs/chughtai-lab` },
      { label: "Dr. Essa's Laboratory & Diagnostic Center", href: `${MARHAM_HOME_URL}/labs/karachi/dr-essa-s-laboratory-diagnostic-center` },
      { label: "Excel Labs", href: `${MARHAM_HOME_URL}/labs/lahore/excel-labs` },
      { label: "All Labs", href: `${MARHAM_HOME_URL}/labs` },
    ],
   
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