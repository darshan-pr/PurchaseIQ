import { SignInButton } from "@clerk/nextjs"
import { LockKeyhole, Mail, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-180px)] max-w-5xl items-center px-4 py-12 md:px-6">
      <div className="grid w-full gap-8 lg:grid-cols-[0.9fr_1fr]">
        <div className="animate-fade-up space-y-4 self-center">
          <div className="flex size-14 items-center justify-center rounded-3xl bg-neutral-950 text-emerald-300 shadow-sm">
            <Sparkles className="size-6" />
          </div>
          <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight text-neutral-950">
            Welcome back to PurchaseIQ.
          </h1>
          <p className="text-neutral-600">
            Sign in to unlock dashboards, dataset tools, product analytics, customer insights, and purchase trends.
          </p>
        </div>

        <Card className="border-black/10 bg-white shadow-xl shadow-black/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <LockKeyhole className="size-5 text-violet-600" />
              Login
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="size-4 text-emerald-700" />
                Email
              </Label>
              <Input id="email" type="email" placeholder="Handled by Clerk" disabled />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Handled by Clerk" disabled />
            </div>
            <SignInButton>
              <Button className="h-10 w-full bg-neutral-950 text-white shadow-sm hover:bg-emerald-800">
                Continue with Clerk
              </Button>
            </SignInButton>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
