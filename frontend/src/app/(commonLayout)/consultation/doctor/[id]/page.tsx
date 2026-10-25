import type { Metadata } from "next";
import BookAppointmentModal from "@/components/modules/Patient/Appointments/BookAppointmentModal"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getUserInfo } from "@/services/auth.services"
import { getDoctorById } from "@/services/doctor.services"
import { type IDoctorDetails } from "@/types/doctor.types"
import { format } from "date-fns"
import Link from "next/link"
import { JsonLd } from "@/components/shared/JsonLd"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await getDoctorById(id);
    const doctor = res?.data as IDoctorDetails | undefined;
    if (doctor?.name) {
      return {
        title: `${doctor.name} - ${doctor.designation || "Medical Specialist"}`,
        description: `Consult with ${doctor.name}, ${doctor.qualification || ""}. Schedule video and in-clinic consultations on Medix.`,
        alternates: {
          canonical: `/consultation/doctor/${id}`,
        },
      };
    }
  } catch {
    // fallback
  }

  return {
    title: "Doctor Profile & Appointment Booking",
    description: "Book an appointment with a verified healthcare specialist on Medix.",
    alternates: {
      canonical: `/consultation/doctor/${id}`,
    },
  };
}

const formatDateTime = (value?: string | Date | null) => {
  if (!value) {
    return "N/A"
  }

  const dateValue = new Date(value)
  if (Number.isNaN(dateValue.getTime())) {
    return "N/A"
  }

  return format(dateValue, "MMM dd, yyyy hh:mm a")
}

