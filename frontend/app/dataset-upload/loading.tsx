import { Database, Loader2, UploadCloud } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function DatasetUploadLoading() {
  return (
    <div className="animate-fade-up space-y-6 pb-8">
      <Card className="border-black/10 bg-white shadow-sm">
        <CardHeader className="border-b border-black/10 bg-gradient-to-r from-white to-emerald-50/60">
          <div className="flex items-center gap-2 text-sm font-bold text-neutral-950">
            <UploadCloud className="size-4.5 text-emerald-700" />
            Loading upload workspace
          </div>
        </CardHeader>
        <CardContent className="flex items-center gap-3 p-5 text-sm text-neutral-600">
          <Loader2 className="size-5 animate-spin text-emerald-700" />
          Preparing dataset tools...
        </CardContent>
      </Card>
      <Card className="border-black/10 bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm font-bold text-neutral-950">
            <Database className="size-4.5 text-emerald-700" />
            Dataset versions
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((row) => (
            <div key={row} className="h-16 animate-pulse rounded-2xl bg-neutral-100" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
