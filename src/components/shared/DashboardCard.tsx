"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export default function DashboardCard({
  title,
  description,
  children,
  action,
  className,
}: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ pointerEvents: 'auto' }}
    >
      <Card
        className={cn(
          "bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 rounded-xl border-border/50",
          className
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-6 pt-6">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground/90">
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="mt-1.5 text-sm">
                {description}
              </CardDescription>
            )}
          </div>
          {action && <div>{action}</div>}
        </CardHeader>
        <CardContent className="px-6 pb-6" style={{ pointerEvents: 'auto' }}>{children}</CardContent>
      </Card>
    </motion.div>
  );
}
