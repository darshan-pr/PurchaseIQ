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

export function listDatasets() {
  return request<DatasetSummary[]>("/api/datasets")
}

export function getActiveDataset() {
  return request<DatasetSummary>("/api/datasets/active")
}

export function getDatasetDetails(id: number) {
  return request<DatasetDetail>(`/api/datasets/${id}`)
}

export function activateDataset(id: number) {
  return request<DatasetSummary>(`/api/datasets/${id}/activate`, {
    method: "PUT",
  })
}

export function deleteDataset(id: number) {
  return request<void>(`/api/datasets/${id}`, {
    method: "DELETE",
  })
}

export function uploadDataset(file: File) {
  const formData = new FormData()
  formData.append("file", file)
  return request<DatasetUploadResponse>("/api/datasets/upload", {
    method: "POST",
    body: formData,
  })
}
