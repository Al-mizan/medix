import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getMyPrescriptions } from "@/services/prescription.services";
import PatientPrescriptionsList from "@/components/modules/Patient/Prescriptions/PatientPrescriptionsList";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Pill } from "lucide-react";

export const metadata: Metadata = {
    title: "My Prescriptions | Medix Digital Healthcare",
    description: "View and download all prescriptions and medication instructions issued by your doctors.",
};

export default async function MyPrescriptionsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const queryParamsObjects = await searchParams;

    const queryString = Object.keys(queryParamsObjects)
        .map((key) => {
            const value = queryParamsObjects[key];
            if (value === undefined) return "";
            if (Array.isArray(value)) {
                return value
                    .map((v) => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`)
                    .join("&");
            }
            return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        })
        .filter(Boolean)
        .join("&");

    const queryClient = new QueryClient();

    try {
        await queryClient.prefetchQuery({
            queryKey: ["my-prescriptions", queryString],
            queryFn: () => getMyPrescriptions(queryString),
            staleTime: 30 * 1000,
        });
    } catch (error) {
        console.error("Failed to prefetch patient prescriptions:", error);
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col gap-2 border-b border-[#E3E6EB] pb-5">
                    <div className="flex items-center gap-2 text-xs font-medium text-[#0B7285] mb-1">
                        <Link href="/dashboard" className="flex items-center gap-1 hover:underline">
                            <ArrowLeft className="size-3.5" /> Back to Dashboard
                        </Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E1F3F6] text-[#0B7285]">
                            <Pill className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-[#101828]">
                                My Prescriptions
                            </h1>
                            <p className="text-sm text-[#5B6472]">
                                Access your doctor-issued digital prescriptions, medication dosage guides, and signed PDFs.
                            </p>
                        </div>
                    </div>
                </div>

                <PatientPrescriptionsList initialQueryString={queryString} />
            </div>
        </HydrationBoundary>
    );
}
