export type DatasetStatus = "UPLOADED" | "PROCESSING" | "COMPLETED" | "FAILED" | "ARCHIVED"

export type DatasetSummary = {
  datasetId: number
  datasetName: string
  fileName: string
  version: number
  recordCount: number
  uploadedAt: string
  status: DatasetStatus
  active: boolean
  issueCount: number
}

export type ImportIssueSummary = {
  rowNumber: number
  reason: string
}

export type DatasetDetail = DatasetSummary & {
  issues: ImportIssueSummary[]
}

export type DatasetUploadResponse = {
  datasetId: number
  version: number
  status: DatasetStatus
  recordCount: number
  issueCount: number
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

let datasetListCache: DatasetSummary[] | null = null
const datasetDetailCache = new Map<number, DatasetDetail>()

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      cache: "no-store",
    })
    if (!response.ok) {
      const body = await response.json().catch(() => ({ error: "Request failed" }))
      throw new Error(body.error ?? "Request failed")
    }
    if (response.status === 204) {
      return undefined as T
    }
    return response.json()
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Backend is not reachable at ${API_URL}. Start the backend with ./start.sh.`)
    }
    throw error
  }
}

export async function listDatasets(forceRefresh = false) {
  if (!forceRefresh && datasetListCache) {
    return datasetListCache
  }
  datasetListCache = await request<DatasetSummary[]>("/api/datasets")
  return datasetListCache
}

export function getCachedDatasets() {
  return datasetListCache
}

export function getActiveDataset() {
  return request<DatasetSummary>("/api/datasets/active")
}

export async function getDatasetDetails(id: number, forceRefresh = false) {
  if (!forceRefresh) {
    const cached = datasetDetailCache.get(id)
    if (cached) {
      return cached
    }
  }
  const detail = await request<DatasetDetail>(`/api/datasets/${id}`)
  datasetDetailCache.set(id, detail)
  return detail
}

export function getCachedDatasetDetails(id: number) {
  return datasetDetailCache.get(id) ?? null
}

export function clearDatasetCache() {
  datasetListCache = null
  datasetDetailCache.clear()
}

export async function activateDataset(id: number) {
  const activated = await request<DatasetSummary>(`/api/datasets/${id}/activate`, {
    method: "PUT",
  })
  clearDatasetCache()
  return activated
}

export async function deleteDataset(id: number) {
  await request<void>(`/api/datasets/${id}`, {
    method: "DELETE",
  })
  clearDatasetCache()
}

export async function uploadDataset(file: File, columnMapping?: Record<string, string>) {
  const formData = new FormData()
  formData.append("file", file)
  if (columnMapping && Object.keys(columnMapping).length > 0) {
    formData.append("mapping", JSON.stringify(columnMapping))
  }
  const response = await request<DatasetUploadResponse>("/api/datasets/upload", {
    method: "POST",
    body: formData,
  })
  clearDatasetCache()
  return response
}
