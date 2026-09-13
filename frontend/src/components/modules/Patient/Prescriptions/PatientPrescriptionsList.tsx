"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyPrescriptions } from "@/services/prescription.services";
import { IPrescription } from "@/types/prescription.types";
import PatientPrescriptionCard from "./PatientPrescriptionCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Search,
    FileText,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    Plus,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

interface PatientPrescriptionsListProps {
    initialQueryString?: string;
}

const ITEMS_PER_PAGE = 6;

export default function PatientPrescriptionsList({
    initialQueryString = "",
}: PatientPrescriptionsListProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortAsc, setSortAsc] = useState(false);

    const { data: response, isLoading } = useQuery({
        queryKey: ["my-prescriptions", initialQueryString],
        queryFn: () => getMyPrescriptions(initialQueryString),
        staleTime: 30 * 1000,
    });

    const prescriptions: IPrescription[] = response?.data || [];

    // Filter and Sort
    const filteredPrescriptions = useMemo(() => {
        let list = [...prescriptions];

        if (searchTerm.trim()) {
            const query = searchTerm.toLowerCase();
            list = list.filter((p) => {
                const docName = p.doctor?.name?.toLowerCase() || "";
                const docDesig = p.doctor?.designation?.toLowerCase() || "";
                const instructions = p.instructions?.toLowerCase() || "";
                return (
                    docName.includes(query) ||
                    docDesig.includes(query) ||
                    instructions.includes(query)
                );
            });
        }

        list.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime() || 0;
            const dateB = new Date(b.createdAt).getTime() || 0;
            return sortAsc ? dateA - dateB : dateB - dateA;
        });

        return list;
    }, [prescriptions, searchTerm, sortAsc]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filteredPrescriptions.length / ITEMS_PER_PAGE));
    const paginatedPrescriptions = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredPrescriptions.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredPrescriptions, currentPage]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    return (
        <div className="space-y-6">
            {/* Controls Bar: Search & Sort */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#E3E6EB] shadow-xs">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A93A3]" />
                    <Input
                        placeholder="Search by doctor or medicine..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="pl-9 bg-[#F7F8FA] border-[#E3E6EB] text-sm h-9"
                    />
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSortAsc(!sortAsc)}
                        className="h-9 text-xs border-[#E3E6EB] text-[#5B6472]"
                    >
                        <ArrowUpDown className="mr-1.5 h-3.5 w-3.5" />
                        {sortAsc ? "Oldest First" : "Newest First"}
                    </Button>

                    <Button
                        asChild
                        size="sm"
                        className="h-9 text-xs bg-[#D9542E] hover:bg-[#B8431F] text-white shadow-xs"
                    >
                        <Link href="/dashboard/book-appointments">
                            <Plus className="mr-1 h-3.5 w-3.5" />
                            Book Consultation
                        </Link>
                    </Button>
                </div>
            </div>

            {/* List / Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="rounded-xl border border-[#E3E6EB] bg-white p-5 space-y-4"
                        >
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-11 w-11 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </div>
                            <Skeleton className="h-10 w-full rounded" />
                            <Skeleton className="h-14 w-full rounded" />
                            <div className="flex justify-between pt-2">
                                <Skeleton className="h-8 w-24 rounded" />
                                <Skeleton className="h-8 w-28 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredPrescriptions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#E3E6EB] bg-white p-12 text-center shadow-xs">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E1F3F6] text-[#0B7285] mb-4">
                        <FileText className="h-7 w-7" />
                    </div>
                    <h3 className="text-base font-semibold text-[#101828]">
                        {searchTerm ? "No matching prescriptions found" : "No Prescriptions on File Yet"}
                    </h3>
                    <p className="text-xs text-[#5B6472] mt-1.5 max-w-sm mx-auto">
                        {searchTerm
                            ? `We couldn't find any prescriptions matching "${searchTerm}". Try another search term.`
                            : "Prescriptions given by your doctors after appointments will automatically appear here with downloadable PDFs."}
                    </p>
                    <div className="mt-5">
                        <Button
                            asChild
                            className="bg-[#0B7285] hover:bg-[#095E70] text-white text-xs px-4 py-2 h-9"
                        >
                            <Link href="/dashboard/book-appointments">
                                <Calendar className="mr-1.5 h-3.5 w-3.5" />
                                Find a Specialist
                            </Link>
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {paginatedPrescriptions.map((prescription) => (
                            <PatientPrescriptionCard
                                key={prescription.id}
                                prescription={prescription}
                            />
                        ))}
                    </div>

                    {/* Pagination Bar */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-[#E3E6EB] bg-white px-4 py-3 rounded-xl shadow-xs">
                            <span className="text-xs text-[#5B6472]">
                                Showing{" "}
                                <strong className="text-[#101828]">
                                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                                </strong>{" "}
                                to{" "}
                                <strong className="text-[#101828]">
                                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredPrescriptions.length)}
                                </strong>{" "}
                                of{" "}
                                <strong className="text-[#101828]">
                                    {filteredPrescriptions.length}
                                </strong>{" "}
                                prescriptions
                            </span>

                            <div className="flex items-center gap-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-xs font-medium px-2 text-[#101828]">
                                    {currentPage} / {totalPages}
                                </span>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
