import React from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface VideoCallErrorCardProps {
  errorMessage: string | null
  isDoctor: boolean
  isPatient: boolean
}

export default function VideoCallErrorCard({
  errorMessage,
  isDoctor,
  isPatient,
}: VideoCallErrorCardProps) {
  const router = useRouter()

  const handleReturnToDashboard = () => {
    if (isDoctor) router.push("/doctor/dashboard/appointments")
    else if (isPatient) router.push("/dashboard/my-appointments")
    else router.push("/admin/dashboard/appointments-management")
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-md border-destructive/20 bg-background shadow-xl">
        <CardContent className="pt-6 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="size-7" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Unable to Join Consultation
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {errorMessage || "The consultation room could not be accessed."}
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full gap-2"
            >
              <RefreshCw className="size-4" />
              Retry Connection
            </Button>
            <Button
              onClick={handleReturnToDashboard}
              className="w-full bg-[#0B7285] hover:bg-[#095E70] text-white"
            >
              <LayoutDashboard className="mr-2 size-4" />
              Return to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
