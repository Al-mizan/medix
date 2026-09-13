"use client"

import StatsCard from "@/components/shared/StatsCard"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getMyAppointments } from "@/services/appointment.services"
import { getDoctorDashboardData } from "@/services/dashboard.services"
import { ApiResponse } from "@/types/api.types"
import { IAppointment } from "@/types/appointment.types"
import { IDoctorDashboardData } from "@/types/dashboard.types"
import { useQuery } from "@tanstack/react-query"
import { format, isToday } from "date-fns"
import {
  Activity,
  ArrowRight,
  CalendarCheck,
  Clock,
  ExternalLink,
  Users,
  Video,
} from "lucide-react"
import Link from "next/link"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "#0B7285", // Clarity Teal
  INPROGRESS: "#E3A130", // Warning Amber
  COMPLETED: "#178A5E", // Success Green
  CANCELED: "#D8464B", // Danger Red
}

const getStatusBadgeClass = (status?: string) => {
  switch (status) {
    case "SCHEDULED":
      return "border-[#0B7285]/30 bg-[#0B7285]/10 text-[#0B7285] dark:bg-[#0B7285]/20"
    case "INPROGRESS":
      return "border-[#E3A130]/30 bg-[#E3A130]/10 text-[#B87A14] dark:text-[#E3A130] dark:bg-[#E3A130]/20"
    case "COMPLETED":
      return "border-[#178A5E]/30 bg-[#178A5E]/10 text-[#178A5E] dark:bg-[#178A5E]/20"
    case "CANCELED":
      return "border-[#D8464B]/30 bg-[#D8464B]/10 text-[#D8464B] dark:bg-[#D8464B]/20"
    default:
      return "border-muted bg-muted/40 text-muted-foreground"
  }
}

