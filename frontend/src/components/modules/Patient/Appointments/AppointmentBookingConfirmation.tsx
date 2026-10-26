"use client"

import { useState } from "react"
import {
  bookAppointmentAction,
  bookAppointmentWithPayLaterAction,
} from "@/app/_actions/appointment.actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useMutation } from "@tanstack/react-query"
import { format } from "date-fns"
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  Calendar,
  CalendarX,
  Check,
  Clock,
  CreditCard,
  Loader2,
  Lock,
  Phone,
  ShieldCheck,
  Smartphone,
  Stethoscope,
  User,
  Users,
  Video,
  Wallet,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface AppointmentBookingConfirmationProps {
  doctorId: string
  scheduleId: string
  doctorName: string
  doctorDesignation?: string
  doctorProfilePhoto?: string
  doctorWorkingPlace?: string
  doctorQualification?: string
  doctorRegistrationNumber?: string
  doctorSpecialties?: string[]
  doctorExperience?: number
  appointmentFee?: number
  scheduleStart?: string | Date
  scheduleEnd?: string | Date
  isScheduleAvailable: boolean
  patientName?: string
  patientEmail?: string
  patientPhone?: string
  patientBloodGroup?: string
}

type PaymentMethodType = "card" | "bkash" | "nagad"

interface PaymentMethodOption {
  id: PaymentMethodType
  name: string
  subtitle: string
  badge: string
  badgeClass: string
  icon: typeof CreditCard
}

const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: "card",
    name: "Credit / Debit Card",
    subtitle: "Visa, Mastercard, AMEX • Instant 256-Bit SSL Checkout",
    badge: "Instant Confirmation",
    badgeClass: "bg-tint-secondary-bg text-tint-secondary-text border border-secondary/20",
    icon: CreditCard,
  },
  {
    id: "bkash",
    name: "bKash Online",
    subtitle: "Fast mobile financial checkout via bKash gateway",
    badge: "Most Popular in BD",
    badgeClass: "bg-pink-500/10 text-pink-700 dark:text-pink-300 border border-pink-500/20",
    icon: Smartphone,
  },
  {
    id: "nagad",
    name: "Nagad Wallet",
    subtitle: "Digital financial service by Bangladesh Post Office",
    badge: "Zero Gateway Fee",
    badgeClass: "bg-tint-accent-bg text-tint-accent-text border border-accent/20",
    icon: Wallet,
  },
]

const RELATIONSHIPS = ["Child", "Parent", "Spouse", "Sibling", "Other"] as const

const formatScheduleDate = (value?: string | Date) => {
  if (!value) return "N/A"
  const dateValue = new Date(value)
  if (Number.isNaN(dateValue.getTime())) return "N/A"
  return format(dateValue, "EEEE, MMMM dd, yyyy")
}

const formatScheduleTime = (value?: string | Date) => {
  if (!value) return "N/A"
  const dateValue = new Date(value)
  if (Number.isNaN(dateValue.getTime())) return "N/A"
  return format(dateValue, "hh:mm a")
}

const getInitials = (name: string) => {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "DR"
  )
}

