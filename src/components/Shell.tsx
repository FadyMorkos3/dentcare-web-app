import { useEffect, useState } from "react"
import { NavLink, Outlet, useNavigate } from "react-router"
import {
  CalendarDays,
  ChartNoAxesCombined,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  CreditCard,
  FileChartColumn,
  FileText,
  Image,
  LayoutDashboard,
  LogOut,
  Moon,
  Search,
  Settings,
  ShieldCheck,
  Stethoscope,
  Sun,
  Users,
  UserRoundPlus,
  Bell,
  LockKeyhole,
  X,
} from "lucide-react"
import { useTheme } from "../app/theme"
import { patients } from "../app/patients"
import {
  ADMIN_DATA_EVENT,
  loadAuditEvents,
  type AuditEvent,
} from "../app/admin"

type Role = "dentist" | "receptionist" | "admin" | "patient"
const profiles = {
  dentist: {
    initials: "MT",
    name: "Dr Mohamed Tareq",
    role: "General dentist",
    section: "Workspace",
  },
  receptionist: {
    initials: "FM",
    name: "Fady Morkos",
    role: "Receptionist",
    section: "Workspace",
  },
  admin: {
    initials: "MM",
    name: "Marwan Morsy",
    role: "System Administrator",
    section: "Administration",
  },
  patient: {
    initials: "AA",
    name: "Ahmed Ali",
    role: "Patient",
    section: "My care",
  },
}
const icons = {
  dashboard: LayoutDashboard,
  patients: Users,
  appointments: CalendarDays,
  records: FileChartColumn,
  treatments: ClipboardList,
  prescriptions: FileText,
  imaging: Image,
  billing: CreditCard,
  reports: ChartNoAxesCombined,
  settings: Settings,
  users: UserRoundPlus,
  access: ShieldCheck,
  audit: FileText,
  myAppointments: CalendarDays,
  request: CalendarDays,
  myPlan: ClipboardList,
  profile: Users,
  notes: FileText,
  stethoscope: Stethoscope,
}
const nav: Record<Role, {
  label: string
  to: string
  icon: keyof typeof icons
  count?: string
}[]> = {
  dentist: [
    { label: "Dashboard", to: "/dashboard", icon: "dashboard" },
    {
      label: "Patients",
      to: "/patients",
      icon: "patients",
    },
    { label: "Appointments", to: "/appointments", icon: "appointments" },
    {
      label: "Dental Records",
      to: "/patients",
      icon: "records",
    },
    { label: "Treatment Plans", to: "/treatment-plans", icon: "treatments" },
    {
      label: "Prescriptions",
      to: "/prescriptions",
      icon: "prescriptions",
    },
    { label: "Imaging", to: "/imaging", icon: "imaging" },
    { label: "Billing", to: "/billing", icon: "billing" },
    { label: "Reports", to: "/reports", icon: "reports" },
    { label: "Settings", to: "/settings", icon: "settings" },
  ],
  receptionist: [
    { label: "Dashboard", to: "/dashboard", icon: "dashboard" },
    {
      label: "Patients",
      to: "/patients",
      icon: "patients",
    },
    { label: "Appointments", to: "/appointments", icon: "appointments" },
    { label: "Billing", to: "/billing", icon: "billing" },
    { label: "Settings", to: "/settings", icon: "settings" },
  ],
  admin: [
    { label: "Manage Users", to: "/admin/users", icon: "users" },
    { label: "Access & roles", to: "/admin/access", icon: "access" },
    { label: "Audit log", to: "/admin/audit", icon: "audit" },
    { label: "Settings", to: "/admin/settings", icon: "settings" },
  ],
  patient: [
    { label: "My dental chart", to: "/my/chart", icon: "records" },
    { label: "My imaging", to: "/my/imaging", icon: "imaging" },
    { label: "My clinical notes", to: "/my/notes", icon: "notes" },
    {
      label: "My appointments",
      to: "/my/appointments",
      icon: "myAppointments",
    },
    {
      label: "Request appointment",
      to: "/my/request-appointment",
      icon: "request",
    },
    { label: "My treatment plan", to: "/my/treatment-plan", icon: "myPlan" },
    { label: "My profile", to: "/my/profile", icon: "profile" },
  ],
}

function ToothIcon() {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 34 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ borderRadius: 9, flexShrink: 0 }}
    >
      {/* Blue rounded-square background */}
      <rect width="34" height="34" rx="9" fill="#2A6DB5" />
      {/* Tooth shape — crown + two roots, white */}
      <path
        d="M17 6C13.5 6 11 8.2 11 11.2c0 1.4.4 2.7 1 3.8.4.8.6 1.6.6 2.5v.5c0 .3.1.6.2.9L13.5 22c.3 1.1.5 2.2.5 3.3 0 .9.4 1.7.9 1.7s.8-.5.9-1.2l.4-2.8c.1-.7.6-1.2 1.3-1.2h.9c.7 0 1.2.5 1.3 1.2l.4 2.8c.1.7.5 1.2.9 1.2s.9-.8.9-1.7c0-1.1.2-2.2.5-3.3l.7-3.1c.1-.3.2-.6.2-.9V18c0-.9.2-1.7.6-2.5.6-1.1 1-2.4 1-3.8C23 8.2 20.5 6 17 6Z"
        fill="white"
      />
    </svg>
  )
}

