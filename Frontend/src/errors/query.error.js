import { logger } from "@/utils/logger";
import { toast } from "sonner";


export const handleQueryError = (error, query) => {
  const queryKey = query?.queryKey ? query.queryKey.join(" -> ") : "unknown";
  logger.error(
    { module: "server-state", source: "query.error.js" },
    `Server state fetch failed on query key [ ${queryKey} ]`,
    error
  );

  const message = error?.response?.data?.error || error?.message || "Failed to fetch data from the server.";
  toast.error(message);
};


export const handleMutationError = (error, variables, context, mutation) => {
  logger.error(
    { module: "server-state", source: "query.error.js" },
    "Server state update (mutation) failed.",
    error
  );

  const message = error?.response?.data?.error || error?.message || "Failed to submit request to the server.";
  toast.error(message);
};
