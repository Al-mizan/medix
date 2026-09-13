"use client";

import { Activity } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "#0B7285", // Clarity Teal
  INPROGRESS: "#E3A130", // Warning Amber
  COMPLETED: "#178A5E", // Success Green
  CANCELED: "#D8464B", // Danger Red
};

const formatStatus = (status: string) => {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

interface DistributionItem {
  status: string;
  count: number | string;
}

interface DoctorAppointmentStatusDonutProps {
  distribution?: DistributionItem[];
}

export default function DoctorAppointmentStatusDonut({
  distribution = [],
}: DoctorAppointmentStatusDonutProps) {
  const distributionData = distribution.map((item) => ({
    name: formatStatus(item.status),
    status: item.status,
    value: Number(item.count),
    color: STATUS_COLORS[item.status] ?? "#8A93A3",
  }));

  const totalCount = distributionData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Card className="border-neutral-200 shadow-sm lg:col-span-3 dark:border-neutral-800">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Activity className="size-4 text-[#0B7285]" />
          Status Distribution
        </CardTitle>
        <CardDescription>
          Breakdown of all consultation statuses
        </CardDescription>
      </CardHeader>

      <CardContent>
        {distributionData.length === 0 || totalCount === 0 ? (
          <div className="flex h-64 items-center justify-center text-center text-xs text-muted-foreground">
            No appointment data available yet.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {distributionData.map((entry) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={entry.color}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0]
                          .payload as (typeof distributionData)[0];
                        const percentage = totalCount
                          ? Math.round((data.value / totalCount) * 100)
                          : 0;
                        return (
                          <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
                            <div className="flex items-center gap-2">
                              <span
                                className="size-2 rounded-full"
                                style={{ backgroundColor: data.color }}
                              />
                              <span className="font-semibold text-popover-foreground">
                                {data.name}:
                              </span>
                              <span className="text-muted-foreground">
                                {data.value} ({percentage}%)
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-8">
                <span className="text-2xl font-bold tracking-tight text-foreground">
                  {totalCount}
                </span>
                <span className="text-[11px] font-medium text-muted-foreground">
                  Total
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100 text-xs dark:border-neutral-800">
              {distributionData.map((item) => (
                <div
                  key={item.status}
                  className="flex items-center justify-between rounded-md bg-neutral-50 px-2.5 py-1.5 dark:bg-neutral-900/50"
                >
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.name}
                  </span>
                  <span className="font-semibold text-foreground">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
