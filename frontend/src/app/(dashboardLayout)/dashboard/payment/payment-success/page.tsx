import type { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CheckCircle2, Calendar, ArrowRight, Home } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Payment Confirmed & Appointment Scheduled",
  description: "Your consultation fee has been processed and your appointment is confirmed.",
}

interface PaymentSuccessPageProps {
  searchParams: Promise<{
    appointment_id?: string
    payment_id?: string
  }>
}

export default async function PaymentSuccessPage({
  searchParams,
}: PaymentSuccessPageProps) {
  const params = await searchParams
  const appointmentId = params.appointment_id
  const paymentId = params.payment_id

  return (
    <div className="flex min-h-[65vh] items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-lg border-primary/20">
        <CardHeader className="flex flex-col items-center pb-2">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <Badge variant="secondary" className="mb-2 bg-emerald-50 text-emerald-700 border-emerald-200">
            Payment Confirmed
          </Badge>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Appointment Booked Successfully!
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-1">
            Your transaction has been processed. A confirmation email and invoice have been sent to your registered address.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-2 text-sm">
          <div className="rounded-lg bg-muted/60 p-3 space-y-2 text-left">
            {paymentId && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Payment Ref:</span>
                <span className="font-mono font-medium truncate max-w-[200px]">{paymentId}</span>
              </div>
            )}
            {appointmentId && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Appointment ID:</span>
                <span className="font-mono font-medium truncate max-w-[200px]">{appointmentId}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">PAID & SCHEDULED</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-2">
          <Button asChild className="w-full">
            <Link href="/dashboard/my-appointments">
              <Calendar className="mr-2 h-4 w-4" />
              View My Appointments
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Return to Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}