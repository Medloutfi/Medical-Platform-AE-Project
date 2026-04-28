import { createBrowserRouter } from "react-router";
import Login from "./pages/Login";
import PatientHome from "./pages/patient/PatientHome";
import InterventionRequest from "./pages/patient/InterventionRequest";
import AppointmentBooking from "./pages/patient/AppointmentBooking";
import PatientHistory from "./pages/patient/PatientHistory";
import DoctorHome from "./pages/doctor/DoctorHome";
import DoctorRequests from "./pages/doctor/DoctorRequests";
import DoctorMap from "./pages/doctor/DoctorMap";
import DoctorSchedule from "./pages/doctor/DoctorSchedule";
import DoctorHistory from "./pages/doctor/DoctorHistory";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTracking from "./pages/admin/AdminTracking";
import AdminDoctors from "./pages/admin/AdminDoctors";
import AdminPatients from "./pages/admin/AdminPatients";
import AdminAnalytics from "./pages/admin/AdminAnalytics";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/patient",
    Component: PatientHome,
  },
  {
    path: "/patient/intervention",
    Component: InterventionRequest,
  },
  {
    path: "/patient/appointment",
    Component: AppointmentBooking,
  },
  {
    path: "/patient/history",
    Component: PatientHistory,
  },
  {
    path: "/doctor",
    Component: DoctorHome,
  },
  {
    path: "/doctor/requests",
    Component: DoctorRequests,
  },
  {
    path: "/doctor/map",
    Component: DoctorMap,
  },
  {
    path: "/doctor/schedule",
    Component: DoctorSchedule,
  },
  {
    path: "/doctor/history",
    Component: DoctorHistory,
  },
  {
    path: "/admin",
    Component: AdminDashboard,
  },
  {
    path: "/admin/tracking",
    Component: AdminTracking,
  },
  {
    path: "/admin/doctors",
    Component: AdminDoctors,
  },
  {
    path: "/admin/patients",
    Component: AdminPatients,
  },
  {
    path: "/admin/analytics",
    Component: AdminAnalytics,
  },
]);
