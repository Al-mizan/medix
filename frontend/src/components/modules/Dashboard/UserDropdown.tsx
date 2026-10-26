"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { logoutAction } from "@/app/_actions/auth.actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserInfo } from "@/types/user.types";
import {
    Activity,
    CheckCircle2,
    HelpCircle,
    Key,
    Loader2,
    LogOut,
    Shield,
    Stethoscope,
    User,
} from "lucide-react";

interface UserDropdownProps {
    userInfo: UserInfo;
}

const UserDropdown = ({ userInfo }: UserDropdownProps) => {
    const [isPending, startTransition] = useTransition();
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

    const handleConfirmLogout = () => {
        startTransition(async () => {
            try {
                await logoutAction();
            } catch (error: unknown) {
                // Ignore Next.js redirect error if thrown
                if (
                    error &&
                    typeof error === "object" &&
                    "digest" in error &&
                    typeof (error as { digest: unknown }).digest === "string" &&
                    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
                ) {
                    return;
                }

                const message =
                    error instanceof Error ? error.message : "Failed to log out";
                toast.error(message);
                setIsLogoutDialogOpen(false);
            }
        });
    };

    const formattedRole = userInfo?.role
        ? userInfo.role.toLowerCase().replace("_", " ")
        : "user";

    // Clinical context metadata based on user role
    const renderClinicalContext = () => {
        if (userInfo?.doctor) {
            const regNum = userInfo.doctor.registrationNumber;
            const specialty = userInfo.doctor.specialties?.[0]?.specialty?.title;

            return (
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono mt-1">
                    <Stethoscope className="size-3 text-secondary shrink-0" />
                    <span className="truncate">
                        {regNum ? `BMDC: ${regNum}` : specialty || "Verified Clinician"}
                    </span>
                </div>
            );
        }

        if (userInfo?.patient) {
            const bloodGroup = userInfo.patient.patientHealthData?.bloodGroup;
            return (
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1">
                    <Activity className="size-3 text-primary shrink-0" />
                    <span>
                        {bloodGroup ? `Blood Group: ${bloodGroup}` : "Medix Patient EHR"}
                    </span>
                </div>
            );
        }

        if (userInfo?.role === "ADMIN" || userInfo?.role === "SUPER_ADMIN") {
            return (
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1">
                    <Shield className="size-3 text-ai shrink-0" />
                    <span>Clinical Governance</span>
                </div>
            );
        }

        return null;
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="User profile menu"
                        className="rounded-full p-0 size-9 min-h-9 min-w-9 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all cursor-pointer"
                    >
                        <Avatar className="size-9 border border-border/80 shadow-2xs">
                            <AvatarImage
                                src={
                                    userInfo?.image ||
                                    userInfo?.profilePhoto ||
                                    userInfo?.patient?.profilePhoto ||
                                    userInfo?.doctor?.profilePhoto ||
                                    userInfo?.admin?.profilePhoto ||
                                    undefined
                                }
                                alt={userInfo?.name || "User profile photo"}
                                className="object-cover"
                            />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                {userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : "U"}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-64 p-1.5 shadow-lg border-border/80" sideOffset={8}>
                    {/* User Identity Header Card */}
                    <DropdownMenuLabel className="p-2.5 font-normal">
                        <div className="flex flex-col space-y-1">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-foreground truncate">
                                    {userInfo?.name || "Medix User"}
                                </p>
                                <CheckCircle2 className="size-3.5 text-secondary shrink-0" aria-label="Verified account" />
                            </div>

                            <p className="text-xs text-muted-foreground truncate font-mono">
                                {userInfo?.email || ""}
                            </p>

                            <div className="pt-1 flex flex-wrap items-center gap-1.5">
                                <Badge
                                    variant="secondary"
                                    className="bg-primary/10 text-primary border-primary/20 text-[11px] font-medium px-2 py-0.5 rounded-full capitalize"
                                >
                                    {formattedRole}
                                </Badge>
                            </div>

                            {renderClinicalContext()}
                        </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild className="cursor-pointer py-2">
                        <Link href="/my-profile" className="flex items-center">
                            <User className="mr-2.5 h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">My Profile</span>
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="cursor-pointer py-2">
                        <Link href="/change-password" className="flex items-center">
                            <Key className="mr-2.5 h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Change Password</span>
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="cursor-pointer py-2">
                        <Link href="/doctors" className="flex items-center">
                            <HelpCircle className="mr-2.5 h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Help & Consultation Support</span>
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Safe Sign Out Trigger */}
                    <DropdownMenuItem
                        onSelect={(e) => {
                            e.preventDefault();
                            setIsLogoutDialogOpen(true);
                        }}
                        className="cursor-pointer py-2 text-destructive focus:bg-destructive/10 focus:text-destructive transition-colors font-medium"
                    >
                        <LogOut className="mr-2.5 h-4 w-4 text-destructive" />
                        <span>Sign Out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Logout Confirmation Safety Modal */}
            <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
                <AlertDialogContent className="w-[calc(100vw-2rem)] max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-semibold text-foreground">
                            Sign Out of Medix?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
                            Are you sure you want to log out? Any in-progress clinical consultations, draft prescriptions, or active filter selections will be concluded.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4 gap-2">
                        <AlertDialogCancel disabled={isPending} className="h-9 text-xs">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleConfirmLogout();
                            }}
                            disabled={isPending}
                            aria-busy={isPending}
                            className="h-9 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-1.5"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="size-3.5 animate-spin" />
                                    <span>Signing out...</span>
                                </>
                            ) : (
                                <>
                                    <LogOut className="size-3.5" />
                                    <span>Sign Out</span>
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default UserDropdown;
