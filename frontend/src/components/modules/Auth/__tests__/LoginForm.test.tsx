import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginForm from "../LoginForm";
import * as loginActionModule from "@/app/(commonLayout)/(authRouteGroup)/login/_action";

vi.mock("@/app/(commonLayout)/(authRouteGroup)/login/_action", () => ({
    loginAction: vi.fn(),
}));

const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

describe("LoginForm", () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = createTestQueryClient();
    });

    it("renders email, password inputs, submit button, and OAuth options", () => {
        render(
            <QueryClientProvider client={queryClient}>
                <LoginForm />
            </QueryClientProvider>
        );

        expect(screen.getByText(/welcome back!/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /^log in$/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /sign in with google/i })).toBeInTheDocument();
    });

    it("toggles password visibility when the eye icon is clicked", () => {
        render(
            <QueryClientProvider client={queryClient}>
                <LoginForm />
            </QueryClientProvider>
        );

        const passwordInput = screen.getByPlaceholderText(/enter your password/i);
        expect(passwordInput).toHaveAttribute("type", "password");

        const toggleBtn = screen.getByRole("button", { name: /show password/i });
        fireEvent.click(toggleBtn);

        expect(passwordInput).toHaveAttribute("type", "text");
        expect(screen.getByRole("button", { name: /hide password/i })).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /hide password/i }));
        expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("displays validation error when an invalid email is entered", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <LoginForm />
            </QueryClientProvider>
        );

        const emailInput = screen.getByPlaceholderText(/enter your email/i);
        fireEvent.change(emailInput, { target: { value: "invalid-email" } });
        fireEvent.blur(emailInput);

        await waitFor(() => {
            expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
        });
    });

    it("calls loginAction upon valid submission", async () => {
        vi.mocked(loginActionModule.loginAction).mockResolvedValue({
            success: true,
            data: {} as unknown as Awaited<ReturnType<typeof loginActionModule.loginAction>> extends { data: infer D } ? D : never,
        } as unknown as Awaited<ReturnType<typeof loginActionModule.loginAction>>);

        const { container } = render(
            <QueryClientProvider client={queryClient}>
                <LoginForm redirectPath="/dashboard" />
            </QueryClientProvider>
        );

        const emailInput = screen.getByPlaceholderText(/enter your email/i);
        const passwordInput = screen.getByPlaceholderText(/enter your password/i);

        fireEvent.change(emailInput, { target: { value: "valid@example.com" } });
        fireEvent.blur(emailInput);
        fireEvent.change(passwordInput, { target: { value: "secret123" } });
        fireEvent.blur(passwordInput);

        const form = container.querySelector("form");
        expect(form).not.toBeNull();
        fireEvent.submit(form!);

        await waitFor(() => {
            expect(loginActionModule.loginAction).toHaveBeenCalledWith(
                {
                    email: "valid@example.com",
                    password: "secret123",
                },
                "/dashboard"
            );
        });
    });

    it("displays server error message when login fails", async () => {
        vi.mocked(loginActionModule.loginAction).mockResolvedValue({
            success: false,
            message: "Invalid email or password",
        });

        const { container } = render(
            <QueryClientProvider client={queryClient}>
                <LoginForm />
            </QueryClientProvider>
        );

        const emailInput = screen.getByPlaceholderText(/enter your email/i);
        const passwordInput = screen.getByPlaceholderText(/enter your password/i);

        fireEvent.change(emailInput, { target: { value: "user@example.com" } });
        fireEvent.blur(emailInput);
        fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
        fireEvent.blur(passwordInput);

        const form = container.querySelector("form");
        expect(form).not.toBeNull();
        fireEvent.submit(form!);

        await waitFor(() => {
            expect(screen.getByText("Invalid email or password")).toBeInTheDocument();
        });
    });
});
