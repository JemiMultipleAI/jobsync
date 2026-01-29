"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Define ChartDataInput locally since it's not exported by recharts
type ChartDataInput = Record<string, unknown>;

interface ChartProps {
  title: string;
  description?: string;
  data: ChartDataInput[];
  type: "line" | "bar" | "pie";
  dataKey: string;
  nameKey?: string;
  colors?: string[];
  className?: string;
}

const COLORS = ["#B260E6", "#ED84A5", "#8B5CF6", "#EC4899", "#A855F7"];

export default function AnalyticsChart({
  title,
  description,
  data,
  type,
  dataKey,
  nameKey = "name",
  colors = COLORS,
  className,
}: ChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card
        className={cn(
          "bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 rounded-xl border-border/50 h-full flex flex-col",
          className
        )}
      >
        <CardHeader className="px-6 pt-6">
          <CardTitle className="text-lg font-semibold text-foreground/90">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="mt-1.5">{description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="px-6 pb-6 flex-1 flex flex-col">
          <ResponsiveContainer width="100%" height="100%">
            {type === "line" ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey={nameKey} className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={dataKey}
                  stroke="#B260E6"
                  strokeWidth={2}
                  dot={{ fill: "#B260E6", r: 4 }}
                />
              </LineChart>
            ) : type === "bar" ? (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey={nameKey} className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend />
                <Bar dataKey={dataKey} fill="#B260E6" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (() => {
              // Calculate total for percentage
              const total = data.reduce((sum, item) => sum + (Number(item[dataKey]) || 0), 0);
              
              return (
                <PieChart>
                  <Pie
                    data={data}
                    cx="30%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    fill="#8884d8"
                    dataKey={dataKey}
                    paddingAngle={3}
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={colors[index % colors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                    formatter={(value: number) => {
                      const percent = total > 0 ? ((value / total) * 100).toFixed(0) : '0';
                      return [`${value} (${percent}%)`, ''];
                    }}
                  />
                  <Legend 
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    wrapperStyle={{ paddingLeft: "20px" }}
                    formatter={(value, entry) => {
                      const { payload } = entry as { payload?: Record<string, unknown> };
                      const itemValue = Number(payload?.[dataKey]) || 0;
                      const percent = total > 0 ? ((itemValue / total) * 100).toFixed(0) : '0';
                      return <span className="text-sm text-foreground">{value} ({percent}%)</span>;
                    }}
                  />
                </PieChart>
              );
            })()}
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
