import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { JsonLd } from "../JsonLd";

describe("JsonLd Component", () => {
  it("renders valid script tag with type application/ld+json", () => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "MedicalOrganization",
      name: "Medix Healthcare",
      url: "https://medix.health",
    };

    const { container } = render(<JsonLd schema={schema} />);
    const script = container.querySelector('script[type="application/ld+json"]');

    expect(script).not.toBeNull();
    expect(script?.textContent).toBe(JSON.stringify(schema));

    const parsed = JSON.parse(script!.textContent || "{}");
    expect(parsed["@type"]).toBe("MedicalOrganization");
    expect(parsed.name).toBe("Medix Healthcare");
  });

  it("handles complex Physician schema with aggregateRating", () => {
    const physicianSchema = {
      "@context": "https://schema.org",
      "@type": "Physician",
      name: "Dr. Gregory House",
      medicalSpecialty: ["Diagnostic Medicine"],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: 42,
      },
    };

    const { container } = render(<JsonLd schema={physicianSchema} />);
    const script = container.querySelector('script[type="application/ld+json"]');

    expect(script).not.toBeNull();
    const parsed = JSON.parse(script!.textContent || "{}");
    expect(parsed["@type"]).toBe("Physician");
    expect(parsed.name).toBe("Dr. Gregory House");
    expect(parsed.aggregateRating.ratingValue).toBe("4.9");
  });

  it("handles graph array schemas for clinic and item lists", () => {
    const clinicSchema = [
      {
        "@context": "https://schema.org",
        "@type": "MedicalClinic",
        name: "Medix Virtual Clinic",
      },
      {
        "@type": "ItemList",
        name: "Specialists",
      },
    ];

    const { container } = render(<JsonLd schema={clinicSchema} />);
    const script = container.querySelector('script[type="application/ld+json"]');

    expect(script).not.toBeNull();
    const parsed = JSON.parse(script!.textContent || "[]");
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(2);
    expect(parsed[0]["@type"]).toBe("MedicalClinic");
  });
});
