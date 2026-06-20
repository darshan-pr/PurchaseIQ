import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Database,
  ScanLine,
  ShoppingCart,
  TrendingUp,
  UsersRound,
} from "lucide-react"
import Link from "next/link"
import { Show, SignUpButton } from "@clerk/nextjs"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { GitHubLink } from "./github-link"

const capabilities = [
  {
    title: "Customer analytics",
    description: "Segment customers by spend, frequency, age, gender, and purchase behavior.",
    icon: UsersRound,
    accent: "emerald" as const,
  },
  {
    title: "Product performance",
    description: "Track top products, category revenue, and buyer patterns in one workspace.",
    icon: ShoppingCart,
    accent: "sky" as const,
  },
  {
    title: "CSV workflow",
    description: "Upload, process, reprocess, and validate datasets before analysis.",
    icon: Database,
    accent: "amber" as const,
  },
]

const accentStyles = {
  emerald: {
    chip: "bg-emerald-50 text-emerald-800 ring-emerald-100 group-hover:bg-emerald-700 group-hover:text-white",
    dot: "bg-emerald-400",
    rule: "from-emerald-300",
  },
  sky: {
    chip: "bg-sky-50 text-sky-800 ring-sky-100 group-hover:bg-sky-700 group-hover:text-white",
    dot: "bg-sky-400",
    rule: "from-sky-300",
  },
  amber: {
    chip: "bg-amber-50 text-amber-800 ring-amber-100 group-hover:bg-amber-700 group-hover:text-white",
    dot: "bg-amber-400",
    rule: "from-amber-300",
  },
}

const dashboardStats = [
  { label: "Customers", value: "12,480", accent: "emerald" as const },
  { label: "Orders", value: "38,210", accent: "sky" as const },
  { label: "Revenue", value: "$1.24M", accent: "amber" as const },
]

const workflow = ["Upload data", "Clean records", "Analyze behavior", "Export insight"]

