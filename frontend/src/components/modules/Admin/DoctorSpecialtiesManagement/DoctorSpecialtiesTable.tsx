"use client";

import UserInfoCell from "@/components/shared/cell/UserInfoCell";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { IDoctor } from "@/types/doctor.types";
import { Award, Briefcase, DollarSign, Stethoscope } from "lucide-react";

interface DoctorSpecialtiesTableProps {
    doctors: IDoctor[];
    searchTerm?: string;
}

export const DoctorSpecialtiesTable = ({
    doctors,
    searchTerm = "",
}: DoctorSpecialtiesTableProps) => {
    const filteredDoctors = doctors.filter((doctor) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        const matchName = doctor.name?.toLowerCase().includes(term);
        const matchEmail = doctor.email?.toLowerCase().includes(term);
        const matchDesignation = doctor.designation?.toLowerCase().includes(term);
        const matchSpecialty = doctor.specialties?.some((s) =>
            s.specialty?.title?.toLowerCase().includes(term),
        );
        return matchName || matchEmail || matchDesignation || matchSpecialty;
    });

    return (
        <div className="rounded-md border bg-card overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/30">
                        <TableHead className="w-[280px]">Doctor</TableHead>
                        <TableHead>Designation</TableHead>
                        <TableHead>Working Place</TableHead>
                        <TableHead>Assigned Specialties</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead className="text-right">Consultation Fee</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredDoctors.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={6}
                                className="h-24 text-center text-muted-foreground"
                            >
                                No doctor specializations found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredDoctors.map((doctor) => {
                            const formattedName = doctor.name
                                ? `Dr. ${doctor.name.replace(/^Dr\.\s*/i, "")}`
                                : "Unknown Doctor";

                            return (
                                <TableRow key={doctor.id}>
                                    <TableCell>
                                        <UserInfoCell
                                            name={formattedName}
                                            email={doctor.email || "No email"}
                                            profilePhoto={doctor.profilePhoto || undefined}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {doctor.designation ? (
                                            <span className="text-xs font-medium text-foreground flex items-center gap-1">
                                                <Stethoscope className="h-3 w-3 text-muted-foreground" />
                                                {doctor.designation}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {doctor.currentWorkingPlace ? (
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Briefcase className="h-3 w-3 text-muted-foreground" />
                                                {doctor.currentWorkingPlace}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {doctor.specialties && doctor.specialties.length > 0 ? (
                                            <div className="flex flex-wrap gap-1.5">
                                                {doctor.specialties.map((item, idx) => (
                                                    <Badge
                                                        key={item.specialty?.id || idx}
                                                        variant="secondary"
                                                        className="font-normal text-xs px-2 py-0.5"
                                                    >
                                                        {item.specialty?.title || "Specialty"}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic">
                                                No specialties assigned
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {doctor.experience ? (
                                            <span className="text-xs text-foreground font-medium inline-flex items-center gap-1">
                                                <Award className="h-3 w-3 text-muted-foreground" />
                                                {doctor.experience} yrs
                                            </span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {doctor.appointmentFee !== undefined ? (
                                            <span className="text-xs font-medium text-foreground inline-flex items-center gap-0.5 justify-end">
                                                <DollarSign className="h-3 w-3 text-muted-foreground" />
                                                {doctor.appointmentFee}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
};
