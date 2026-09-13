import React from "react";
import Link from "next/link";
import { Activity, Key, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface ProfileSecuritySidebarProps {
    updatedAt?: string | Date | null;
}

export default function ProfileSecuritySidebar({ updatedAt }: ProfileSecuritySidebarProps) {
    return (
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
                        {updatedAt
                            ? new Date(updatedAt).toLocaleDateString()
                            : "N/A"}
                    </p>
                    <p>• Multi-device session authorization active</p>
                </CardContent>
            </Card>
        </div>
    );
}
