"use client"

import { useMemo, useState, type ReactNode } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from "recharts"

import { currency, type DistributionPoint, type MoneyPoint, type TrendPoint } from "@/lib/analytics"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const greenConfig = {
  value: {
    label: "Value",
    color: "#059669",
  },
  revenue: {
    label: "Revenue",
    color: "#047857",
  },
  orders: {
    label: "Orders",
    color: "#34d399",
  },
  secondary: {
    label: "Secondary",
    color: "#064e3b",
  },
} satisfies ChartConfig

const pieColors = ["#064e3b", "#047857", "#059669", "#10b981", "#34d399", "#a7f3d0"]
const barColors = ["#064e3b", "#047857", "#059669", "#10b981", "#34d399"]

export function StatGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div>
}

export function StatCard({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail?: string
}) {
  return (
    <Card className="border-black/10 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-5">
        <div className="mb-4 h-1.5 w-12 rounded-full bg-gradient-to-r from-emerald-900 via-emerald-700 to-emerald-300" />
        <p className="text-sm font-semibold text-neutral-500">{label}</p>
        <p className="mt-3 text-3xl font-bold tracking-tight text-neutral-950">{value}</p>
        {detail && <p className="mt-2 text-sm text-neutral-500">{detail}</p>}
      </CardContent>
    </Card>
  )
}

