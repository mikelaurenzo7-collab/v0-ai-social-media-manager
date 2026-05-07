'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/brand/logo'
import { ArrowRight, Menu, X } from 'lucide-react'

const NAV = [
  { href: '/agents',   label: 'Agents'   },
  { href: '/examples', label: 'Examples' },
  { href: '/pricing',  label: 'Pricing'  },
  { href: '/about',    label: 'About'    },
  { href: '/roadmap',  label: 'Roadmap'  },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-border/60 glass' : 'border-b border-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center" aria-label="PostPilot home">
          <Logo size={28} wordmark wordmarkClassName="text-[1.45rem]" />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
              <span className="pointer-events-none absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-orange-500 to-pink-600 transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm" className="btn-gradient h-9 px-4 rounded-full">
            <Link href="/signup" className="inline-flex items-center gap-1.5">
              Start free
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-border/60 glass">
          <div className="space-y-1 px-4 py-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block py-2.5 text-base font-medium text-foreground/80 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              <Button variant="outline" asChild className="w-full">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild className="w-full btn-gradient">
                <Link href="/signup">Start free</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
