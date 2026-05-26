import React from "react";
import { useRouteError, isRouteErrorResponse } from "react-router";
import { logger } from "@/utils/logger";

export default function RouterErrorFallback() {
  const error = useRouteError();
  
  logger.error(
    { module: "router", source: "router.error.jsx" },
    "Route rendering or loader error occurred",
    error
  );

  let title = "Routing Error";
  let message = "An unexpected error occurred while loading this page.";

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    if (error.status === 404) {
      message = "The page you are looking for does not exist.";
    } else if (error.status === 401) {
      message = "You are not authorized to view this page. Please log in.";
    } else if (error.status === 403) {
      message = "You do not have permission to access this page.";
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md text-center border">
        <h2 className="text-xl font-bold text-red-600 mb-2">{title}</h2>
        <p className="text-zinc-600 mb-4 text-sm">{message}</p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => window.location.href = "/"}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition cursor-pointer"
          >
            Go Home
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-zinc-200 text-zinc-800 rounded-md text-sm hover:bg-zinc-300 transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}
