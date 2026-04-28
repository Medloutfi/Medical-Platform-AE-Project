import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "patient" | "doctor" | "admin";
  userName: string;
  notificationCount?: number;
}

export function DashboardLayout({ children, role, userName, notificationCount }: DashboardLayoutProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/");
    } else if (user.role !== role) {
      navigate(`/${user.role}`);
    }
  }, [user, navigate, role]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <Sidebar role={user.role} />
      <Navbar userName={user.name} role={user.role} notificationCount={notificationCount} />
      <main className="lg:ml-64 pt-16">
        <div className="p-4 lg:p-8 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}