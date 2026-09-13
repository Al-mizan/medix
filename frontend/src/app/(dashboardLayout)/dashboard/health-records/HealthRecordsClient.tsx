"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyPatientProfile } from "@/services/patient.services";
import HealthRecordsForm from "@/components/modules/Patient/HealthRecords/HealthRecordsForm";
import MedicalReportsSection from "@/components/modules/Patient/HealthRecords/MedicalReportsSection";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function HealthRecordsClient() {
    const { data: profileResponse, isLoading } = useQuery({
        queryKey: ["my-patient-profile"],
        queryFn: getMyPatientProfile,
        staleTime: 30 * 1000,
    });

    const profile = profileResponse?.data;

    return (
        <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E3E6EB] pb-5">
                <div>
                    <div className="flex items-center gap-2 text-xs font-medium text-[#0B7285] mb-2">
                        <Link href="/dashboard" className="flex items-center gap-1 hover:underline">
                            <ArrowLeft className="size-3.5" /> Back to Dashboard
                        </Link>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#101828]">
                        Health Records & Clinical Profile
                    </h1>
                    <p className="text-sm text-[#5B6472] mt-1">
                        Keep your vital health information up to date to ensure doctors provide accurate, personalized care.
                    </p>
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-6">
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <Skeleton className="h-48 w-full rounded-xl" />
                </div>
            ) : (
                <>
                    <HealthRecordsForm profile={profile} />
                    <MedicalReportsSection medicalReports={profile?.medicalReports || []} />
                </>
            )}
        </div>
    );
}
