"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserInfo } from "@/types/user.types";
import { Camera, CheckCircle2, Edit3, X } from "lucide-react";
import React, { useRef } from "react";

interface ProfileHeaderProps {
    user: UserInfo;
    isEditing: boolean;
    onToggleEdit: () => void;
    avatarPreview: string | null;
    onAvatarChange: (file: File) => void;
}

const getRoleBadgeStyle = (role: string) => {
    switch (role) {
        case "PATIENT":
            return "bg-[#E1F3F6] text-[#075463] border-transparent hover:bg-[#E1F3F6]";
        case "DOCTOR":
            return "bg-[#E3F7EE] text-[#0F5C3E] border-transparent hover:bg-[#E3F7EE]";
        case "ADMIN":
        case "SUPER_ADMIN":
            return "bg-muted text-foreground border-border hover:bg-muted";
        default:
            return "bg-muted text-muted-foreground border-transparent";
    }
};

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    user,
    isEditing,
    onToggleEdit,
    avatarPreview,
    onAvatarChange,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentAvatar =
        avatarPreview ||
        user.image ||
        user.profilePhoto ||
        user.patient?.profilePhoto ||
        user.doctor?.profilePhoto ||
        user.admin?.profilePhoto ||
        undefined;

    const initial = user.name ? user.name.charAt(0).toUpperCase() : "U";

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onAvatarChange(file);
        }
    };

    const isPatient = user.role === "PATIENT";

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-card to-muted/20 border border-border p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                    {/* Avatar Container */}
                    <div className="relative group">
                        <Avatar className="size-24 sm:size-28 border-4 border-background shadow-md">
                            <AvatarImage
                                src={currentAvatar}
                                alt={user.name}
                                className="object-cover"
                            />
                            <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                                {initial}
                            </AvatarFallback>
                        </Avatar>

                        {/* File Upload Overlay (Patient in Edit Mode) */}
                        {isEditing && isPatient && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    aria-label="Upload profile photo"
                                    className="absolute inset-0 rounded-full bg-black/40 text-white flex flex-col items-center justify-center opacity-90 hover:opacity-100 transition-opacity cursor-pointer shadow"
                                >
                                    <Camera className="size-6 mb-1" />
                                    <span className="text-[11px] font-semibold">
                                        Upload
                                    </span>
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                            </>
                        )}
                    </div>

                    {/* User Metadata */}
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                {user.name}
                            </h1>

                            <Badge
                                variant="secondary"
                                className={`text-xs px-2.5 py-0.5 font-semibold capitalize ${getRoleBadgeStyle(
                                    user.role
                                )}`}
                            >
                                {user.role.toLowerCase().replace("_", " ")}
                            </Badge>

                            {user.emailVerified && (
                                <span
                                    title="Verified Account"
                                    className="inline-flex items-center text-xs font-medium text-[#178A5E]"
                                >
                                    <CheckCircle2 className="size-4 mr-1 text-[#178A5E]" />
                                    Verified
                                </span>
                            )}
                        </div>

                        <p className="text-sm text-muted-foreground">
                            {user.email}
                        </p>

                        <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-muted-foreground pt-1">
                            <span className="inline-flex items-center gap-1.5">
                                <span className="size-2 rounded-full bg-[#178A5E]" />
                                Account Active
                            </span>
                            {user.createdAt && (
                                <span>
                                    Member since{" "}
                                    {new Date(user.createdAt).getFullYear()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Edit Toggle Button */}
                <div className="w-full sm:w-auto flex justify-center sm:justify-end">
                    <Button
                        type="button"
                        variant={isEditing ? "outline" : "default"}
                        onClick={onToggleEdit}
                        className={
                            isEditing
                                ? "border-muted-foreground/30 hover:bg-muted"
                                : "bg-[#0B7285] hover:bg-[#095E70] text-white"
                        }
                    >
                        {isEditing ? (
                            <>
                                <X className="size-4 mr-2" />
                                Cancel Editing
                            </>
                        ) : (
                            <>
                                <Edit3 className="size-4 mr-2" />
                                Edit Profile
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;
