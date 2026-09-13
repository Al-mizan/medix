"use client";

import DateCell from "@/components/shared/cell/DateCell";
import UserInfoCell from "@/components/shared/cell/UserInfoCell";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IPayment } from "@/types/payment.types";
import { ColumnDef } from "@tanstack/react-table";
import { Download, ExternalLink, Eye, FileText, MoreHorizontal } from "lucide-react";
import { PaymentStatusBadge } from "./paymentBadges";

interface PaymentsColumnsOptions {
    onView?: (payment: IPayment) => void;
}

export const getPaymentsColumns = ({
    onView,
}: PaymentsColumnsOptions = {}): ColumnDef<IPayment>[] => [
    {
        id: "transactionId",
        accessorKey: "transactionId",
        header: "Transaction ID",
        cell: ({ row }) => {
            const txId = row.original.transactionId;
            return (
                <span
                    className="font-mono text-xs text-foreground bg-muted/60 px-2 py-1 rounded border border-border/50 max-w-[130px] truncate block"
                    title={txId}
                >
                    {txId ? `${txId.slice(0, 8)}...` : "—"}
                </span>
            );
        },
    },
    {
        id: "patient",
        header: "Patient",
        enableSorting: false,
        cell: ({ row }) => {
            const patient = row.original.patient || row.original.appointment?.patient;
            return (
                <UserInfoCell
                    name={patient?.name || "Unknown Patient"}
                    email={patient?.email || "No email"}
                    profilePhoto={patient?.profilePhoto || undefined}
                />
            );
        },
    },
    {
        id: "doctor",
        header: "Doctor",
        enableSorting: false,
        cell: ({ row }) => {
            const doctor = row.original.doctor || row.original.appointment?.doctor;
            const name = doctor?.name
                ? `Dr. ${doctor.name.replace(/^Dr\.\s*/i, "")}`
                : "Unknown Doctor";
            return (
                <UserInfoCell
                    name={name}
                    email={doctor?.email || "No email"}
                    profilePhoto={doctor?.profilePhoto || undefined}
                />
            );
        },
    },
    {
        id: "amount",
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
            const amount = row.original.amount;
            return (
                <span className="font-semibold text-sm text-foreground">
                    ${typeof amount === "number" ? amount.toFixed(2) : amount}
                </span>
            );
        },
    },
    {
        id: "status",
        accessorKey: "status",
        header: "Payment Status",
        cell: ({ row }) => {
            return <PaymentStatusBadge status={row.original.status} />;
        },
    },
    {
        id: "invoiceUrl",
        header: "Invoice",
        enableSorting: false,
        cell: ({ row }) => {
            const invoiceUrl = row.original.invoiceUrl;
            if (!invoiceUrl) {
                return <span className="text-xs text-muted-foreground">—</span>;
            }

            return (
                <a
                    href={invoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline px-2 py-1 rounded hover:bg-muted transition-colors"
                >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Download</span>
                    <ExternalLink className="h-2.5 w-2.5 opacity-70" />
                </a>
            );
        },
    },
    {
        id: "createdAt",
        accessorKey: "createdAt",
        header: "Payment Date",
        cell: ({ row }) => {
            return (
                <DateCell
                    date={row.original.createdAt}
                    formatString="MMM dd, yyyy"
                />
            );
        },
    },
    {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => {
            const payment = row.original;
            const hasInvoice = Boolean(payment.invoiceUrl);

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                            onClick={() => onView?.(payment)}
                            className="cursor-pointer"
                        >
                            <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                            View Details
                        </DropdownMenuItem>

                        {hasInvoice && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild className="cursor-pointer">
                                    <a
                                        href={payment.invoiceUrl!}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center"
                                    >
                                        <Download className="mr-2 h-4 w-4 text-muted-foreground" />
                                        Download PDF
                                    </a>
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export const paymentsColumns: ColumnDef<IPayment>[] = getPaymentsColumns();
