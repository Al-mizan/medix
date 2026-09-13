"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UserInfo } from "@/types/user.types";
import {
    Activity,
    ArrowUpRight,
    Building,
    Calendar,
    DollarSign,
    HeartPulse,
    Key,
    Lock,
    Mail,
    MapPin,
    Phone,
    Shield,
    Star,
    Stethoscope,
    User,
} from "lucide-react";
import Link from "next/link";
import React from "react";

interface ProfileViewProps {
    user: UserInfo;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user }) => {
    const patientData = user.patient;
    const doctorData = user.doctor;
    const adminData = user.admin;

    const contactNumber =
        patientData?.contactNumber ||
        doctorData?.contactNumber ||
        adminData?.contactNumber ||
        "Not provided";

    const address =
        patientData?.address ||
        doctorData?.address ||
        "Not provided";

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Personal Information (2 cols on md) */}
            <div className="md:col-span-2 space-y-6">
                {/* Personal Information */}
                <Card className="border-border/80 shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-2 text-foreground">
                            <User className="size-5 text-[#0B7285]" />
                            <CardTitle className="text-lg font-semibold">
                                Personal Information
                            </CardTitle>
                        </div>
                        <CardDescription>
                            Your basic account details and primary contact information.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                    <User className="size-3.5" /> Full Name
                                </span>
                                <p className="font-medium text-foreground">{user.name}</p>
                            </div>

                            <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                    <Mail className="size-3.5" /> Email Address
                                </span>
                                <p className="font-medium text-foreground">{user.email}</p>
                            </div>

                            <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                    <Phone className="size-3.5" /> Contact Number
                                </span>
                                <p className="font-medium text-foreground">{contactNumber}</p>
                            </div>

                            <div className="space-y-1">
                                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                    <MapPin className="size-3.5" /> Address
                                </span>
                                <p className="font-medium text-foreground">{address}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Role-Specific Card */}
                {user.role === "PATIENT" && (
                    <Card className="border-border/80 shadow-sm">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-foreground">
                                    <HeartPulse className="size-5 text-[#178A5E]" />
                                    <CardTitle className="text-lg font-semibold">
                                        Health Overview
                                    </CardTitle>
                                </div>
                                <Link href="/dashboard/health-records">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs text-primary font-medium hover:text-primary hover:bg-primary/5"
                                    >
                                        Health Records
                                        <ArrowUpRight className="size-3.5 ml-1" />
                                    </Button>
                                </Link>
                            </div>
                            <CardDescription>
                                Clinical metrics recorded on your profile.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        Gender
                                    </span>
                                    <p className="font-medium capitalize text-foreground">
                                        {patientData?.patientHealthData?.gender?.toLowerCase() ||
                                            "Not specified"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        Blood Group
                                    </span>
                                    <p className="font-medium text-foreground">
                                        {patientData?.patientHealthData?.bloodGroup?.replace(
                                            "_",
                                            " "
                                        ) || "Not specified"}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        Date of Birth
                                    </span>
                                    <p className="font-medium text-foreground">
                                        {patientData?.patientHealthData?.dateOfBirth
                                            ? new Date(
                                                  patientData.patientHealthData.dateOfBirth
                                              ).toLocaleDateString()
                                            : "Not specified"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {user.role === "DOCTOR" && doctorData && (
                    <Card className="border-border/80 shadow-sm">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-2 text-foreground">
                                <Stethoscope className="size-5 text-[#0B7285]" />
                                <CardTitle className="text-lg font-semibold">
                                    Clinical & Professional Details
                                </CardTitle>
                            </div>
                            <CardDescription>
                                Verification credentials, specialties, and hospital affiliations.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5 text-sm">
                            {/* Specialties */}
                            <div>
                                <span className="text-xs font-medium text-muted-foreground block mb-2">
                                    Clinical Specialties
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {doctorData.specialties && doctorData.specialties.length > 0 ? (
                                        doctorData.specialties.map((s, idx) => (
                                            <Badge
                                                key={idx}
                                                variant="outline"
                                                className="bg-[#E1F3F6] text-[#075463] border-transparent font-medium"
                                            >
                                                {s.specialty?.title || "Specialty"}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-muted-foreground text-xs">
                                            No specialties listed
                                        </span>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        Designation & Qualification
                                    </span>
                                    <p className="font-medium text-foreground">
                                        {doctorData.designation || "Doctor"} (
                                        {doctorData.qualification || "MBBS"})
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                        <Building className="size-3.5" /> Current Workplace
                                    </span>
                                    <p className="font-medium text-foreground">
                                        {doctorData.currentWorkingPlace || "Not specified"}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        Registration License
                                    </span>
                                    <p className="font-medium text-foreground font-mono text-xs">
                                        {doctorData.registrationNumber || "Not specified"}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                        <DollarSign className="size-3.5" /> Consultation Fee
                                    </span>
                                    <p className="font-medium text-foreground">
                                        ${doctorData.appointmentFee ?? 0}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        Experience
                                    </span>
                                    <p className="font-medium text-foreground">
                                        {doctorData.experience ?? 0} years
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                        <Star className="size-3.5 text-amber-500 fill-amber-500" /> Patient Rating
                                    </span>
                                    <p className="font-medium text-foreground">
                                        {doctorData.averageRating
                                            ? Number(doctorData.averageRating).toFixed(1)
                                            : "5.0"}{" "}
                                        / 5.0
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
                    <Card className="border-border/80 shadow-sm">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-2 text-foreground">
                                <Shield className="size-5 text-[#0B7285]" />
                                <CardTitle className="text-lg font-semibold">
                                    Administrative Scope
                                </CardTitle>
                            </div>
                            <CardDescription>
                                System access tier and administrative permissions.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        Privilege Level
                                    </span>
                                    <p className="font-medium text-foreground">
                                        {user.role === "SUPER_ADMIN"
                                            ? "Super Administrator (Full System Access)"
                                            : "System Administrator"}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        Hospital Management
                                    </span>
                                    <p className="font-medium text-foreground">
                                        Doctors, Patients, Appointments, Schedules
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Right Column: Security & Settings */}
            <div className="space-y-6">
                <Card className="border-border/80 shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-2 text-foreground">
                            <Lock className="size-5 text-[#0B7285]" />
                            <CardTitle className="text-lg font-semibold">
                                Security
                            </CardTitle>
                        </div>
                        <CardDescription>
                            Manage password and authentication settings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div className="space-y-1.5">
                            <span className="text-xs font-medium text-muted-foreground">
                                Account Password
                            </span>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/50">
                                <span className="font-mono text-muted-foreground text-sm">
                                    ••••••••••••
                                </span>
                                <Badge variant="outline" className="text-xs">
                                    Protected
                                </Badge>
                            </div>
                        </div>

                        <Link href="/change-password" className="block pt-2">
                            <Button
                                variant="outline"
                                className="w-full justify-center border-border hover:bg-muted"
                            >
                                <Key className="size-4 mr-2 text-primary" />
                                Change Password
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="border-border/80 shadow-sm bg-muted/20">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 text-foreground">
                            <Activity className="size-4 text-[#178A5E]" />
                            <CardTitle className="text-sm font-semibold">
                                Quick Activity
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground space-y-2">
                        <p>
                            • Profile last updated on{" "}
                            {user.updatedAt
                                ? new Date(user.updatedAt).toLocaleDateString()
                                : "N/A"}
                        </p>
                        <p>• Multi-device session authorization active</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ProfileView;
