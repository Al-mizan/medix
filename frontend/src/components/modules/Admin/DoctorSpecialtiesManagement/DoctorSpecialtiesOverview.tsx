"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getDoctors } from "@/services/doctor.services";
import { getSpecialties } from "@/services/specialty.services";
import { IDoctor } from "@/types/doctor.types";
import { ISpecialty } from "@/types/specialty.types";
import { useQuery } from "@tanstack/react-query";
import {
    Award,
    CheckCircle,
    LayoutGrid,
    Search,
    Stethoscope,
    Table as TableIcon,
    Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { DoctorSpecialtiesTable } from "./DoctorSpecialtiesTable";
import { SpecialtyCard } from "./SpecialtyCard";

export const DoctorSpecialtiesOverview = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedView, setSelectedView] = useState<"cards" | "table">("cards");

    const { data: doctorsResponse, isLoading: isDoctorsLoading } = useQuery({
        queryKey: ["doctors-specialties-overview"],
        queryFn: () => getDoctors("limit=100"),
    });

    const { data: specialtiesResponse, isLoading: isSpecialtiesLoading } = useQuery({
        queryKey: ["specialties-list-overview"],
        queryFn: () => getSpecialties("limit=100"),
    });

    const doctors: IDoctor[] = doctorsResponse?.data ?? [];
    const specialties: ISpecialty[] = specialtiesResponse?.data ?? [];

    // Map specialties to associated doctors
    const specialtyDoctorMap = useMemo(() => {
        const map = new Map<string, IDoctor[]>();

        // Initialize for all specialties
        specialties.forEach((spec) => {
            map.set(spec.id, []);
        });

        // Populate from doctors' assigned specialties
        doctors.forEach((doctor) => {
            doctor.specialties?.forEach((item) => {
                const specId = item.specialty?.id;
                if (specId && map.has(specId)) {
                    map.get(specId)!.push(doctor);
                }
            });
        });

        return map;
    }, [specialties, doctors]);

    // Filtered specialties for cards
    const filteredSpecialties = useMemo(() => {
        if (!searchTerm.trim()) return specialties;
        const term = searchTerm.toLowerCase();

        return specialties.filter((specialty) => {
            const titleMatch = specialty.title?.toLowerCase().includes(term);
            const descMatch = specialty.description?.toLowerCase().includes(term);
            const associatedDocs = specialtyDoctorMap.get(specialty.id) || [];
            const docMatch = associatedDocs.some((d) =>
                d.name?.toLowerCase().includes(term),
            );
            return titleMatch || descMatch || docMatch;
        });
    }, [specialties, specialtyDoctorMap, searchTerm]);

    // Metrics
    const totalSpecialties = specialties.length;
    const assignedDoctorsCount = doctors.filter(
        (d) => d.specialties && d.specialties.length > 0,
    ).length;
    const totalAssignments = doctors.reduce(
        (acc, d) => acc + (d.specialties?.length || 0),
        0,
    );

    const isLoading = isDoctorsLoading || isSpecialtiesLoading;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight text-foreground">
                        Doctor-Specialties Overview
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Read-only overview of clinical specialties and assigned practitioners.
                    </p>
                </div>
                <Badge variant="outline" className="w-fit text-xs font-normal">
                    Assignments managed via Doctors Management
                </Badge>
            </div>

            {/* Metric KPI cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-border/80 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Active Specialties
                        </CardTitle>
                        <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {totalSpecialties}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Available hospital departments
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/80 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Specialized Doctors
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {assignedDoctorsCount}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Doctors with assigned specialties
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/80 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Total Specializations
                        </CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {totalAssignments}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Active doctor-specialty mappings
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Controls: Search & Tabs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by specialty or doctor name..."
                        className="pl-9 h-9 text-sm"
                    />
                </div>

                <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border">
                    <Button
                        variant={selectedView === "cards" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setSelectedView("cards")}
                        className="h-7 px-3 text-xs gap-1.5"
                    >
                        <LayoutGrid className="h-3.5 w-3.5" />
                        Specialty Cards
                    </Button>
                    <Button
                        variant={selectedView === "table" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setSelectedView("table")}
                        className="h-7 px-3 text-xs gap-1.5"
                    >
                        <TableIcon className="h-3.5 w-3.5" />
                        Doctor Table
                    </Button>
                </div>
            </div>

            {/* Content Display */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                    Loading doctor-specialties data...
                </div>
            ) : selectedView === "cards" ? (
                filteredSpecialties.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 rounded-lg border bg-card text-center text-muted-foreground">
                        <Stethoscope className="h-10 w-10 stroke-[1.25] text-muted-foreground/40 mb-3" />
                        <h3 className="text-sm font-semibold text-foreground">
                            No Specialties Found
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            Try adjusting your search term.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSpecialties.map((specialty) => (
                            <SpecialtyCard
                                key={specialty.id}
                                specialty={specialty}
                                doctors={specialtyDoctorMap.get(specialty.id) || []}
                            />
                        ))}
                    </div>
                )
            ) : (
                <DoctorSpecialtiesTable
                    doctors={doctors}
                    searchTerm={searchTerm}
                />
            )}
        </div>
    );
};

export default DoctorSpecialtiesOverview;
