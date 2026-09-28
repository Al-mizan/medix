import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import DataTableSearch from "../DataTableSearch";

describe("DataTableSearch Component", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("hydrates with initialValue without triggering onDebouncedChange immediately", () => {
        const onDebouncedChange = vi.fn();
        render(
            <DataTableSearch
                initialValue="cardio"
                placeholder="Search doctors..."
                onDebouncedChange={onDebouncedChange}
            />
        );

        const input = screen.getByRole("textbox", { name: "Search doctors..." });
        expect(input).toHaveValue("cardio");
        expect(onDebouncedChange).not.toHaveBeenCalled();
    });

    it("debounces rapid input changes and fires callback once after 300ms pause", () => {
        const onDebouncedChange = vi.fn();
        render(
            <DataTableSearch
                placeholder="Search..."
                onDebouncedChange={onDebouncedChange}
            />
        );

        const input = screen.getByRole("textbox", { name: "Search..." });

        fireEvent.change(input, { target: { value: "d" } });
        act(() => {
            vi.advanceTimersByTime(100);
        });
        expect(onDebouncedChange).not.toHaveBeenCalled();

        fireEvent.change(input, { target: { value: "do" } });
        act(() => {
            vi.advanceTimersByTime(150);
        });
        expect(onDebouncedChange).not.toHaveBeenCalled();

        fireEvent.change(input, { target: { value: "doc" } });
        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(onDebouncedChange).toHaveBeenCalledTimes(1);
        expect(onDebouncedChange).toHaveBeenCalledWith("doc");
    });

    it("immediately clears input and fires onDebouncedChange with empty string on clear button click", () => {
        const onDebouncedChange = vi.fn();
        render(
            <DataTableSearch
                initialValue="cardio"
                placeholder="Search..."
                onDebouncedChange={onDebouncedChange}
            />
        );

        const clearBtn = screen.getByRole("button", { name: "Clear search" });
        fireEvent.click(clearBtn);

        const input = screen.getByRole("textbox", { name: "Search..." });
        expect(input).toHaveValue("");
        expect(onDebouncedChange).toHaveBeenCalledWith("");
    });

    it("renders loading spinner and keeps input non-blocking during queries", () => {
        const onDebouncedChange = vi.fn();
        render(
            <DataTableSearch
                initialValue="surgery"
                placeholder="Search..."
                isLoading={true}
                onDebouncedChange={onDebouncedChange}
            />
        );

        const spinner = screen.getByTestId("search-loading-spinner");
        expect(spinner).toBeInTheDocument();

        const input = screen.getByRole("textbox", { name: "Search..." });
        expect(input).not.toBeDisabled();
    });
});
