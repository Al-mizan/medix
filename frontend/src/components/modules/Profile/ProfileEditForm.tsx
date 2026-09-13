"use client";

import React from "react";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { UserInfo } from "@/types/user.types";
import { AlertCircle, Check, UserCheck } from "lucide-react";
import ProfileClinicalCredentialsCard from "./ProfileClinicalCredentialsCard";
import ProfileEditFormFields from "./ProfileEditFormFields";
import { useProfileUpdate } from "./useProfileUpdate";

interface ProfileEditFormProps {
    user: UserInfo;
    onCancel: () => void;
    avatarFile: File | null;
    onClearAvatarFile: () => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
    user,
    onCancel,
    avatarFile,
    onClearAvatarFile,
}) => {
    const { form, serverError, isPending } = useProfileUpdate({
        user,
        avatarFile,
        onClearAvatarFile,
        onCancel,
    });

    return (
        <form
            method="POST"
            action="#"
            noValidate
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
            }}
            className="space-y-6"
        >
            <Card className="border-border/80 shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                        <UserCheck className="size-5 text-[#0B7285]" />
                        <CardTitle className="text-lg font-semibold">
                            Edit Profile Details
                        </CardTitle>
                    </div>
                    <CardDescription>
                        Update your editable personal information and contact credentials.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                    {/* Avatar preview banner if file selected */}
                    {avatarFile && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-[#E1F3F6] border border-[#0B7285]/20 text-xs text-[#075463]">
                            <span className="font-medium flex items-center gap-1.5">
                                <Check className="size-4 text-[#178A5E]" />
                                New profile photo selected: {avatarFile.name}
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onClearAvatarFile}
                                className="h-6 px-2 text-xs text-destructive hover:bg-destructive/10"
                            >
                                Remove
                            </Button>
                        </div>
                    )}

                    {/* Fields */}
                    <ProfileEditFormFields
                        form={form}
                        email={user.email}
                        role={user.role}
                    />

                    {/* Informative Read-Only Clinical Details for Doctors */}
                    {user.role === "DOCTOR" && user.doctor && (
                        <ProfileClinicalCredentialsCard doctorData={user.doctor} />
                    )}

                    {serverError && (
                        <Alert variant="destructive">
                            <AlertCircle className="size-4" />
                            <AlertDescription>{serverError}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>

                <CardFooter className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isPending}
                        className="border-border hover:bg-muted"
                    >
                        Cancel
                    </Button>

                    <form.Subscribe
                        selector={(s) => [s.canSubmit, s.isSubmitting] as const}
                    >
                        {([canSubmit, isSubmitting]) => (
                            <AppSubmitButton
                                isPending={isSubmitting || isPending}
                                pendingLabel="Saving..."
                                disabled={!canSubmit}
                                className="w-auto px-6 bg-[#0B7285] hover:bg-[#095E70] text-white"
                            >
                                Save Changes
                            </AppSubmitButton>
                        )}
                    </form.Subscribe>
                </CardFooter>
            </Card>
        </form>
    );
};

export default ProfileEditForm;
