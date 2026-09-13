import { Badge } from "@/components/ui/badge";

export const getAppointmentStatusBadgeClass = (status?: string): string => {
    switch (status) {
        case "SCHEDULED":
            return "border-[#0B7285]/30 bg-[#E1F3F6] text-[#075463] dark:bg-[#0B7285]/20 dark:text-[#E1F3F6]";
        case "INPROGRESS":
            return "border-[#E3A130]/30 bg-[#FBF0DC] text-[#7A4A09] dark:bg-[#E3A130]/20 dark:text-[#FBF0DC]";
        case "COMPLETED":
            return "border-[#178A5E]/30 bg-[#E3F7EE] text-[#0F5C3E] dark:bg-[#178A5E]/20 dark:text-[#E3F7EE]";
        case "CANCELED":
            return "border-[#D8464B]/30 bg-[#FCEBEB] text-[#7A2323] dark:bg-[#D8464B]/20 dark:text-[#FCEBEB]";
        default:
            return "border-muted bg-muted/40 text-muted-foreground";
    }
};

export const getPaymentStatusBadgeClass = (status?: string): string => {
    switch (status) {
        case "PAID":
            return "border-[#178A5E]/30 bg-[#E3F7EE] text-[#0F5C3E] dark:bg-[#178A5E]/20 dark:text-[#E3F7EE]";
        case "UNPAID":
            return "border-[#E3A130]/30 bg-[#FBF0DC] text-[#7A4A09] dark:bg-[#E3A130]/20 dark:text-[#FBF0DC]";
        case "REFUNDED":
            return "border-[#0B7285]/30 bg-[#E1F3F6] text-[#075463] dark:bg-[#0B7285]/20 dark:text-[#E1F3F6]";
        case "FAILED":
            return "border-[#D8464B]/30 bg-[#FCEBEB] text-[#7A2323] dark:bg-[#D8464B]/20 dark:text-[#FCEBEB]";
        default:
            return "border-muted bg-muted/40 text-muted-foreground";
    }
};

export const AppointmentStatusBadge = ({ status }: { status?: string }) => {
    const label = status || "SCHEDULED";
    return (
        <Badge
            variant="outline"
            className={`font-medium text-xs px-2.5 py-0.5 rounded-full ${getAppointmentStatusBadgeClass(
                status,
            )}`}
        >
            {label}
        </Badge>
    );
};

export const PaymentStatusBadge = ({ status }: { status?: string }) => {
    const label = status || "UNPAID";
    return (
        <Badge
            variant="outline"
            className={`font-medium text-xs px-2.5 py-0.5 rounded-full ${getPaymentStatusBadgeClass(
                status,
            )}`}
        >
            {label}
        </Badge>
    );
};
