import AppointmentBookingConfirmation from "@/components/modules/Patient/Appointments/AppointmentBookingConfirmation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getDoctorById } from "@/services/doctor.services"
import { getMyProfileService } from "@/services/profile.services"
import { type IDoctorDetails } from "@/types/doctor.types"
import {
  Calendar,
  CalendarX,
  CheckCircle2,
  Clock,
  FileText,
  ShieldCheck,
  Stethoscope,
} from "lucide-react"
import Link from "next/link"

const BookAppointmentsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ doctorId?: string; scheduleId?: string }>
}) => {
  const params = await searchParams
  const doctorId = params.doctorId?.trim() ?? ""
  const scheduleId = params.scheduleId?.trim() ?? ""

  if (!doctorId || !scheduleId) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Book Appointment</span>
          </nav>

          <Card className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-none">
            <CardHeader className="p-0 pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-11 rounded-lg bg-tint-primary-bg text-primary flex items-center justify-center shrink-0">
                  <Stethoscope className="size-6" />
                </div>
                <div>
                  <CardTitle as="h1" className="text-2xl font-bold tracking-tight text-foreground">
                    Book a Telemedicine Consultation
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Connect with verified medical specialists for encrypted video consultations and digital prescriptions.
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 space-y-6">
              <div className="rounded-xl border border-border bg-muted/20 p-5 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  How Consultation Booking Works
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="size-6 rounded-full bg-primary/10 text-primary font-mono text-xs font-bold flex items-center justify-center">
                        1
                      </span>
                      <p className="text-sm font-semibold text-foreground">Find a Specialist</p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Filter doctors by department, experience, patient reviews, and consultation fee in BDT.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="size-6 rounded-full bg-primary/10 text-primary font-mono text-xs font-bold flex items-center justify-center">
                        2
                      </span>
                      <p className="text-sm font-semibold text-foreground">Pick a Schedule Slot</p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Select an upcoming 30-minute consultation slot that matches your availability.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="size-6 rounded-full bg-primary/10 text-primary font-mono text-xs font-bold flex items-center justify-center">
                        3
                      </span>
                      <p className="text-sm font-semibold text-foreground">Confirm & Consult</p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Review clinical details, choose pay now or a 30-minute hold, and join the video call from your dashboard.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-secondary" />
                  BMDC Verified Doctors
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-secondary" />
                  Encrypted Telemedicine
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5 text-secondary" />
                  30-Minute Video Sessions
                </span>
              </div>
            </CardContent>

            <CardFooter className="p-0 pt-6 flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-primary-foreground font-medium"
              >
                <Link href="/consultation">
                  <Calendar className="size-4" />
                  Browse Doctors & Specialists
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto border-border">
                <Link href="/dashboard/my-appointments">
                  <FileText className="size-4" />
                  View My Existing Appointments
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>
    )
  }

  let doctorDetails: IDoctorDetails | null = null

  try {
    const response = await getDoctorById(doctorId)
    doctorDetails = response.data
  } catch {
    doctorDetails = null
  }

  if (!doctorDetails) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="rounded-xl border border-border bg-card p-6 shadow-none text-center">
          <CardHeader className="items-center pb-2">
            <div className="size-12 rounded-full bg-tint-warning-bg text-tint-warning-text flex items-center justify-center mb-2">
              <CalendarX className="size-6" />
            </div>
            <CardTitle as="h2" className="text-xl font-bold tracking-tight text-foreground">
              Doctor Profile Unavailable
            </CardTitle>
            <p className="max-w-md mx-auto text-sm text-muted-foreground mt-1">
              We could not retrieve the selected clinician or consultation schedule. The schedule link may have expired or the clinician profile is undergoing update.
            </p>
          </CardHeader>

          <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button
              asChild
              className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-primary-foreground"
            >
              <Link href="/consultation">
                <Calendar className="size-4" />
                Return to Consultation Directory
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto border-border">
              <Link href="/dashboard">Go to Patient Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </section>
    )
  }

  let patientProfile = null
  try {
    const profileRes = await getMyProfileService()
    patientProfile = profileRes?.data || null
  } catch {
    patientProfile = null
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const selectedSchedule = (doctorDetails.doctorSchedules ?? []).find((item) => {
    const startDateTime = item.schedule?.startDateTime

    if (item.isBooked || item.schedule?.id !== scheduleId || !startDateTime) {
      return false
    }

    const parsedDate = new Date(startDateTime)
    return !Number.isNaN(parsedDate.getTime()) && parsedDate >= today
  })

  return (
    <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <AppointmentBookingConfirmation
        doctorId={doctorId}
        scheduleId={scheduleId}
        doctorName={doctorDetails.name}
        doctorDesignation={doctorDetails.designation}
        doctorProfilePhoto={doctorDetails.profilePhoto}
        doctorWorkingPlace={doctorDetails.currentWorkingPlace}
        doctorQualification={doctorDetails.qualification}
        doctorRegistrationNumber={doctorDetails.registrationNumber}
        doctorSpecialties={doctorDetails.specialties
          ?.map((s) => s.specialty?.title)
          .filter((t): t is string => Boolean(t))}
        doctorExperience={doctorDetails.experience}
        appointmentFee={doctorDetails.appointmentFee}
        scheduleStart={selectedSchedule?.schedule?.startDateTime}
        scheduleEnd={selectedSchedule?.schedule?.endDateTime}
        isScheduleAvailable={Boolean(selectedSchedule)}
        patientName={patientProfile?.patient?.name || patientProfile?.name || ""}
        patientEmail={patientProfile?.email || ""}
        patientPhone={patientProfile?.patient?.contactNumber || ""}
        patientBloodGroup={patientProfile?.patient?.patientHealthData?.bloodGroup || ""}
      />
    </section>
  )
}

export default BookAppointmentsPage