const getInitials = (name?: string) => {
  if (!name) {
    return "DR"
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((item) => item[0]?.toUpperCase() ?? "")
    .join("")
}

const getTodayStart = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

const ConsultationDoctorByIdPage = async ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  const { id } = await params
  const currentUser = await getUserInfo()

  let doctorDetails: IDoctorDetails | null = null
  let errorMessage = ""

  try {
    const response = await getDoctorById(id)
    doctorDetails = response.data
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "data" in error.response &&
      error.response.data &&
      typeof error.response.data === "object" &&
      "message" in error.response.data &&
      typeof error.response.data.message === "string"
    ) {
      errorMessage = error.response.data.message
    } else {
      errorMessage = "Failed to load doctor details"
    }
  }

  if (!doctorDetails) {
    return (
      <section className="space-y-4">
        <Button asChild variant="outline">
          <Link href="/consultation">Back to Consultation</Link>
        </Button>
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {errorMessage || "Doctor details not available."}
        </div>
      </section>
    )
  }

  const todayStart = getTodayStart()

  const availableUpcomingSchedules = (doctorDetails.doctorSchedules ?? [])
    .filter((item) => {
      if (item.isBooked) {
        return false
      }

      if (!item.schedule?.startDateTime) {
        return false
      }

      const startDate = new Date(item.schedule.startDateTime)
      if (Number.isNaN(startDate.getTime())) {
        return false
      }

      return startDate >= todayStart
    })
    .sort((a, b) => {
      const leftValue = new Date(a.schedule?.startDateTime ?? 0).getTime()
      const rightValue = new Date(b.schedule?.startDateTime ?? 0).getTime()
      return leftValue - rightValue
    })

  const doctorJsonLd = {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: doctorDetails.name,
    image: doctorDetails.profilePhoto || undefined,
    description: doctorDetails.designation || "Medical Specialist",
    medicalSpecialty: (doctorDetails.specialties ?? []).map(
      (s) => s.specialty.title
    ),
    address: doctorDetails.address
      ? {
          "@type": "PostalAddress",
          streetAddress: doctorDetails.address,
        }
      : undefined,
    priceRange: doctorDetails.appointmentFee
      ? `৳${Number(doctorDetails.appointmentFee).toLocaleString("en-BD")}`
      : undefined,
    ...(doctorDetails.averageRating && doctorDetails.averageRating > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: doctorDetails.averageRating.toFixed(1),
            reviewCount: doctorDetails.reviews?.length || 1,
            bestRating: "5",
            worstRating: "1",
          },
        }
      : {}),
  }

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <JsonLd schema={doctorJsonLd} />
      <Button asChild variant="outline" size="sm">
        <Link href="/consultation">Back to Consultation</Link>
      </Button>

      {/* Doctor Hero Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card text-card-foreground bg-gradient-to-r from-primary/5 via-card to-secondary/5 p-6 shadow-xs">
        <div className="flex flex-col gap-5 md:flex-row md:items-start">
          <Avatar className="size-24 ring-4 ring-primary/20 shadow-sm shrink-0">
            <AvatarImage src={doctorDetails.profilePhoto} alt={doctorDetails.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
              {getInitials(doctorDetails.name)}
            </AvatarFallback>
          </Avatar>

          <div className="relative min-w-0 flex-1 space-y-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl truncate" title={doctorDetails.name}>
              {doctorDetails.name}
            </h1>
            <p className="text-sm font-medium text-muted-foreground truncate" title={doctorDetails.designation || "N/A"}>
              {doctorDetails.designation || "N/A"}
            </p>
            <p className="text-xs text-muted-foreground truncate" title={doctorDetails.currentWorkingPlace || "N/A"}>
              {doctorDetails.currentWorkingPlace || "N/A"}
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {(doctorDetails.specialties ?? []).map((item) => (
                <Badge key={item.specialty.id} variant="secondary">
                  {item.specialty.title}
                </Badge>
              ))}
              {(!doctorDetails.specialties || doctorDetails.specialties.length === 0) && (
                <Badge variant="secondary">No specialties listed</Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-2 pt-1 text-xs">
              <Badge variant="outline">Experience: {doctorDetails.experience ?? 0} yrs</Badge>
              <Badge variant="outline" className="tabular-nums">Fee: ৳{doctorDetails.appointmentFee ? Number(doctorDetails.appointmentFee).toLocaleString("en-BD") : "N/A"} BDT</Badge>
              <Badge variant="outline">Rating: {doctorDetails.averageRating ? Number(doctorDetails.averageRating).toFixed(1) : "0.0"}</Badge>
            </div>

            <div className="pt-3">
              <BookAppointmentModal
                doctorId={String(doctorDetails.id)}
                doctorName={doctorDetails.name}
                isAuthenticated={Boolean(currentUser)}
                viewerRole={currentUser?.role ?? null}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <h2 className="mb-3 text-base font-semibold text-foreground">Professional Information</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium text-foreground">Qualification:</span> <span className="text-muted-foreground">{doctorDetails.qualification || "N/A"}</span></p>
            <p><span className="font-medium text-foreground">Experience:</span> <span className="text-muted-foreground">{doctorDetails.experience ?? 0} years</span></p>
            <p><span className="font-medium text-foreground">Registration Number:</span> <span className="text-muted-foreground">{doctorDetails.registrationNumber || "N/A"}</span></p>
            <p><span className="font-medium text-foreground">Appointment Fee:</span> <span className="text-muted-foreground">৳{doctorDetails.appointmentFee ? Number(doctorDetails.appointmentFee).toLocaleString("en-BD") : "N/A"}</span></p>
            <p><span className="font-medium text-foreground">Average Rating:</span> <span className="text-muted-foreground">{doctorDetails.averageRating ? Number(doctorDetails.averageRating).toFixed(1) : "0.0"} / 5</span></p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <h2 className="mb-3 text-base font-semibold text-foreground">Contact Information</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium text-foreground">Email:</span> <span className="text-muted-foreground">{doctorDetails.email || "N/A"}</span></p>
            <p><span className="font-medium text-foreground">Contact Number:</span> <span className="text-muted-foreground">{doctorDetails.contactNumber || "N/A"}</span></p>
            <p><span className="font-medium text-foreground">Gender:</span> <span className="text-muted-foreground">{doctorDetails.gender || "N/A"}</span></p>
            <p><span className="font-medium text-foreground">Address:</span> <span className="text-muted-foreground">{doctorDetails.address || "N/A"}</span></p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
          <h2 className="text-base font-semibold text-foreground">Available Doctor Schedules</h2>
          <Badge variant="secondary" className="text-xs">From Today Onward</Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {availableUpcomingSchedules.slice(0, 18).map((item, index) => (
            <div
              key={item.id ?? item.schedule?.id ?? `schedule-${index}`}
              className="rounded-xl border border-border/80 bg-muted/30 p-3.5 text-xs space-y-1"
            >
              <p><span className="font-semibold text-foreground">Start:</span> <span className="text-muted-foreground">{formatDateTime(item.schedule?.startDateTime)}</span></p>
              <p><span className="font-semibold text-foreground">End:</span> <span className="text-muted-foreground">{formatDateTime(item.schedule?.endDateTime)}</span></p>
              <p className="pt-0.5 font-medium text-emerald-600 dark:text-emerald-400">Available for Booking</p>
            </div>
          ))}
          {availableUpcomingSchedules.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center sm:col-span-2 lg:col-span-3">No available upcoming schedules found. Check back soon.</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
        <h2 className="mb-3 text-base font-semibold text-foreground border-b border-border/60 pb-3">Patient Reviews</h2>
        <div className="divide-y divide-border/60">
          {(doctorDetails.reviews ?? []).map((review, index) => (
            <div key={review.id ?? `review-${index}`} className="py-3.5 first:pt-0 last:pb-0 text-sm space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Rating: {review.rating ?? "5"} / 5</span>
                <span className="text-muted-foreground">{formatDateTime(review.createdAt)}</span>
              </div>
              <p className="text-muted-foreground">{review.comment || "Patient completed consultation successfully."}</p>
            </div>
          ))}
          {(!doctorDetails.reviews || doctorDetails.reviews.length === 0) && (
            <p className="text-sm text-muted-foreground py-4 text-center">No reviews yet for this physician.</p>
          )}
        </div>
      </div>
    </section>
  )
}

export default ConsultationDoctorByIdPage