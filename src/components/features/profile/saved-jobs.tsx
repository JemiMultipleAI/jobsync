import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export type SavedJob = {
  id: string
  title: string
  company: string
  location: string
  type: "Full-time" | "Part-time" | "Contract"
}

export function SavedJobs({ jobs }: { jobs: SavedJob[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {jobs.map((j) => (
        <Card key={j.id} className="border-0 shadow-sm bg-card/60 backdrop-blur">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{j.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {j.company} • {j.location}
                </p>
              </div>
              <Badge variant="secondary" className="bg-muted text-foreground">
                {j.type}
              </Badge>
            </div>
            <Button size="sm" className="w-full">
              Apply
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
