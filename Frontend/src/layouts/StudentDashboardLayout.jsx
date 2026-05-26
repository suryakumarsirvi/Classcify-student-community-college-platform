import React, { useEffect, useState } from "react";
import StudentSidebar from "@/components/Common/StudentSidebar";
import { cn } from "@/lib/utils";
import { Outlet, useNavigate } from "react-router";

const StudentDashboardLayout = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
    const savedState = localStorage.getItem("studentSidebarExpanded");
    return savedState === "false" ? false : true;
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("studentToken");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem("studentSidebarExpanded", isSidebarExpanded);
  }, [isSidebarExpanded]);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <div className="min-h-screen">
      <StudentSidebar isExpanded={isSidebarExpanded} toggle={toggleSidebar} />
      <div
        className={cn(
          "transition-all duration-300",
          isSidebarExpanded ? "pl-64" : "pl-20"
        )}
      >
        <main className="px-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentDashboardLayout;
