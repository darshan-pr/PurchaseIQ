"use client"

import { Show } from "@clerk/nextjs"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

import { AppShell } from "@/components/app-shell"
import { PublicShell } from "@/components/public-shell"

export function RootFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  if (pathname === "/landing") {
    return <PublicShell>{children}</PublicShell>
  }

  return (
    <>
      <Show when="signed-out">
        <PublicShell>{children}</PublicShell>
      </Show>
      <Show when="signed-in">
        <AppShell>{children}</AppShell>
      </Show>
    </>
  )
}
