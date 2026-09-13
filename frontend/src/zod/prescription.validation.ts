import { z } from "zod";

export const medicationItemSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  duration: z.string().min(1, "Duration is required"),
});

export type IMedicationItem = z.infer<typeof medicationItemSchema>;

export const createPrescriptionFormZodSchema = z.object({
  appointmentId: z.string().min(1, "Please select an appointment"),
  followUpDate: z.string().optional(),
  instructions: z.string().optional(),
  medications: z.array(medicationItemSchema).default([]),
});

export type ICreatePrescriptionFormValues = z.infer<typeof createPrescriptionFormZodSchema>;

export const updatePrescriptionFormZodSchema = z.object({
  followUpDate: z.string().optional(),
  instructions: z.string().optional(),
  medications: z.array(medicationItemSchema).default([]),
});

export type IUpdatePrescriptionFormValues = z.infer<typeof updatePrescriptionFormZodSchema>;

export const createPrescriptionServerZodSchema = z.object({
  appointmentId: z.string().min(1, "Appointment ID is required"),
  instructions: z.string().min(1, "Instructions cannot be empty"),
  followUpDate: z.string().optional(),
});

export const updatePrescriptionServerZodSchema = z.object({
  instructions: z.string().min(1, "Instructions cannot be empty").optional(),
  followUpDate: z.string().optional(),
});

export function formatPrescriptionInstructions(
  medications: IMedicationItem[],
  additionalNotes?: string
): string {
  const validMeds = (medications || []).filter((m) => m.name && m.name.trim().length > 0);
  const parts: string[] = [];

  if (validMeds.length > 0) {
    const medLines = validMeds.map(
      (m, i) => `${i + 1}. ${m.name.trim()} | ${m.dosage.trim()} | ${m.frequency.trim()} | ${m.duration.trim()}`
    );
    parts.push(`MEDICATIONS:\n${medLines.join("\n")}`);
  }

  if (additionalNotes && additionalNotes.trim().length > 0) {
    parts.push(`ADDITIONAL INSTRUCTIONS:\n${additionalNotes.trim()}`);
  }

  return parts.join("\n\n");
}

export function parsePrescriptionInstructions(raw: string): {
  medications: IMedicationItem[];
  instructions: string;
} {
  if (!raw) {
    return { medications: [], instructions: "" };
  }

  const medHeader = "MEDICATIONS:";
  const notesHeader = "ADDITIONAL INSTRUCTIONS:";

  if (raw.includes(medHeader)) {
    const parts = raw.split(notesHeader);
    const medSection = parts[0]?.replace(medHeader, "").trim() || "";
    const notesSection = parts[1]?.trim() || "";

    const medLines = medSection.split("\n").map((l) => l.trim()).filter(Boolean);
    const medications: IMedicationItem[] = medLines.map((line) => {
      const cleaned = line.replace(/^\d+\.\s*/, "");
      const [name, dosage, frequency, duration] = cleaned.split("|").map((s) => s.trim());
      return {
        name: name || "",
        dosage: dosage || "",
        frequency: frequency || "",
        duration: duration || "",
      };
    });

    return { medications, instructions: notesSection };
  }

  return { medications: [], instructions: raw };
}
