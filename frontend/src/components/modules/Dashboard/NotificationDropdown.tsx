"use client";

import { useState } from "react";
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import {
    Bell,
    Calendar,
    CheckCheck,
    CheckCircle,
    Clock,
    UserPlus,
} from "lucide-react";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: "appointment" | "schedule" | "system" | "user";
    timestamp: Date;
    read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: "1",
        title: "New Appointment Scheduled",
        message:
            "You have a new appointment scheduled with John Doe on 2024-06-15 at 10:00 AM.",
        type: "appointment",
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
    },
    {
        id: "2",
        title: "Schedule Updated",
        message: "Your schedule has been updated for the week of 2024-06-17.",
        type: "schedule",
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        read: true,
    },
    {
        id: "3",
        title: "System Maintenance",
        message:
            "The system will undergo maintenance on 2024-06-20 from 1:00 AM to 3:00 AM.",
        type: "system",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: false,
    },
    {
        id: "4",
        title: "New User Registered",
        message: "A new user, Jane Smith, has registered on the platform.",
        type: "user",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
        read: true,
    },
];

const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
        case "appointment":
            return <Calendar className="h-4 w-4 text-blue-600" />;
        case "schedule":
            return <Clock className="h-4 w-4 text-amber-600" />;
        case "system":
            return <CheckCircle className="h-4 w-4 text-purple-600" />;
        case "user":
            return <UserPlus className="h-4 w-4 text-green-600" />;
        default:
            return <Bell className="h-4 w-4 text-gray-600" />;
    }
};

const NotificationDropdown = () => {
    const router = useRouter();
    const [notifications, setNotifications] =
        useState<Notification[]>(MOCK_NOTIFICATIONS);
    const [isAllModalOpen, setIsAllModalOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState<"all" | "unread">("all");

    const unreadCount = notifications.filter((n) => !n.read).length;

    const handleNotificationClick = (notification: Notification) => {
        // 1. Mark as read
        setNotifications((prev) =>
            prev.map((item) =>
                item.id === notification.id ? { ...item, read: true } : item,
            ),
        );

        // 2. Feedback toast
        toast.info(notification.title, {
            description: notification.message,
        });

        // 3. Deep-link routing based on type
        switch (notification.type) {
            case "appointment":
                router.push("/admin/dashboard/appointments-management");
                break;
            case "schedule":
                router.push("/admin/dashboard/doctor-schedules-managament");
                break;
            case "user":
                router.push("/admin/dashboard/patients-management");
                break;
            default:
                break;
        }
    };

    const handleMarkAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        toast.success("All notifications marked as read");
    };

    const filteredNotifications =
        activeFilter === "unread"
            ? notifications.filter((n) => !n.read)
            : notifications;

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant={"outline"}
                        size={"icon"}
                        aria-label="Notifications"
                        className="relative min-h-[44px] min-w-[44px] sm:min-h-9 sm:min-w-9"
                    >
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <Badge
                                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center pointer-events-none"
                                variant={"destructive"}
                                aria-label={`${unreadCount} unread notifications`}
                            >
                                <span className="text-[10px] font-medium leading-none">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            </Badge>
                        )}
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align={"end"} className="w-80">
                    <DropdownMenuLabel className="flex items-center justify-between">
                        <span>Notifications</span>
                        {unreadCount > 0 && (
                            <Badge variant={"secondary"} className="ml-2">
                                {unreadCount} new
                            </Badge>
                        )}
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <ScrollArea className="h-75">
                        {notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <DropdownMenuItem
                                    key={notification.id}
                                    onClick={() =>
                                        handleNotificationClick(notification)
                                    }
                                    className="flex flex-col items-start gap-2 p-3 cursor-pointer rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:bg-neutral-100 dark:focus:bg-neutral-800 transition-colors my-1"
                                >
                                    <div className="flex items-start gap-2.5 w-full">
                                        <div className="mt-0.5 shrink-0">
                                            {getNotificationIcon(
                                                notification.type,
                                            )}
                                        </div>

                                        <div className="flex-1 space-y-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-sm font-medium leading-none truncate">
                                                    {notification.title}
                                                </p>
                                                {!notification.read && (
                                                    <span
                                                        className="h-2 w-2 shrink-0 rounded-full bg-blue-600"
                                                        aria-label="Unread"
                                                    />
                                                )}
                                            </div>

                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {notification.message}
                                            </p>

                                            <p className="text-[11px] text-muted-foreground">
                                                {formatDistanceToNow(
                                                    notification.timestamp,
                                                    {
                                                        addSuffix: true,
                                                    },
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </DropdownMenuItem>
                            ))
                        ) : (
                            <div className="p-6 text-center text-sm text-muted-foreground">
                                No notifications
                            </div>
                        )}
                    </ScrollArea>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onSelect={(e) => {
                            e.preventDefault();
                            setIsAllModalOpen(true);
                        }}
                        className="text-center justify-center cursor-pointer font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:bg-neutral-100 dark:focus:bg-neutral-800 transition-colors"
                    >
                        View All Notifications
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* In-page All Notifications Modal */}
            <Dialog open={isAllModalOpen} onOpenChange={setIsAllModalOpen}>
                <DialogContent className="w-[calc(100vw-2rem)] max-w-lg p-0 gap-0 overflow-hidden">
                    <DialogHeader className="border-b px-6 py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                                <DialogTitle className="text-lg font-semibold">
                                    All Notifications
                                </DialogTitle>
                                <DialogDescription className="text-xs mt-0.5">
                                    Recent updates and platform alerts.
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
                                variant={
                                    activeFilter === "all"
                                        ? "secondary"
                                        : "ghost"
                                }
                                size="sm"
                                className="h-7 text-xs px-3"
                                onClick={() => setActiveFilter("all")}
                            >
                                All ({notifications.length})
                            </Button>
                            <Button
                                variant={
                                    activeFilter === "unread"
                                        ? "secondary"
                                        : "ghost"
                                }
                                size="sm"
                                className="h-7 text-xs px-3"
                                onClick={() => setActiveFilter("unread")}
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
                                    <div
                                        key={notification.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => {
                                            handleNotificationClick(
                                                notification,
                                            );
                                            setIsAllModalOpen(false);
                                        }}
                                        onKeyDown={(e) => {
                                            if (
                                                e.key === "Enter" ||
                                                e.key === " "
                                            ) {
                                                e.preventDefault();
                                                handleNotificationClick(
                                                    notification,
                                                );
                                                setIsAllModalOpen(false);
                                            }
                                        }}
                                        className="flex items-start gap-3 p-3.5 rounded-lg border border-border/80 bg-card hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        <div className="mt-0.5 p-2 rounded-md bg-muted/60 shrink-0">
                                            {getNotificationIcon(
                                                notification.type,
                                            )}
                                        </div>

                                        <div className="flex-1 space-y-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h4 className="text-sm font-medium text-foreground">
                                                    {notification.title}
                                                </h4>
                                                {!notification.read && (
                                                    <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {notification.message}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground/80 pt-0.5">
                                                {formatDistanceToNow(
                                                    notification.timestamp,
                                                    { addSuffix: true },
                                                )}
                                            </p>
                                        </div>
                                    </div>
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
