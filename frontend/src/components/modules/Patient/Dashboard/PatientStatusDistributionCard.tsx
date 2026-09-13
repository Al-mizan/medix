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

const STATUS_COLOR_MAP: Record<string, string> = {
    SCHEDULED: "#0B7285", // Info / Clarity Teal
    COMPLETED: "#178A5E", // Success / Vital Emerald
    INPROGRESS: "#E3A130", // Warning / Amber
    CANCELED: "#D8464B", // Danger / Red
};

interface ChartDataItem {
    name: string;
    value: number;
    rawStatus: string;
}

interface PatientStatusDistributionCardProps {
    chartData: ChartDataItem[];
}

export default function PatientStatusDistributionCard({
    chartData,
}: PatientStatusDistributionCardProps) {
    return (
        <Card className="border-[#E3E6EB] bg-white shadow-xs">
            <CardHeader className="pb-2 border-b border-[#E3E6EB]">
                <CardTitle className="text-base font-semibold text-[#101828] flex items-center gap-2">
                    <Activity className="size-4 text-[#0B7285]" />
                    Appointment Status
                </CardTitle>
                <CardDescription className="text-xs text-[#5B6472]">
                    Distribution of your overall appointment history
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
                {chartData.length === 0 || chartData.every((item) => item.value === 0) ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <p className="text-xs text-[#5B6472]">
                            No appointment history available yet.
                        </p>
                    </div>
                ) : (
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={85}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => {
                                        const color =
                                            STATUS_COLOR_MAP[entry.rawStatus] ||
                                            "#5B6472";
                                        return (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={color}
                                                stroke="transparent"
                                            />
                                        );
                                    })}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#FFFFFF",
                                        borderColor: "#E3E6EB",
                                        borderRadius: "8px",
                                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                                        fontSize: "12px",
                                    }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    iconType="circle"
                                    iconSize={8}
                                    wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
