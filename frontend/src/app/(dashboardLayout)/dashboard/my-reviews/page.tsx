import PatientReviewsList from "@/components/modules/Patient/Reviews/PatientReviewsList"
import { getMyReviews } from "@/services/review.services"
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"

export const dynamic = "force-dynamic"

const PatientMyReviewsPage = async () => {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ["my-reviews"],
    queryFn: () => getMyReviews(),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <PatientReviewsList />
      </section>
    </HydrationBoundary>
  )
}

export default PatientMyReviewsPage
