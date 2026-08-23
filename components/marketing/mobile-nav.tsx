'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Menu } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

const LINKS = [
  { href: '#for-farmers', label: 'For Farmers' },
  { href: '#for-buyers', label: 'For Buyers' },
  { href: '#features', label: 'Features' },
  { href: '#get-the-app', label: 'Get the App' },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Open menu"
        className="md:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="size-5" />
      </Button>
      <SheetContent side="right" className="w-4/5 sm:max-w-xs">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="flex items-center gap-2.5">
            <img
              src="/wimakit-icon.png"
              alt=""
              className="size-6 shrink-0 object-contain"
            />
            WiMakit
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-2.5 py-2.5 text-[15px] font-medium text-foreground/85 transition-colors hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <SheetFooter className="gap-2.5 border-t border-border pt-4">
          <Button
            className="h-11 gap-1.5 rounded-lg bg-farmer text-[15px] text-background hover:bg-farmer/90"
            render={<Link href="/sign-up" onClick={() => setOpen(false)} />}
          >
            Register as a Farmer
            <ArrowRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="h-11 rounded-lg text-[15px]"
            render={<Link href="/sign-in" onClick={() => setOpen(false)} />}
          >
            Sign in
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
