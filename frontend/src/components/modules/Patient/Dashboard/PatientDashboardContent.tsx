"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import {
    Activity,
    AlertTriangle,
    ArrowRight,
    Calendar,
    CalendarCheck,
    CalendarClock,
    CalendarPlus,
    CheckCircle2,
    CreditCard,
    FileText,
    HeartPulse,
    Loader2,
    Pill,
    ShieldAlert,
    Stethoscope,
    User,
} from "lucide-react";
import {
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import { toast } from "sonner";

import { initiateAppointmentPaymentAction } from "@/app/_actions/appointment.actions";
import StatsCard from "@/components/shared/StatsCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { getMyAppointments } from "@/services/appointment.services";
import { getDashboardData } from "@/services/dashboard.services";
import { getMyPatientProfile } from "@/services/patient.services";
import { getMyPrescriptions } from "@/services/prescription.services";
import { ApiResponse } from "@/types/api.types";
import { IAppointment } from "@/types/appointment.types";
import { IPatientDashboardData } from "@/types/dashboard.types";
import { IPatientProfile } from "@/types/patient.types";
import { IPrescription } from "@/types/prescription.types";

const STATUS_COLOR_MAP: Record<string, string> = {
    SCHEDULED: "#0B7285", // Info / Clarity Teal
    COMPLETED: "#178A5E", // Success / Vital Emerald
    INPROGRESS: "#E3A130", // Warning / Amber
    CANCELED: "#D8464B", // Danger / Red
};

const formatBloodGroup = (bg?: string | null) => {
    if (!bg) return "Not specified";
    return bg
        .replace("_POSITIVE", "+")
        .replace("_NEGATIVE", "-");
};

export default function PatientDashboardContent() {
    const [payingAppointmentId, setPayingAppointmentId] = useState<string | null>(null);

    // Queries
    const { data: statsResponse } = useQuery({
        queryKey: ["patient-dashboard-stats"],
        queryFn: () => getDashboardData(),
        staleTime: 30 * 1000,
    });

    const { data: appointmentsResponse } = useQuery({
        queryKey: ["my-appointments"],
        queryFn: () => getMyAppointments(),
        staleTime: 30 * 1000,
    });

    const { data: prescriptionsResponse } = useQuery({
        queryKey: ["my-prescriptions"],
        queryFn: () => getMyPrescriptions(),
        staleTime: 30 * 1000,
    });

    const { data: profileResponse } = useQuery({
        queryKey: ["my-patient-profile"],
        queryFn: () => getMyPatientProfile(),
        staleTime: 30 * 1000,
    });

    const appointments: IAppointment[] = useMemo(() => {
        return ((appointmentsResponse as ApiResponse<IAppointment[]> | undefined)?.data) || [];
    }, [appointmentsResponse]);

    const prescriptions: IPrescription[] = useMemo(() => {
        return ((prescriptionsResponse as ApiResponse<IPrescription[]> | undefined)?.data) || [];
    }, [prescriptionsResponse]);

    const profile: IPatientProfile | null = useMemo(() => {
        return ((profileResponse as ApiResponse<IPatientProfile> | undefined)?.data) || null;
    }, [profileResponse]);

    const statsData: Partial<IPatientDashboardData> = useMemo(() => {
        return ((statsResponse as ApiResponse<IPatientDashboardData> | undefined)?.data) || {};
    }, [statsResponse]);

    // Computed Stats
    const totalAppointments = appointments.length || statsData.appointmentCount || 0;
    const upcomingAppointments = useMemo(() => {
        return appointments
            .filter((a) => a.status === "SCHEDULED")
            .sort((a, b) => {
                const dateA = new Date(a.schedule?.startDateTime || a.createdAt || 0).getTime();
                const dateB = new Date(b.schedule?.startDateTime || b.createdAt || 0).getTime();
                return dateA - dateB;
            });
    }, [appointments]);

    const completedAppointments = useMemo(() => {
        return appointments.filter((a) => a.status === "COMPLETED");
    }, [appointments]);

    const totalPrescriptions = prescriptions.length;

    // Next 3-5 upcoming appointments
    const nextAppointments = useMemo(() => {
        return upcomingAppointments.slice(0, 5);
    }, [upcomingAppointments]);

    // Last 3 prescriptions
    const recentPrescriptions = useMemo(() => {
        return [...prescriptions]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3);
    }, [prescriptions]);

    // Chart distribution
    const chartData = useMemo(() => {
        if (statsData.appointmentStatusDistribution && statsData.appointmentStatusDistribution.length > 0) {
            return statsData.appointmentStatusDistribution.map((item) => ({
                name: item.status
                    .replace(/_/g, " ")
                    .toLowerCase()
                    .replace(/\b\w/g, (char) => char.toUpperCase()),
                rawStatus: item.status,
                value: Number(item.count),
            }));
        }

        // Fallback: derive from appointments array if stats didn't return grouped data
        const counts: Record<string, number> = {};
        appointments.forEach((appt) => {
            const status = appt.status || "SCHEDULED";
            counts[status] = (counts[status] || 0) + 1;
        });

        return Object.entries(counts).map(([status, count]) => ({
            name: status
                .replace(/_/g, " ")
                .toLowerCase()
                .replace(/\b\w/g, (char) => char.toUpperCase()),
            rawStatus: status,
            value: count,
        }));
    }, [statsData.appointmentStatusDistribution, appointments]);

    const handlePayNow = async (appointmentId: string) => {
        try {
            setPayingAppointmentId(appointmentId);
            const result = await initiateAppointmentPaymentAction(appointmentId);

            if (!result.success) {
                toast.error(result.message || "Failed to initiate payment");
                return;
            }

            if (!result.data.paymentUrl) {
                toast.error("Payment checkout URL was not generated. Please try again.");
                return;
            }

            window.location.assign(result.data.paymentUrl);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Payment initiation failed";
            toast.error(message);
        } finally {
            setPayingAppointmentId(null);
        }
    };

    const healthData = profile?.patientHealthData;

    return (
        <div className="space-y-8 p-4 md:p-8 bg-[#F7F8FA] min-h-screen">
            {/* Welcome Banner */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white rounded-2xl p-6 border border-[#E3E6EB] shadow-xs">
                <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E1F3F6] text-[#075463] mb-2">
                        <Activity className="size-3.5 text-[#0B7285]" /> Patient Portal
                    </span>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#101828]">
                        Welcome back, {profile?.name || "Patient"}
                    </h1>
                    <p className="text-sm text-[#5B6472] mt-1">
                        Review your upcoming consultations, prescriptions, and health profile status.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        asChild
                        className="bg-[#D9542E] hover:bg-[#B8431F] text-white font-medium shadow-xs"
                    >
                        <Link href="/dashboard/book-appointments">
                            <CalendarPlus className="size-4 mr-2" /> Book Appointment
                        </Link>
                    </Button>
                </div>
            </div>

            {/* 1. Stats Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Appointments"
                    value={totalAppointments}
                    iconName="Calendar"
                    description="All-time consultations"
                    className="border-[#E3E6EB] bg-white shadow-xs"
                />
                <StatsCard
                    title="Upcoming Appointments"
                    value={upcomingAppointments.length}
                    iconName="Clock"
                    description="Scheduled visits"
                    className="border-[#E3E6EB] bg-white shadow-xs"
                />
                <StatsCard
                    title="Completed Visits"
                    value={completedAppointments.length}
                    iconName="CheckCircle"
                    description="Consultations finished"
                    className="border-[#E3E6EB] bg-white shadow-xs"
                />
                <StatsCard
                    title="Prescriptions"
                    value={totalPrescriptions}
                    iconName="FileText"
                    description="Active & past prescriptions"
                    className="border-[#E3E6EB] bg-white shadow-xs"
                />
            </div>

            {/* 2. Main Content Grid: Upcoming Appointments & Status Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upcoming Appointments List (2 Columns) */}
                <Card className="lg:col-span-2 border-[#E3E6EB] bg-white shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#E3E6EB]">
                        <div>
                            <CardTitle className="text-base font-semibold text-[#101828] flex items-center gap-2">
                                <CalendarClock className="size-4 text-[#0B7285]" />
                                Upcoming Consultations
                            </CardTitle>
                            <CardDescription className="text-xs text-[#5B6472] mt-0.5">
                                Your next scheduled sessions with verified medical specialists
                            </CardDescription>
                        </div>
                        <Button asChild variant="ghost" size="sm" className="text-xs text-[#0B7285] hover:text-[#095E70]">
                            <Link href="/dashboard/my-appointments">
                                View all <ArrowRight className="size-3.5 ml-1" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        {nextAppointments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <div className="size-12 rounded-full bg-[#E1F3F6] flex items-center justify-center text-[#0B7285] mb-3">
                                    <Calendar className="size-6" />
                                </div>
                                <h3 className="text-sm font-semibold text-[#101828]">
                                    No upcoming appointments
                                </h3>
                                <p className="text-xs text-[#5B6472] max-w-sm mt-1 mb-4">
                                    You have no scheduled appointments at the moment. Need to see a doctor?
                                </p>
                                <Button
                                    asChild
                                    size="sm"
                                    className="bg-[#D9542E] hover:bg-[#B8431F] text-white text-xs font-medium"
                                >
                                    <Link href="/dashboard/book-appointments">
                                        Book an Appointment
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3.5">
                                {nextAppointments.map((appt) => {
                                    const doctorName = appt.doctor?.name || "Doctor";
                                    const designation = appt.doctor?.designation || "Specialist";
                                    const photo = appt.doctor?.profilePhoto || "";
                                    const isUnpaid = appt.paymentStatus !== "PAID";
                                    const isCurrentlyPaying = payingAppointmentId === appt.id;
                                    const formattedDate = appt.schedule?.startDateTime
                                        ? format(new Date(appt.schedule.startDateTime), "EEE, MMM dd, yyyy • hh:mm a")
                                        : "Schedule TBD";

                                    return (
                                        <div
                                            key={appt.id}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-[#E3E6EB] hover:border-[#0B7285]/40 transition-colors bg-white shadow-2xs"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar className="size-11 border border-border">
                                                    <AvatarImage src={photo} alt={doctorName} />
                                                    <AvatarFallback className="bg-[#E1F3F6] text-[#075463] text-sm font-semibold">
                                                        {doctorName.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h4 className="text-sm font-semibold text-[#101828]">
                                                        Dr. {doctorName}
                                                    </h4>
                                                    <p className="text-xs text-[#5B6472]">{designation}</p>
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-[#5B6472]">
                                                        <span className="font-medium text-[#0B7285]">
                                                            {formattedDate}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2.5 self-end sm:self-center">
                                                {isUnpaid ? (
                                                    <Button
                                                        size="sm"
                                                        disabled={isCurrentlyPaying}
                                                        onClick={() => handlePayNow(appt.id)}
                                                        className="bg-[#D9542E] hover:bg-[#B8431F] text-white text-xs h-8 px-3 font-medium shadow-2xs cursor-pointer"
                                                    >
                                                        {isCurrentlyPaying ? (
                                                            <>
                                                                <Loader2 className="size-3.5 animate-spin mr-1.5" />
                                                                Processing...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CreditCard className="size-3.5 mr-1.5" />
                                                                Pay Now
                                                            </>
                                                        )}
                                                    </Button>
                                                ) : (
                                                    <Badge className="bg-[#E3F7EE] text-[#0F5C3E] border-transparent text-xs py-1 px-2.5">
                                                        <CheckCircle2 className="size-3 mr-1 text-[#178A5E]" /> Paid
                                                    </Badge>
                                                )}

                                                <Badge
                                                    variant="outline"
                                                    className="border-[#0B7285]/30 text-[#075463] bg-[#E1F3F6]/50 text-xs py-1 px-2.5"
                                                >
                                                    Scheduled
                                                </Badge>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Appointment Status Distribution (1 Column Donut Chart) */}
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
            </div>

            {/* 3. Bottom Grid: Health Summary & Recent Prescriptions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Health Summary Card (1 Column) */}
                <Card className="border-[#E3E6EB] bg-white shadow-xs">
                    <CardHeader className="pb-3 border-b border-[#E3E6EB]">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold text-[#101828] flex items-center gap-2">
                                <HeartPulse className="size-4 text-[#0B7285]" />
                                Health Summary
                            </CardTitle>
                            <Button asChild variant="ghost" size="sm" className="text-xs text-[#0B7285] hover:text-[#095E70]">
                                <Link href="/dashboard/health-records">
                                    Edit <ArrowRight className="size-3.5 ml-1" />
                                </Link>
                            </Button>
                        </div>
                        <CardDescription className="text-xs text-[#5B6472]">
                            Key biometrics and health data snapshot
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 space-y-4">
                        {healthData ? (
                            <>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-lg border border-[#E3E6EB] bg-[#F7F8FA]">
                                        <span className="text-[11px] text-[#5B6472] uppercase font-semibold">
                                            Blood Group
                                        </span>
                                        <p className="text-lg font-bold text-[#0B7285] mt-0.5">
                                            {formatBloodGroup(healthData.bloodGroup)}
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-lg border border-[#E3E6EB] bg-[#F7F8FA]">
                                        <span className="text-[11px] text-[#5B6472] uppercase font-semibold">
                                            Allergies
                                        </span>
                                        <div className="mt-1">
                                            {healthData.hasAllergies ? (
                                                <Badge className="bg-[#FCEBEB] text-[#7A2323] border-transparent text-[11px]">
                                                    Has Allergies
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-[#E3F7EE] text-[#0F5C3E] border-transparent text-[11px]">
                                                    None Reported
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2.5 pt-1 text-xs">
                                    <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                                        <span className="text-[#5B6472]">Height:</span>
                                        <span className="font-semibold text-[#101828]">
                                            {healthData.height ? `${healthData.height} cm` : "Not recorded"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                                        <span className="text-[#5B6472]">Weight:</span>
                                        <span className="font-semibold text-[#101828]">
                                            {healthData.weight ? `${healthData.weight} kg` : "Not recorded"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                                        <span className="text-[#5B6472]">Diabetes Status:</span>
                                        <span className="font-semibold text-[#101828]">
                                            {healthData.hasDiabetes ? (
                                                <span className="text-[#E3A130]">Diagnosed</span>
                                            ) : (
                                                <span className="text-[#178A5E]">No</span>
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-1.5">
                                        <span className="text-[#5B6472]">Smoking Status:</span>
                                        <span className="font-semibold text-[#101828]">
                                            {healthData.smokingStatus ? (
                                                <span className="text-[#D8464B]">Smoker</span>
                                            ) : (
                                                <span className="text-[#178A5E]">Non-smoker</span>
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    asChild
                                    variant="outline"
                                    className="w-full text-xs font-medium border-[#0B7285] text-[#0B7285] hover:bg-[#E1F3F6]"
                                >
                                    <Link href="/dashboard/health-records">
                                        Update Health Records
                                    </Link>
                                </Button>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                                <div className="size-10 rounded-full bg-[#FBF0DC] flex items-center justify-center text-[#7A4A09]">
                                    <AlertTriangle className="size-5" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold text-[#101828]">
                                        Health Profile Incomplete
                                    </h4>
                                    <p className="text-[11px] text-[#5B6472] mt-1">
                                        Providing your vitals and allergies helps doctors deliver safer, tailored care.
                                    </p>
                                </div>
                                <Button
                                    asChild
                                    size="sm"
                                    className="bg-[#D9542E] hover:bg-[#B8431F] text-white text-xs font-medium w-full"
                                >
                                    <Link href="/dashboard/health-records">
                                        Complete Health Profile
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Prescriptions (2 Columns) */}
                <Card className="lg:col-span-2 border-[#E3E6EB] bg-white shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#E3E6EB]">
                        <div>
                            <CardTitle className="text-base font-semibold text-[#101828] flex items-center gap-2">
                                <Pill className="size-4 text-[#0B7285]" />
                                Recent Prescriptions
                            </CardTitle>
                            <CardDescription className="text-xs text-[#5B6472]">
                                Medical orders and dosage instructions from your consultations
                            </CardDescription>
                        </div>
                        <Button asChild variant="ghost" size="sm" className="text-xs text-[#0B7285] hover:text-[#095E70]">
                            <Link href="/dashboard/my-prescriptions">
                                View all <ArrowRight className="size-3.5 ml-1" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        {recentPrescriptions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <div className="size-12 rounded-full bg-[#E1F3F6] flex items-center justify-center text-[#0B7285] mb-3">
                                    <FileText className="size-6" />
                                </div>
                                <h3 className="text-sm font-semibold text-[#101828]">
                                    No prescriptions found
                                </h3>
                                <p className="text-xs text-[#5B6472] max-w-sm mt-1">
                                    Prescriptions issued by doctors after completed visits will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3.5">
                                {recentPrescriptions.map((rx) => {
                                    const doctorName = rx.doctor?.name || "Doctor";
                                    const formattedDate = format(new Date(rx.createdAt), "MMM dd, yyyy");
                                    const followUp = rx.followUpDate
                                        ? format(new Date(rx.followUpDate), "MMM dd, yyyy")
                                        : null;

                                    return (
                                        <div
                                            key={rx.id}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-[#E3E6EB] hover:border-[#0B7285]/40 transition-colors bg-white shadow-2xs"
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-sm font-semibold text-[#101828]">
                                                        Dr. {doctorName}
                                                    </h4>
                                                    <span className="text-[11px] text-[#5B6472]">• {formattedDate}</span>
                                                </div>
                                                <p className="text-xs text-[#5B6472] line-clamp-2">
                                                    {rx.instructions || "Standard clinical medication guidance issued."}
                                                </p>
                                                {followUp && (
                                                    <p className="text-[11px] font-medium text-[#0B7285]">
                                                        Follow-up date: {followUp}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="self-end sm:self-center">
                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs font-medium border-[#0B7285] text-[#0B7285] hover:bg-[#E1F3F6]"
                                                >
                                                    <Link href="/dashboard/my-prescriptions">
                                                        View Details
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
