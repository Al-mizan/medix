import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function DoctorPrescriptionBanner() {
  return (
    <Card className="border-neutral-200 bg-gradient-to-r from-[#0B7285]/5 via-transparent to-transparent shadow-sm dark:border-neutral-800">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-foreground">
            Have completed consultations?
          </h4>
          <p className="text-xs text-muted-foreground">
            Generate electronic prescriptions with medication regimens and direct PDF downloads for your patients.
          </p>
        </div>
        <Button
          asChild
          size="sm"
          className="bg-[#0B7285] text-white hover:bg-[#095E70] shrink-0"
        >
          <Link href="/doctor/dashboard/prescriptions">
            Create Prescription
            <ExternalLink className="ml-1.5 size-3.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
