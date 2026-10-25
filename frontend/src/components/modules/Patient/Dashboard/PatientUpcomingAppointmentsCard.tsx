"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, Calendar, CalendarClock, CheckCircle2, CreditCard, Loader2, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { IAppointment } from "@/types/appointment.types";

interface PatientUpcomingAppointmentsCardProps {
    nextAppointments: IAppointment[];
    payingAppointmentId: string | null;
    onPayNow: (appointmentId: string) => void;
}

export default function PatientUpcomingAppointmentsCard({
    nextAppointments,
    payingAppointmentId,
    onPayNow,
}: PatientUpcomingAppointmentsCardProps) {
    return (
        <Card className="lg:col-span-2 border-border bg-card text-card-foreground shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
                <div>
                    <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                        <CalendarClock className="size-4 text-primary" />
                        Upcoming Consultations
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">
                        Your next scheduled sessions with verified medical specialists
                    </CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-xs text-primary hover:text-primary/90">
                    <Link href="/dashboard/my-appointments">
                        View all <ArrowRight className="size-3.5 ml-1" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
                {nextAppointments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                            <Calendar className="size-6" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">
                            No upcoming appointments
                        </h3>
                        <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
                            You have no scheduled appointments at the moment. Need to see a doctor?
                        </p>
                        <Button
                            asChild
                            size="sm"
                            className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs font-medium"
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
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border hover:border-primary/40 transition-colors bg-card shadow-2xs"
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <Avatar className="size-11 border border-border shrink-0">
                                            <AvatarImage src={photo} alt={doctorName} />
                                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                                                {doctorName.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-0.5 min-w-0 flex-1">
                                            <h4 className="text-sm font-semibold text-foreground truncate" title={`Dr. ${doctorName}`}>
                                                Dr. {doctorName}
                                            </h4>
                                            <p className="text-xs text-muted-foreground truncate" title={designation}>{designation}</p>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                <span className="font-medium text-primary">
                                                    {formattedDate}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                                        {isUnpaid ? (
                                            <Button
                                                size="sm"
                                                disabled={isCurrentlyPaying}
                                                onClick={() => onPayNow(appt.id)}
                                                className="bg-accent hover:bg-accent-hover text-accent-foreground text-xs h-8 px-3 font-medium shadow-2xs cursor-pointer"
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
                                            <div className="flex items-center gap-1.5">
                                                <Badge className="bg-secondary/15 text-secondary border-transparent text-xs py-1 px-2.5">
                                                    <CheckCircle2 className="size-3 mr-1 text-secondary" /> Paid
                                                </Badge>

                                                {appt.videoCallingId && (appt.status === "INPROGRESS" || appt.status === "SCHEDULED") && (
                                                    <Button
                                                        asChild
                                                        size="sm"
                                                        variant={appt.status === "INPROGRESS" ? "default" : "outline"}
                                                        className={
                                                            appt.status === "INPROGRESS"
                                                                ? "h-8 bg-primary hover:bg-primary-hover text-primary-foreground text-xs px-2.5 animate-pulse"
                                                                : "h-8 border-primary/30 text-primary hover:bg-primary/10 text-xs px-2.5"
                                                        }
                                                    >
                                                        <Link href={`/consultation/session/${appt.videoCallingId}`}>
                                                            <Video className="size-3.5 mr-1" />
                                                            {appt.status === "INPROGRESS" ? "Join Video Call" : "Pre-Call Setup"}
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                        )}

                                        <Badge
                                            variant="outline"
                                            className="border-primary/30 text-primary bg-primary/10 text-xs py-1 px-2.5"
                                        >
                                            {appt.status ?? "Scheduled"}
                                        </Badge>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
