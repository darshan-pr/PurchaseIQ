"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CheckCircle2,
  Columns3,
  Database,
  FileSpreadsheet,
  FileUp,
  Info,
  Loader2,
  RefreshCw,
  RotateCcw,
  Trash2,
  UploadCloud,
  XCircle,
} from "lucide-react"

import {
  activateDataset,
  deleteDataset,
  getDatasetDetails,
  listDatasets,
  uploadDataset,
  type DatasetSummary,
} from "@/lib/datasets"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { clearAnalyticsCache } from "@/lib/analytics"
import {
  autoMapColumns,
  clearDatasetUploadDraft,
  getDatasetUploadDraft,
  missingRequiredDatasetColumns,
  parseCsvLine,
  setDatasetUploadDraft,
} from "@/lib/dataset-upload-draft"

const statusStyles: Record<string, string> = {
  COMPLETED: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  ARCHIVED: "bg-neutral-100 text-neutral-700 ring-neutral-200",
  FAILED: "bg-red-50 text-red-700 ring-red-200",
  PROCESSING: "bg-amber-50 text-amber-700 ring-amber-200",
  UPLOADED: "bg-blue-50 text-blue-700 ring-blue-200",
}

const processSteps = [
  "Validate CSV",
  "Map columns",
  "Create version",
  "Activate dataset",
]

