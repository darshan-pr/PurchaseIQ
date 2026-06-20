import type { ReactNode } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function PagePlaceholder({
  title,
  purpose,
  children,
}: {
  title: string
  purpose: string
  children?: ReactNode
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-neutral-950 p-6 text-white shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-300">Coming soon</p>
        <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight">{title}</h1>
        <p className="mt-3 max-w-2xl text-white/70">{purpose}</p>
      </div>

      <Card className="border-black/10 bg-white shadow-sm">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>This PurchaseIQ page is ready for implementation.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-neutral-600">
          {children ?? "Coming soon."}
        </CardContent>
      </Card>
    </div>
  )
}
