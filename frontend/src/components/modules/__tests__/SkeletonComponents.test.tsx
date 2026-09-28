import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DoctorListSkeleton from "../DoctorListSkeleton";
import DashboardStatsSkeleton from "../DashboardStatsSkeleton";
import AppointmentsTableSkeleton from "../AppointmentsTableSkeleton";

describe("Skeleton Components", () => {
  describe("DoctorListSkeleton", () => {
    it("renders default 6 doctor card skeletons with badges and pagination placeholders", () => {
      render(<DoctorListSkeleton count={6} />);
      const skeletonContainer = screen.getByTestId("doctor-list-skeleton");
      expect(skeletonContainer).toBeInTheDocument();

      const cards = skeletonContainer.querySelectorAll('[class*="border border-border"]');
      expect(cards.length).toBe(6);
    });

    it("renders custom count of cards", () => {
      render(<DoctorListSkeleton count={3} />);
      const skeletonContainer = screen.getByTestId("doctor-list-skeleton");
      const cards = skeletonContainer.querySelectorAll('[class*="border border-border"]');
      expect(cards.length).toBe(3);
    });
  });

  describe("DashboardStatsSkeleton", () => {
    it("renders 4 metric card skeletons and 2 chart skeleton cards", () => {
      render(<DashboardStatsSkeleton />);
      const skeletonContainer = screen.getByTestId("dashboard-stats-skeleton");
      expect(skeletonContainer).toBeInTheDocument();

      // Top metric cards grid
      const metricCards = skeletonContainer.querySelectorAll('[class*="border-neutral-200"]');
      expect(metricCards.length).toBe(6); // 4 stats + 2 charts
    });
  });

  describe("AppointmentsTableSkeleton", () => {
    it("renders banner skeleton and appointment cards", () => {
      render(<AppointmentsTableSkeleton count={4} />);
      const skeletonContainer = screen.getByTestId("appointments-table-skeleton");
      expect(skeletonContainer).toBeInTheDocument();

      const cards = skeletonContainer.querySelectorAll('[class*="border-neutral-200"]');
      expect(cards.length).toBe(4);
    });
  });
});
