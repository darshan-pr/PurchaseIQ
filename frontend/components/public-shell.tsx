"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { Code2, LayoutDashboard, LineChart, LogIn, ShieldCheck } from "lucide-react"
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"

import { GitHubLink } from "@/components/github-link"
import { Logo } from "@/components/logo"
import { Button, buttonVariants } from "@/components/ui/button"

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen overflow-hidden bg-[#f7f9f4] text-neutral-950">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_50%_0%,rgba(22,163,74,0.16),transparent_60%)]" />

      <header className="relative z-10 border-b border-black/10 bg-[#f7f9f4]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <Link href="/landing" className="group">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-neutral-600 md:flex">
            <a href="#features" className="transition hover:text-emerald-700">
              Features
            </a>
            <a href="#workflow" className="transition hover:text-emerald-700">
              Workflow
            </a>
            <a href="#security" className="transition hover:text-emerald-700">
              Security
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <GitHubLink className="border-black/15 text-neutral-900 hover:bg-neutral-100 hover:text-neutral-950" />
            <Show when="signed-out">
              <>
                <SignInButton>
                  <Button variant="outline" className="border-black/15 bg-white text-neutral-900 hover:bg-neutral-100">
                    <LogIn className="size-4" />
                    Sign in
                  </Button>
                </SignInButton>
                <SignUpButton>
                  <Button className="bg-emerald-700 text-white shadow-sm hover:bg-emerald-800">
                    Start
                  </Button>
                </SignUpButton>
              </>
            </Show>
            <Show when="signed-in">
              <>
                <Link
                  href="/"
                  className={buttonVariants({
                    className: "bg-emerald-700 text-white shadow-sm hover:bg-emerald-800",
                  })}
                >
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </Link>
                <UserButton />
              </>
            </Show>
          </div>
        </div>
      </header>

      <main className="relative z-10">{children}</main>

      <footer className="relative z-10 border-t border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-neutral-600 md:flex-row md:items-center md:justify-between md:px-6">
          <Logo className="scale-90 origin-left" />
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-600" />
              Clerk secured
            </span>
            <span className="inline-flex items-center gap-1.5">
              <LineChart className="size-4 text-emerald-700" />
              Built for analytics
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Code2 className="size-4 text-neutral-700" />
              College major project
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
