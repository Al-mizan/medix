# Medix Domain Glossary

Ubiquitous domain language and critic evaluation terminology for the Medix digital healthcare platform monorepo.

## Clinical & Platform Context

**Patient**:
An individual seeking medical consultations, booking appointments with vetted clinicians, managing health records, tracking prescriptions, and executing payments.
_Avoid_: Customer, Client, User, End-user

**Doctor**:
A licensed medical practitioner managing consultation slots, evaluating patient histories, conducting clinical appointments, issuing digital prescriptions, and reviewing feedback.
_Avoid_: Clinician, Provider, Medic

**Admin**:
An operational and clinical governance user responsible for onboarding doctors, managing administrative accounts, auditing system-wide schedules, and overseeing platform payments.
_Avoid_: Manager, Operator, Superuser

**DoctorSchedule**:
An atomic, discrete time slot allocated to a specific doctor for a specific date and time, bookable by exactly one patient.
_Avoid_: Availability, Slot, Calendar Event

**Appointment**:
A consultation contract linking a Patient, Doctor, and DoctorSchedule through a defined lifecycle (SCHEDULED → INPROGRESS → COMPLETED or CANCELED).
_Avoid_: Booking, Session, Meeting

**Prescription**:
A formal medical directive authored by a licensed doctor following or during an appointment containing medication regimens, dosages, and instructions.
_Avoid_: Script, Medication Order

**Medical Report**:
A diagnostic test result, imaging file, or clinical history document uploaded to a patient's electronic health record.
_Avoid_: Diagnostic File, Lab Result, Attachment

## Critic & Evaluation Context

**Critic Agent**:
An autonomous evaluation agent assuming a specific persona (Admin, Doctor, Patient) that navigates real workflows across desktop and mobile viewports, audits visual craft and UX against design tokens, and outputs an objective score without writing code.
_Avoid_: QA Tester, Auditor, Inspector

**Builder Agent**:
The autonomous implementation agent that ingests ranked issues from critic evaluation reports, writes code to resolve regressions or polish gaps, and triggers re-verification.
_Avoid_: Developer Agent, Coder, Worker

**Critic Harness**:
The automated browser orchestration infrastructure that executes end-to-end user journeys, captures viewport screenshots, traps browser console errors, and tracks network failures across desktop and mobile profiles.
_Avoid_: Test Runner, E2E Suite, Selenium Script

**Score Gate**:
The strict composite passing threshold (≥ 8.5/10 across all three critic agents with zero console errors and zero network failures) required before code is deemed releasable.
_Avoid_: Quality Bar, Acceptance Cutoff, Pass Mark
