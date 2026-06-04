"use client"

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
  "inline-flex items-center gap-0.5 text-[15px] font-normal text-maingray transition-colors hover:text-brandblue"

function NavLink({ item }: { item: NavLinkItem }) {
  if (item.hasDropdown && item.children?.length) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            navLinkClass,
            "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-brandblue/30"
          )}
        >
          {item.label}
          <ChevronDownIcon className="size-3.5 opacity-70" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-44">
          {item.children.map((child) => (
            <DropdownMenuItem key={child.href} render={<Link href={child.href} />}>
              {child.label}
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

function HeaderActions({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        render={
          <a
            href={NAV_ACTIONS.call.href}
            aria-label={NAV_ACTIONS.call.ariaLabel}
          />
        }
        size="icon"
        className="size-9 rounded-md bg-brandblue text-white hover:bg-navyblue"
      >
        <PhoneIcon className="size-4" />
      </Button>
      <Button
        render={<Link href={NAV_ACTIONS.login.href} />}
        variant="outline"
        className="h-9 rounded-md border-brandblue px-5 text-[15px] font-normal text-brandblue hover:bg-washblue hover:text-brandblue"
      >
        {NAV_ACTIONS.login.label}
      </Button>
    </div>
  )
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-lightergray bg-white">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-4 px-4 sm:h-[60px] sm:px-6 lg:px-8">
        <MarhamLogo width={110} className="sm:hidden" />
        <MarhamLogo width={120} className="hidden sm:block" />

        <nav
          className="hidden flex-1 items-center justify-center gap-5 xl:flex xl:gap-6"
          aria-label="Main navigation"
        >
          {MAIN_NAV_LINKS.map((item) => (
            <NavLink key={item.label} item={item} />
          ))}
        </nav>

        <div className="hidden items-center xl:flex">
          <HeaderActions />
        </div>

        <div className="flex items-center gap-2 xl:hidden">
          <HeaderActions className="hidden sm:flex" />
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-brandblue hover:bg-washblue"
                  aria-label="Open menu"
                />
              }
            >
              <MenuIcon className="size-6" />
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs p-0">
              <SheetHeader className="border-b border-lightergray px-4 py-4">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <MarhamLogo width={110} />
              </SheetHeader>
              <nav
                className="flex flex-col gap-1 px-2 py-3"
                aria-label="Mobile navigation"
              >
                {MAIN_NAV_LINKS.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-between rounded-md px-3 py-2.5 text-[15px] text-maingray transition-colors hover:bg-pagegray hover:text-brandblue"
                  >
                    {item.label}
                    {item.hasDropdown ? (
                      <ChevronDownIcon className="size-4 opacity-60" />
                    ) : null}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-2 border-t border-lightergray p-4 sm:hidden">
                <Button
                  render={
                    <a
                      href={NAV_ACTIONS.call.href}
                      aria-label={NAV_ACTIONS.call.ariaLabel}
                    />
                  }
                  className="h-10 w-full bg-brandblue text-white hover:bg-navyblue"
                >
                  <PhoneIcon className="size-4" />
                  {NAV_ACTIONS.call.label}
                </Button>
                <Button
                  render={<Link href={NAV_ACTIONS.login.href} />}
                  variant="outline"
                  className="h-10 w-full border-brandblue text-brandblue hover:bg-washblue"
                >
                  {NAV_ACTIONS.login.label}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
