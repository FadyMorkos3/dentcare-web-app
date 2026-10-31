import type { ReactNode } from "react"
import { createBrowserRouter, Navigate, useOutletContext } from "react-router"
import { AppShell } from "../components/Shell"
import {
  AccessRoles,
  Appointments,
  AdministratorSettings,
  AuditLog,
  BillingPage,
  ClinicalNotes,
  CreateTreatmentPlan,
  Dashboard,
  DentalChart,
  Landing,
  Imaging,
  Login,
  ManageAppointment,
  ManageUsers,
  MyAppointments,
  MyTreatmentPlan,
  PatientOverview,
  Patients,
  Prescriptions,
  RecordDiagnosis,
  RegisterPatient,
  RequestAppointment,
  TreatmentPlan,
  SimplePage,
} from "../pages"

function AdminOnly({ children }: { children: ReactNode }) {
  const { role } = useOutletContext<{ role: string }>()
  if (role !== "admin") {
    return (
      <SimplePage
        title="Administrator access required"
        backTo={role === "patient" ? "/my/appointments" : "/dashboard"}
      />
    )
  }
  return <>{children}</>
}

export const router = createBrowserRouter([
  { path: "/", Component: Landing },
  { path: "/landing", Component: Landing },
  { path: "/welcome", Component: Landing },
  { path: "/login", Component: Login },
  {
    Component: AppShell,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", Component: Dashboard },
      { path: "patients", Component: Patients },
      { path: "patients/register", Component: RegisterPatient },
      { path: "patients/:patientId", Component: PatientOverview },
      { path: "patients/:patientId/chart", Component: DentalChart },
      { path: "patients/:patientId/notes", Component: ClinicalNotes },
      { path: "patients/:patientId/diagnosis", Component: RecordDiagnosis },
      {
        path: "patients/:patientId/treatment-plan",
        Component: TreatmentPlan,
      },
      { path: "patients/:patientId/imaging", Component: Imaging },
      { path: "patients/:patientId/billing", Component: BillingPage },
      { path: "treatment-plans", Component: TreatmentPlan },
      { path: "treatment-plans/new", Component: CreateTreatmentPlan },
      { path: "appointments", Component: Appointments },
      { path: "appointments/manage", Component: ManageAppointment },
      { path: "billing", Component: BillingPage },
      { path: "imaging", Component: Imaging },
      { path: "prescriptions", Component: Prescriptions },
      { path: "reports", element: <SimplePage title="Reports" /> },
      {
        path: "admin/users",
        element: (
          <AdminOnly>
            <ManageUsers />
          </AdminOnly>
        ),
      },
      {
        path: "admin/access",
        element: (
          <AdminOnly>
            <AccessRoles />
          </AdminOnly>
        ),
      },
      {
        path: "admin/audit",
        element: (
          <AdminOnly>
            <AuditLog />
          </AdminOnly>
        ),
      },
      {
        path: "admin/settings",
        element: (
          <AdminOnly>
            <AdministratorSettings />
          </AdminOnly>
        ),
      },
      { path: "my/appointments", Component: MyAppointments },
      { path: "my/chart", element: <DentalChart portal /> },
      { path: "my/imaging", element: <Imaging portal /> },
      { path: "my/notes", element: <ClinicalNotes portal /> },
      { path: "my/request-appointment", Component: RequestAppointment },
      { path: "my/treatment-plan", Component: MyTreatmentPlan },
      { path: "my/profile", element: <PatientOverview portal /> },
      { path: "access", element: <Navigate to="/admin/access" replace /> },
      { path: "audit", element: <Navigate to="/admin/audit" replace /> },
      { path: "settings", element: <SimplePage title="Settings" /> },
      { path: "*", element: <SimplePage title="Page not found" /> },
    ],
  },
])
