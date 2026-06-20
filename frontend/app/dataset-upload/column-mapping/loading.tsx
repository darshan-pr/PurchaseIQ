import { Columns3, Loader2 } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function ColumnMappingLoading() {
  return (
    <div className="animate-fade-up space-y-6 pb-8">
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-24 animate-pulse rounded-2xl border border-black/10 bg-white shadow-sm" />
        ))}
      </div>
      <Card className="border-black/10 bg-white shadow-sm">
        <CardHeader className="border-b border-black/10 bg-gradient-to-r from-white to-emerald-50/60">
          <div className="flex items-center gap-2 text-sm font-bold text-neutral-950">
            <Columns3 className="size-4.5 text-emerald-700" />
            Opening column mapping
          </div>
        </CardHeader>
        <CardContent className="flex items-center gap-3 p-5 text-sm text-neutral-600">
          <Loader2 className="size-5 animate-spin text-emerald-700" />
          Preparing the mapping workspace...
        </CardContent>
      </Card>
    </div>
  )
}