export function LandingPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(16,24,16,0.07) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
            maskImage: "linear-gradient(to bottom, black, transparent 85%)",
          }}
        />
        <div aria-hidden className="pointer-events-none absolute -left-24 -top-32 -z-10 size-[28rem] rounded-full bg-emerald-200/50 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute right-0 top-10 -z-10 size-72 rounded-full bg-sky-200/40 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute right-1/3 bottom-0 -z-10 size-64 rounded-full bg-amber-200/30 blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-start gap-12 px-4 pt-12 pb-16 md:px-6 md:pt-16 md:pb-20 lg:grid-cols-[0.95fr_1.05fr] lg:pt-20 lg:pb-24">
          <div className="animate-fade-up space-y-7">
            
            <div className="space-y-5">
              <h1 className="max-w-xl font-heading text-4xl font-extrabold leading-[1.08] tracking-tight text-neutral-950 md:text-5xl lg:text-6xl">
                Make purchase data
                <br />
                <span className="text-neutral-400">easier to read, compare,</span>
                <br />
                and{" "}
                <span className="relative inline-block">
                  explain.
                  <svg
                    aria-hidden
                    viewBox="0 0 220 18"
                    className="absolute -bottom-1 left-0 h-3 w-full text-emerald-400"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M2 13C45 4 95 2 130 7C160 11 190 13 218 6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>
              <p className="max-w-lg text-base leading-7 text-neutral-600 md:text-lg">
                PurchaseIQ is a focused analytics workspace for customer, product, and sales
                pattern analysis. Upload CSV datasets, switch versions, and present clear insights
                from one project-ready dashboard.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Show when="signed-in">
                <Link
                  href="/"
                  className={buttonVariants({
                    className: "h-11 bg-neutral-950 px-5 text-white shadow-sm hover:bg-emerald-800",
                  })}
                >
                  Start analyzing
                  <ArrowRight className="size-4" />
                </Link>
              </Show>
              <Show when="signed-out">
                <SignUpButton>
                  <Button className="h-11 bg-neutral-950 px-5 text-white shadow-sm hover:bg-emerald-800">
                    Start analyzing
                    <ArrowRight className="size-4" />
                  </Button>
                </SignUpButton>
              </Show>
              <a href="#features">
                <Button variant="outline" className="h-11 border-black/15 bg-white px-5 text-neutral-900 hover:bg-neutral-100">
                  Explore modules
                </Button>
              </a>
              <GitHubLink className="h-11 w-11" />
            </div>

            <div className="flex max-w-xl flex-wrap gap-2 pt-1">
              {["CSV-ready flow", "Versioned datasets", "Insight dashboards"].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/80 px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-sm backdrop-blur"
                >
                  <CheckCircle2 className="size-3.5 text-emerald-700" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="animate-fade-up relative lg:pt-4">
            <div
              aria-hidden
              className="absolute -right-4 -top-6 hidden -rotate-6 rounded-[2rem] border border-black/10 bg-white/70 p-3 shadow-lg lg:block"
              style={{ width: "85%" }}
            >
              <div className="h-40 rounded-[1.45rem] bg-neutral-950/90" />
            </div>

            <div className="relative rounded-[2rem] border border-black/10 bg-white p-3 shadow-2xl shadow-black/10">
              

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
                    <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 transition hover:bg-white/[0.09]">
                      <p className="flex items-center gap-1.5 text-xs text-white/50">
                        <span className={`size-1.5 rounded-full ${accentStyles[stat.accent].dot}`} />
                        {stat.label}
                      </p>
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
                      {[44, 52, 48, 64, 58, 76, 71, 88, 82, 94].map((height, index) => (
                        <div
                          key={`${height}-${index}`}
                          className="flex-1 rounded-t bg-gradient-to-t from-emerald-500 to-emerald-300"
                          style={{ height: `${height}%` }}
                        />
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
          </div>
        </div>
      </section>

      <section id="features" className="relative mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="mb-9 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">Modules</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-neutral-950">
              Everything arranged for a clean analysis workflow.
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-6 text-neutral-500">
            Three workspaces, one dataset — switch between them without losing context.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {capabilities.map((feature) => (
            <Card
              key={feature.title}
              className="group relative overflow-hidden border-black/10 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentStyles[feature.accent].rule} to-transparent`} />
              <CardContent className="p-6">
                <div
                  className={`mb-5 flex size-11 items-center justify-center rounded-2xl ring-1 transition ${accentStyles[feature.accent].chip}`}
                >
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
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1fr] lg:items-start">
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

            <div className="relative pt-2">
              <div className="absolute left-[22px] top-3 bottom-3 w-px bg-gradient-to-b from-emerald-200 via-emerald-200 to-transparent sm:left-0 sm:right-0 sm:top-[22px] sm:bottom-auto sm:h-px sm:w-auto sm:bg-gradient-to-r" />
              <div className="grid gap-6 sm:grid-cols-4">
                {workflow.map((step, index) => (
                  <div key={step} className="relative flex items-center gap-3 sm:flex-col sm:items-center sm:gap-3 sm:text-center">
                    <div className="z-10 flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-emerald-600 bg-white text-sm font-bold text-emerald-700">
                      0{index + 1}
                    </div>
                    <p className="font-semibold text-neutral-950">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="datasets" className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-neutral-950 p-6 text-white md:p-8">
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-16 size-56 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="relative grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-neutral-950">
                <Database className="size-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Dataset versions stay easy to compare</h2>
                <p className="mt-2 max-w-2xl text-white/65">
                  Upload a new CSV, map its columns, make it active, or switch back to a previous
                  version when you need to compare historical analysis.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
              <CheckCircle2 className="size-4" />
              Active dataset control
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="relative overflow-hidden rounded-[2rem] border border-emerald-900/10 bg-emerald-800 p-8 text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
              maskImage: "radial-gradient(circle at 80% 20%, black, transparent 70%)",
            }}
          />
          <div aria-hidden className="absolute -right-16 -top-16 size-56 rounded-full bg-emerald-500/30 blur-3xl" />
          <div aria-hidden className="absolute -bottom-20 left-1/3 size-56 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <ScanLine className="mb-4 size-7 text-emerald-200" />
              <h2 className="text-3xl font-bold tracking-tight">Ready to inspect your purchase data?</h2>
              <p className="mt-2 text-emerald-50/80">Create an account and start with the dashboard shell.</p>
            </div>
            <Show when="signed-in">
              <Link
                href="/"
                className={buttonVariants({
                  className: "bg-white text-emerald-900 hover:bg-emerald-50",
                })}
              >
                Open dashboard
              </Link>
            </Show>
            <Show when="signed-out">
              <SignUpButton>
                <Button className="bg-white text-emerald-900 hover:bg-emerald-50">Create account</Button>
              </SignUpButton>
            </Show>
          </div>
        </div>
      </section>
    </>
  )
}