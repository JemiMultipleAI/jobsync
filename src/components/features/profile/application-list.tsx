import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export type Application = {
  id: string
  title: string
  company: string
  location: string
  appliedOn: string
  status: "Under Review" | "Interview" | "Offer" | "Rejected"
}

export function ApplicationList({ data }: { data: Application[] }) {
  const color: Record<Application["status"], string> = {
    "Under Review": "bg-muted text-foreground",
    Interview: "bg-secondary text-secondary-foreground",
    Offer: "bg-green-600 text-white",
    Rejected: "bg-destructive text-destructive-foreground",
  }

  return (
    <Card className="border-0 shadow-sm bg-card/60 backdrop-blur">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.title}</TableCell>
                <TableCell>{row.company}</TableCell>
                <TableCell>{row.location}</TableCell>
                <TableCell className="text-muted-foreground">{row.appliedOn}</TableCell>
                <TableCell className="text-right">
                  <Badge className={color[row.status]}>{row.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
