import { cn } from "@/lib/utils"

interface LoaderProps {
  size?: "sm" | "md" | "lg"
  variant?: "default" | "primary" | "secondary"
  className?: string
}

export function Loader({ size = "md", variant = "default", className }: LoaderProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  }

  const variantClasses = {
    default: "text-gray-600",
    primary: "text-blue-600",
    secondary: "text-orange-600",
  }

  return (
    <div className={cn("animate-spin", sizeClasses[size], variantClasses[variant], className)}>
      <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="6" width="2.8" height="12" opacity="0">
          <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" begin="0.1" />
        </rect>
        <rect x="6" y="6" width="2.8" height="12" opacity="0">
          <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" begin="0.2" />
        </rect>
        <rect x="11" y="6" width="2.8" height="12" opacity="0">
          <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" begin="0.3" />
        </rect>
        <rect x="16" y="6" width="2.8" height="12" opacity="0">
          <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" begin="0.4" />
        </rect>
        <rect x="21" y="6" width="2.8" height="12" opacity="0">
          <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" begin="0.5" />
        </rect>
      </svg>
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader size="lg" variant="primary" />
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

export function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center space-y-3">
        <Loader size="md" variant="secondary" />
        <p className="text-sm text-muted-foreground">Loading content...</p>
      </div>
    </div>
  )
}

export function ButtonLoader({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <div className="flex items-center gap-2">
      <Loader size={size} variant="default" />
      <span>Loading...</span>
    </div>
  )
}

export function TableLoader() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
          <div className="w-12 h-12 bg-gray-200 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function CardLoader() {
  return (
    <div className="border rounded-lg p-6 space-y-4 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/3" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-4/6" />
      </div>
    </div>
  )
}

