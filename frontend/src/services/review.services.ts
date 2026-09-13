"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { ApiResponse } from "@/types/api.types";
import { IReview } from "@/types/review.types";

export const getMyReviews = async (
  queryString?: string | unknown
): Promise<ApiResponse<IReview[]>> => {
  try {
    const qs = typeof queryString === "string" ? queryString : undefined;
    const endpoint = qs
      ? `/reviews/my-reviews?${qs}`
      : "/reviews/my-reviews";
    return await httpClient.get<IReview[]>(endpoint);
  } catch (error) {
    console.log("Error fetching my reviews:", error);
    throw error;
  }
};

export const getAllReviews = async (
  queryString?: string | unknown
): Promise<ApiResponse<IReview[]>> => {
  try {
    const qs = typeof queryString === "string" ? queryString : undefined;
    const endpoint = qs ? `/reviews?${qs}` : "/reviews";
    return await httpClient.get<IReview[]>(endpoint);
  } catch (error) {
    console.log("Error fetching all reviews:", error);
    throw error;
  }
};

export const createReview = async (payload: {
  appointmentId: string;
  rating: number;
  comment?: string;
}): Promise<ApiResponse<IReview>> => {
  try {
    return await httpClient.post<IReview>("/reviews", payload);
  } catch (error) {
    console.log("Error creating review:", error);
    throw error;
  }
};

export const updateReview = async (
  id: string,
  payload: { rating?: number; comment?: string }
): Promise<ApiResponse<IReview>> => {
  try {
    return await httpClient.patch<IReview>(`/reviews/${id}`, payload);
  } catch (error) {
    console.log("Error updating review:", error);
    throw error;
  }
};

export const deleteReview = async (id: string): Promise<ApiResponse<IReview>> => {
  try {
    return await httpClient.delete<IReview>(`/reviews/${id}`);
  } catch (error) {
    console.log("Error deleting review:", error);
    throw error;
  }
};
