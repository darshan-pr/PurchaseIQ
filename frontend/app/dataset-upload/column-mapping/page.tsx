"use client"

import Link from "next/link"
import { ArrowLeft, CheckCircle2, Columns3, FileSpreadsheet, Loader2, UploadCloud } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  datasetColumns,
  getDatasetUploadDraft,
  missingRequiredDatasetColumns,
  updateDatasetColumnMapping,
} from "@/lib/dataset-upload-draft"
import { useState } from "react"

export default function ColumnMappingPage() {
  const [draft, setDraft] = useState(() => getDatasetUploadDraft())
  const [saving, setSaving] = useState(false)
  const missingRequiredColumns = missingRequiredDatasetColumns(draft.columnMapping)

  function handleMappingChange(key: string, value: string) {
    updateDatasetColumnMapping(key, value)
    setDraft(getDatasetUploadDraft())
  }

  if (!draft.file) {
    return (
      <div className="space-y-6 pb-8">
        <Card className="border-black/10 bg-white shadow-sm">
          <CardContent className="grid gap-4 p-6 text-center md:p-10">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <FileSpreadsheet className="size-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-950">Choose a CSV first</h1>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-neutral-600">
                Column mapping is available after selecting a dataset file on the upload page.
              </p>
            </div>
            <Link
              href="/dataset-upload"
              className={buttonVariants({
                className: "mx-auto bg-neutral-950 text-white hover:bg-emerald-800",
              })}
            >
              <UploadCloud className="size-4" />
              Go to upload
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="animate-fade-up space-y-6 pb-8">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">CSV columns</p>
          <p className="mt-1 text-2xl font-bold text-neutral-950">{draft.csvHeaders.length}</p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Required unmapped</p>
          <p className={`mt-1 text-2xl font-bold ${missingRequiredColumns.length > 0 ? "text-amber-700" : "text-emerald-700"}`}>
            {missingRequiredColumns.length}
          </p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Status</p>
          <p className="mt-1 text-2xl font-bold text-neutral-950">
            {missingRequiredColumns.length > 0 ? "Needs review" : "Ready"}
          </p>
        </div>
      </div>

      <Card className="border-black/10 bg-white shadow-sm">
        <CardHeader className="border-b border-black/10 bg-gradient-to-r from-white to-emerald-50/60">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Columns3 className="size-4.5 text-emerald-700" />
                Map your columns
              </CardTitle>
              <CardDescription className="mt-1 text-xs">
                Match your CSV headers to the PurchaseIQ fields before uploading{" "}
                <span className="font-semibold text-neutral-700">{draft.file.name}</span>.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-[#f7f9f4] text-neutral-700" variant="secondary">
                {draft.csvHeaders.length} columns found
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
        </CardHeader>
        <CardContent className="space-y-5 p-5">
          {missingRequiredColumns.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-bold">Map these required fields before uploading:</p>
              <p className="mt-1 leading-6">{missingRequiredColumns.join(", ")}</p>
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {datasetColumns.map((column) => (
              <label key={column.key} className="grid gap-1.5 rounded-2xl border border-black/10 bg-[#f7f9f4] p-3 text-sm">
                <span className="font-semibold text-neutral-800">
                  {column.label}
                  {column.required && <span className="text-red-600"> *</span>}
                </span>
                <select
                  value={draft.columnMapping[column.key] ?? ""}
                  onChange={(event) => handleMappingChange(column.key, event.target.value)}
                  className="h-9 min-w-0 rounded-lg border border-black/10 bg-white px-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-3 focus:ring-emerald-100"
                >
                  <option value="">{column.required ? "Select a CSV column" : "Not included"}</option>
                  {draft.csvHeaders.map((header) => (
                    <option key={`${column.key}-${header}`} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-black/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/dataset-upload" className={buttonVariants({ variant: "outline", className: "bg-white" })}>
              <ArrowLeft className="size-4" />
              Back to upload
            </Link>
            <Link
              href="/dataset-upload"
              onClick={() => setSaving(true)}
              className={buttonVariants({
                className: "bg-neutral-950 text-white hover:bg-emerald-800",
              })}
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              Save mapping
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
