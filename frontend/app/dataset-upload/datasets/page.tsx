"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Database, Info, Loader2 } from "lucide-react"

import { listDatasets, type DatasetSummary } from "@/lib/datasets"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const statusStyles: Record<string, string> = {
  COMPLETED: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  ARCHIVED: "bg-neutral-100 text-neutral-700 ring-neutral-200",
  FAILED: "bg-red-50 text-red-700 ring-red-200",
  PROCESSING: "bg-amber-50 text-amber-700 ring-amber-200",
  UPLOADED: "bg-blue-50 text-blue-700 ring-blue-200",
}

export default function DatasetMetadataIndexPage() {
  const [datasets, setDatasets] = useState<DatasetSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    async function loadDatasets() {
      setLoading(true)
      setError("")
      try {
        const datasetList = await listDatasets()
        if (!cancelled) {
          setDatasets(datasetList)
        }
      } catch (exception) {
        if (!cancelled) {
          setError(exception instanceof Error ? exception.message : "Unable to load datasets")
          setDatasets([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadDatasets()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-5 pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-950 md:text-3xl">Dataset Metadata</h1>
          <p className="mt-1 text-sm text-neutral-600">Choose a dataset version to view its full metadata.</p>
        </div>
        <Link href="/dataset-upload" className={buttonVariants({ variant: "outline", className: "bg-white" })}>
          <ArrowLeft className="size-4" />
          Back to upload
        </Link>
      </div>

      <Card className="border-black/10 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="size-4.5 text-emerald-700" />
            Dataset Versions
          </CardTitle>
          <CardDescription className="text-xs">Open the full metadata page for any uploaded version.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-[#f7f9f4] p-4 text-sm font-semibold text-neutral-700">
              <Loader2 className="size-4 animate-spin text-emerald-700" />
              Loading dataset versions
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
              {error}
            </div>
          ) : datasets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/10 bg-[#f7f9f4] p-6 text-center text-sm text-neutral-600">
              No dataset versions are available yet.
            </div>
          ) : (
            <div className="space-y-3">
              {datasets.map((dataset) => (
                <Link
                  key={dataset.datasetId}
                  href={`/dataset-upload/datasets/${dataset.datasetId}`}
                  className="grid items-center gap-3 rounded-2xl border border-black/10 bg-white p-3.5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-md md:grid-cols-[0.45fr_1.4fr_0.7fr_0.7fr_auto]"
                >
                  <span className="text-base font-bold text-neutral-950">v{dataset.version}</span>
                  <span className="truncate text-sm text-neutral-600">{dataset.fileName}</span>
                  <Badge className={`${statusStyles[dataset.status]} w-fit ring-1`} variant="secondary">
                    {dataset.active ? "ACTIVE" : dataset.status}
                  </Badge>
                  <span className="text-sm font-semibold text-neutral-700">
                    {dataset.recordCount.toLocaleString()} records
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-800">
                    <Info className="size-4" />
                    Details
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
