"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IDoctor } from "@/types/doctor.types";
import { ISpecialty } from "@/types/specialty.types";
import { Award, Briefcase, Stethoscope, UserCheck, Users } from "lucide-react";
import Image from "next/image";

interface SpecialtyCardProps {
    specialty: ISpecialty;
    doctors: IDoctor[];
}

const getInitials = (name?: string) => {
    if (!name) return "DR";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const SpecialtyCard = ({ specialty, doctors }: SpecialtyCardProps) => {
    return (
        <Card className="flex flex-col h-full overflow-hidden border-border/80 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="pb-3 border-b bg-muted/20">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg border bg-background flex items-center justify-center overflow-hidden shrink-0">
                            {specialty.icon ? (
                                <Image
                                    src={specialty.icon}
                                    alt={specialty.title}
                                    width={28}
                                    height={28}
                                    className="object-contain"
                                />
                            ) : (
                                <Stethoscope className="h-5 w-5 text-muted-foreground" />
                            )}
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold text-foreground">
                                {specialty.title}
                            </CardTitle>
                            {specialty.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                    {specialty.description}
                                </p>
                            )}
                        </div>
                    </div>

                    <Badge
                        variant="secondary"
                        className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                    >
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span>{doctors.length} {doctors.length === 1 ? "Doctor" : "Doctors"}</span>
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-4">
                {doctors.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                        <UserCheck className="h-8 w-8 stroke-[1.25] text-muted-foreground/50 mb-2" />
                        <p className="text-xs">No doctors assigned yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground block">
                            Assigned Practitioners
                        </span>
                        <div className="space-y-2.5">
                            {doctors.map((doctor) => {
                                const formattedName = doctor.name
                                    ? `Dr. ${doctor.name.replace(/^Dr\.\s*/i, "")}`
                                    : "Doctor";

                                return (
                                    <div
                                        key={doctor.id}
                                        className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/40 transition-colors border border-transparent hover:border-border/50"
                                    >
                                        <Avatar className="h-8 w-8 border shrink-0 mt-0.5">
                                            <AvatarImage
                                                src={doctor.profilePhoto || undefined}
                                                alt={formattedName}
                                            />
                                            <AvatarFallback className="text-[11px] bg-primary/10 text-primary font-medium">
                                                {getInitials(doctor.name)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="min-w-0 flex-1 space-y-0.5">
                                            <p className="text-xs font-semibold text-foreground truncate">
                                                {formattedName}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                                                {doctor.designation && (
                                                    <span className="truncate max-w-[140px]">
                                                        {doctor.designation}
                                                    </span>
                                                )}
                                                {doctor.currentWorkingPlace && (
                                                    <span className="truncate max-w-[140px] flex items-center gap-0.5">
                                                        <Briefcase className="h-2.5 w-2.5 shrink-0" />
                                                        {doctor.currentWorkingPlace}
                                                    </span>
                                                )}
                                            </div>
                                            {doctor.experience ? (
                                                <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
                                                    <Award className="h-2.5 w-2.5 text-muted-foreground/70" />
                                                    {doctor.experience} yrs exp
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
