import React, { useEffect, useState } from "react";
import TeacherSidebar from "@/components/Common/TeacherSidebar";
import { cn } from "@/lib/utils";
import { Outlet, useNavigate } from "react-router";

const TeacherDashboardLayout = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
    const savedState = localStorage.getItem("teacherSidebarExpanded");
    return savedState === "false" ? false : true;
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("teacherToken");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem("teacherSidebarExpanded", isSidebarExpanded);
  }, [isSidebarExpanded]);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <div className="min-h-screen">
      <TeacherSidebar isExpanded={isSidebarExpanded} toggle={toggleSidebar} />
      <div
        className={cn(
          "transition-all duration-300",
          isSidebarExpanded ? "pl-64" : "pl-20"
        )}
      >
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboardLayout;
