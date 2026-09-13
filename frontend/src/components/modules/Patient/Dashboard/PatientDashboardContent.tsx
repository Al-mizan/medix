"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { initiateAppointmentPaymentAction } from "@/app/_actions/appointment.actions";
import { getMyAppointments } from "@/services/appointment.services";
import { getPatientDashboardData } from "@/services/dashboard.services";
import { getMyPatientProfile } from "@/services/patient.services";
import { getMyPrescriptions } from "@/services/prescription.services";
import { ApiResponse } from "@/types/api.types";
import { IAppointment } from "@/types/appointment.types";
import { IPatientDashboardData } from "@/types/dashboard.types";
import { IPatientProfile } from "@/types/patient.types";
import { IPrescription } from "@/types/prescription.types";

import PatientDashboardHeader from "./PatientDashboardHeader";
import PatientStatsOverview from "./PatientStatsOverview";
import PatientUpcomingAppointmentsCard from "./PatientUpcomingAppointmentsCard";
import PatientStatusDistributionCard from "./PatientStatusDistributionCard";
import PatientHealthSnapshotCard from "./PatientHealthSnapshotCard";
import PatientRecentPrescriptionsCard from "./PatientRecentPrescriptionsCard";

export default function PatientDashboardContent() {
    const [payingAppointmentId, setPayingAppointmentId] = useState<string | null>(null);

    // Queries
    const { data: statsResponse } = useQuery({
        queryKey: ["patient-dashboard-stats"],
        queryFn: () => getPatientDashboardData(),
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
        if (!appointmentsResponse) return [];
        const raw = (appointmentsResponse as ApiResponse<IAppointment[]>).data;
        return Array.isArray(raw) ? raw : [];
    }, [appointmentsResponse]);

    const prescriptions: IPrescription[] = useMemo(() => {
        if (!prescriptionsResponse) return [];
        const raw = (prescriptionsResponse as ApiResponse<IPrescription[]>).data;
        return Array.isArray(raw) ? raw : [];
    }, [prescriptionsResponse]);

    const stats: IPatientDashboardData | null = useMemo(() => {
        if (!statsResponse) return null;
        if ("data" in statsResponse && statsResponse.data) {
            return statsResponse.data as IPatientDashboardData;
        }
        return null;
    }, [statsResponse]);

    const profile: IPatientProfile | null = useMemo(() => {
        if (!profileResponse) return null;
        return (profileResponse as ApiResponse<IPatientProfile>).data || null;
    }, [profileResponse]);

    // Data derivations
    const upcomingAppointments = useMemo(() => {
        return appointments.filter(
            (a) => a.status === "SCHEDULED" || a.status === "INPROGRESS"
        );
    }, [appointments]);

    const completedAppointments = useMemo(() => {
        return appointments.filter((a) => a.status === "COMPLETED");
    }, [appointments]);

    const nextAppointments = useMemo(() => {
        return [...upcomingAppointments]
            .sort((a, b) => {
                const dateA = a.schedule?.startDateTime ? new Date(a.schedule.startDateTime).getTime() : 0;
                const dateB = b.schedule?.startDateTime ? new Date(b.schedule.startDateTime).getTime() : 0;
                return dateA - dateB;
            })
            .slice(0, 3);
    }, [upcomingAppointments]);

    const recentPrescriptions = useMemo(() => {
        return [...prescriptions]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3);
    }, [prescriptions]);

    // Chart status distribution
    const chartData = useMemo(() => {
        if (stats?.appointmentStatusDistribution && stats.appointmentStatusDistribution.length > 0) {
            return stats.appointmentStatusDistribution.map((item) => ({
                name: item.status.charAt(0) + item.status.slice(1).toLowerCase(),
                value: item.count,
                rawStatus: item.status,
            }));
        }

        const counts: Record<string, number> = {
            SCHEDULED: upcomingAppointments.length,
            COMPLETED: completedAppointments.length,
            CANCELED: appointments.filter((a) => a.status === "CANCELED").length,
        };

        return Object.entries(counts).map(([status, value]) => ({
            name: status.charAt(0) + status.slice(1).toLowerCase(),
            value,
            rawStatus: status,
        }));
    }, [stats, upcomingAppointments, completedAppointments, appointments]);

    const handlePayNow = async (appointmentId: string) => {
        try {
            setPayingAppointmentId(appointmentId);
            const res = await initiateAppointmentPaymentAction(appointmentId);
            if (res.success && res.data?.paymentUrl) {
                toast.success("Redirecting to secure payment checkout...");
                window.location.href = res.data.paymentUrl;
            } else {
                toast.error(res.message || "Failed to initialize payment gateway");
            }
        } catch {
            toast.error("An unexpected error occurred during payment processing");
        } finally {
            setPayingAppointmentId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Quick Action */}
            <PatientDashboardHeader name={profile?.name} />

            {/* 1. Top Key Metric Overview Cards */}
            <PatientStatsOverview
                totalAppointments={stats?.appointmentCount ?? appointments.length}
                upcomingAppointmentsCount={upcomingAppointments.length}
                completedAppointmentsCount={completedAppointments.length}
                totalPrescriptions={prescriptions.length}
            />

            {/* 2. Main Content Grid: Upcoming Appointments & Status Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <PatientUpcomingAppointmentsCard
                    nextAppointments={nextAppointments}
                    payingAppointmentId={payingAppointmentId}
                    onPayNow={handlePayNow}
                />
                <PatientStatusDistributionCard chartData={chartData} />
            </div>

            {/* 3. Bottom Grid: Health Summary & Recent Prescriptions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <PatientHealthSnapshotCard healthData={profile?.patientHealthData} />
                <PatientRecentPrescriptionsCard recentPrescriptions={recentPrescriptions} />
            </div>
        </div>
    );
}
