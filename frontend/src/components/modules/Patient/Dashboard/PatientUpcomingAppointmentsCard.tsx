"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, Calendar, CalendarClock, CheckCircle2, CreditCard, Loader2 } from "lucide-react";
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
                                                onClick={() => onPayNow(appt.id)}
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
    );
}
