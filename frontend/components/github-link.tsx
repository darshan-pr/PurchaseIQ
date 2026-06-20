import { cn } from "@/lib/utils"

const PROJECT_GITHUB_URL = "https://github.com/darshanpr/CPPA"

export function GitHubLink({ className }: { className?: string }) {
  return (
    <a
      href={PROJECT_GITHUB_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Open PurchaseIQ on GitHub"
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-xl border border-black/10 bg-white text-neutral-800 shadow-sm transition hover:bg-neutral-950 hover:text-white",
        className
      )}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current">
        <path d="M12 2C6.48 2 2 6.58 2 12.22c0 4.52 2.87 8.35 6.84 9.7.5.09.68-.22.68-.49v-1.73c-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.56 2.36 1.11 2.94.85.09-.67.35-1.11.63-1.37-2.22-.26-4.55-1.14-4.55-5.05 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.27 9.27 0 0 1 12 5.95c.85 0 1.7.12 2.5.34 1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.92-2.34 4.79-4.57 5.04.36.32.68.94.68 1.9v2.79c0 .27.18.59.69.49A10.15 10.15 0 0 0 22 12.22C22 6.58 17.52 2 12 2Z" />
      </svg>
    </a>
  )
}