export function BarChartCard({
  title,
  description,
  data,
  valueFormatter,
}: {
  title: string
  description?: string
  data: Array<DistributionPoint | MoneyPoint>
  valueFormatter?: (value: number) => string
}) {
  return (
    <Card className="border-black/10 bg-white shadow-sm transition duration-300 hover:shadow-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={greenConfig} className="h-[280px] w-full">
          <BarChart accessibilityLayer data={data.slice(0, 10)} margin={{ left: 8, right: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} interval={0} angle={-18} textAnchor="end" height={60} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => valueFormatter?.(Number(value)) ?? String(value)} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" fill="var(--color-value)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function PieChartCard({
  title,
  description,
  data,
}: {
  title: string
  description?: string
  data: DistributionPoint[]
}) {
  return (
    <Card className="border-black/10 bg-white shadow-sm transition duration-300 hover:shadow-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={greenConfig} className="mx-auto h-[260px] w-full max-w-md">
          <PieChart accessibilityLayer>
            <ChartTooltip content={<ChartTooltipContent nameKey="label" />} />
            <Pie data={data} dataKey="value" nameKey="label" innerRadius={62} outerRadius={96} paddingAngle={3}>
              {data.map((entry, index) => (
                <Cell key={entry.label} fill={pieColors[index % pieColors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function DonutActiveChartCard({
  title,
  description,
  data,
  valueFormatter,
}: {
  title: string
  description?: string
  data: Array<DistributionPoint | MoneyPoint>
  valueFormatter?: (value: number) => string
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const visibleData = data.slice(0, 6)
  const activePoint = visibleData[activeIndex] ?? visibleData[0]
  const displayValue = activePoint
    ? valueFormatter?.(activePoint.value) ?? String(activePoint.value)
    : "0"

  return (
    <Card className="border-black/10 bg-white shadow-sm transition duration-300 hover:shadow-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={greenConfig} className="mx-auto h-[300px] w-full max-w-md">
          <PieChart accessibilityLayer>
            <ChartTooltip content={<ChartTooltipContent nameKey="label" />} />
            <Pie
              data={visibleData}
              dataKey="value"
              nameKey="label"
              innerRadius={76}
              outerRadius={112}
              paddingAngle={2}
              onMouseEnter={(_, index) => setActiveIndex(index)}
            >
              {visibleData.map((entry, index) => (
                <Cell
                  key={entry.label}
                  fill={pieColors[index % pieColors.length]}
                  opacity={index === activeIndex ? 1 : 0.82}
                  stroke={index === activeIndex ? "#ecfdf5" : "transparent"}
                  strokeWidth={index === activeIndex ? 4 : 0}
                />
              ))}
            </Pie>
            <text x="50%" y="47%" textAnchor="middle" dominantBaseline="middle" className="fill-neutral-950 text-3xl font-bold">
              {displayValue}
            </text>
            <text x="50%" y="59%" textAnchor="middle" dominantBaseline="middle" className="fill-neutral-500 text-xs">
              {activePoint?.label ?? "No data"}
            </text>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function PieLabelChartCard({
  title,
  description,
  data,
  valueFormatter,
}: {
  title: string
  description?: string
  data: Array<DistributionPoint | MoneyPoint>
  valueFormatter?: (value: number) => string
}) {
  const visibleData = data.slice(0, 6)

  return (
    <Card className="border-black/10 bg-white shadow-sm transition duration-300 hover:shadow-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={greenConfig} className="mx-auto h-[300px] w-full max-w-md">
          <PieChart accessibilityLayer margin={{ top: 20, right: 24, bottom: 20, left: 24 }}>
            <ChartTooltip content={<ChartTooltipContent nameKey="label" />} />
            <Pie
              data={visibleData}
              dataKey="value"
              nameKey="label"
              outerRadius={94}
              labelLine
              label={({ value }) => valueFormatter?.(Number(value)) ?? String(value)}
            >
              {visibleData.map((entry, index) => (
                <Cell key={entry.label} fill={pieColors[index % pieColors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function HorizontalBarChartCard({
  title,
  description,
  data,
  valueFormatter,
}: {
  title: string
  description?: string
  data: Array<DistributionPoint | MoneyPoint>
  valueFormatter?: (value: number) => string
}) {
  const visibleData = useMemo(() => data.slice(0, 8), [data])

  return (
    <Card className="border-black/10 bg-white shadow-sm transition duration-300 hover:shadow-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={greenConfig} className="h-[320px] w-full">
          <BarChart accessibilityLayer data={visibleData} layout="vertical" margin={{ left: 12, right: 24 }}>
            <CartesianGrid horizontal={false} />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => valueFormatter?.(Number(value)) ?? String(value)}
            />
            <YAxis
              dataKey="label"
              type="category"
              tickLine={false}
              axisLine={false}
              width={108}
              tickMargin={8}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" radius={[0, 10, 10, 0]}>
              {visibleData.map((entry, index) => (
                <Cell key={entry.label} fill={barColors[index % barColors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function RadialMetricCard({
  title,
  description,
  value,
  max,
  centerLabel,
}: {
  title: string
  description?: string
  value: number
  max: number
  centerLabel: string
}) {
  const percent = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100))
  const data = [{ name: title, value: percent, fill: "#047857" }]

  return (
    <Card className="border-black/10 bg-white shadow-sm transition duration-300 hover:shadow-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={greenConfig} className="mx-auto h-[230px] w-full max-w-sm">
          <RadialBarChart data={data} startAngle={90} endAngle={-270} innerRadius={78} outerRadius={104}>
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" background cornerRadius={14} />
            <text x="50%" y="47%" textAnchor="middle" dominantBaseline="middle" className="fill-neutral-950 text-3xl font-bold">
              {centerLabel}
            </text>
            <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="fill-neutral-500 text-xs">
              {percent}% of total
            </text>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function AreaTrendChartCard({
  title,
  description,
  data,
}: {
  title: string
  description?: string
  data: TrendPoint[]
}) {
  return (
    <Card className="border-black/10 bg-white shadow-sm transition duration-300 hover:shadow-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={greenConfig} className="h-[320px] w-full">
          <AreaChart accessibilityLayer data={data} margin={{ left: 8, right: 16 }}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#047857" stopOpacity={0.38} />
                <stop offset="95%" stopColor="#047857" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="ordersFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => currency(Number(value))} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area type="monotone" dataKey="revenue" stroke="#047857" fill="url(#revenueFill)" strokeWidth={3} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function TrendChartCard({
  title,
  description,
  data,
  mode = "revenue",
}: {
  title: string
  description?: string
  data: TrendPoint[]
  mode?: "revenue" | "orders"
}) {
  return (
    <Card className="border-black/10 bg-white shadow-sm transition duration-300 hover:shadow-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={greenConfig} className="h-[300px] w-full">
          <LineChart accessibilityLayer data={data} margin={{ left: 8, right: 16 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => mode === "revenue" ? currency(Number(value)) : String(value)} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey={mode}
              stroke={mode === "revenue" ? "var(--color-revenue)" : "var(--color-orders)"}
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function DataTable({
  columns,
  rows,
}: {
  columns: string[]
  rows: Array<Array<ReactNode>>
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
      <div className="grid bg-neutral-950 px-4 py-3 text-xs font-bold uppercase tracking-wide text-white" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
        {columns.map((column) => (
          <span key={column}>{column}</span>
        ))}
      </div>
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="grid items-center border-t border-black/10 px-4 py-3 text-sm transition hover:bg-emerald-50/40"
          style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
        >
          {row.map((cell, cellIndex) => (
            <span key={cellIndex} className="truncate pr-2 text-neutral-700">
              {cell}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}
