export const ADMIN_USERS_KEY = "dentcare-admin-users"
export const ADMIN_AUDIT_KEY = "dentcare-admin-audit"
export const ADMIN_SETTINGS_KEY = "dentcare-admin-settings"
export const ADMIN_DATA_EVENT = "dentcare-admin-data"

export type AdminRole =
  | "Dentist"
  | "Dental hygienist"
  | "Receptionist"
  | "System admin"
  | "Patient"

export type AdminAccess =
  | "Clinical"
  | "Operations"
  | "Administration"
  | "Own information"
  | "No access"

export type AdminUser = {
  id: string
  name: string
  email: string
  role: AdminRole
  access: AdminAccess
  status: "Active" | "Disabled"
  secureSignIn: boolean
  lastActive: string
}

export type AuditEvent = {
  id: string
  at: string
  actor: string
  action: string
  target: string
  detail: string
}

export type AdminSettings = {
  sessionTimeout: "15 minutes" | "30 minutes" | "1 hour" | "4 hours"
  requireSecureSignIn: boolean
  notifyAccountChanges: boolean
  notifyFailedSignIns: boolean
  allowPatientPortal: boolean
}

export const adminRoles: AdminRole[] = [
  "Dentist",
  "Dental hygienist",
  "Receptionist",
  "System admin",
  "Patient",
]

export const roleAccess: Record<AdminRole, AdminAccess> = {
  Dentist: "Clinical",
  "Dental hygienist": "Clinical",
  Receptionist: "Operations",
  "System admin": "Administration",
  Patient: "Own information",
}

const seededUsers: AdminUser[] = [
  {
    id: "usr-mohamed-tareq",
    name: "Dr Mohamed Tareq",
    email: "mohamed.tareq@practice.example",
    role: "Dentist",
    access: "Clinical",
    status: "Active",
    secureSignIn: true,
    lastActive: "Now",
  },
  {
    id: "usr-fady-morkos",
    name: "Fady Morkos",
    email: "fady.morkos@practice.example",
    role: "Receptionist",
    access: "Operations",
    status: "Active",
    secureSignIn: true,
    lastActive: "Now",
  },
  {
    id: "usr-marwan-morsy",
    name: "Marwan Morsy",
    email: "marwan.morsy@practice.example",
    role: "System admin",
    access: "Administration",
    status: "Active",
    secureSignIn: true,
    lastActive: "Now",
  },
  {
    id: "usr-ahmed-ali",
    name: "Ahmed Ali",
    email: "ahmed.ali@example.com",
    role: "Patient",
    access: "Own information",
    status: "Active",
    secureSignIn: true,
    lastActive: "Now",
  },
]

const seededAudit: AuditEvent[] = []

export const defaultAdminSettings: AdminSettings = {
  sessionTimeout: "30 minutes",
  requireSecureSignIn: true,
  notifyAccountChanges: true,
  notifyFailedSignIns: true,
  allowPatientPortal: true,
}

function readStored<T>(key: string, fallback: T): T {
  const stored = localStorage.getItem(key)
  if (!stored) {
    return fallback
  }

  try {
    return JSON.parse(stored) as T
  } catch {
    return fallback
  }
}

function notifyAdminDataChanged() {
  window.dispatchEvent(new Event(ADMIN_DATA_EVENT))
}

function withDerivedAccess(user: AdminUser): AdminUser {
  const knownRole = adminRoles.find((role) => role === user.role)
  const role = knownRole ?? "Receptionist"
  return { ...user, role, access: roleAccess[role] }
}

export function loadAdminUsers() {
  return readStored(ADMIN_USERS_KEY, seededUsers).map(withDerivedAccess)
}

export function saveAdminUsers(users: AdminUser[]) {
  localStorage.setItem(
    ADMIN_USERS_KEY,
    JSON.stringify(users.map(withDerivedAccess)),
  )
  notifyAdminDataChanged()
}

export function loadAuditEvents() {
  return readStored(ADMIN_AUDIT_KEY, seededAudit).map((event) => ({ ...event }))
}

export function appendAuditEvent(event: Omit<AuditEvent, "id" | "at">) {
  const next: AuditEvent = {
    ...event,
    id: `audit-${Date.now()}`,
    at: new Date().toISOString(),
  }
  localStorage.setItem(
    ADMIN_AUDIT_KEY,
    JSON.stringify([next, ...loadAuditEvents()]),
  )
  notifyAdminDataChanged()
  return next
}

export function loadAdminSettings() {
  return {
    ...defaultAdminSettings,
    ...readStored(ADMIN_SETTINGS_KEY, defaultAdminSettings),
  }
}

export function saveAdminSettings(settings: AdminSettings) {
  localStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(settings))
  notifyAdminDataChanged()
}
