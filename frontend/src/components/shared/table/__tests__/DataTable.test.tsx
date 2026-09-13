import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ColumnDef } from "@tanstack/react-table";
import DataTable from "../DataTable";

interface MockItem {
    id: string;
    name: string;
    role: string;
}

const mockColumns: ColumnDef<MockItem>[] = [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => <span>{row.original.name}</span>,
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => <span>{row.original.role}</span>,
    },
];

const mockData: MockItem[] = [
    { id: "1", name: "Alice Doctor", role: "Cardiologist" },
    { id: "2", name: "Bob Patient", role: "Patient" },
    { id: "3", name: "Charlie Admin", role: "SuperAdmin" },
];

describe("DataTable", () => {
    it("renders column headers and row data cells correctly", () => {
        render(<DataTable data={mockData} columns={mockColumns} />);

        expect(screen.getByText("Name")).toBeInTheDocument();
        expect(screen.getByText("Role")).toBeInTheDocument();

        expect(screen.getByText("Alice Doctor")).toBeInTheDocument();
        expect(screen.getByText("Cardiologist")).toBeInTheDocument();
        expect(screen.getByText("Bob Patient")).toBeInTheDocument();
        expect(screen.getByText("Charlie Admin")).toBeInTheDocument();
    });

    it("renders fallback empty message when data array is empty", () => {
        render(
            <DataTable
                data={[]}
                columns={mockColumns}
                emptyMessage="No healthcare records found."
            />
        );

        expect(screen.getByText("No healthcare records found.")).toBeInTheDocument();
    });

    it("renders default empty message if no custom emptyMessage is provided", () => {
        render(<DataTable data={[]} columns={mockColumns} />);

        expect(screen.getByText("No data available.")).toBeInTheDocument();
    });

    it("renders pagination controls and handles page navigation callbacks", () => {
        const onPaginationChange = vi.fn();

        render(
            <DataTable
                data={mockData}
                columns={mockColumns}
                pagination={{
                    state: { pageIndex: 0, pageSize: 1 },
                    onPaginationChange,
                }}
                meta={{
                    page: 1,
                    limit: 1,
                    total: 3,
                    totalPages: 3,
                }}
            />
        );

        expect(screen.getByText("Total 3 items, 3 pages")).toBeInTheDocument();

        const nextBtn = screen.getByRole("button", { name: /next/i });
        expect(nextBtn).toBeInTheDocument();
        expect(nextBtn).not.toBeDisabled();

        const prevBtn = screen.getByRole("button", { name: /prev/i });
        expect(prevBtn).toBeDisabled();

        fireEvent.click(nextBtn);
        expect(onPaginationChange).toHaveBeenCalled();
    });

    it("renders action buttons when onView and onDelete handlers are provided", async () => {
        const onView = vi.fn();
        const onDelete = vi.fn();

        render(
            <DataTable
                data={mockData.slice(0, 1)}
                columns={mockColumns}
                actions={{ onView, onDelete }}
            />
        );

        expect(screen.getByText("Actions")).toBeInTheDocument();
        const actionsTrigger = screen.getByRole("button", { name: /open menu/i });
        expect(actionsTrigger).toBeInTheDocument();

        fireEvent.pointerDown(actionsTrigger);

        await waitFor(() => {
            expect(screen.getByText("View")).toBeInTheDocument();
            expect(screen.getByText("Delete")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("View"));
        expect(onView).toHaveBeenCalledWith(mockData[0]);
    });
});