const formatStatus = (status: string) => {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const getInitials = (name?: string) => {
  if (!name) return "PT"
  const parts = name.trim().split(" ")
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const DoctorDashboardContent = () => {
  const { data: statsResponse } = useQuery({
    queryKey: ["doctor-dashboard-data"],
    queryFn: getDoctorDashboardData,
    refetchOnWindowFocus: "always",
  })

  const { data: appointmentsResponse } = useQuery({
    queryKey: ["my-appointments"],
    queryFn: () => getMyAppointments(),
    refetchOnWindowFocus: "always",
  })

  const stats = (statsResponse as ApiResponse<IDoctorDashboardData>)?.data
  const appointments = (appointmentsResponse as ApiResponse<IAppointment[]>)?.data ?? []

  // Filter today's appointments
  const todayAppointments = appointments
    .filter((apt) => {
      if (!apt.schedule?.startDateTime) return false
      const startDate = new Date(apt.schedule.startDateTime)
      return !Number.isNaN(startDate.getTime()) && isToday(startDate)
    })
    .sort((a, b) => {
      const timeA = new Date(a.schedule?.startDateTime ?? 0).getTime()
      const timeB = new Date(b.schedule?.startDateTime ?? 0).getTime()
      return timeA - timeB
    })

  // Format distribution data for Donut Chart
  const distributionData = (stats?.appointmentStatusDistribution ?? []).map((item) => ({
    name: formatStatus(item.status),
    status: item.status,
    value: Number(item.count),
    color: STATUS_COLORS[item.status] ?? "#8A93A3",
  }))

  const totalDistributionCount = distributionData.reduce((acc, curr) => acc + curr.value, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Doctor Console
          </h1>
          <p className="text-sm text-muted-foreground">
            Clinical overview, today&apos;s consultations, and practice analytics.
          </p>
        </div>
        <div className="flex items-center gap-2 pt-2 sm:pt-0">
          <Button asChild variant="outline" size="sm" className="border-[#0B7285]/30 hover:bg-[#0B7285]/10">
            <Link href="/doctor/dashboard/appointments">
              <CalendarCheck className="mr-2 size-4 text-[#0B7285]" />
              Manage Appointments
            </Link>
          </Button>
          <Button asChild size="sm" className="bg-[#0B7285] text-white hover:bg-[#095E70]">
            <Link href="/doctor/dashboard/prescriptions">
              Prescriptions
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Patients"
          value={stats?.patientCount ?? 0}
          iconName="Users"
          description="Unique patients consulted"
          className="border-neutral-200 shadow-sm dark:border-neutral-800"
        />
        <StatsCard
          title="Total Appointments"
          value={stats?.appointmentCount ?? 0}
          iconName="CalendarDays"
          description="Lifetime scheduled appointments"
          className="border-neutral-200 shadow-sm dark:border-neutral-800"
        />
        <StatsCard
          title="Patient Reviews"
          value={stats?.reviewCount ?? 0}
          iconName="Star"
          description="Total patient feedbacks received"
          className="border-neutral-200 shadow-sm dark:border-neutral-800"
        />
        <StatsCard
          title="Total Revenue"
          value={`$${(stats?.totalRevenue ?? 0).toLocaleString()}`}
          iconName="DollarSign"
          description="Earnings from completed consultations"
          className="border-neutral-200 shadow-sm dark:border-neutral-800"
        />
      </div>

      {/* Main Grid: Today's Appointments & Distribution Chart */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Today's Appointments (4 cols) */}
        <Card className="border-neutral-200 shadow-sm lg:col-span-4 dark:border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="space-y-0.5">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Clock className="size-4 text-[#0B7285]" />
                Today&apos;s Appointments
              </CardTitle>
              <CardDescription>
                {todayAppointments.length} appointment{todayAppointments.length === 1 ? "" : "s"} scheduled for today
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs text-[#0B7285] hover:bg-[#0B7285]/10">
              <Link href="/doctor/dashboard/appointments">
                View all
                <ArrowRight className="ml-1 size-3.5" />
              </Link>
            </Button>
          </CardHeader>

          <CardContent className="space-y-3">
            {todayAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 py-12 text-center dark:border-neutral-800">
                <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-[#0B7285]/10 text-[#0B7285]">
                  <CalendarCheck className="size-6" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">No appointments today</h3>
                <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                  You have no consultations scheduled for today. Review your upcoming schedule or view all appointments.
                </p>
                <Button asChild variant="outline" size="sm" className="mt-4 border-[#0B7285]/30 text-xs hover:bg-[#0B7285]/10">
                  <Link href="/doctor/dashboard/appointments">View Schedule</Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {todayAppointments.map((appointment) => {
                  const patient = appointment.patient
                  const schedule = appointment.schedule
                  const startTime = schedule?.startDateTime
                    ? format(new Date(schedule.startDateTime), "hh:mm a")
                    : "N/A"
                  const endTime = schedule?.endDateTime
                    ? format(new Date(schedule.endDateTime), "hh:mm a")
                    : "N/A"
                  const isScheduled = appointment.status === "SCHEDULED"
                  const isInProgress = appointment.status === "INPROGRESS"

                  return (
                    <div
                      key={appointment.id}
                      className="flex flex-col gap-3 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10 border border-neutral-200 dark:border-neutral-700">
                          {patient?.profilePhoto && (
                            <AvatarImage src={patient.profilePhoto} alt={patient?.name ?? "Patient"} />
                          )}
                          <AvatarFallback className="bg-[#0B7285]/10 text-xs font-semibold text-[#0B7285]">
                            {getInitials(patient?.name)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="space-y-0.5">
                          <p className="text-sm font-medium text-foreground">{patient?.name ?? "Patient"}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="size-3 text-[#0B7285]" />
                              {startTime} - {endTime}
                            </span>
                            {patient?.contactNumber && (
                              <>
                                <span>•</span>
                                <span>{patient.contactNumber}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`rounded-md px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(appointment.status)}`}
                        >
                          {appointment.status ?? "SCHEDULED"}
                        </Badge>

                        {(isScheduled || isInProgress) && (
                          <Button
                            asChild
                            size="sm"
                            variant={isInProgress ? "default" : "outline"}
                            className={
                              isInProgress
                                ? "h-8 bg-[#E3A130] px-3 text-xs text-white hover:bg-[#B87A14]"
                                : "h-8 border-[#0B7285]/40 px-3 text-xs text-[#0B7285] hover:bg-[#0B7285]/10"
                            }
                          >
                            <Link href={`/consultation/doctor/${appointment.id}`}>
                              <Video className="mr-1.5 size-3.5" />
                              {isInProgress ? "Resume Call" : "Join Call"}
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Distribution Donut Chart (3 cols) */}
        <Card className="border-neutral-200 shadow-sm lg:col-span-3 dark:border-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Activity className="size-4 text-[#0B7285]" />
              Status Distribution
            </CardTitle>
            <CardDescription>Breakdown of all consultation statuses</CardDescription>
          </CardHeader>

          <CardContent>
            {distributionData.length === 0 || totalDistributionCount === 0 ? (
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
                          <Cell key={`cell-${entry.name}`} fill={entry.color} stroke="transparent" />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload as (typeof distributionData)[0]
                            const percentage = totalDistributionCount
                              ? Math.round((data.value / totalDistributionCount) * 100)
                              : 0
                            return (
                              <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="size-2 rounded-full"
                                    style={{ backgroundColor: data.color }}
                                  />
                                  <span className="font-semibold text-popover-foreground">{data.name}:</span>
                                  <span className="text-muted-foreground">
                                    {data.value} ({percentage}%)
                                  </span>
                                </div>
                              </div>
                            )
                          }
                          return null
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
                  {/* Center Metric */}
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-8">
                    <span className="text-2xl font-bold tracking-tight text-foreground">
                      {totalDistributionCount}
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground">Total</span>
                  </div>
                </div>

                {/* Quick distribution stats list */}
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
                      <span className="font-semibold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Footer Banner */}
      <Card className="border-neutral-200 bg-gradient-to-r from-[#0B7285]/5 via-transparent to-transparent shadow-sm dark:border-neutral-800">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-foreground">Have completed consultations?</h4>
            <p className="text-xs text-muted-foreground">
              Generate electronic prescriptions with medication regimens and direct PDF downloads for your patients.
            </p>
          </div>
          <Button asChild size="sm" className="bg-[#0B7285] text-white hover:bg-[#095E70] shrink-0">
            <Link href="/doctor/dashboard/prescriptions">
              Create Prescription
              <ExternalLink className="ml-1.5 size-3.5" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default DoctorDashboardContent
