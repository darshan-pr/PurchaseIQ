import Image from "next/image"

import { cn } from "@/lib/utils"

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex size-10 items-center justify-center overflow-hidden rounded-2xl bg-black shadow-sm ring-1 ring-black/10">
        <Image
          src="/logo.png"
          alt="PurchaseIQ logo"
          width={40}
          height={40}
          className="size-full object-cover"
          priority
        />
      </div>
      <div className={cn(compact && "sr-only")}>
        <p className="font-heading text-lg font-extrabold tracking-tight text-neutral-950">
          Purchase<span className="text-emerald-700">IQ</span>
        </p>
        <p className="whitespace-nowrap text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-neutral-500">
          Pattern intelligence
        </p>
      </div>
    </div>
  )
}
