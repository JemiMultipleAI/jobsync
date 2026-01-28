"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

type ProfileHeaderProps = {
  name: string
  title: string
  location: string
  experience: string
  avatarUrl?: string
  skills: string[]
}

export function ProfileHeader({ name, title, location, experience, avatarUrl, skills }: ProfileHeaderProps) {
  return (
    <Card className="border-0 shadow-sm bg-card/60 backdrop-blur">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <Avatar className="h-20 w-20 ring-2 ring-primary/10">
            <AvatarImage src={avatarUrl || ""} alt={`${name} avatar`} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-1">
            <h2 className="text-2xl font-bold text-pretty">{name}</h2>
            <p className="text-muted-foreground">
              {title} • {location}
            </p>
            <p className="text-sm text-muted-foreground">Experience: {experience}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              {skills.map((s) => (
                <Badge key={s} variant="secondary" className="bg-muted text-foreground">
                  {s}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline">Edit Profile</Button>
            <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
              Download CV
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
