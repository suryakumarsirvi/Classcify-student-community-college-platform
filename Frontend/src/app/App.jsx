import React from "react";
import { Provider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router";
import { store } from "@/app/App.store";
import { queryClient } from "@/app/App.stack";
import { router } from "@/app/App.routes";
import { AuthProvider } from "@/contexts/AuthContext";

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
  );
}
