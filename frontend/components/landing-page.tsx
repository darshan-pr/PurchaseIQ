import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Database,
  LockKeyhole,
  ScanLine,
  ShieldCheck,
  ShoppingCart,
  TrendingUp,
  UsersRound,
} from "lucide-react"
import { SignUpButton } from "@clerk/nextjs"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const capabilities = [
  {
    title: "Customer analytics",
    description: "Segment customers by spend, frequency, age, gender, and purchase behavior.",
    icon: UsersRound,
  },
  {
    title: "Product performance",
    description: "Track top products, category revenue, and buyer patterns in one workspace.",
    icon: ShoppingCart,
  },
  {
    title: "CSV workflow",
    description: "Upload, process, reprocess, and validate datasets before analysis.",
    icon: Database,
  },
]

const dashboardStats = [
  { label: "Customers", value: "12,480" },
  { label: "Orders", value: "38,210" },
  { label: "Revenue", value: "$1.24M" },
]

const workflow = ["Upload data", "Clean records", "Analyze behavior", "Export insight"]

export function LandingPage() {
  return (
    <>
      <section className="mx-auto grid min-h-[calc(100vh-164px)] max-w-7xl items-center gap-12 px-4 py-16 md:px-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="animate-fade-up space-y-8">
          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-800" variant="outline">
            Customer purchase pattern analysis
          </Badge>

          <div className="space-y-5">
            <h1 className="max-w-4xl font-heading text-5xl font-extrabold leading-[1.02] tracking-tight text-neutral-950 md:text-7xl">
              Make purchase data easier to read, compare, and explain.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-neutral-600">
              PurchaseIQ is a focused analytics workspace for customer, product, and sales
              pattern analysis. Clean dashboards, protected access, and project-ready insight pages.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <SignUpButton>
              <Button className="h-11 bg-neutral-950 px-5 text-white shadow-sm hover:bg-emerald-800">
                Start analyzing
                <ArrowRight className="size-4" />
              </Button>
            </SignUpButton>
            <a href="#features">
              <Button variant="outline" className="h-11 border-black/15 bg-white px-5 text-neutral-900 hover:bg-neutral-100">
                Explore modules
              </Button>
            </a>
          </div>

          <div className="grid max-w-xl gap-3 text-sm text-neutral-600 sm:grid-cols-3">
            {["Clerk authentication", "CSV-ready flow", "9 planned pages"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-700" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="animate-fade-up rounded-[2rem] border border-black/10 bg-white p-3 shadow-2xl shadow-black/10">
          <div className="rounded-[1.45rem] bg-neutral-950 p-5 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-sm font-semibold text-emerald-300">PurchaseIQ Dashboard</p>
                <p className="mt-1 text-xs text-white/50">Business overview</p>
              </div>
              <BarChart3 className="size-5 text-emerald-300" />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {dashboardStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-xs text-white/50">{stat.label}</p>
                  <p className="mt-2 text-2xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_0.8fr]">
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                <div className="mb-5 flex items-center justify-between">
                  <p className="text-sm font-semibold">Revenue trend</p>
                  <TrendingUp className="size-4 text-emerald-300" />
                </div>
                <div className="flex h-44 items-end gap-2">
                  {[44, 52, 48, 64, 58, 76, 71, 88, 82, 94].map((height) => (
                    <div key={height} className="flex-1 rounded-t bg-emerald-400/90" style={{ height: `${height}%` }} />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {["Top category", "Repeat buyers", "Average order"].map((item, index) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                    <p className="text-xs text-white/50">{item}</p>
                    <p className="mt-2 font-semibold">{["Electronics", "64%", "$84.20"][index]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">Modules</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-neutral-950">
            Everything arranged for a clean analysis workflow.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {capabilities.map((feature) => (
            <Card key={feature.title} className="group border-black/10 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-5 flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100 transition group-hover:bg-emerald-700 group-hover:text-white">
                  <feature.icon className="size-5" />
                </div>
                <h3 className="text-lg font-bold text-neutral-950">{feature.title}</h3>
                <p className="mt-2 leading-7 text-neutral-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="workflow" className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm md:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1fr]">
            <div>
              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-800" variant="outline">
                Workflow
              </Badge>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-neutral-950">
                A practical flow from dataset to dashboard.
              </h2>
              <p className="mt-3 leading-7 text-neutral-600">
                The structure keeps the college project simple to explain while still looking like
                a real analytics product.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {workflow.map((step, index) => (
                <div key={step} className="rounded-2xl border border-black/10 bg-[#f7f9f4] p-5">
                  <p className="text-sm font-bold text-emerald-700">0{index + 1}</p>
                  <p className="mt-2 font-semibold text-neutral-950">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="security" className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid gap-4 rounded-[2rem] bg-neutral-950 p-6 text-white md:grid-cols-[1fr_auto] md:items-center md:p-8">
          <div className="flex gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500 text-neutral-950">
              <LockKeyhole className="size-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Protected analytics by default</h2>
              <p className="mt-2 max-w-2xl text-white/65">
                The landing page stays public. Dashboard, datasets, customer, product, and purchase
                analytics stay hidden until Clerk authentication succeeds.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
            <ShieldCheck className="size-4" />
            Secure route protection
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="rounded-[2rem] border border-emerald-900/10 bg-emerald-800 p-8 text-white">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <ScanLine className="mb-4 size-7 text-emerald-200" />
              <h2 className="text-3xl font-bold tracking-tight">Ready to inspect your purchase data?</h2>
              <p className="mt-2 text-emerald-50/80">Create an account and start with the dashboard shell.</p>
            </div>
            <SignUpButton>
              <Button className="bg-white text-emerald-900 hover:bg-emerald-50">Create account</Button>
            </SignUpButton>
          </div>
        </div>
      </section>
    </>
  )
}
