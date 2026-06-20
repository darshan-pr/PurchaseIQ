"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Database,
  FileSpreadsheet,
  FileUp,
  Loader2,
  PlugZap,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
  XCircle,
} from "lucide-react"

import {
  API_URL,
  activateDataset,
  deleteDataset,
  getActiveDataset,
  getDatasetDetails,
  listDatasets,
  uploadDataset,
  type DatasetDetail,
  type DatasetSummary,
} from "@/lib/datasets"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { clearAnalyticsCache } from "@/lib/analytics"

const statusStyles: Record<string, string> = {
  COMPLETED: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  ARCHIVED: "bg-neutral-100 text-neutral-700 ring-neutral-200",
  FAILED: "bg-red-50 text-red-700 ring-red-200",
  PROCESSING: "bg-amber-50 text-amber-700 ring-amber-200",
  UPLOADED: "bg-blue-50 text-blue-700 ring-blue-200",
}

const processSteps = [
  "Validate CSV",
  "Create version",
  "Store records",
  "Activate dataset",
]

export default function DatasetUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [datasets, setDatasets] = useState<DatasetSummary[]>([])
  const [activeDataset, setActiveDataset] = useState<DatasetSummary | null>(null)
  const [selectedDetail, setSelectedDetail] = useState<DatasetDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [activatingId, setActivatingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const latestDataset = useMemo(() => datasets[0], [datasets])
  const apiOnline = !error.includes("Backend is not reachable")

  useEffect(() => {
    void refresh()
  }, [])

  async function refresh() {
    setLoading(true)
    setError("")
    try {
      const [datasetList, active] = await Promise.all([
        listDatasets(),
        getActiveDataset().catch(() => null),
      ])
      setDatasets(datasetList)
      setActiveDataset(active)
      setSelectedDetail(datasetList[0] ? await getDatasetDetails(datasetList[0].datasetId) : null)
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : "Unable to load datasets")
      setDatasets([])
      setActiveDataset(null)
      setSelectedDetail(null)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload() {
    if (!file) {
      setError("Choose a CSV file before uploading")
      return
    }
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Only CSV files are supported")
      return
    }

    setUploading(true)
    setError("")
    setMessage("")
    try {
      const response = await uploadDataset(file)
      clearAnalyticsCache()
      setMessage(`Version ${response.version} uploaded: ${response.recordCount} valid records, ${response.issueCount} issues`)
      setFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      await refresh()
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  async function handleActivate(datasetId: number) {
    setActivatingId(datasetId)
    setError("")
    setMessage("")
    try {
      const activated = await activateDataset(datasetId)
      clearAnalyticsCache()
      setMessage(`Dataset version ${activated.version} is now active`)
      await refresh()
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : "Activation failed")
    } finally {
      setActivatingId(null)
    }
  }

  async function handleDelete(dataset: DatasetSummary) {
    const confirmed = window.confirm(
      `Delete dataset v${dataset.version}? This will remove its imported records and cached analytics results.`
    )
    if (!confirmed) {
      return
    }

    setDeletingId(dataset.datasetId)
    setError("")
    setMessage("")
    try {
      await deleteDataset(dataset.datasetId)
      clearAnalyticsCache()
      setMessage(`Dataset version ${dataset.version} and its analytics results were deleted`)
      if (selectedDetail?.datasetId === dataset.datasetId) {
        setSelectedDetail(null)
      }
      await refresh()
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : "Delete failed")
    } finally {
      setDeletingId(null)
    }
  }

  function handleDrop(event: React.DragEvent<HTMLButtonElement>) {
    event.preventDefault()
    setDragActive(false)
    const droppedFile = event.dataTransfer.files?.[0]
    if (droppedFile) {
      setFile(droppedFile)
    }
  }

  async function selectDataset(datasetId: number) {
    setError("")
    try {
      setSelectedDetail(await getDatasetDetails(datasetId))
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : "Unable to load dataset details")
    }
  }

  return (
    <div className="space-y-6 pb-8">
      <section className="relative overflow-hidden rounded-[1.75rem] bg-neutral-950 p-6 text-white shadow-sm md:p-8">
        <div className="absolute -right-10 -top-12 h-60 w-60 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-full w-1/3 bg-gradient-to-l from-emerald-500/10 to-transparent" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-300">
                Dataset Management
              </p>
              <Badge className={apiOnline ? "bg-emerald-400/15 text-emerald-200" : "bg-red-400/15 text-red-200"}>
                <PlugZap className="size-3.5" />
                {apiOnline ? "Backend connected" : "Backend offline"}
              </Badge>
            </div>
            <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight md:text-6xl">
              Upload Dataset
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-white/68">
              Upload customer purchase CSVs, validate records, create versions, and keep analytics
              pointed at one active dataset.
            </p>
          </div>
          <div className="min-w-[260px] rounded-3xl border border-white/10 bg-white/[0.06] p-5 text-sm shadow-2xl shadow-emerald-950/20 backdrop-blur">
            <p className="text-white/50">API endpoint</p>
            <p className="mt-1 font-mono text-emerald-200">{API_URL}</p>
          </div>
        </div>
      </section>

      {error && <Alert tone="error" message={error} />}
      {message && <Alert tone="success" message={message} />}

      <section className="grid items-stretch gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <Card className="overflow-hidden border-black/10 bg-white shadow-sm transition duration-300 hover:shadow-md">
          <CardHeader className="border-b border-black/10 bg-gradient-to-r from-white to-emerald-50/60">
            <CardTitle className="flex items-center gap-2">
              <UploadCloud className="size-5 text-emerald-700" />
              Upload CSV
            </CardTitle>
            <CardDescription>
              Use `sample-datasets/purchaseiq-sample.csv` for a quick test upload.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-5 md:p-7">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault()
                setDragActive(true)
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`group w-full rounded-3xl border border-dashed p-6 text-left transition duration-300 hover:-translate-y-0.5 md:p-8 ${
                dragActive
                  ? "border-emerald-700 bg-emerald-100 shadow-inner"
                  : "border-emerald-300 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/40 hover:border-emerald-600 hover:bg-emerald-50"
              }`}
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex size-20 items-center justify-center rounded-3xl bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-100 transition duration-300 group-hover:scale-105 group-hover:shadow-md">
                  <FileSpreadsheet className="size-9" />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-neutral-950">
                    {file ? file.name : "Choose or drop a customer purchase CSV"}
                  </p>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
                    Required: CustomerID, Age, Gender, Product, Category, Quantity, Price, PurchaseDate
                  </p>
                  {file && (
                    <p className="mt-2 text-xs font-semibold text-emerald-800">
                      {(file.size / 1024).toFixed(1)} KB ready to upload
                    </p>
                  )}
                </div>
              </div>
            </button>

            <div className="sr-only">
              <Label htmlFor="dataset-file">CSV file</Label>
            </div>
            <Input
              ref={fileInputRef}
              id="dataset-file"
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />

            <div className="grid gap-3 sm:grid-cols-4">
              {processSteps.map((step, index) => (
                <div key={step} className="min-h-24 rounded-2xl border border-black/10 bg-[#f7f9f4] p-4">
                  <p className="text-xs font-black text-emerald-700">0{index + 1}</p>
                  <p className="mt-2 text-sm font-bold leading-5 text-neutral-800">{step}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleUpload}
                disabled={uploading || !file}
                className="bg-neutral-950 text-white transition hover:-translate-y-0.5 hover:bg-emerald-800"
              >
                {uploading ? <Loader2 className="size-4 animate-spin" /> : <FileUp className="size-4" />}
                {uploading ? "Uploading..." : "Upload dataset"}
              </Button>
              <Button onClick={refresh} disabled={loading} variant="outline" className="bg-white">
                {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                Refresh status
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full border-black/10 bg-white shadow-sm transition duration-300 hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-emerald-700" />
              Active Dataset
            </CardTitle>
            <CardDescription>Analytics always run against this active version.</CardDescription>
          </CardHeader>
          <CardContent>
            {activeDataset ? (
              <div className="space-y-4">
                <div className="rounded-3xl bg-neutral-950 p-6 text-white">
                  <p className="text-sm text-white/50">Current active version</p>
                  <div className="mt-3 flex items-end justify-between gap-4">
                    <p className="text-5xl font-bold">v{activeDataset.version}</p>
                    <Badge className="bg-emerald-400/15 text-emerald-200">ACTIVE</Badge>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Metric label="Records" value={activeDataset.recordCount.toLocaleString()} />
                  <Metric label="Issues" value={activeDataset.issueCount.toLocaleString()} />
                  <Metric label="File" value={activeDataset.fileName} />
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<Clock3 className="size-6" />}
                title="No active dataset yet"
                description="Upload a valid CSV and it will become the active analytics dataset."
              />
            )}
          </CardContent>
        </Card>
      </section>

      <Card className="border-black/10 bg-white shadow-sm">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="size-5 text-emerald-700" />
              Dataset Versions
            </CardTitle>
            <CardDescription>Previous versions remain available for historical reference.</CardDescription>
          </div>
          {datasets.length > 0 && (
            <Badge className="w-fit bg-emerald-50 text-emerald-800">
              {datasets.length} version{datasets.length === 1 ? "" : "s"}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingRows />
          ) : datasets.length === 0 ? (
            <EmptyState
              icon={<Database className="size-6" />}
              title="No dataset versions"
              description="Once an upload succeeds, the version history appears here."
            />
          ) : (
            <div className="space-y-3">
              {datasets.map((dataset) => (
                <div
                  key={dataset.datasetId}
                  className="grid gap-3 rounded-3xl border border-black/10 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-md md:grid-cols-[0.55fr_1.2fr_0.75fr_0.75fr_1.15fr]"
                >
                  <button
                    className="text-left text-lg font-bold text-neutral-950"
                    onClick={() => void selectDataset(dataset.datasetId)}
                  >
                    v{dataset.version}
                  </button>
                  <span className="truncate text-sm text-neutral-600">{dataset.fileName}</span>
                  <span>
                    <Badge className={`${statusStyles[dataset.status]} ring-1`} variant="secondary">
                      {dataset.active ? "ACTIVE" : dataset.status}
                    </Badge>
                  </span>
                  <span className="text-sm font-semibold text-neutral-700">
                    {dataset.recordCount.toLocaleString()} records
                  </span>
                  <span>
                    {dataset.active ? (
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                        <CheckCircle2 className="size-4" />
                        Current
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void handleActivate(dataset.datasetId)}
                          disabled={activatingId === dataset.datasetId || deletingId === dataset.datasetId}
                        >
                          {activatingId === dataset.datasetId ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <RotateCcw className="size-3.5" />
                          )}
                          Activate
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                          onClick={() => void handleDelete(dataset)}
                          disabled={deletingId === dataset.datasetId || activatingId === dataset.datasetId}
                        >
                          {deletingId === dataset.datasetId ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="size-3.5" />
                          )}
                          Delete
                        </Button>
                      </div>
                    )}
                    {dataset.active && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                        onClick={() => void handleDelete(dataset)}
                        disabled={deletingId === dataset.datasetId}
                      >
                        {deletingId === dataset.datasetId ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="size-3.5" />
                        )}
                        Delete
                      </Button>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-black/10 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-emerald-700" />
            Dataset Information
          </CardTitle>
          <CardDescription>
            {latestDataset ? "Selected version details and recent validation issues." : "Upload a dataset to view details."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedDetail ? (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-4">
                <Metric label="Dataset" value={selectedDetail.datasetName} />
                <Metric label="Version" value={`v${selectedDetail.version}`} />
                <Metric label="Uploaded" value={new Date(selectedDetail.uploadedAt).toLocaleString()} />
                <Metric label="Issue count" value={selectedDetail.issueCount.toLocaleString()} />
              </div>
              {selectedDetail.issues.length > 0 ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="mb-3 flex items-center gap-2 text-sm font-bold text-amber-900">
                    <AlertCircle className="size-4" />
                    Recent invalid rows
                  </p>
                  <div className="space-y-2">
                    {selectedDetail.issues.map((issue) => (
                      <p key={`${issue.rowNumber}-${issue.reason}`} className="text-sm text-amber-800">
                        Row {issue.rowNumber}: {issue.reason}
                      </p>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
                  No validation issues logged for this dataset.
                </p>
              )}
            </div>
          ) : (
            <EmptyState
              icon={<FileSpreadsheet className="size-6" />}
              title="No dataset selected"
              description="Choose a version from the history to inspect its metadata and issues."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Alert({ tone, message }: { tone: "error" | "success"; message: string }) {
  const isError = tone === "error"
  return (
    <div
      className={`animate-fade-up flex items-start gap-3 rounded-2xl border p-4 text-sm font-medium ${
        isError
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
    >
      {isError ? <XCircle className="mt-0.5 size-4" /> : <CheckCircle2 className="mt-0.5 size-4" />}
      <span>{message}</span>
    </div>
  )
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-3xl border border-dashed border-black/10 bg-[#f7f9f4] p-6 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
        {icon}
      </div>
      <p className="mt-3 font-bold text-neutral-950">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-neutral-600">{description}</p>
    </div>
  )
}

function LoadingRows() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((row) => (
        <div key={row} className="h-16 animate-pulse rounded-2xl bg-neutral-100" />
      ))}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-[#f7f9f4] p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-2 break-words font-bold text-neutral-950">{value}</p>
    </div>
  )
}
