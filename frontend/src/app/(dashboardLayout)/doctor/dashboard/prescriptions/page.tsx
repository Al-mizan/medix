import DoctorPrescriptionsTable from "@/components/modules/Doctor/Prescriptions/DoctorPrescriptionsTable"
import { getMyAppointments } from "@/services/appointment.services"
import { getMyPrescriptions } from "@/services/prescription.services"
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"

export const dynamic = "force-dynamic"

const PrescriptionsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) => {
  const queryParamsObjects = await searchParams

  const queryString = Object.keys(queryParamsObjects)
    .map((key) => {
      const value = queryParamsObjects[key]

      if (value === undefined) {
        return ""
      }

      if (Array.isArray(value)) {
        return value
          .map((item) => `${encodeURIComponent(key)}=${encodeURIComponent(item)}`)
          .join("&")
      }

      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    })
    .filter(Boolean)
    .join("&")

  const queryClient = new QueryClient()

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["my-prescriptions", queryString],
      queryFn: () => getMyPrescriptions(queryString),
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: ["my-appointments"],
      queryFn: () => getMyAppointments(),
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
    }),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <DoctorPrescriptionsTable initialQueryString={queryString} />
      </section>
    </HydrationBoundary>
  )
}

export default PrescriptionsPage