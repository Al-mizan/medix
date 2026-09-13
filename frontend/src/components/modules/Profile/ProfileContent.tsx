"use client";

import { getMyProfileAction } from "@/app/(dashboardLayout)/(commonProtectedLayout)/my-profile/_action";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiResponse } from "@/types/api.types";
import { UserInfo } from "@/types/user.types";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, RefreshCw } from "lucide-react";
import React, { useEffect, useState } from "react";
import ProfileEditForm from "./ProfileEditForm";
import ProfileHeader from "./ProfileHeader";
import ProfileView from "./ProfileView";

interface ProfileContentProps {
    initialData?: UserInfo | null;
}

const ProfileContent: React.FC<ProfileContentProps> = ({ initialData }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const {
        data: profileResponse,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["my-profile"],
        queryFn: async () => {
            const res = await getMyProfileAction();
            if (!res.success) {
                throw new Error(res.message || "Failed to load profile");
            }
            return res as ApiResponse<UserInfo>;
        },
        initialData: initialData
            ? ({
                  success: true,
                  message: "Initial user data",
                  data: initialData,
              } as ApiResponse<UserInfo>)
            : undefined,
    });

    const user = profileResponse?.data || initialData;

    // Handle avatar file selection and object URL cleanup
    const handleAvatarChange = (file: File) => {
        setAvatarFile(file);
        if (avatarPreview) {
            URL.revokeObjectURL(avatarPreview);
        }
        const previewUrl = URL.createObjectURL(file);
        setAvatarPreview(previewUrl);
    };

    const handleClearAvatarFile = () => {
        setAvatarFile(null);
        if (avatarPreview) {
            URL.revokeObjectURL(avatarPreview);
            setAvatarPreview(null);
        }
    };

    useEffect(() => {
        return () => {
            if (avatarPreview) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);

    if (isLoading && !user) {
        return (
            <div className="max-w-5xl mx-auto space-y-6">
                <Skeleton className="h-44 w-full rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-64 md:col-span-2 rounded-xl" />
                    <Skeleton className="h-64 rounded-xl" />
                </div>
            </div>
        );
    }

    if (isError || !user) {
        return (
            <div className="max-w-md mx-auto py-12">
                <Alert variant="destructive">
                    <AlertCircle className="size-4" />
                    <AlertTitle>Profile Error</AlertTitle>
                    <AlertDescription className="mt-1 text-sm">
                        {error instanceof Error
                            ? error.message
                            : "Could not retrieve user profile data."}
                    </AlertDescription>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        className="mt-4 border-destructive/40 hover:bg-destructive/10"
                    >
                        <RefreshCw className="size-3.5 mr-1.5" />
                        Retry
                    </Button>
                </Alert>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Profile Header (Avatar + Quick Info + Edit Mode Toggle) */}
            <ProfileHeader
                user={user}
                isEditing={isEditing}
                onToggleEdit={() => {
                    setIsEditing((prev) => !prev);
                    if (isEditing) {
                        handleClearAvatarFile();
                    }
                }}
                avatarPreview={avatarPreview}
                onAvatarChange={handleAvatarChange}
            />

            {/* Profile View or Edit Form */}
            {isEditing ? (
                <ProfileEditForm
                    user={user}
                    onCancel={() => {
                        setIsEditing(false);
                        handleClearAvatarFile();
                    }}
                    avatarFile={avatarFile}
                    onClearAvatarFile={handleClearAvatarFile}
                />
            ) : (
                <ProfileView user={user} />
            )}
        </div>
    );
};

export default ProfileContent;