const AppointmentBookingConfirmation = ({
  doctorId,
  scheduleId,
  doctorName,
  doctorDesignation,
  doctorProfilePhoto,
  doctorWorkingPlace,
  doctorQualification,
  doctorRegistrationNumber,
  doctorSpecialties,
  doctorExperience,
  appointmentFee,
  scheduleStart,
  scheduleEnd,
  isScheduleAvailable,
  patientName = "",
  patientEmail = "",
  patientPhone = "",
  patientBloodGroup = "",
}: AppointmentBookingConfirmationProps) => {
  const router = useRouter()

  // 1. Payment Method State
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType>("card")

  // 2. Patient / Dependent Selector State
  const [bookingFor, setBookingFor] = useState<"myself" | "dependent">("myself")
  const [dependentName, setDependentName] = useState("")
  const [dependentRelationship, setDependentRelationship] = useState<(typeof RELATIONSHIPS)[number]>("Child")
  const [dependentAge, setDependentAge] = useState("")
  const [dependentGender, setDependentGender] = useState<"MALE" | "FEMALE" | "OTHER">("MALE")
  const [consultationReason, setConsultationReason] = useState("")

  // 3. SMS & WhatsApp Consultation Reminders State
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true)
  const [contactPhone, setContactPhone] = useState(patientPhone || "")
  const [remind1Hour, setRemind1Hour] = useState(true)
  const [remind15Min, setRemind15Min] = useState(true)

  const payNowMutation = useMutation({
    mutationFn: bookAppointmentAction,
  })

  const payLaterMutation = useMutation({
    mutationFn: bookAppointmentWithPayLaterAction,
  })

  const handlePayNow = async () => {
    if (bookingFor === "dependent" && !dependentName.trim()) {
      toast.error("Please enter the dependent patient's full name")
      return
    }

    const methodName = PAYMENT_METHODS.find((m) => m.id === selectedPaymentMethod)?.name || "Payment"
    toast.info(`Initiating secure checkout with ${methodName}...`)

    const result = await payNowMutation.mutateAsync({ doctorId, scheduleId })

    if (!result.success) {
      toast.error(result.message || "Failed to book appointment")
      return
    }

    if (!result.data.paymentUrl) {
      toast.error("Payment link is unavailable right now")
      return
    }

    window.location.assign(result.data.paymentUrl)
  }

  const handlePayLater = async () => {
    if (bookingFor === "dependent" && !dependentName.trim()) {
      toast.error("Please enter the dependent patient's full name")
      return
    }

    const result = await payLaterMutation.mutateAsync({ doctorId, scheduleId })

    if (!result.success) {
      toast.error(result.message || "Failed to book appointment")
      return
    }

    router.push("/dashboard/my-appointments?status=pay_later_booked")
    router.refresh()
  }

  const formattedFee =
    appointmentFee != null && !Number.isNaN(appointmentFee)
      ? appointmentFee.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "0.00"

  if (!isScheduleAvailable) {
    return (
      <div className="mx-auto max-w-2xl py-6">
        <Card className="rounded-xl border border-border bg-card p-2 shadow-none text-center">
          <CardHeader className="items-center pb-2">
            <div className="size-12 rounded-full bg-tint-warning-bg text-tint-warning-text flex items-center justify-center mb-2">
              <CalendarX className="size-6" />
            </div>
            <CardTitle as="h2" className="text-xl font-bold tracking-tight text-foreground">
              Selected Consultation Slot Unavailable
            </CardTitle>
            <CardDescription className="max-w-md mx-auto text-sm text-muted-foreground mt-1">
              This appointment slot has already been reserved or its booking window has expired.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
            <div className="rounded-xl border border-border bg-muted/30 p-4 text-left space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Suggested Next Steps
              </p>
              <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
                <li>Return to the doctor&apos;s profile to view alternate available dates and times.</li>
                <li>Explore other certified specialists in the same medical department.</li>
                <li>Review any active consultations in your patient appointments dashboard.</li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              asChild
              className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-primary-foreground"
            >
              <Link href={`/consultation/doctor/${doctorId}`}>
                <Calendar className="size-4" />
                View Doctor&apos;s Available Slots
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto border-border">
              <Link href="/consultation">Browse All Doctors</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const isMutating = payNowMutation.isPending || payLaterMutation.isPending
  const currentMethod = PAYMENT_METHODS.find((m) => m.id === selectedPaymentMethod)

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Top Header Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-none">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link href="/dashboard" className="hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <Link href="/consultation" className="hover:text-foreground transition-colors">
                Consultations
              </Link>
              <span>/</span>
              <span className="text-foreground font-medium">Confirm Booking</span>
            </nav>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Confirm Your Appointment
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Review your consultation schedule, select patient details, and choose your preferred payment method.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-tint-primary-bg text-tint-primary-text border border-border">
              <Video className="size-3.5" />
              Telemedicine Video
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-tint-secondary-bg text-tint-secondary-text border border-secondary/20">
              <ShieldCheck className="size-3.5" />
              End-to-End Encrypted
            </span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Left Column: Doctor, Patient Details, and Alerts */}
        <div className="space-y-6">
          {/* Card 1: Clinician & Consultation Schedule */}
          <Card className="rounded-xl border border-border shadow-none">
            <CardHeader>
              <CardTitle as="h2" className="text-lg font-semibold text-foreground">
                Doctor & Consultation Details
              </CardTitle>
              <CardDescription>
                Verified clinical specialist and appointment timing for your upcoming consultation.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Clinician Card */}
              <div className="flex items-start gap-4 rounded-xl border border-border bg-muted/30 p-4">
                <Avatar className="size-16 rounded-full border border-border shrink-0">
                  <AvatarImage src={doctorProfilePhoto} alt={doctorName} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                    {getInitials(doctorName)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-bold text-foreground">{doctorName}</p>
                    {doctorRegistrationNumber && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-muted text-muted-foreground border border-border">
                        BMDC: {doctorRegistrationNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-text-secondary">
                    {doctorDesignation || "Consultant Specialist"}
                  </p>
                  {doctorQualification && (
                    <p className="text-xs text-muted-foreground">{doctorQualification}</p>
                  )}
                  {doctorWorkingPlace && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                      <Stethoscope className="size-3.5 shrink-0 text-primary" />
                      <span>{doctorWorkingPlace}</span>
                    </p>
                  )}
                  {doctorExperience != null && doctorExperience > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {doctorExperience} {doctorExperience === 1 ? "year" : "years"} of clinical experience
                    </p>
                  )}
                  {doctorSpecialties && doctorSpecialties.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {doctorSpecialties.slice(0, 3).map((spec, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-tint-primary-bg text-tint-primary-text border border-border"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Schedule Timing Block */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Consultation Schedule
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-secondary">
                    <Clock className="size-3.5" />
                    30 Mins Duration
                  </span>
                </div>

                <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-tint-primary-bg text-primary flex items-center justify-center shrink-0">
                      <Calendar className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Date</p>
                      <p className="text-sm font-semibold text-foreground">
                        {formatScheduleDate(scheduleStart)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-border/60">
                    <div className="size-10 rounded-lg bg-tint-primary-bg text-primary flex items-center justify-center shrink-0">
                      <Clock className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Time Slot
                      </p>
                      <p className="text-sm font-semibold font-mono tabular-nums text-foreground">
                        {formatScheduleTime(scheduleStart)} – {formatScheduleTime(scheduleEnd)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Patient Selector (Myself vs Family Member / Dependent) */}
          <Card className="rounded-xl border border-border shadow-none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle as="h2" className="text-lg font-semibold text-foreground">
                    Patient Consultation Profile
                  </CardTitle>
                  <CardDescription>
                    Specify whether this appointment is for yourself or a family dependent.
                  </CardDescription>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  <User className="size-3.5" />
                  Prescription Target
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Segmented Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-muted/50 border border-border">
                <button
                  type="button"
                  onClick={() => setBookingFor("myself")}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    bookingFor === "myself"
                      ? "bg-card text-foreground shadow-xs border border-border/80"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <User className="size-3.5" />
                  For Myself
                </button>
                <button
                  type="button"
                  onClick={() => setBookingFor("dependent")}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    bookingFor === "dependent"
                      ? "bg-card text-foreground shadow-xs border border-border/80"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Users className="size-3.5" />
                  For Family Member / Dependent
                </button>
              </div>

              {/* Myself Profile View */}
              {bookingFor === "myself" ? (
                <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Consultation Registered For
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        {patientName || "Current Account Holder"}
                      </p>
                    </div>
                    {patientBloodGroup && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-muted text-muted-foreground border border-border w-fit">
                        Blood: {patientBloodGroup}
                      </span>
                    )}
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 text-xs text-muted-foreground pt-1 border-t border-border/60">
                    <div>Email: <span className="text-foreground">{patientEmail || "Registered Account"}</span></div>
                    <div>Phone: <span className="text-foreground">{patientPhone || "Registered Number"}</span></div>
                  </div>

                  <div className="pt-2">
                    <Label htmlFor="myself-reason" className="text-xs font-medium text-foreground">
                      Reason for Consultation / Symptoms (Optional)
                    </Label>
                    <Input
                      id="myself-reason"
                      placeholder="e.g. Seasonal allergy follow-up, persistent cough, fever..."
                      value={consultationReason}
                      onChange={(e) => setConsultationReason(e.target.value)}
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>
              ) : (
                /* Dependent Profile Form */
                <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3.5">
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-tint-primary-bg/50 border border-primary/20 text-xs text-muted-foreground">
                    <ShieldCheck className="size-4 text-primary shrink-0 mt-0.5" />
                    <span>
                      The attending doctor will generate the clinical summary and valid digital prescription directly in the dependent patient&apos;s name.
                    </span>
                  </div>

                  {/* Relationship Selector */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      Relationship to Account Holder *
                    </Label>
                    <div className="flex flex-wrap gap-1.5">
                      {RELATIONSHIPS.map((rel) => (
                        <button
                          key={rel}
                          type="button"
                          onClick={() => setDependentRelationship(rel)}
                          className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                            dependentRelationship === rel
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-card text-muted-foreground border-border hover:bg-muted"
                          }`}
                        >
                          {rel}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dependent Full Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="dep-name" className="text-xs font-semibold text-foreground">
                      Dependent Full Name *
                    </Label>
                    <Input
                      id="dep-name"
                      placeholder="e.g. Fatima Khan"
                      value={dependentName}
                      onChange={(e) => setDependentName(e.target.value)}
                      className="text-xs"
                      required
                    />
                  </div>

                  {/* Age and Gender Grid */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="dep-age" className="text-xs font-semibold text-foreground">
                        Age (Years)
                      </Label>
                      <Input
                        id="dep-age"
                        type="number"
                        min="1"
                        max="120"
                        placeholder="e.g. 7"
                        value={dependentAge}
                        onChange={(e) => setDependentAge(e.target.value)}
                        className="text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">Gender</Label>
                      <div className="grid grid-cols-3 gap-1">
                        {(["MALE", "FEMALE", "OTHER"] as const).map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setDependentGender(g)}
                            className={`py-1.5 text-xs font-medium rounded-md border text-center transition-colors cursor-pointer ${
                              dependentGender === g
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card text-muted-foreground border-border hover:bg-muted"
                            }`}
                          >
                            {g === "MALE" ? "Male" : g === "FEMALE" ? "Female" : "Other"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Dependent Symptoms */}
                  <div className="space-y-1.5">
                    <Label htmlFor="dep-symptoms" className="text-xs font-semibold text-foreground">
                      Chief Complaint / Symptoms Description
                    </Label>
                    <Textarea
                      id="dep-symptoms"
                      placeholder="Describe symptoms, duration, known allergies, or specific questions for the specialist..."
                      value={consultationReason}
                      onChange={(e) => setConsultationReason(e.target.value)}
                      className="text-xs min-h-[70px]"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 3: SMS & WhatsApp Consultation Reminders */}
          <Card className="rounded-xl border border-border shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-tint-secondary-bg text-secondary flex items-center justify-center shrink-0">
                    <Bell className="size-4" />
                  </div>
                  <div>
                    <CardTitle as="h2" className="text-base font-semibold text-foreground">
                      SMS & WhatsApp Consultation Alerts
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Receive instant reminder alerts and direct WebRTC room links prior to session start.
                    </CardDescription>
                  </div>
                </div>
                <Switch
                  checked={smsAlertsEnabled}
                  onCheckedChange={setSmsAlertsEnabled}
                  aria-label="Toggle SMS and WhatsApp consultation alerts"
                />
              </div>
            </CardHeader>

            {smsAlertsEnabled && (
              <CardContent className="space-y-3 pt-0">
                <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="alert-phone" className="text-xs font-semibold text-foreground">
                        Reminder Mobile Number
                      </Label>
                      <span className="text-[11px] text-muted-foreground">
                        Defaulting to registered account contact
                      </span>
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="alert-phone"
                        type="tel"
                        placeholder="+880 1712-345678"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="pl-9 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-foreground">Notification Schedule</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setRemind1Hour(!remind1Hour)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                          remind1Hour
                            ? "bg-tint-secondary-bg text-tint-secondary-text border-secondary/30"
                            : "bg-card text-muted-foreground border-border hover:bg-muted"
                        }`}
                      >
                        <Check className={`size-3 ${remind1Hour ? "opacity-100" : "opacity-0"}`} />
                        1 Hour Before (Preparation Checklist)
                      </button>

                      <button
                        type="button"
                        onClick={() => setRemind15Min(!remind15Min)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                          remind15Min
                            ? "bg-tint-secondary-bg text-tint-secondary-text border-secondary/30"
                            : "bg-card text-muted-foreground border-border hover:bg-muted"
                        }`}
                      >
                        <Check className={`size-3 ${remind15Min ? "opacity-100" : "opacity-0"}`} />
                        15 Mins Before (Direct Video Room Link)
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-1 border-t border-border/60">
                    <Lock className="size-3 text-secondary shrink-0" />
                    <span>
                      We only dispatch critical clinical room invitations and schedule changes. Zero promotional messages.
                    </span>
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Right Column: Payment Summary, Method Selector, and Action */}
        <div className="space-y-6">
          <Card className="rounded-xl border border-border shadow-none">
            <CardHeader>
              <CardTitle as="h2" className="text-lg font-semibold text-foreground">
                Payment Summary
              </CardTitle>
              <CardDescription>
                Transparent consultation fee breakdown and payment method.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Fee Display */}
              <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                  <span>Standard Consultation Fee</span>
                  <span>1 Telemedicine Session</span>
                </div>
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="font-mono text-3xl font-bold tracking-tight text-foreground tabular-nums">
                    ৳ {formattedFee}
                  </span>
                  <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                    BDT
                  </span>
                </div>
                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Prescription Target:</span>
                  <span className="font-semibold text-foreground">
                    {bookingFor === "myself"
                      ? patientName || "Myself"
                      : `${dependentName || "Family Dependent"} (${dependentRelationship})`}
                  </span>
                </div>
              </div>

              {/* 1. Payment Method Selector */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Select Payment Method
                  </p>
                  <span className="text-[11px] text-muted-foreground">
                    Authorized Healthcare Gateways
                  </span>
                </div>

                <div
                  className="space-y-2"
                  role="radiogroup"
                  aria-label="Select Payment Method"
                >
                  {PAYMENT_METHODS.map((method) => {
                    const isSelected = selectedPaymentMethod === method.id
                    const Icon = method.icon

                    return (
                      <button
                        key={method.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setSelectedPaymentMethod(method.id)}
                        className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                            : "border-border bg-card hover:bg-muted/30"
                        }`}
                      >
                        <div
                          className={`size-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon className="size-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-foreground">
                              {method.name}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${method.badgeClass}`}
                            >
                              {method.badge}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                            {method.subtitle}
                          </p>
                        </div>

                        <div
                          className={`size-4 rounded-full border flex items-center justify-center shrink-0 mt-1 transition-colors ${
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background"
                          }`}
                        >
                          {isSelected && <Check className="size-2.5 stroke-[3]" />}
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Method Specific Context */}
                <div className="p-3 rounded-lg bg-muted/30 border border-border text-xs text-muted-foreground">
                  {selectedPaymentMethod === "card" && (
                    <p>
                      Redirects to our encrypted Stripe portal. Supports Visa, Mastercard, AMEX, and international debit cards with instantaneous confirmation.
                    </p>
                  )}
                  {selectedPaymentMethod === "bkash" && (
                    <p>
                      Opens the official bKash Merchant checkout session. Ensure your bKash mobile balance has at least ৳ {formattedFee} BDT available.
                    </p>
                  )}
                  {selectedPaymentMethod === "nagad" && (
                    <p>
                      Connects directly to the Nagad digital financial payment gateway with instant SMS OTP authentication.
                    </p>
                  )}
                </div>
              </div>

              {/* 30-Minute Hold Truth Notice */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/20 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 dark:text-amber-200">
                  <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>Reservation & Payment Terms</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1.5 leading-relaxed">
                  <p>
                    <strong className="text-foreground">Pay Now:</strong> Instantly confirms your consultation slot via chosen payment gateway.
                  </p>
                  <p>
                    <strong className="text-foreground">Pay Later (30-Min Hold):</strong> Temporarily holds your slot. Unpaid reservations are automatically released after{" "}
                    <strong className="text-foreground">30 minutes</strong> to ensure fair schedule availability for all patients.
                  </p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-3 pt-2" aria-busy={isMutating}>
              {/* Primary Action: Terracotta Accent Button */}
              <Button
                type="button"
                className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent-hover font-semibold shadow-xs focus-visible:ring-2 focus-visible:ring-accent transition-all cursor-pointer"
                onClick={() => void handlePayNow()}
                disabled={isMutating}
                aria-label={`Confirm and pay now ৳ ${formattedFee} BDT with ${currentMethod?.name}`}
              >
                {payNowMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Connecting to Checkout...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="size-4" />
                    <span>
                      Confirm & Pay with {currentMethod?.name.split(" ")[0]}
                    </span>
                  </>
                )}
              </Button>

              {/* Secondary Action: Pay Later with Explicit 30-Min Label */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 border-border hover:bg-muted font-medium text-foreground cursor-pointer"
                onClick={() => void handlePayLater()}
                disabled={isMutating}
                aria-label="Book appointment with pay later (30-minute hold)"
              >
                {payLaterMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Reserving Slot...</span>
                  </>
                ) : (
                  <>
                    <Wallet className="size-4" />
                    <span>Book & Pay Later (30-Min Hold)</span>
                  </>
                )}
              </Button>

              {/* Return Link */}
              <Button asChild variant="ghost" className="w-full text-muted-foreground hover:text-foreground">
                <Link
                  href={`/consultation/doctor/${doctorId}`}
                  className="flex items-center justify-center gap-1.5 text-xs font-medium"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Return to Doctor Details</span>
                </Link>
              </Button>

              {/* Trust Reassurance */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                <Lock className="size-3 text-secondary" />
                <span>256-Bit SSL Encrypted Healthcare Checkout</span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AppointmentBookingConfirmation