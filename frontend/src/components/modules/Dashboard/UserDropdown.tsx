"use client";

import { logoutAction } from "@/app/_actions/auth.actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserInfo } from "@/types/user.types";
import { Key, Loader2, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";

interface UserDropdownProps {
    userInfo: UserInfo;
}

const UserDropdown = ({ userInfo }: UserDropdownProps) => {
    const [isPending, startTransition] = useTransition();

    const handleLogout = () => {
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
            }
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant={"ghost"}
                    size={"icon"}
                    className="rounded-full p-0 size-8 hover:opacity-90 transition-opacity"
                >
                    <Avatar className="size-8">
                        <AvatarImage
                            src={
                                userInfo.image ||
                                userInfo.profilePhoto ||
                                userInfo.patient?.profilePhoto ||
                                userInfo.doctor?.profilePhoto ||
                                userInfo.admin?.profilePhoto ||
                                undefined
                            }
                            alt={userInfo.name}
                            className="object-cover"
                        />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                            {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : "U"}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align={"end"} className="w-56">
                <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{userInfo.name}</p>

                        <p className="text-xs text-muted-foreground">
                            {userInfo.email}
                        </p>

                        <p className="text-xs text-primary capitalize">
                            {userInfo.role.toLowerCase().replace("_", " ")}
                        </p>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                    <Link href={"/my-profile"}>
                        <User className="mr-2 h-4 w-4" />
                        My Profile
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link href={"/change-password"}>
                        <Key className="mr-2 h-4 w-4" />
                        Change Password
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isPending}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                >
                    {isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <LogOut className="mr-2 h-4 w-4" />
                    )}
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default UserDropdown;
