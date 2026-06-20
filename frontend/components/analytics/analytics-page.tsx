"use client"

import { useEffect, useState, type ReactNode } from "react"
import { AlertCircle, Database, Loader2 } from "lucide-react"

import { getActiveAnalytics, type AnalyticsPayload } from "@/lib/analytics"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export function AnalyticsPage({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: (analytics: AnalyticsPayload) => ReactNode
}) {
  const [analytics, setAnalytics] = useState<AnalyticsPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function load() {
      try {
        setAnalytics(await getActiveAnalytics())
      } catch (exception) {
        setError(exception instanceof Error ? exception.message : "Unable to load analytics")
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  return (
    <div className="space-y-6 pb-8">
      <section className="rounded-[2rem] bg-neutral-950 p-6 text-white shadow-sm md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-300">
              Active Dataset Analytics
            </p>
            <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight md:text-5xl">{title}</h1>
            <p className="mt-3 max-w-3xl text-white/70">{description}</p>
          </div>
          {analytics && (
            <Badge className="w-fit bg-emerald-400/15 text-emerald-200">
              <Database className="size-3.5" />
              Dataset v{analytics.version}
            </Badge>
          )}
        </div>
      </section>

      {loading && (
        <Card className="border-black/10 bg-white shadow-sm">
          <CardContent className="flex items-center gap-3 p-6 text-neutral-600">
            <Loader2 className="size-5 animate-spin text-emerald-700" />
            Loading cached analytics for the active dataset...
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50 shadow-sm">
          <CardContent className="flex items-start gap-3 p-6 text-red-700">
            <AlertCircle className="mt-0.5 size-5" />
            <div>
              <p className="font-bold">Analytics unavailable</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {analytics && children(analytics)}
    </div>
  )
}
