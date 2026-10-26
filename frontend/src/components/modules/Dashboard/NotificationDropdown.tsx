"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import {
    Bell,
    Calendar,
    CheckCheck,
    CheckCircle,
    Clock,
    FileText,
    UserPlus,
    Loader2,
    Sparkles,
} from "lucide-react";
import { UserInfo } from "@/types/user.types";
import {
    getMyNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from "@/services/notification.services";
import { INotification } from "@/types/notification.types";

export type NotificationType = "appointment" | "schedule" | "prescription" | "system" | "user";

export interface DynamicNotification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    timestamp: Date;
    read: boolean;
    actionUrl?: string;
}

interface NotificationDropdownProps {
    userInfo?: UserInfo;
}

const normalizeNotificationType = (type?: string): NotificationType => {
    switch (type?.toUpperCase()) {
        case "APPOINTMENT":
            return "appointment";
        case "SCHEDULE":
            return "schedule";
        case "PRESCRIPTION":
            return "prescription";
        case "USER":
            return "user";
        case "SYSTEM":
        default:
            return "system";
    }
};

const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
        case "appointment":
            return <Calendar className="h-4 w-4 text-primary" />;
        case "schedule":
            return <Clock className="h-4 w-4 text-secondary" />;
        case "prescription":
            return <FileText className="h-4 w-4 text-primary" />;
        case "system":
            return <CheckCircle className="h-4 w-4 text-ai" />;
        case "user":
            return <UserPlus className="h-4 w-4 text-amber-500" />;
        default:
            return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
};

const getNotificationIconBg = (type: NotificationType) => {
    switch (type) {
        case "appointment":
            return "bg-primary/10 text-primary";
        case "schedule":
            return "bg-secondary/10 text-secondary";
        case "prescription":
            return "bg-primary/10 text-primary";
        case "system":
            return "bg-ai/10 text-ai";
        case "user":
            return "bg-amber-500/10 text-amber-500";
        default:
            return "bg-muted text-muted-foreground";
    }
};

export const resolveNotificationRoute = (type: NotificationType, role?: string): string => {
    const normalizedRole = role?.toUpperCase();
    switch (type) {
        case "appointment":
            if (normalizedRole === "DOCTOR") return "/doctor/dashboard/appointments";
            if (normalizedRole === "ADMIN" || normalizedRole === "SUPER_ADMIN")
                return "/admin/dashboard/appointments-management";
            return "/dashboard/my-appointments";
        case "schedule":
            if (normalizedRole === "DOCTOR") return "/doctor/dashboard/my-schedules";
            if (normalizedRole === "ADMIN" || normalizedRole === "SUPER_ADMIN")
                return "/admin/dashboard/doctor-schedules-managament";
            return "/dashboard/book-appointments";
        case "prescription":
            if (normalizedRole === "DOCTOR") return "/doctor/dashboard/prescriptions";
            if (normalizedRole === "ADMIN" || normalizedRole === "SUPER_ADMIN")
                return "/admin/dashboard/prescriptions-management";
            return "/dashboard/my-prescriptions";
        case "user":
            if (normalizedRole === "ADMIN" || normalizedRole === "SUPER_ADMIN")
                return "/admin/dashboard/patients-management";
            return "/my-profile";
        case "system":
        default:
            return "/my-profile";
    }
};

