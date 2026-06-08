// site-header.tsx

"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronDownIcon, MenuIcon, PhoneIcon } from "lucide-react"

import { MarhamLogo } from "@/components/logo/marham-logo"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  MAIN_NAV_LINKS,
  NAV_ACTIONS,
  type NavLinkItem,
} from "@/lib/constants/navigation"
import { cn } from "@/lib/utils"

const navLinkClass =
  "inline-flex items-center gap-0.5 text-[15px] font-normal text-maingray transition-colors hover:bg-deepblue rounded-sm px-2 py-1 hover:text-white"

function NavLink({ item }: { item: NavLinkItem }) {
  const [isOpen, setIsOpen] = React.useState(false)

  if (item.hasDropdown && item.children?.length) {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger
          asChild
          className={cn(
            navLinkClass,
            "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-brandblue/30 cursor-pointer"
          )}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <Link href={item.href}>
            {item.label}
            <ChevronDownIcon className={cn("size-3.5 opacity-70 transition-transform duration-200", isOpen && "rotate-180")} />
          </Link>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="min-w-56 bg-white py-2 shadow-lg border border-lightergray rounded-md"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          {item.children.map((child) => (
            <DropdownMenuItem
              key={child.href}
              asChild
              className="focus:bg-washblue focus:text-brandblue text-maingray cursor-pointer px-4 py-2 text-[15px] font-normal rounded-none"
            >
              <Link href={child.href} className="w-full block">
                {child.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Link href={item.href} className={navLinkClass}>
      {item.label}
      {item.hasDropdown ? (
        <ChevronDownIcon className="size-3.5 opacity-70" aria-hidden />
      ) : null}
    </Link>
  )
}

function MobileNavItem({ item }: { item: NavLinkItem }) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const hasChildren = item.hasDropdown && !!item.children?.length

  if (hasChildren) {
    return (
      <div className="flex flex-col">
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-[15px] text-maingray transition-colors hover:bg-pagegray hover:text-brandblue"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((open) => !open)}
        >
          {item.label}
          <ChevronDownIcon
            className={cn(
              "size-4 opacity-60 transition-transform duration-200",
              isExpanded && "rotate-180"
            )}
          />
        </button>
        {isExpanded && (
          <div className="ml-4 flex flex-col border-l border-lightergray pl-2">
            {item.children!.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className="rounded-md px-3 py-2 text-[14px] text-maingray transition-colors hover:text-brandblue"
              >
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Link
      href={item.href}
      className="flex items-center justify-between rounded-md px-3 py-2.5 text-[15px] text-maingray transition-colors hover:bg-pagegray hover:text-brandblue"
    >
      {item.label}
    </Link>
  )
}

function HeaderActions({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        asChild
        size="icon"
        className="size-9 rounded-md bg-brandblue text-white hover:bg-navyblue"
      >
        <a href={NAV_ACTIONS.call.href} aria-label={NAV_ACTIONS.call.ariaLabel}>
          <PhoneIcon className="size-4" />
        </a>
      </Button>
      <Button
        asChild
        variant="outline"
        className="h-9 rounded-md border-brandblue px-5 text-[15px] font-normal text-brandblue hover:bg-washblue hover:text-brandblue"
      >
        <Link href={NAV_ACTIONS.login.href}>{NAV_ACTIONS.login.label}</Link>
      </Button>
    </div>
  )
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-lightergray bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:h-[60px] sm:px-6 lg:px-10">
        <MarhamLogo width={110} className="sm:hidden" />
        <MarhamLogo width={120} className="hidden sm:block" />

     <div className="hidden items-center gap-2 xl:flex">
  <nav className="flex items-center gap-2" aria-label="Main navigation">
    {MAIN_NAV_LINKS.map((item) => (
      <NavLink key={item.label} item={item} />
    ))}
  </nav>

  <HeaderActions />
</div>

        <div className="flex items-center gap-2 xl:hidden">
          <HeaderActions className="hidden sm:flex" />
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-brandblue hover:bg-washblue"
                aria-label="Open menu"
              >
                <MenuIcon className="size-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs p-0 flex flex-col">
              <SheetHeader className="border-b border-lightergray px-4 py-4">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <MarhamLogo width={110} />
              </SheetHeader>
              <nav
                className="flex-1 flex flex-col gap-1 px-2 py-3 overflow-y-auto"
                aria-label="Mobile navigation"
              >
                {MAIN_NAV_LINKS.map((item) => (
                  <MobileNavItem key={item.label} item={item} />
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-2 border-t border-lightergray p-4 sm:hidden bg-white">
                <Button
                  asChild
                  className="h-10 w-full bg-brandblue text-white hover:bg-navyblue"
                >
                  <a href={NAV_ACTIONS.call.href} aria-label={NAV_ACTIONS.call.ariaLabel}>
                    <PhoneIcon className="size-4" />
                    {NAV_ACTIONS.call.label}
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-10 w-full border-brandblue text-brandblue hover:bg-washblue"
                >
                  <Link href={NAV_ACTIONS.login.href}>{NAV_ACTIONS.login.label}</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}