export default function DatasetUploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(() => getDatasetUploadDraft().file)
  const [datasets, setDatasets] = useState<DatasetSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [activatingId, setActivatingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [pendingDelete, setPendingDelete] = useState<DatasetSummary | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [csvHeaders, setCsvHeaders] = useState<string[]>(() => getDatasetUploadDraft().csvHeaders)
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>(
    () => getDatasetUploadDraft().columnMapping
  )
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const missingRequiredColumns = useMemo(
    () => missingRequiredDatasetColumns(columnMapping),
    [columnMapping]
  )

  useEffect(() => {
    router.prefetch("/dataset-upload/column-mapping")
    void refresh()
  }, [router])

  useEffect(() => {
    datasets.forEach((dataset) => {
      router.prefetch(`/dataset-upload/datasets/${dataset.datasetId}`)
      void getDatasetDetails(dataset.datasetId).catch(() => null)
    })
  }, [datasets, router])

  async function refresh() {
    setLoading(true)
    setError("")
    try {
      const datasetList = await listDatasets()
      setDatasets(datasetList)
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : "Unable to load datasets")
      setDatasets([])
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
      if (csvHeaders.length > 0 && missingRequiredColumns.length > 0) {
        setError(`Map required columns before uploading: ${missingRequiredColumns.join(", ")}`)
        navigateToMapping()
        return
      }

      const response = await uploadDataset(file, columnMapping)
      clearAnalyticsCache()
      setMessage(`Version ${response.version} uploaded: ${response.recordCount} valid records, ${response.issueCount} issues`)
      setFile(null)
      setCsvHeaders([])
      setColumnMapping({})
      clearDatasetUploadDraft()
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

  function navigateToMapping() {
    router.push("/dataset-upload/column-mapping")
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

  async function handleDelete(dataset: DatasetSummary | null = pendingDelete) {
    if (!dataset) {
      return
    }

    setDeletingId(dataset.datasetId)
    setPendingDelete(null)
    setError("")
    setMessage("")
    try {
      await deleteDataset(dataset.datasetId)
      clearAnalyticsCache()
      setMessage(`Dataset version ${dataset.version} and its analytics results were deleted`)
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
      void handleFileSelect(droppedFile)
    }
  }

  async function handleFileSelect(nextFile: File | null) {
    setFile(nextFile)
    setCsvHeaders([])
    setColumnMapping({})
    setError("")
    if (!nextFile) {
      clearDatasetUploadDraft()
      return
    }
    if (!nextFile.name.toLowerCase().endsWith(".csv")) {
      setError("Only CSV files are supported")
      clearDatasetUploadDraft()
      return
    }
    try {
      const firstLine = (await nextFile.text()).split(/\r?\n/).find((line) => line.trim().length > 0) ?? ""
      const headers = parseCsvLine(firstLine)
      const nextMapping = autoMapColumns(headers)
      setCsvHeaders(headers)
      setColumnMapping(nextMapping)
      setDatasetUploadDraft({
        file: nextFile,
        csvHeaders: headers,
        columnMapping: nextMapping,
      })
      navigateToMapping()
    } catch {
      setError("Unable to read the CSV header for mapping")
    }
  }

  return (
    <div className="space-y-6 pb-8">
      

      {error && <Alert tone="error" message={error} />}
      {message && <Alert tone="success" message={message} />}

      <section className="grid items-stretch gap-5">
        <Card className="overflow-hidden border-black/10 bg-white shadow-sm transition duration-300 hover:shadow-md">
          <CardHeader className="border-b border-black/10 bg-gradient-to-r from-white to-emerald-50/60">
            <CardTitle className="flex items-center gap-2 text-base">
              <UploadCloud className="size-4.5 text-emerald-700" />
              Upload CSV
            </CardTitle>
            <CardDescription className="text-xs">
              Use `sample-datasets/purchaseiq-sample.csv` for a quick test upload.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 p-5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault()
                setDragActive(true)
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`group w-full rounded-2xl border border-dashed p-4 text-left transition duration-300 hover:-translate-y-0.5 ${
                dragActive
                  ? "border-emerald-700 bg-emerald-100 shadow-inner"
                  : "border-emerald-300 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/40 hover:border-emerald-600 hover:bg-emerald-50"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex size-12 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-100 transition duration-300 group-hover:scale-105 group-hover:shadow-md">
                  <FileSpreadsheet className="size-5.5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-neutral-950">
                    {file ? file.name : "Choose or drop a customer purchase CSV"}
                  </p>
                  <p className="mt-1.5 max-w-2xl text-xs leading-5 text-neutral-600">
                    Required: CustomerID, Age, Gender, Product, Category, Quantity, Price, PurchaseDate
                  </p>
                  {file && (
                    <p className="mt-1.5 text-xs font-semibold text-emerald-800">
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
              onChange={(event) => void handleFileSelect(event.target.files?.[0] ?? null)}
            />

            {csvHeaders.length > 0 && (
              <div className="rounded-2xl border border-black/10 bg-[#f7f9f4] p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-bold text-neutral-950">
                      <Columns3 className="size-4 text-emerald-700" />
                      Column mapping
                    </p>
                    <p className="mt-1 truncate text-xs text-neutral-600" title={file?.name}>
                      {file?.name}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-white text-neutral-700" variant="secondary">
                      {csvHeaders.length} columns found
                    </Badge>
                    {missingRequiredColumns.length > 0 ? (
                      <Badge className="bg-amber-50 text-amber-800" variant="secondary">
                        {missingRequiredColumns.length} unmapped
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-50 text-emerald-800" variant="secondary">
                        <CheckCircle2 className="size-3.5" />
                        Ready
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex flex-col gap-2 border-t border-black/10 pt-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs leading-5 text-neutral-600">
                    {missingRequiredColumns.length > 0
                      ? `Map required fields: ${missingRequiredColumns.join(", ")}`
                      : "All required fields are mapped. You can upload now or review the mapping."}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-white"
                    onClick={() => void navigateToMapping()}
                  >
                    <Columns3 className="size-4" />
                    Edit columns
                  </Button>
                </div>
              </div>
            )}

            <div className="grid gap-2.5 sm:grid-cols-4">
              {processSteps.map((step, index) => (
                <div key={step} className="min-h-16 rounded-xl border border-black/10 bg-[#f7f9f4] p-2.5">
                  <p className="text-xs font-black text-emerald-700">0{index + 1}</p>
                  <p className="mt-1.5 text-xs font-bold leading-4 text-neutral-800">{step}</p>
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
      </section>

      <Card className="border-black/10 bg-white shadow-sm">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="size-4.5 text-emerald-700" />
              Dataset Versions
            </CardTitle>
            <CardDescription className="text-xs">Previous versions remain available for historical reference.</CardDescription>
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
              icon={<Database className="size-5" />}
              title="No dataset versions"
              description="Once an upload succeeds, the version history appears here."
            />
          ) : (
            <div className="space-y-3">
              {datasets.map((dataset) => (
                <div
                  key={dataset.datasetId}
                  className="grid items-center gap-3 rounded-2xl border border-black/10 bg-white p-3.5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-md md:grid-cols-[0.45fr_1.4fr_0.7fr_0.7fr_1.3fr]"
                >
                  <Link
                    href={`/dataset-upload/datasets/${dataset.datasetId}`}
                    className="truncate text-left text-base font-bold text-neutral-950 transition hover:text-emerald-800"
                    title={`Open metadata for dataset v${dataset.version}`}
                  >
                    v{dataset.version}
                  </Link>
                  <span className="truncate text-sm text-neutral-600">{dataset.fileName}</span>
                  <span>
                    <Badge className={`${statusStyles[dataset.status]} ring-1`} variant="secondary">
                      {dataset.active ? "ACTIVE" : dataset.status}
                    </Badge>
                  </span>
                  <span className="text-sm font-semibold text-neutral-700">
                    {dataset.recordCount.toLocaleString()} records
                  </span>
                  <span className="flex items-center justify-start gap-2 md:justify-end">
                    {dataset.active ? (
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                        <CheckCircle2 className="size-4" />
                        Current
                      </span>
                    ) : (
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
                    )}
                    <Link
                      href={`/dataset-upload/datasets/${dataset.datasetId}`}
                      className={buttonVariants({
                        size: "sm",
                        variant: "outline",
                        className:
                          deletingId === dataset.datasetId || activatingId === dataset.datasetId
                            ? "pointer-events-none bg-white opacity-50"
                            : "bg-white",
                      })}
                      title="View dataset information"
                    >
                      <Info className="size-3.5" />
                      Info
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                      onClick={() => setPendingDelete(dataset)}
                      disabled={deletingId === dataset.datasetId || activatingId === dataset.datasetId}
                    >
                      {deletingId === dataset.datasetId ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                      Delete
                    </Button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {pendingDelete && (
        <DeleteDatasetDialog
          dataset={pendingDelete}
          deleting={deletingId === pendingDelete.datasetId}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => void handleDelete(pendingDelete)}
        />
      )}
    </div>
  )
}

function DeleteDatasetDialog({
  dataset,
  deleting,
  onCancel,
  onConfirm,
}: {
  dataset: DatasetSummary
  deleting: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-700">
            <Trash2 className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-950">Delete dataset v{dataset.version}?</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              This removes the imported records and cached analytics for {dataset.fileName}. If it is active,
              the latest remaining completed version becomes current.
            </p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" className="bg-white" onClick={onCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button className="bg-red-600 text-white hover:bg-red-700" onClick={onConfirm} disabled={deleting}>
            {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
            Delete
          </Button>
        </div>
      </div>
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
      <div className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
        {icon}
      </div>
      <p className="mt-3 text-sm font-bold text-neutral-950">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-neutral-600">{description}</p>
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
