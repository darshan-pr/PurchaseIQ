"use client"

export const datasetColumns = [
  { key: "CustomerID", label: "Customer ID", required: true, aliases: ["customer id", "customer_id", "customerid", "id"] },
  { key: "Age", label: "Age", required: true, aliases: ["age", "customer age"] },
  { key: "Gender", label: "Gender", required: true, aliases: ["gender", "sex"] },
  { key: "Product", label: "Product", required: true, aliases: ["product", "item", "product name", "item name"] },
  { key: "Category", label: "Category", required: true, aliases: ["category", "product category"] },
  { key: "Quantity", label: "Quantity", required: true, aliases: ["quantity", "qty", "units"] },
  { key: "Price", label: "Price", required: true, aliases: ["price", "unit price", "amount"] },
  { key: "PurchaseDate", label: "Purchase date", required: true, aliases: ["purchase date", "purchase_date", "purchasedate", "date", "order date"] },
  { key: "City", label: "City", required: false, aliases: ["city", "location"] },
  { key: "ProductID", label: "Product ID", required: false, aliases: ["product id", "product_id", "productid", "sku"] },
  { key: "OrderID", label: "Order ID", required: false, aliases: ["order id", "order_id", "orderid", "invoice id"] },
]

export type DatasetUploadDraft = {
  file: File | null
  csvHeaders: string[]
  columnMapping: Record<string, string>
}

let draft: DatasetUploadDraft = {
  file: null,
  csvHeaders: [],
  columnMapping: {},
}

export function getDatasetUploadDraft() {
  return draft
}

export function setDatasetUploadDraft(nextDraft: DatasetUploadDraft) {
  draft = nextDraft
}

export function updateDatasetColumnMapping(key: string, value: string) {
  draft = {
    ...draft,
    columnMapping: {
      ...draft.columnMapping,
      [key]: value,
    },
  }
}

export function clearDatasetUploadDraft() {
  draft = {
    file: null,
    csvHeaders: [],
    columnMapping: {},
  }
}

export function missingRequiredDatasetColumns(columnMapping: Record<string, string>) {
  return datasetColumns
    .filter((column) => column.required && !columnMapping[column.key])
    .map((column) => column.label)
}

export function parseCsvLine(line: string) {
  const values: string[] = []
  let current = ""
  let quoted = false

  for (let index = 0; index < line.length; index++) {
    const character = line[index]
    if (character === "\"") {
      if (quoted && line[index + 1] === "\"") {
        current += "\""
        index++
      } else {
        quoted = !quoted
      }
    } else if (character === "," && !quoted) {
      values.push(current.trim())
      current = ""
    } else {
      current += character
    }
  }
  values.push(current.trim())
  return values.filter(Boolean)
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, " ")
}

export function autoMapColumns(headers: string[]) {
  const normalizedHeaders = new Map(headers.map((header) => [normalizeHeader(header), header]))
  return Object.fromEntries(
    datasetColumns.map((column) => {
      const match = column.aliases.map(normalizeHeader).find((alias) => normalizedHeaders.has(alias))
      return [column.key, match ? normalizedHeaders.get(match) ?? "" : ""]
    })
  )
}
