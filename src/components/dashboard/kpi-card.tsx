import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ReactNode } from 'react'

interface KpiCardProps {
  title: string
  value: string | number
  icon: ReactNode
  description?: string
}

export function KpiCard({ title, value, icon, description }: KpiCardProps) {
  return (
    <Card className="border border-border/60 bg-white dark:bg-background shadow-sm hover:shadow-md transition-shadow duration-300 rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium tracking-tight text-muted-foreground">
          {title}
        </CardTitle>
        <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tighter">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/40 block"></span>
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
