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
import { getMyAppointments } from "@/services/appointment.services";

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
            if (normalizedRole === "ADMIN" || normalizedRole === "SUPER_ADMIN") return "/admin/dashboard/appointments-management";
            return "/dashboard/my-appointments";
        case "schedule":
            if (normalizedRole === "DOCTOR") return "/doctor/dashboard/my-schedules";
            if (normalizedRole === "ADMIN" || normalizedRole === "SUPER_ADMIN") return "/admin/dashboard/doctor-schedules-managament";
            return "/dashboard/book-appointments";
        case "prescription":
            if (normalizedRole === "DOCTOR") return "/doctor/dashboard/prescriptions";
            if (normalizedRole === "ADMIN" || normalizedRole === "SUPER_ADMIN") return "/admin/dashboard/prescriptions-management";
            return "/dashboard/my-prescriptions";
        case "user":
            if (normalizedRole === "ADMIN" || normalizedRole === "SUPER_ADMIN") return "/admin/dashboard/patients-management";
            return "/my-profile";
        case "system":
        default:
            return "/my-profile";
    }
};

const getBaseNotificationsForRole = (userInfo?: UserInfo): DynamicNotification[] => {
    const role = userInfo?.role?.toUpperCase();
    const now = Date.now();

    if (role === "DOCTOR") {
        return [
            {
                id: "doc-1",
                title: "Upcoming Consultations",
                message: "You have active 30-minute consultation slots available for patient bookings.",
                type: "schedule",
                timestamp: new Date(now - 1000 * 60 * 20),
                read: false,
            },
            {
                id: "doc-2",
                title: "Prescriptions Queue",
                message: "Consultation summaries and digital prescriptions can be authored in your clinical portal.",
                type: "prescription",
                timestamp: new Date(now - 1000 * 60 * 90),
                read: false,
            },
            {
                id: "doc-3",
                title: "Patient Feedback",
                message: "A recent consultation received high patient satisfaction ratings.",
                type: "appointment",
                timestamp: new Date(now - 1000 * 60 * 60 * 12),
                read: true,
            },
        ];
    }

    if (role === "ADMIN" || role === "SUPER_ADMIN") {
        return [
            {
                id: "adm-1",
                title: "Doctor Directory Governance",
                message: "Review doctor schedules and credentials in specialties management.",
                type: "schedule",
                timestamp: new Date(now - 1000 * 60 * 30),
                read: false,
            },
            {
                id: "adm-2",
                title: "Patient Registrations",
                message: "New patient accounts registered on the Medix healthcare platform.",
                type: "user",
                timestamp: new Date(now - 1000 * 60 * 120),
                read: false,
            },
            {
                id: "adm-3",
                title: "System Operations",
                message: "Database queries, Redis cache, and Stripe payment webhooks operational.",
                type: "system",
                timestamp: new Date(now - 1000 * 60 * 60 * 8),
                read: true,
            },
        ];
    }

    // Default: PATIENT
    return [
        {
            id: "pat-1",
            title: "Telemedicine Consultation",
            message: "Book an appointment with vetted specialists in 30-minute consultation slots.",
            type: "appointment",
            timestamp: new Date(now - 1000 * 60 * 15),
            read: false,
        },
        {
            id: "pat-2",
            title: "Health Records Synced",
            message: "Your vitals and longitudinal health records are securely updated in Medix EHR.",
            type: "system",
            timestamp: new Date(now - 1000 * 60 * 180),
            read: false,
        },
        {
            id: "pat-3",
            title: "Prescription History",
            message: "Access your digital prescriptions and diagnostic reports anytime.",
            type: "prescription",
            timestamp: new Date(now - 1000 * 60 * 60 * 24),
            read: true,
        },
    ];
};