const NotificationDropdown = ({ userInfo }: NotificationDropdownProps) => {
    const router = useRouter();
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [isAllModalOpen, setIsAllModalOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState<"all" | "unread">("all");
    const [isLoading, setIsLoading] = useState(false);
    const [notifications, setNotifications] = useState<DynamicNotification[]>([]);
    const [serverUnreadCount, setServerUnreadCount] = useState(0);

    const mapNotification = useCallback((item: INotification): DynamicNotification => {
        return {
            id: item.id,
            title: item.title,
            message: item.message,
            type: normalizeNotificationType(item.type),
            timestamp: new Date(item.createdAt),
            read: item.read,
            actionUrl: item.actionUrl || undefined,
        };
    }, []);

    const fetchNotifications = useCallback(async () => {
        if (!userInfo?.id) return;
        setIsLoading(true);
        try {
            const res = await getMyNotifications({ limit: 50 });
            if (res?.success && Array.isArray(res.data)) {
                setNotifications(res.data.map(mapNotification));
                if (res.meta?.unreadCount !== undefined) {
                    setServerUnreadCount(res.meta.unreadCount);
                }
            }
        } catch (error) {
            console.error("Failed to fetch live notifications:", error);
        } finally {
            setIsLoading(false);
        }
    }, [userInfo?.id, mapNotification]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Refresh when opening popover or modal
    const handlePopoverOpenChange = (open: boolean) => {
        setIsPopoverOpen(open);
        if (open) {
            fetchNotifications();
        }
    };

    const unreadCount = useMemo(() => {
        return notifications.filter((n) => !n.read).length || serverUnreadCount;
    }, [notifications, serverUnreadCount]);

    const handleNotificationClick = async (notification: DynamicNotification) => {
        // 1. Optimistically mark as read locally
        setNotifications((prev) =>
            prev.map((item) => (item.id === notification.id ? { ...item, read: true } : item))
        );
        setServerUnreadCount((prev) => Math.max(0, prev - 1));

        // 2. Persist to backend
        try {
            await markNotificationAsRead(notification.id);
        } catch (error) {
            console.error("Failed to mark notification as read on server:", error);
        }

        // 3. Close popover/modal
        setIsPopoverOpen(false);
        setIsAllModalOpen(false);

        // 4. Role-aware deep-link routing
        const targetUrl =
            notification.actionUrl || resolveNotificationRoute(notification.type, userInfo?.role);
        router.push(targetUrl);
    };

    const handleMarkAllAsRead = async () => {
        // Optimistic update
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setServerUnreadCount(0);

        try {
            await markAllNotificationsAsRead();
            toast.success("All notifications marked as read");
        } catch (error) {
            console.error("Failed to mark all as read on server:", error);
            toast.error("Could not update all notifications on server");
        }
    };

    const filteredNotifications = useMemo(() => {
        return activeFilter === "unread" ? notifications.filter((n) => !n.read) : notifications;
    }, [notifications, activeFilter]);

    return (
        <>
            <Popover open={isPopoverOpen} onOpenChange={handlePopoverOpenChange}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        aria-label={
                            unreadCount > 0
                                ? `Notifications (${unreadCount} unread)`
                                : "Notifications"
                        }
                        className="relative size-9 min-h-9 min-w-9 rounded-md border-border/80 hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors"
                    >
                        <Bell className="size-4.5" />
                        {unreadCount > 0 && (
                            <Badge
                                className="absolute -top-1 -right-1 size-5 rounded-full p-0 flex items-center justify-center pointer-events-none bg-primary text-primary-foreground font-medium leading-none text-[10px] shadow-2xs border-2 border-background"
                                aria-hidden="true"
                            >
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </Badge>
                        )}
                    </Button>
                </PopoverTrigger>

                <PopoverContent align="end" className="w-80 p-0 shadow-lg border-border/80" sideOffset={8}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-3.5 border-b border-border/80 bg-card">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                            {unreadCount > 0 && (
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[11px] px-1.5 py-0">
                                    {unreadCount} new
                                </Badge>
                            )}
                        </div>

                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleMarkAllAsRead}
                                className="h-7 px-2 text-xs gap-1 text-primary hover:text-primary-hover hover:bg-primary/10 transition-colors"
                            >
                                <CheckCheck className="size-3.5" />
                                Mark all read
                            </Button>
                        )}
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1 p-2 border-b border-border/60 bg-muted/30">
                        <Button
                            variant={activeFilter === "all" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-7 text-xs px-2.5 font-medium"
                            onClick={() => setActiveFilter("all")}
                            aria-pressed={activeFilter === "all"}
                        >
                            All ({notifications.length})
                        </Button>
                        <Button
                            variant={activeFilter === "unread" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-7 text-xs px-2.5 font-medium"
                            onClick={() => setActiveFilter("unread")}
                            aria-pressed={activeFilter === "unread"}
                        >
                            Unread ({unreadCount})
                        </Button>
                    </div>

                    {/* Notifications List */}
                    <ScrollArea className="max-h-80">
                        {isLoading && notifications.length === 0 ? (
                            <div className="py-10 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                <Loader2 className="size-5 animate-spin text-primary" />
                                <span className="text-xs">Loading notifications...</span>
                            </div>
                        ) : filteredNotifications.length > 0 ? (
                            <div className="divide-y divide-border/40">
                                {filteredNotifications.map((notification) => (
                                    <button
                                        type="button"
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className="w-full flex items-start gap-3 p-3 text-left hover:bg-accent/60 focus-visible:bg-accent/80 focus-visible:outline-none transition-colors cursor-pointer group"
                                    >
                                        <div className={`mt-0.5 p-2 rounded-md shrink-0 ${getNotificationIconBg(notification.type)}`}>
                                            {getNotificationIcon(notification.type)}
                                        </div>

                                        <div className="flex-1 space-y-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                                    {notification.title}
                                                </p>
                                                {!notification.read && (
                                                    <span className="size-2 shrink-0 rounded-full bg-primary" aria-label="Unread notification">
                                                        <span className="sr-only">Unread</span>
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                                {notification.message}
                                            </p>

                                            <p className="text-[11px] text-muted-foreground/80 font-mono">
                                                {formatDistanceToNow(notification.timestamp, {
                                                    addSuffix: true,
                                                })}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="py-10 text-center text-xs text-muted-foreground space-y-1">
                                <Sparkles className="size-5 mx-auto text-muted-foreground/50 mb-1" />
                                <p className="font-medium text-foreground">All caught up</p>
                                <p className="text-[11px]">
                                    {activeFilter === "unread" ? "No unread alerts" : "No notifications yet"}
                                </p>
                            </div>
                        )}
                    </ScrollArea>

                    {/* Footer View All Action */}
                    <div className="border-t border-border/80 p-2 bg-card">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setIsPopoverOpen(false);
                                setIsAllModalOpen(true);
                            }}
                            className="w-full text-xs font-medium justify-center text-muted-foreground hover:text-foreground hover:bg-accent"
                        >
                            View All Notifications
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

            {/* In-page All Notifications Modal Dialog */}
            <Dialog open={isAllModalOpen} onOpenChange={setIsAllModalOpen}>
                <DialogContent className="w-[calc(100vw-2rem)] max-w-lg p-0 gap-0 overflow-hidden">
                    <DialogHeader className="border-b px-6 py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                                <DialogTitle className="text-lg font-semibold text-foreground">
                                    All Notifications
                                </DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                    Recent updates and clinical platform alerts.
                                </DialogDescription>
                            </div>
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleMarkAllAsRead}
                                    className="gap-1.5 text-xs h-8 text-primary hover:text-primary-hover self-start sm:self-center"
                                >
                                    <CheckCheck className="size-3.5" />
                                    Mark all as read
                                </Button>
                            )}
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex items-center gap-2 pt-3">
                            <Button
                                variant={activeFilter === "all" ? "secondary" : "ghost"}
                                size="sm"
                                className="h-7 text-xs px-3 font-medium"
                                onClick={() => setActiveFilter("all")}
                                aria-pressed={activeFilter === "all"}
                            >
                                All ({notifications.length})
                            </Button>
                            <Button
                                variant={activeFilter === "unread" ? "secondary" : "ghost"}
                                size="sm"
                                className="h-7 text-xs px-3 font-medium"
                                onClick={() => setActiveFilter("unread")}
                                aria-pressed={activeFilter === "unread"}
                            >
                                Unread ({unreadCount})
                            </Button>
                        </div>
                    </DialogHeader>

                    <ScrollArea className="max-h-[60vh] p-4">
                        {filteredNotifications.length === 0 ? (
                            <div className="py-12 text-center text-sm text-muted-foreground">
                                {activeFilter === "unread"
                                    ? "No unread notifications"
                                    : "No notifications found"}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredNotifications.map((notification) => (
                                    <button
                                        key={notification.id}
                                        type="button"
                                        onClick={() => handleNotificationClick(notification)}
                                        className="w-full flex items-start gap-3 p-3.5 rounded-lg border border-border/80 bg-card hover:bg-accent/60 transition-colors cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                    >
                                        <div className={`mt-0.5 p-2 rounded-md shrink-0 ${getNotificationIconBg(notification.type)}`}>
                                            {getNotificationIcon(notification.type)}
                                        </div>

                                        <div className="flex-1 space-y-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h4 className="text-sm font-medium text-foreground">
                                                    {notification.title}
                                                </h4>
                                                {!notification.read && (
                                                    <span className="size-2 shrink-0 rounded-full bg-primary">
                                                        <span className="sr-only">Unread</span>
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                {notification.message}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground/80 pt-0.5 font-mono">
                                                {formatDistanceToNow(notification.timestamp, {
                                                    addSuffix: true,
                                                })}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default NotificationDropdown;