function getInitials(fullName: string) {
  const cleaned = fullName.replace(/\b(Dr|Mr|Mrs|Ms|Prof)\.?\b/gi, "").trim()
  const parts = cleaned.split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return "NA"
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function AppShell() {
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const [role, setRole] = useState<Role>(
    () => localStorage.getItem("dentcare-role") as Role || "dentist",
  )
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifications, setNotifications] = useState<AuditEvent[]>(
    loadAuditEvents,
  )
  const [notificationsSeen, setNotificationsSeen] = useState(0)
  const [bellOpen, setBellOpen] = useState(false)
  const profile = profiles[role]

  useEffect(() => {
    const refresh = () => setNotifications(loadAuditEvents())
    window.addEventListener(ADMIN_DATA_EVENT, refresh)
    return () => window.removeEventListener(ADMIN_DATA_EVENT, refresh)
  }, [])

  const searchableItems: {
    label: string
    route: string
    roles: Role[]
    keywords: string
  }[] = [
    {
      label: "Dashboard",
      route: "/dashboard",
      roles: ["dentist", "receptionist"],
      keywords: "overview home",
    },
    {
      label: "Patient register",
      route: "/patients",
      roles: ["dentist", "receptionist"],
      keywords: "patient profile list choose record",
    },
    {
      label: "Treatment plan",
      route: "/treatment-plans",
      roles: ["dentist"],
      keywords: "plan procedures costs",
    },
    {
      label: "Appointments",
      route: "/appointments",
      roles: ["dentist", "receptionist"],
      keywords: "calendar schedule booking",
    },
    {
      label: "Manage appointment",
      route: "/appointments/manage",
      roles: ["dentist", "receptionist"],
      keywords: "reschedule cancel booking",
    },
    {
      label: "Billing",
      route: "/billing",
      roles: ["dentist", "receptionist"],
      keywords: "invoice payment receipt",
    },
    {
      label: "Imaging",
      route: "/imaging",
      roles: ["dentist"],
      keywords: "xray bitewing periapical",
    },
    {
      label: "Manage users",
      route: "/admin/users",
      roles: ["admin"],
      keywords: "accounts access roles create edit reset",
    },
    {
      label: "Access & roles",
      route: "/admin/access",
      roles: ["admin"],
      keywords: "permissions role matrix dentist hygienist receptionist",
    },
    {
      label: "Audit log",
      route: "/admin/audit",
      roles: ["admin"],
      keywords: "security activity account changes export",
    },
    {
      label: "Administrator settings",
      route: "/admin/settings",
      roles: ["admin"],
      keywords: "session timeout secure sign-in notifications portal",
    },
    {
      label: "My appointments",
      route: "/my/appointments",
      roles: ["patient"],
      keywords: "visits bookings",
    },
    {
      label: "Request appointment",
      route: "/my/request-appointment",
      roles: ["patient"],
      keywords: "request booking",
    },
    {
      label: "My treatment plan",
      route: "/my/treatment-plan",
      roles: ["patient"],
      keywords: "my plan costs",
    },
    ...patients.map((p) => ({
      label: `${p.name} · ${p.id}`,
      route: `/patients/${p.slug}`,
      roles: ["dentist", "receptionist"] as Role[],
      keywords: `${p.name} ${p.id} ${p.dob} patient record chart`,
    })),
  ]

  const filteredSearch = searchableItems
    .filter((item) => item.roles.includes(role))
    .filter((item) => {
      if (!searchText.trim()) {
        return true
      }
      const q = searchText.toLowerCase()
      return (
        item.label.toLowerCase().includes(q) ||
        item.keywords.toLowerCase().includes(q)
      )
    })
    .slice(0, 6)

  function navigateFromSearch(route: string) {
    navigate(route)
    setSearchOpen(false)
    setSearchText("")
  }

  function submitSearch() {
    if (filteredSearch[0]) {
      navigateFromSearch(filteredSearch[0].route)
    }
  }

  function signOut() {
    localStorage.removeItem("dentcare-role")
    navigate("/login")
  }

  function switchRole(next: Role) {
    localStorage.setItem("dentcare-role", next)
    setRole(next)
    setMenuOpen(false)
    navigate(
      next === "patient"
        ? "/my/appointments"
        : next === "admin"
          ? "/admin/users"
          : "/dashboard",
    )
  }

  const roleMenu: { label: string; value: Role; desc: string }[] = [
    {
      label: "Dr Mohamed Tareq",
      value: "dentist",
      desc: "General dentist",
    },
    { label: "Fady Morkos", value: "receptionist", desc: "Receptionist" },
    { label: "Marwan Morsy", value: "admin", desc: "System admin" },
    { label: "Ahmed Ali", value: "patient", desc: "Patient portal" },
  ]

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      {mobileNavOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileNavOpen ? "mobile-open" : ""}`}>
        <div className="brand">
          <ToothIcon />
          <strong>DentCare</strong>
          <button
            className="mobile-close"
            onClick={() => setMobileNavOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="org-card">
          <strong>Dental Practice</strong>
          <span>
            {role === "admin"
              ? "Administration"
              : role === "patient"
                ? "Patient portal"
                : "Clinical workspace"}{" "}
            · Online
          </span>
        </div>
        <span className="nav-label">{profile.section}</span>
        <nav>
          {nav[role].map((item) => {
            const Icon = icons[item.icon]
            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={() => setMobileNavOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {(item.count ??
                  (item.to === "/patients" ? patients.length : undefined)) && (
                  <small>
                    {item.count ??
                      (item.to === "/patients" ? patients.length : undefined)}
                  </small>
                )}
              </NavLink>
            )
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="privacy-card">
            <LockKeyhole size={15} />
            <div>
              <strong>
                {role === "patient"
                  ? "Your private patient portal"
                  : "Private clinical workspace"}
              </strong>
              <span>Educational project · fictional data</span>
            </div>
          </div>
          <a className="help" href="mailto:help@dentcare.example">
            <CircleHelp size={17} /> Help &amp; support
          </a>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="top-left">
            <button
              className="hamburger"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation"
            >
              <span />
              <span />
              <span />
            </button>
            <div className="top-search">
              {role === "patient" ? (
                <ShieldCheck size={16} />
              ) : (
                <Search size={16} />
              )}
              <input
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value)
                  setSearchOpen(true)
                }}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => {
                  window.setTimeout(() => setSearchOpen(false), 120)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    submitSearch()
                  }
                }}
                placeholder={
                  role === "patient"
                    ? "Search your appointments or treatment plan"
                    : role === "admin"
                      ? "Search users, access or settings"
                      : "Search patients, records or appointments"
                }
                aria-label="Global search"
              />
              {role !== "patient" && <kbd>Ctrl K</kbd>}
              {searchOpen && filteredSearch.length > 0 && (
                <div className="search-results">
                  {filteredSearch.map((item) => (
                    <button
                      type="button"
                      key={item.route}
                      onClick={() => navigateFromSearch(item.route)}
                    >
                      <strong>{item.label}</strong>
                      <small>{item.route}</small>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="top-actions">
            <span className="top-date">Thu, 08 Oct 2026</span>
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={
                isDark ? "Switch to light mode" : "Switch to dark mode"
              }
              title={isDark ? "Light mode" : "Dark mode"}
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            {role === "admin" && (
              <div className="notif-wrap">
                <button
                  className="bell-button"
                  onClick={() => {
                    setBellOpen(!bellOpen)
                    setNotificationsSeen(notifications.length)
                  }}
                  aria-label="Notifications"
                  title="Security & account notifications"
                >
                  <Bell size={17} />
                  {notifications.length - notificationsSeen > 0 && (
                    <em>{notifications.length - notificationsSeen}</em>
                  )}
                </button>
                  {bellOpen && (
                    <>
                      <div
                        className="menu-backdrop"
                        onClick={() => setBellOpen(false)}
                      />
                      <div className="notif-dropdown">
                        <div className="dropdown-header">
                          Security &amp; account activity
                        </div>
                        {notifications.slice(0, 5).map((event) => (
                          <div className="notif-item" key={event.id}>
                            <strong>{event.action}</strong>
                            <span>{event.detail}</span>
                            <small>
                              {event.target} ·{" "}
                              {new Intl.DateTimeFormat("en-GB", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              }).format(new Date(event.at))}
                            </small>
                          </div>
                        ))}
                        <div className="dropdown-divider" />
                        <button
                          className="dropdown-item"
                          onClick={() => {
                            setBellOpen(false)
                            navigate("/admin/audit")
                          }}
                        >
                          <ShieldCheck size={15} />
                          <span>
                            <strong>Open audit log</strong>
                            <small>Review all administrative events</small>
                          </span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
            )}
            <div className="profile-wrap">
              <button
                className="profile-menu"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <b>{profile.initials}</b>
                <span>
                  <strong>{profile.name}</strong>
                  <small>{profile.role}</small>
                </span>
                <ChevronDown size={14} />
              </button>
              {menuOpen && (
                <>
                  <div
                    className="menu-backdrop"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="profile-dropdown">
                    <div className="dropdown-header">Switch demo account</div>
                    {roleMenu.map((r) => (
                      <button
                        key={r.value}
                        className={`dropdown-item ${
                          role === r.value ? "active" : ""
                        }`}
                        onClick={() => switchRole(r.value)}
                      >
                        <b>{getInitials(r.label)}</b>
                        <span>
                          <strong>{r.label}</strong>
                          <small>{r.desc}</small>
                        </span>
                      </button>
                    ))}
                    <div className="dropdown-divider" />
                    <button className="dropdown-item danger" onClick={signOut}>
                      <LogOut size={15} />
                      <span>
                        <strong>Sign out</strong>
                        <small>Return to login</small>
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>
        <main>
          <Outlet context={{ role }} />
        </main>
        <footer>
          <span>DentCare · Dental practice management</span>
          <span>Fictional records · for educational use only</span>
        </footer>
      </div>
    </div>
  )
}
