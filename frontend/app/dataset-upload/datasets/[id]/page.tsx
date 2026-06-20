"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Database,
  FileSpreadsheet,
  Info,
} from "lucide-react"

import {
  getCachedDatasetDetails,
  getDatasetDetails,
  type DatasetDetail,
} from "@/lib/datasets"
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

export default function DatasetMetadataPage() {
  const params = useParams<{ id: string }>()
  const datasetId = Number(params.id)
  const cachedDataset = useMemo(
    () => (Number.isFinite(datasetId) ? getCachedDatasetDetails(datasetId) : null),
    [datasetId]
  )
  const [dataset, setDataset] = useState<DatasetDetail | null>(cachedDataset)
  const [loading, setLoading] = useState(!cachedDataset)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    async function loadDataset() {
      if (!Number.isFinite(datasetId)) {
        setError("Invalid dataset selected")
        setLoading(false)
        return
      }

      setLoading(true)
      setError("")
      try {
        const detail = await getDatasetDetails(datasetId)
        if (!cancelled) {
          setDataset(detail)
        }
      } catch (exception) {
        if (!cancelled) {
          setError(exception instanceof Error ? exception.message : "Unable to load dataset metadata")
          setDataset(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadDataset()
    return () => {
      cancelled = true
    }
  }, [datasetId])

  if (loading && !dataset) {
    return <DatasetMetadataSkeleton />
  }

  if (error && !dataset) {
    return (
      <div className="space-y-4">
        <Link href="/dataset-upload" className={buttonVariants({ variant: "outline", className: "bg-white" })}>
          <ArrowLeft className="size-4" />
          Back to upload
        </Link>
        <Card className="border-red-200 bg-red-50 shadow-sm">
          <CardContent className="flex items-start gap-3 p-5 text-red-800">
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-bold">Could not load dataset metadata</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!dataset) {
    return null
  }

  return (
    <div className="space-y-5 pb-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          
          <h1 className="mt-3 truncate text-2xl font-bold tracking-tight text-neutral-950 md:text-3xl">
            Dataset #{dataset.datasetId}
          </h1>
          <p className="mt-1 truncate text-sm text-neutral-600" title={dataset.fileName}>
            v{dataset.version} · {dataset.fileName}
          </p>
        </div>
        <Link href="/dataset-upload" className={buttonVariants({ variant: "outline", className: "bg-white" })}>
          <ArrowLeft className="size-4" />
          Back to upload
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Metric icon={<Database className="size-4" />} label="Records" value={dataset.recordCount.toLocaleString()} />
        <Metric icon={<AlertCircle className="size-4" />} label="Issues" value={dataset.issueCount.toLocaleString()} />
        <Metric icon={<Clock3 className="size-4" />} label="Uploaded" value={new Date(dataset.uploadedAt).toLocaleString()} />
        <Metric icon={<FileSpreadsheet className="size-4" />} label="Version" value={`v${dataset.version}`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
        <Card className="border-black/10 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="size-4.5 text-emerald-700" />
              Dataset Metadata
            </CardTitle>
            <CardDescription className="text-xs">
              Complete import metadata for this dataset version.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-black/10 rounded-2xl border border-black/10 bg-[#f7f9f4]">
              <MetadataRow label="Dataset ID" value={String(dataset.datasetId)} />
              <MetadataRow label="Dataset name" value={dataset.datasetName} />
              <MetadataRow label="File name" value={dataset.fileName} />
              <MetadataRow label="Status" value={dataset.active ? "ACTIVE" : dataset.status} />
              <MetadataRow label="Active" value={dataset.active ? "Yes" : "No"} />
              <MetadataRow label="Uploaded at" value={new Date(dataset.uploadedAt).toLocaleString()} />
              <MetadataRow label="Record count" value={dataset.recordCount.toLocaleString()} />
              <MetadataRow label="Issue count" value={dataset.issueCount.toLocaleString()} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-black/10 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="size-4.5 text-emerald-700" />
              Validation Log
            </CardTitle>
            <CardDescription className="text-xs">
              Invalid rows captured during CSV processing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dataset.issues.length > 0 ? (
              <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                {dataset.issues.map((issue) => (
                  <div
                    key={`${issue.rowNumber}-${issue.reason}`}
                    className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
                  >
                    <span className="font-bold">Row {issue.rowNumber}:</span> {issue.reason}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm font-medium text-emerald-800">
                No validation issues logged for this dataset.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DatasetMetadataSkeleton() {
  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-3">
          <div className="h-6 w-28 animate-pulse rounded-full bg-neutral-200" />
          <div className="h-8 w-56 animate-pulse rounded-xl bg-neutral-200" />
        </div>
        <div className="h-9 w-32 animate-pulse rounded-lg bg-neutral-200" />
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-24 animate-pulse rounded-2xl bg-neutral-100" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="h-80 animate-pulse rounded-2xl bg-neutral-100" />
        <div className="h-80 animate-pulse rounded-2xl bg-neutral-100" />
      </div>
    </div>
  )
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-emerald-700">{icon}</div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-1 break-words text-base font-bold text-neutral-950">{value}</p>
    </div>
  )
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 px-4 py-3 sm:grid-cols-[0.38fr_0.62fr] sm:items-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="break-words text-sm font-semibold text-neutral-900">{value}</p>
    </div>
  )
}