const NotificationDropdown = ({ userInfo }: NotificationDropdownProps) => {
    const router = useRouter();
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [isAllModalOpen, setIsAllModalOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState<"all" | "unread">("all");
    const [isLoading, setIsLoading] = useState(false);
    const [notifications, setNotifications] = useState<DynamicNotification[]>([]);

    const storageKey = useMemo(() => {
        return `medix_read_notifications_${userInfo?.id || userInfo?.email || "guest"}`;
    }, [userInfo?.id, userInfo?.email]);

    // Load and synthesize dynamic notifications
    useEffect(() => {
        let isMounted = true;

        const loadDynamicNotifications = async () => {
            setIsLoading(true);
            try {
                const baseList = getBaseNotificationsForRole(userInfo);

                // Read persisted read-status IDs from localStorage
                let readIds: string[] = [];
                try {
                    const stored = localStorage.getItem(storageKey);
                    if (stored) {
                        readIds = JSON.parse(stored);
                    }
                } catch {
                    // Ignore storage read errors
                }

                // If user is logged in, attempt to fetch live appointment updates
                if (userInfo?.id) {
                    try {
                        const appointmentsRes = await getMyAppointments();
                        const appointments = appointmentsRes?.data;

                        if (Array.isArray(appointments) && appointments.length > 0) {
                            const latest = appointments.slice(0, 3);
                            const appointmentNotifications: DynamicNotification[] = latest.map((appt) => {
                                const doctorName = appt.doctor?.name || "Specialist";
                                const isPatient = userInfo.role === "PATIENT";
                                const patientName = appt.patient?.name || "Patient";

                                const statusText = appt.status ? appt.status.toLowerCase() : "scheduled";

                                return {
                                    id: `appt-${appt.id}`,
                                    title: `Appointment ${appt.status || "Scheduled"}`,
                                    message: isPatient
                                        ? `Consultation with Dr. ${doctorName} is marked as ${statusText}.`
                                        : `Consultation with ${patientName} is marked as ${statusText}.`,
                                    type: "appointment" as NotificationType,
                                    timestamp: new Date(appt.createdAt || Date.now()),
                                    read: readIds.includes(`appt-${appt.id}`),
                                };
                            });

                            if (isMounted) {
                                // Merge appointment notifications on top of base
                                const merged = [
                                    ...appointmentNotifications,
                                    ...baseList.map((item) => ({
                                        ...item,
                                        read: readIds.includes(item.id) ? true : item.read,
                                    })),
                                ];
                                setNotifications(merged);
                                return;
                            }
                        }
                    } catch {
                        // Network error fallback to base list
                    }
                }

                if (isMounted) {
                    setNotifications(
                        baseList.map((item) => ({
                            ...item,
                            read: readIds.includes(item.id) ? true : item.read,
                        }))
                    );
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadDynamicNotifications();

        return () => {
            isMounted = false;
        };
    }, [userInfo, storageKey]);

    const unreadCount = useMemo(() => {
        return notifications.filter((n) => !n.read).length;
    }, [notifications]);

    const persistReadStatus = useCallback(
        (updatedNotifications: DynamicNotification[]) => {
            try {
                const readIds = updatedNotifications.filter((n) => n.read).map((n) => n.id);
                localStorage.setItem(storageKey, JSON.stringify(readIds));
            } catch {
                // Ignore storage write errors
            }
        },
        [storageKey]
    );

    const handleNotificationClick = (notification: DynamicNotification) => {
        // 1. Mark as read locally and persist
        const updated = notifications.map((item) =>
            item.id === notification.id ? { ...item, read: true } : item
        );
        setNotifications(updated);
        persistReadStatus(updated);

        // 2. Close popover/modal
        setIsPopoverOpen(false);
        setIsAllModalOpen(false);

        // 3. Role-aware deep-link routing
        const targetUrl = notification.actionUrl || resolveNotificationRoute(notification.type, userInfo?.role);
        router.push(targetUrl);
    };

    const handleMarkAllAsRead = () => {
        const updated = notifications.map((n) => ({ ...n, read: true }));
        setNotifications(updated);
        persistReadStatus(updated);
        toast.success("All notifications marked as read");
    };

    const filteredNotifications = useMemo(() => {
        return activeFilter === "unread"
            ? notifications.filter((n) => !n.read)
            : notifications;
    }, [notifications, activeFilter]);

    return (
        <>
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
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
                        {isLoading ? (
                            <div className="py-10 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                <Loader2 className="size-5 animate-spin text-primary" />
                                <span className="text-xs">Updating alerts...</span>
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
                                    {activeFilter === "unread" ? "No unread alerts" : "No recent notifications"}
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
