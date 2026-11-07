import axios from "axios";

interface ApiErrorBody {
  error?: string;
  details?: { field?: string; message: string }[];
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (error.response) {
      const { data, status } = error.response;
      const details = data?.details?.map((d) => d.message).join(", ");
      return details || data?.error || `Request failed (${status})`;
    }
    if (error.code === "ECONNABORTED")
      return "The request timed out. Please try again.";
    return "Cannot reach the server. Check your connection and try again.";
  }
  return "Something went wrong. Please try again.";
}
