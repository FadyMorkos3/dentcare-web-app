import { useEffect, useMemo, useState, type ComponentProps } from "react"
import { Link, Navigate, useNavigate, useParams } from "react-router"
import {
  OdontogramShell,
  disablePersistence,
  enablePersistence,
  exportImage,
  formatToothLabel,
  getOdontogramSummary,
  getSelectedTeeth,
  getStatusChart,
  getToothStateSummary,
  importStatus,
  onStateChange,
  openPerioOverlay,
  setPerioViewMode,
  setToothAnatomy,
} from "react-advanced-odontogram"
import {
  AlertTriangle,
  ArrowRight,
  ArrowUp,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  ClipboardCheck,
  Clock,
  Download,
  Eye,
  EyeOff,
  FileText,
  Image as ImageIcon,
  Lock,
  Mail,
  Moon,
  Plus,
  Search,
  ShieldCheck,
  Stethoscope,
  Sun,
  UserRound,
  Users,
} from "lucide-react"
import {
  Badge,
  Button,
  Card,
  Field,
  Notice,
  PageTitle,
  SelectField,
} from "./components/ui"
import { useTheme } from "./app/theme"
import { isSupabaseConfigured, supabase } from "./lib/supabase"
import xrayRight from "./assets/images/xray-right-bitewing.png"
import xrayLeft from "./assets/images/xray-left-bitewing.png"
import xrayPeriapical from "./assets/images/xray-periapical-36.png"
import {
  ADMIN_DATA_EVENT,
  adminRoles,
  appendAuditEvent,
  loadAdminSettings,
  loadAdminUsers,
  loadAuditEvents,
  roleAccess,
  saveAdminSettings,
  saveAdminUsers,
  type AdminSettings,
  type AdminUser,
} from "./app/admin"
import {
  allergiesText,
  dobFromIso,
  findPatient,
  findPatientByName,
  patients,
  portalPatient,
  registerPatient,
  getSelectedSlug,
  setSelectedSlug,
  updatePatient,
  type Patient,
} from "./app/patients"

function downloadTextFile(fileName: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

/** Small tooth icon for sidebar brand — white tooth on blue square */
function LoginToothIcon() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 34 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0, filter: "drop-shadow(0 2px 4px rgba(42,109,181,0.35))" }}
    >
      <defs>
        <linearGradient id="login-tooth-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="login-tooth-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e8f1fb" />
        </linearGradient>
      </defs>
      <rect width="34" height="34" rx="10" fill="url(#login-tooth-bg)" />
      <path
        d="M17 6.5C13.2 6.5 10.6 8.9 10.6 12.2c0 1.6.5 3 1.3 4.2.5.9.8 1.9.8 2.9v.6c0 .4.1.7.2 1l.9 3.4c.3 1.3.5 2.5.5 3.8 0 1.1.4 2 1.1 2s1-.7 1.1-1.5l.4-3.1c.1-.8.7-1.4 1.5-1.4h.8c.8 0 1.4.6 1.5 1.4l.4 3.1c.1.8.5 1.5 1.1 1.5s1.1-.9 1.1-2c0-1.3.2-2.5.5-3.8l.9-3.4c.1-.3.2-.6.2-1v-.6c0-1 .3-2 .8-2.9.8-1.2 1.3-2.6 1.3-4.2 0-3.3-2.6-5.7-6.4-5.7Z"
        fill="url(#login-tooth-fill)"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="0.6"
      />
      <circle cx="24" cy="10" r="1.6" fill="#93c5fd" opacity="0.9" />
    </svg>
  )
}

/** Large tooth for the login hero; the orbit rings are drawn separately */
function HeroTooth() {
  return (
    <svg
      className="hero-tooth"
      viewBox="0 0 160 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ filter: "drop-shadow(0 16px 40px rgba(96,165,250,0.45))" }}
    >
      <defs>
        <linearGradient id="hero-tooth-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#dbeafe" />
          <stop offset="100%" stopColor="#93c5fd" />
        </linearGradient>
        <linearGradient id="hero-tooth-stroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      {/* Modern abstract tooth: smooth single silhouette, no roots */}
      <path
        d="M80 20
           C 52 20, 34 38, 34 62
           C 34 74, 38 84, 46 92
           C 50 96, 52 102, 52 108
           L 52 138
           C 52 150, 60 160, 72 162
           C 76 162.5, 84 162.5, 88 162
           C 100 160, 108 150, 108 138
           L 108 108
           C 108 102, 110 96, 114 92
           C 122 84, 126 74, 126 62
           C 126 38, 108 20, 80 20 Z"
        fill="url(#hero-tooth-fill)"
        stroke="url(#hero-tooth-stroke)"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* inner highlight */}
      <path
        d="M62 40 C 56 46, 54 56, 56 66"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* sparkle */}
      <path d="M124 30 l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4Z" fill="#93c5fd" opacity="0.95" />
      <path d="M40 70 l1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5 3-1.5 1.5-3Z" fill="#a7f3d0" opacity="0.9" />
    </svg>
  )
}

function tabsFor(patient: Patient) {
  return [
    ["Overview", `/patients/${patient.slug}`],
    ["Dental chart", `/patients/${patient.slug}/chart`],
    ["Treatment plan", `/patients/${patient.slug}/treatment-plan`],
    ["Clinical notes", `/patients/${patient.slug}/notes`],
    ["Imaging", `/patients/${patient.slug}/imaging`],
    ["Billing", `/patients/${patient.slug}/billing`],
  ] as const
}

/** Resolves the record to work in: the URL when it carries a patient id,
 *  otherwise the clinician's last chosen patient. Pages call this instead of
 *  defaulting to a hardcoded record, so /billing or /imaging cannot quietly
 *  show someone else's data. An id that matches no record returns undefined
 *  rather than falling back, so a mistyped link never opens the wrong file. */
function usePatientContext() {
  const { patientId } = useParams()
  const fromUrl = findPatient(patientId)
  const patient = fromUrl ?? (patientId ? undefined : findPatient(getSelectedSlug()))
  useEffect(() => {
    if (fromUrl) {
      setSelectedSlug(fromUrl.slug)
    }
  }, [fromUrl])
  return patient
}

function NoPatientSelected({ purpose }: { purpose?: string } = {}) {
  const { patientId } = useParams()
  return (
    <>
      <PageTitle
        title={patientId ? "Patient not found" : "Choose a patient"}
        subtitle={
          patientId
            ? `Patients / ${patientId} · no record with that reference`
            : purpose
              ? `Patients / ${purpose} · select a record first`
              : "Patients / select a record to open"
        }
      />
      <Card>
        <SectionHead title="Patient register" action={`${patients.length} records`} />
        <Notice tone="info">
          {patientId
            ? "Check the reference and pick the patient from the register below."
            : "Patient information is only shown after you choose a record, so a clinician never opens the wrong file."}
        </Notice>
        <PatientTable caption="Pick one of the patients below to continue." />
        <div className="form-actions">
          <Link to="/patients">
            <Button variant="secondary">
              <Users size={16} /> Open full patient list
            </Button>
          </Link>
        </div>
      </Card>
    </>
  )
}

function PatientHeader({
  patient,
  active = "Overview",
  allergy = true,
  portal = false,
  showTabs = true,
}: {
  patient: Patient
  active?: string
  allergy?: boolean
  portal?: boolean
  showTabs?: boolean
}) {
  const tabs: readonly (readonly [string, string])[] = portal
    ? [
        ["Overview", "/my/profile"],
        ["Dental chart", "/my/chart"],
        ["Imaging", "/my/imaging"],
        ["Clinical notes", "/my/notes"],
        ["My appointments", "/my/appointments"],
        ["My treatment plan", "/my/treatment-plan"],
        ["Request appointment", "/my/request-appointment"],
      ]
    : tabsFor(patient)
  return (
    <>
      <Card className="patient-strip">
        <div className="patient-id">
          <div className="avatar">{patient.initials}</div>
          <div className="patient-name">
            <strong>{patient.name}</strong>
            <small>
              {patient.id} · DOB {patient.dob} · {patient.age} years ·{" "}
              {patient.gender}
            </small>
          </div>
        </div>
        <div>
          <small>Primary clinician</small>
          <strong>{patient.clinician}</strong>
        </div>
        <div>
          <small>Last visit</small>
          <strong>{patient.lastVisit}</strong>
        </div>
        <div>
          <small>Next appointment</small>
          <strong>{patient.nextAppointment}</strong>
        </div>
        <Badge tone={patient.status === "Active" ? "green" : "gray"}>
          {patient.status === "Active" ? "Active patient" : "Inactive patient"}
        </Badge>
        {!portal && (
          <Link className="switch-patient" to="/patients">
            Change patient
          </Link>
        )}
      </Card>
      {allergy && patient.allergies.length > 0 && (
        <div className="allergy">
          <AlertTriangle size={17} />
          <strong>ALLERGY ALERT</strong>
          <span>{allergiesText(patient)}</span>
          <small>Verify before prescribing · use latex-free supplies</small>
        </div>
      )}
      {showTabs && (
        <div className="tabs">
          {tabs.map(([label, to]) => (
            <Link
              className={active === label ? "active" : ""}
              key={label}
              to={to}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </>
  )
}

/** Shown in place of clinical content for a record that has no data yet. */
function EmptyRecord({
  patient,
  area,
  actionTo,
  actionLabel,
}: {
  patient: Patient
  area: string
  actionTo?: string
  actionLabel?: string
}) {
  return (
    <Card className="empty-state">
      <ClipboardCheck size={34} />
      <h2>No {area.toLowerCase()} yet</h2>
      <p>
        {patient.name} ({patient.id}) is registered but this part of the clinical
        record has not been started. Nothing here is inferred or reused from
        another patient.
      </p>
      {actionTo && actionLabel && (
        <Link to={actionTo}>
          <Button>
            <Plus size={16} /> {actionLabel}
          </Button>
        </Link>
      )}
    </Card>
  )
}

function StatCard({
  icon: Icon,
  value,
  label,
  hint,
  tone,
  trend,
}: {
  icon: typeof Users
  value: string
  label: string
  hint: string
  tone: string
  trend?: string
}) {
  return (
    <Card className="stat">
      <span className={`stat-icon ${tone}`}>
        <Icon size={21} />
      </span>
      <div>
        <div className="stat-value-row">
          <strong>{value}</strong>
          {trend && (
            <span className="stat-trend">
              <ArrowUp size={11} /> {trend}
            </span>
          )}
        </div>
        <span>{label}</span>
        <small>{hint}</small>
      </div>
    </Card>
  )
}

export function Login() {
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const [email, setEmail] = useState("mohamed.tareq@practice.example")
  const [password, setPassword] = useState("DentCare2026")
  const [show, setShow] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const role = email.includes("fady")
    ? "receptionist"
    : email.includes("marwan")
      ? "admin"
      : email.includes("ahmed")
        ? "patient"
        : "dentist"
  const [authError, setAuthError] = useState("")
  function logIn() {
    setAuthError("")
    const finish = (resolvedRole: string) => {
      localStorage.setItem("dentcare-role", resolvedRole)
      navigate(
        resolvedRole === "patient"
          ? "/my/appointments"
          : resolvedRole === "admin"
            ? "/admin/users"
            : "/dashboard",
      )
    }
    const resolveRole = async () => {
      if (isSupabaseConfigured) {
        try {
          const { data } = await supabase
            .from("admin_users")
            .select("role")
            .eq("email", email.trim().toLowerCase())
            .single()
          if (data?.role) {
            const r = String(data.role).toLowerCase()
            if (r.includes("admin")) return "admin"
            if (r.includes("reception")) return "receptionist"
            if (r.includes("patient")) return "patient"
            return "dentist"
          }
        } catch {
          /* fall back */
        }
      }
      return role
    }
    if (isSupabaseConfigured) {
      supabase.auth
        .signInWithPassword(email, password)
        .then(async (res: any) => {
          const error = res?.error
          if (error) {
            setAuthError(error.message || "Sign in failed.")
            return
          }
          const resolvedRole = await resolveRole()
          finish(resolvedRole)
        })
        .catch((err: any) => {
          setAuthError(err?.message || "Sign in failed.")
        })
    } else {
      resolveRole().then(finish)
    }
  }
  const demos = [
    ["Dentist", "mohamed.tareq@practice.example"],
    ["Receptionist", "fady.morkos@practice.example"],
    ["System admin", "marwan.morsy@practice.example"],
    ["Patient", "ahmed.ali@example.com"],
  ]
  return (
    <div className="login-page">
      <section className="login-art">
        <div className="brand large">
          <LoginToothIcon />
          <strong>DentCare</strong>
        </div>
        <div className="login-copy">
          <span className="eyebrow">A connected clinical workspace</span>
          <h1>
            Better records.
            <br />
            Better dental care.
          </h1>
          <p>
            Patient history, treatment planning and imaging — together in one
            clear, secure workspace.
          </p>
        </div>
        <div className="login-hero">
          <svg
            className="hero-orbits"
            viewBox="0 0 460 330"
            fill="none"
            aria-hidden="true"
          >
            <ellipse
              cx="230"
              cy="165"
              rx="222"
              ry="132"
              stroke="rgba(126,190,235,.26)"
              transform="rotate(-15 230 165)"
            />
            <ellipse
              cx="230"
              cy="165"
              rx="150"
              ry="150"
              stroke="rgba(126,190,235,.14)"
            />
            <circle cx="232" cy="33" r="5" fill="#63b8f2" />
          </svg>
          <HeroTooth />
          <div className="hero-chip chip-one">
            <span className="hero-chip-icon">
              <ShieldCheck size={17} />
            </span>
            <div>
              <strong>Patient-first care</strong>
              <small>Safety at every step</small>
            </div>
          </div>
          <div className="hero-chip chip-two">
            <span className="hero-chip-icon">
              <ClipboardCheck size={17} />
            </span>
            <div>
              <strong>One complete record</strong>
              <small>From diagnosis to review</small>
            </div>
          </div>
        </div>
        <div className="login-art-foot">
          <span className="rule" />
          <strong>Designed for thoughtful clinical practice.</strong>
          <small>Configurable for any dental practice</small>
        </div>
      </section>
      <section className="login-form-wrap">
        <header className="login-side-head">
          <span>
            <Link to="/landing" className="text-link">
              ← Back to website
            </Link>
          </span>
          <span>
            Need assistance?{" "}
            <a href="mailto:help@dentcare.example">Contact support</a>
          </span>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Light mode" : "Dark mode"}
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </header>
        <form
          className="login-form"
          onSubmit={(e) => {
            e.preventDefault()
            logIn()
          }}
        >
          <span className="mobile-brand">DentCare</span>
          <span className="practice">
            <Building2 size={14} /> Dental Practice
          </span>
          <h2>Welcome back</h2>
          <p>Sign in to your DentCare workspace.</p>
          {resetSent && (
            <Notice tone="success">
              Password reset instructions were sent to {email}.
            </Notice>
          )}
          <label className="field">
            <span>Email address</span>
            <span className="with-icon">
              <Mail size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </span>
          </label>
          <label className="field">
            <span>Password</span>
            <span className="with-icon">
              <Lock size={16} />
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="reveal"
                onClick={() => setShow(!show)}
              >
                {show ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </span>
          </label>
          <div className="form-row">
            <label className="check">
              <input type="checkbox" /> Remember me
            </label>
            <button
              type="button"
              className="text-link"
              onClick={() => setResetSent(true)}
            >
              Forgot password?
            </button>
          </div>
          {authError && <Notice tone="danger">{authError}</Notice>}
          <Button type="submit" className="wide">
            Log in <ArrowRight size={17} />
          </Button>
          <p className="secure-line">
            <ShieldCheck size={15} /> Authorized staff and patients only
          </p>
          <div className="demo">
            <span>Demo as</span>
            <div>
              {demos.map(([name, value]) => (
                <button
                  type="button"
                  key={name}
                  onClick={() => {
                    setEmail(value)
                    setPassword("DentCare2026")
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </form>
        <footer className="login-side-foot">
          <span>
            Educational environment · All patient information is fictional.
          </span>
          <span>DentCare © 2026 · Privacy · Terms of use</span>
        </footer>
      </section>
    </div>
  )
}

export function Dashboard() {
  const navigate = useNavigate()
  const role = localStorage.getItem("dentcare-role") as string || "dentist"
  const hour = new Date().getHours()
  const timeOfDay =
    hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening"
  const names: Record<string, string> = {
    dentist: "Mohamed",
    receptionist: "Fady",
    admin: "Marwan",
    patient: "Ahmed",
  }
  const greeting = `Good ${timeOfDay}, ${names[role] || ""}`.trim()
  return (
    <>
      <style>{`
        .dashboard-welcome {
          background: linear-gradient(135deg, rgba(42,109,181,.10), rgba(35,137,101,.06));
          border-radius: 16px;
          padding: 6px 12px 2px;
          margin-bottom: 6px;
        }
        .stat-value-row { display: flex; align-items: center; gap: 10px; }
        .stat-trend {
          display: inline-flex; align-items: center; gap: 2px;
          font-size: 11px; font-weight: 600; color: #1c8159;
          background: rgba(35,137,101,.10); padding: 2px 7px; border-radius: 999px;
        }
        .schedule-empty {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          padding: 36px 16px; text-align: center; color: var(--muted);
        }
        .schedule-empty strong { color: var(--ink); font-size: 15px; }
        .schedule-empty p { margin: 0; font-size: 13px; max-width: 320px; line-height: 1.5; }
        .schedule-empty svg { color: var(--blue); margin-bottom: 4px; }
        .treatment-progress { align-items: center; }
        .treatment-progress b { font-variant-numeric: tabular-nums; }
      `}</style>
      <div className="dashboard-welcome">
        <PageTitle
          title={greeting}
          subtitle="Thursday, 08 October 2026 · Here's what's happening today."
          action={
            <Button onClick={() => navigate("/appointments/manage")}>
              <Plus size={16} /> New appointment
            </Button>
          }
        />
      </div>
      <div className="stats-grid">
        <StatCard
          icon={Users}
          value={String(patients.length)}
          label="Registered patients"
          hint={`${patients.filter((p) => p.populated).length} with a clinical record`}
          tone="blue"
          trend="+12%"
        />
        <StatCard
          icon={CalendarDays}
          value={String(clinicians[0]?.appts.length ?? 0)}
          label="My appointments today"
          hint={
            clinicians[0]?.appts[0]
              ? `Next at ${clinicians[0].appts[0][0]}`
              : "No appointments booked"
          }
          tone="green"
          trend="+8%"
        />
        <StatCard
          icon={Stethoscope}
          value={String(patients.filter((p) => p.populated).length)}
          label="Active treatment plans"
          hint="2 procedures scheduled"
          tone="purple"
          trend="+5%"
        />
        <StatCard
          icon={Clock}
          value="2"
          label="Requests awaiting review"
          hint="Not yet booked"
          tone="amber"
          trend="+3%"
        />
      </div>
      <div className="dashboard-grid">
        <Card className="span-2">
          <SectionHead
            title="My schedule today"
            action="View full schedule"
            actionTo="/appointments"
          />
          <DoctorSchedulePreview />
        </Card>
        <Card>
          <SectionHead title="Quick actions" />
          <div className="quick-actions">
            <Link to="/patients/register">
              <UserRound />
              <span>Register patient</span>
              <ChevronRight />
            </Link>
            <Link to="/appointments/manage">
              <CalendarDays />
              <span>Book appointment</span>
              <ChevronRight />
            </Link>
            <Link to="/treatment-plans/new">
              <FileText />
              <span>Create treatment plan</span>
              <ChevronRight />
            </Link>
            <Link to="/imaging">
              <ImageIcon />
              <span>Open imaging</span>
              <ChevronRight />
            </Link>
          </div>
        </Card>
        <Card>
          <SectionHead
            title="Waiting on reception"
            action="Manage"
            actionTo="/appointments/manage"
          />
          <div className="follow">
            <b>2</b>
            <span>Booking requests awaiting review</span>
          </div>
          <div className="follow">
            <b>1</b>
            <span>Patient with an accepted plan</span>
          </div>
          <div className="follow">
            <b>0</b>
            <span>Recall appointments due</span>
          </div>
        </Card>
        <Card className="span-2">
          <SectionHead title="Active treatments" action="View plans" actionTo="/patients" />
          {patients.some((p) => p.populated) ? (
            <Link className="treatment-progress" to="/patients/maya-bennett/treatment-plan">
              <span>Ahmed Ali · Caries management</span>
              <b>2 of 4 planned (50%)</b>
              <i>
                <em />
              </i>
            </Link>
          ) : (
            <Notice tone="info">
              No patients have an accepted treatment plan yet. Create one from a
              patient record to see progress here.
            </Notice>
          )}
        </Card>
      </div>
    </>
  )
}
function SectionHead({
  title,
  action,
  actionTo,
  onAction,
}: {
  title: string
  action?: string
  actionTo?: string
  onAction?: () => void
}) {
  return (
    <div className="section-head">
      <h2>{title}</h2>
      {action &&
        (actionTo ? (
          <Link className="text-link" to={actionTo}>
            {action} <ChevronRight size={14} />
          </Link>
        ) : onAction ? (
          <button type="button" onClick={onAction}>
            {action} <ChevronRight size={14} />
          </button>
        ) : (
          <span className="section-meta">{action}</span>
        ))}
    </div>
  )
}
function DoctorSchedulePreview() {
  const clinician = clinicians[0]
  if (!clinician || clinician.appts.length === 0) {
    return (
      <div className="schedule-empty">
        <CalendarDays size={34} />
        <strong>No appointments scheduled</strong>
        <p>
          {clinician
            ? `${clinician.name}'s schedule is clear for today. Book a new visit or enjoy the breathing room.`
            : "No clinician schedule is available yet. Appointments will appear here once booked."}
        </p>
      </div>
    )
  }
  return (
    <div className="schedule-preview">
      <div className="schedule-preview-head">
        <span>
          <strong>{clinician.name}</strong>
          <small>{clinician.role}</small>
        </span>
        <Badge tone="blue">{clinician.appts.length} appointments</Badge>
      </div>
      <div className="schedule-preview-list">
        {clinician.appts.map(([time, patientName, detail, tone]) => {
          const patient = findPatientByName(patientName)
          const detailParts = detail.split(" · ")
          const status = detailParts.at(-1) ?? "Scheduled"
          const treatment = detailParts.slice(0, -1).join(" · ")
          return (
            <Link
              className={`schedule-preview-appt ${tone}`}
              key={`${time}-${patientName}`}
              to={patient ? `/patients/${patient.slug}` : "/appointments"}
            >
              <span className="schedule-preview-time">
                <time>{time}</time>
                <small>{addMinutes(time, 45)}</small>
              </span>
              <span className="schedule-preview-body">
                <strong>{patientName}</strong>
                <small>{treatment}</small>
              </span>
              <span className="schedule-preview-status">{status}</span>
              <ChevronRight size={16} />
            </Link>
          )
        })}
      </div>
      <div className="schedule-preview-now">
        <span>09:12 now</span>
      </div>
    </div>
  )
}

function PatientTable({ caption }: { caption?: string }) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All patients")
  const [clinicianFilter, setClinicianFilter] = useState("All clinicians")

  const filtered = patients.filter((p) => {
    const matchesQuery =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.includes(search) ||
      p.dob.includes(search)
    const matchesStatus =
      statusFilter === "All patients" || p.status === statusFilter
    const matchesClinician =
      clinicianFilter === "All clinicians" || p.clinician === clinicianFilter
    return matchesQuery && matchesStatus && matchesClinician
  })

  return (
    <>
      <div className="filter-row" style={{ gridTemplateColumns: "2fr 1fr 1fr" }}>
        <Field
          label="Search patients"
          placeholder="Name, ID or date of birth"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <SelectField
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All patients</option>
          <option>Active</option>
          <option>Inactive</option>
        </SelectField>
        <SelectField
          label="Clinician"
          value={clinicianFilter}
          onChange={(e) => setClinicianFilter(e.target.value)}
        >
          <option>All clinicians</option>
          <option>Dr Mohamed Tareq</option>
          <option>Dr Mohamed Tareq</option>
        </SelectField>
      </div>
      <div className="patient-picker">
        {filtered.map((p) => (
          <Link
            key={p.id}
            to={`/patients/${p.slug}`}
            className="patient-row"
          >
            <span className="patient-id">
              <span className="avatar">{p.initials}</span>
              <span className="patient-name">
                <strong>{p.name}</strong>
                <small>
                  {p.id} · DOB {p.dob}
                </small>
              </span>
            </span>
            <span className="patient-clinician">{p.clinician}</span>
            <Badge tone={p.status === "Active" ? "green" : "gray"}>
              {p.status}
            </Badge>
            <ChevronRight className="row-arrow" size={17} />
          </Link>
        ))}
      </div>
      {filtered.length === 0 && (
        <Notice tone="warning">
          No matching patients found. Try a different name or ID.
        </Notice>
      )}
      <small className="table-note">
        {caption ??
          `Showing ${filtered.length} of ${patients.length} registered patients · Fictional records`}
      </small>
    </>
  )
}

/** Patients list page — the entry point every clinician must pass through. */
export function Patients() {
  return (
    <>
      <PageTitle
        title="Patients"
        subtitle="Select a patient to open their record"
        action={
          <Link to="/patients/register">
            <Button>
              <Plus size={16} /> Register patient
            </Button>
          </Link>
        }
      />
      <Card>
        <SectionHead
          title="Patient register"
          action={`${patients.length} patients`}
        />
        <PatientTable />
      </Card>
    </>
  )
}

export function PatientOverview({ portal = false }: { portal?: boolean }) {
  const routePatient = usePatientContext()
  const patient = portal ? portalPatient : routePatient
  const [saved, setSaved] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({
    name: patient?.name ?? "",
    phone: patient?.phone ?? "",
    email: patient?.email ?? "",
    address: patient?.address ?? "",
    clinician: patient?.clinician ?? "Dr Mohamed Tareq",
    status: (patient?.status ?? "Active") as "Active" | "Inactive",
  })

  useEffect(() => {
    if (patient) {
      setDraft({
        name: patient.name,
        phone: patient.phone,
        email: patient.email,
        address: patient.address,
        clinician: patient.clinician,
        status: patient.status,
      })
    }
  }, [patient])

  if (!patient) {
    return <NoPatientSelected purpose="overview" />
  }

  return (
    <>
      <PageTitle
        title={portal ? "My profile" : "Patient profile"}
        subtitle={
          portal
            ? "Your personal and clinical information"
            : `Patients / ${patient.name} / Overview`
        }
        action={
          !portal && (
            <Button
              variant="secondary"
              onClick={() => {
                setEditing((v) => !v)
                setSaved(false)
              }}
            >
              {editing ? "Cancel" : "Edit patient"}
            </Button>
          )
        }
      />
      {saved && (
        <Notice tone="success">Patient details saved.</Notice>
      )}
      {editing && (
        <Card>
          <SectionHead title="Edit patient details" />
          <div className="form-grid">
            <Field
              label="Full name *"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            />
            <Field
              label="Phone"
              value={draft.phone}
              onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
            />
            <Field
              label="Email"
              type="email"
              value={draft.email}
              onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
            />
            <Field
              label="Address"
              value={draft.address}
              onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))}
            />
            <SelectField
              label="Clinician"
              value={draft.clinician}
              onChange={(e) => setDraft((d) => ({ ...d, clinician: e.target.value }))}
            >
              <option>Dr Mohamed Tareq</option>
            </SelectField>
            <SelectField
              label="Status"
              value={draft.status}
              onChange={(e) =>
                setDraft((d) => ({ ...d, status: e.target.value as "Active" | "Inactive" }))
              }
            >
              <option>Active</option>
              <option>Inactive</option>
            </SelectField>
          </div>
          <div className="form-actions">
            <Button variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                updatePatient(patient.slug, {
                  name: draft.name.trim() || patient.name,
                  fullName: draft.name.trim() || patient.fullName,
                  phone: draft.phone.trim() || patient.phone,
                  email: draft.email.trim() || patient.email,
                  address: draft.address.trim() || patient.address,
                  clinician: draft.clinician,
                  status: draft.status,
                })
                setEditing(false)
                setSaved(true)
              }}
            >
              <Check size={16} /> Save changes
            </Button>
          </div>
        </Card>
      )}
      <PatientHeader
        patient={patient}
        active="Overview"
        allergy={!portal}
        portal={portal}
      />
      <div className="content-grid">
        <div className="stack">
          <Card>
            <SectionHead title="Patient details" />
            <div className="detail-grid">
              <Info label="Full name" value={patient.fullName} />
              <Info
                label="Date of birth"
                value={`${patient.dob} (${patient.age})`}
              />
              <Info label="Phone" value={patient.phone} />
              <Info label="Email" value={patient.email} />
              <Info label="Address" value={patient.address} />
              <Info label="NHS number" value={patient.nhsNumber} />
              <Info label="Registered" value={`${patient.registeredOn}`} />
              <Info label="Taken by" value={patient.registeredBy} />
            </div>
          </Card>
          {patient.populated ? (
            <>
              <Card>
                <SectionHead title="Medical history" />
                <p className="body-copy">
                  Mild intermittent asthma. No hospital admissions. Patient
                  carries salbutamol inhaler.
                </p>
                <Notice tone="info">
                  Medical history verified with patient on 24 Sep 2026.
                </Notice>
              </Card>
              <Card>
                <SectionHead title="Dental history" />
                <div className="detail-grid">
                  <Info label="Last examination" value="24 Sep 2026" />
                  <Info label="Oral hygiene" value="Fair" />
                  <Info label="Recall interval" value="6 months" />
                  <Info label="Radiographs" value="Bitewings · 24 Sep 2026" />
                </div>
              </Card>
            </>
          ) : (
            <Card>
              <SectionHead title="Medical & dental history" />
              <p className="body-copy">
                No history has been taken for {patient.name} yet. Nothing is
                carried over from another record.
              </p>
              <Notice tone="warning">
                Ask the patient to complete a medical questionnaire before the
                first appointment.
              </Notice>
            </Card>
          )}
        </div>
        <div className="stack">
          <Card>
            <SectionHead title="Allergies & medications" />
            {patient.allergies.length > 0 ? (
              patient.allergies.map((a) => (
                <h3 className="red-text" key={a.agent}>
                  {a.agent} — {a.reaction}
                </h3>
              ))
            ) : (
              <p className="body-copy">No allergies recorded.</p>
            )}
            {patient.populated && (
              <>
                <hr />
                <Info
                  label="Current medication"
                  value="Salbutamol inhaler · as required"
                />
              </>
            )}
          </Card>
          {patient.populated ? (
            <>
              <Card>
                <SectionHead title="Active diagnoses" />
                <p>
                  <Badge tone="red">Active</Badge> Dental caries · tooth 16
                </p>
                <p>
                  <Badge tone="amber">Monitor</Badge> Localized gingivitis
                </p>
              </Card>
              <Card>
                <SectionHead
                  title="Latest clinical note"
                  action="View all notes"
                  actionTo={`/patients/${patient.slug}/notes`}
                />
                <small>24 Sep 2026 · {patient.clinician}</small>
                <p className="body-copy">
                  Routine examination. Bitewings reviewed. Occlusal caries
                  identified on 16; discussed restorative options and
                  prevention.
                </p>
              </Card>
            </>
          ) : (
            <EmptyRecord
              patient={patient}
              area="Clinical record"
              actionTo={`/patients/${patient.slug}/chart`}
              actionLabel="Start charting"
            />
          )}
        </div>
      </div>
    </>
  )
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="info">
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  )
}

/** Ahmed Ali's findings on record, in the engine's FDI-keyed payload shape. */
const mayaSeed = {
  version: "2.22",
  globals: { wisdomVisible: true },
  teeth: {
    "16": { caries: ["caries-occlusal"], cariesSeverity: { occlusal: 3 } },
    "11": {
      toothSubstrate: "crownprep",
      restorationType: "crown",
      restorationMaterial: "zircon",
    },
    "26": {
      fillingSurfaces: ["occlusal", "mesial"],
      fillingSurfaceMaterials: { occlusal: "composite", mesial: "composite" },
    },
    "36": {
      endo: "endo-filling",
      toothSubstrate: "crownprep",
      restorationType: "crown",
      restorationMaterial: "metal-ceramic",
    },
    "46": { toothSelection: "none" },
  },
}

/** Every other registered patient starts from a blank odontogram. */
const emptySeed = {
  version: "2.22",
  globals: { wisdomVisible: true },
  teeth: {},
}

type ShellProps = ComponentProps<typeof OdontogramShell>

const chartThemes: Record<"light" | "dark", ShellProps["themeConfig"]> = {
  light: {
    colors: {
      background: "#f7fafd",
      panel: "#ffffff",
      card: "#f2f5f8",
      text: "#22384b",
      muted: "#6b7d8f",
      line: "#dfe6ed",
      accent: "#2a6db5",
      accent2: "#238965",
    },
    tooth: { body: "#f0f5fa", dentin: "#f7e6c4", outline: "#8ba1b3" },
  },
  dark: {
    colors: {
      background: "#16222f",
      panel: "#172432",
      card: "#1d2c3b",
      text: "#e2ecf5",
      muted: "#8ba0b3",
      line: "#263746",
      accent: "#4f96da",
      accent2: "#35b184",
    },
    tooth: { body: "#22323f", dentin: "#5a4826", outline: "#7e93a6" },
  },
}

export function DentalChart({ portal = false }: { portal?: boolean }) {
  const { isDark } = useTheme()
  const routePatient = usePatientContext()
  const patient = portal ? portalPatient : routePatient
  const [language, setLanguage] = useState<ShellProps["language"]>("en")
  const [numbering, setNumbering] =
    useState<ShellProps["numberingSystem"]>("FDI")
  const [revision, setRevision] = useState(0)
  const slug = patient?.slug

  useEffect(() => {
    if (!patient) {
      return
    }
    let cancelled = false
    // disablePersistence flushes the previous patient's debounced save before
    // the engine is reseeded for the next file.
    disablePersistence()

    async function seed() {
      let seedData: any = patient!.populated ? mayaSeed : emptySeed
      if (isSupabaseConfigured && !portal) {
        try {
          const { data } = await supabase
            .from("dental_charts")
            .select("chart_data")
            .eq("patient_slug", patient!.slug)
            .single()
          if (!cancelled && data && (data as any).chart_data) {
            seedData = (data as any).chart_data
          }
        } catch {
          /* fall back to seed */
        }
      }
      if (cancelled) return
      importStatus(seedData)
      // enablePersistence restores this patient's own saved case when one exists,
      // so charting done in the demo survives a refresh. Call after mount.
      // A patient viewing their own file gets no persistence at all: nothing they
      // tap on the chart can be written back to the record.
      if (!portal) {
        enablePersistence({ key: `dentcare-chart-${patient!.slug}` })
      }
      setToothAnatomy("measured")
      // Inline perio has no bounded height inside our card, so its own scroll
      // containers never engage and the grid unrolls for thousands of px.
      setPerioViewMode("popup")
    }
    seed()

    // Persist chart changes to Supabase (debounced) when configured.
    let saveTimer: ReturnType<typeof setTimeout> | null = null
    const persist = () => {
      if (portal || !isSupabaseConfigured || !patient) return
      if (saveTimer) clearTimeout(saveTimer)
      saveTimer = setTimeout(() => {
        const chart = getStatusChart()
        supabase
          .from("dental_charts")
          .upsert({
            patient_slug: patient!.slug,
            chart_data: chart,
            updated_at: new Date().toISOString(),
          })
          .then(() => undefined)
          .catch(() => undefined)
      }, 800)
    }

    // Engine state lives in a module singleton, so the panel re-reads it on
    // every notification rather than mirroring it into React state.
    const unsubscribe = onStateChange(() => {
      setRevision((r) => r + 1)
      persist()
    })
    return () => {
      cancelled = true
      if (saveTimer) clearTimeout(saveTimer)
      unsubscribe()
      disablePersistence()
    }
  }, [patient, slug, portal])

  const chart = useMemo(
    () => ({
      selected: getSelectedTeeth(),
      details: getSelectedTeeth()
        .slice(0, 4)
        .map((toothNo) => ({ toothNo, lines: getToothStateSummary(toothNo) })),
      summary: getOdontogramSummary(),
    }),
    [revision],
  )

  if (!patient) {
    return <NoPatientSelected purpose="dental chart" />
  }

  return (
    <>
      <PageTitle
        title={portal ? "My dental chart" : "Dental chart"}
        subtitle={
          portal
            ? "My care / Adult odontogram"
            : `Patients / ${patient.name} / Adult odontogram`
        }
        action={
          portal ? undefined : (
            <Button onClick={() => exportImage("png")}>
              <Download size={16} /> Export image
            </Button>
          )
        }
      />
      <PatientHeader patient={patient} active="Dental chart" portal={portal} />
      <div className="chart-layout">
        <Card className="odontogram">
          <div className="section-head">
            <h2>Adult dentition · {numbering} notation</h2>
            <div className="chart-tools">
              <p className="chart-hint">
                {portal
                  ? "Click a tooth to see what was recorded on it. This chart is read-only."
                  : "Click a tooth to chart it, double-click to add a clinical note."}
              </p>
              <Button variant="ghost" onClick={() => openPerioOverlay()}>
                <Stethoscope size={16} /> Periodontal chart
              </Button>
            </div>
          </div>
          {!patient.populated && (
            <Notice tone="info">
              Nothing is charted for {patient.name} yet. Findings you add here
              are saved to this record only.
            </Notice>
          )}
          {portal && (
            <Notice tone="info">
              This is your chart as {patient.clinician} recorded it. Only the
              practice can change it — ask at your next visit if anything looks
              wrong.
            </Notice>
          )}
          <div
            className={`odon-scope${isDark ? " dark" : ""}${portal ? " chart-portal" : ""}`}
          >
            <OdontogramShell
              language={language}
              onLanguageChange={setLanguage}
              numberingSystem={numbering}
              onNumberingChange={setNumbering}
              darkMode={isDark}
              enableNotes={!portal}
              toothInfo={false}
              selectionColor={isDark ? "#7cc0ff" : "#2a6db5"}
              themeConfig={chartThemes[isDark ? "dark" : "light"]}
            />
          </div>
        </Card>
        <Card className="tooth-panel">
          <SectionHead
            title={
              chart.selected.length
                ? `Teeth selected · ${chart.selected.length}`
                : "Tooth detail"
            }
          />
          {chart.details.length === 0 ? (
            <p className="body-copy">
              No tooth selected. Click a tooth on the chart to review its
              findings.
            </p>
          ) : (
            chart.details.map(({ toothNo, lines }) => (
              <div key={toothNo} className="chart-tooth">
                <strong>{formatToothLabel(toothNo)}</strong>
                {lines.length ? (
                  <ul className="chart-findings">
                    {lines.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="body-copy">
                    No active findings for this tooth.
                  </p>
                )}
              </div>
            ))
          )}
          <div className="chart-overview">
            <SectionHead title="Whole-mouth summary" />
            <p className="body-copy">{chart.summary.overview}</p>
            {chart.summary.sections
              .filter((section) => section.items.length > 0)
              .map((section) => (
                <div key={section.key} className="chart-tooth">
                  <strong>{section.heading}</strong>
                  <ul className="chart-findings">
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </>
  )
}

type ClinicalNote = {
  date: string
  clinician: string
  title: string
  tag: string
  tone: "blue" | "green" | "amber" | "red" | "gray"
  findings: string
  plan: string
}

/** Examination history for the showcase record, newest first. Every entry is
 *  backed by something already visible elsewhere: the 24 Sep bitewings, the
 *  caries on 16, the root filling and crown on 36, the 12 Apr 2024 radiograph. */
const mayaNotes: readonly ClinicalNote[] = [
  {
    date: "24 Sep 2026",
    clinician: "Dr Mohamed Tareq",
    title: "Routine examination · caries diagnosis",
    tag: "Active problem",
    tone: "amber",
    findings:
      "Routine examination. Bitewings reviewed. Occlusal caries identified on 16; discussed restorative options and prevention.",
    plan: "Composite restoration 16 · oral hygiene instruction · 6-month recall",
  },
  {
    date: "24 Sep 2026",
    clinician: "Dr Mohamed Tareq",
    title: "Bitewing radiograph review",
    tag: "Imaging",
    tone: "blue",
    findings:
      "Upper right and left bitewings taken. Caries limited to enamel occlusally on 16. Existing margins on 26 sound, no recurrent decay. Bone levels within normal limits.",
    plan: "Diagnosis recorded as K02.0 · no additional imaging required at this visit",
  },
  {
    date: "12 Apr 2024",
    clinician: "Dr Mohamed Tareq",
    title: "Endodontic and crown review · tooth 36",
    tag: "Resolved",
    tone: "green",
    findings:
      "Periapical radiograph of 36. Root filling well condensed to length, no periapical radiolucency. Metal-ceramic crown margins intact, probing depths within healthy range.",
    plan: "No treatment indicated · review at routine recall",
  },
  {
    date: "06 Feb 2023",
    clinician: "Dr Mohamed Tareq",
    title: "Crown placement · tooth 11",
    tag: "Resolved",
    tone: "green",
    findings:
      "Tooth prepared and zirconia crown cemented. Occlusion checked with articulating foil, patient comfortable on articulation and excursive movements.",
    plan: "Annual margin check · avoid biting hard foods on the restored incisor",
  },
]

export function ClinicalNotes({ portal = false }: { portal?: boolean }) {
  const routePatient = usePatientContext()
  const patient = portal ? portalPatient : routePatient
  if (!patient) {
    return <NoPatientSelected purpose="clinical notes" />
  }
  const [extraNotes, setExtraNotes] = useState<ClinicalNote[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem(`dentcare-notes-${patient!.slug}`) ?? "[]",
      ) as ClinicalNote[]
    } catch {
      return []
    }
  })

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let cancelled = false
    supabase
      .from("clinical_notes")
      .select("*")
      .eq("patient_slug", patient!.slug)
      .order("created_at", { ascending: false })
      .then(({ data }: { data: any }) => {
        if (cancelled || !Array.isArray(data)) return
        const mapped: ClinicalNote[] = data.map((row: any) => ({
          date: row.date,
          clinician: row.clinician,
          title: row.title,
          tag: row.tag,
          tone: row.tone,
          findings: row.findings,
          plan: row.plan,
        }))
        setExtraNotes(mapped)
      })
    return () => {
      cancelled = true
    }
  }, [patient])
  const [noteForm, setNoteForm] = useState({
    title: "",
    findings: "",
    plan: "",
    tag: "Active problem",
    tone: "blue" as ClinicalNote["tone"],
  })
  const [noteSaved, setNoteSaved] = useState(false)
  const notes = [...extraNotes, ...(patient.populated ? mayaNotes : [])]

  function saveNote() {
    if (!noteForm.title.trim() || !noteForm.findings.trim()) return
    const next: ClinicalNote = {
      date: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      clinician: patient!.clinician,
      title: noteForm.title.trim(),
      tag: noteForm.tag,
      tone: noteForm.tone,
      findings: noteForm.findings.trim(),
      plan: noteForm.plan.trim() || "No plan recorded.",
    }
    const updated = [next, ...extraNotes]
    setExtraNotes(updated)
    localStorage.setItem(
      `dentcare-notes-${patient!.slug}`,
      JSON.stringify(updated),
    )
    if (isSupabaseConfigured) {
      supabase
        .from("clinical_notes")
        .insert({
          id: `note-${Date.now()}`,
          patient_slug: patient!.slug,
          date: next.date,
          clinician: next.clinician,
          title: next.title,
          tag: next.tag,
          tone: next.tone,
          findings: next.findings,
          plan: next.plan,
        })
        .then(() => undefined)
        .catch(() => undefined)
    }
    setNoteForm({ title: "", findings: "", plan: "", tag: "Active problem", tone: "blue" })
    setNoteSaved(true)
  }
  return (
    <>
      <PageTitle
        title={portal ? "My clinical notes" : "Clinical notes"}
        subtitle={
          portal
            ? "My care / Note history"
            : `Patients / ${patient.name} / Note history`
        }
        action={
          portal ? undefined : (
            <Link to={`/patients/${patient.slug}/diagnosis`}>
              <Button>
                <Plus size={16} /> Record diagnosis
              </Button>
            </Link>
          )
        }
      />
      <PatientHeader
        patient={patient}
        active="Clinical notes"
        portal={portal}
      />
      {!patient.populated ? (
        <EmptyRecord
          patient={patient}
          area="Clinical notes"
          actionTo={`/patients/${patient.slug}/diagnosis`}
          actionLabel="Record the first diagnosis"
        />
      ) : (
        <div className="content-grid wide-left" key={patient.slug}>
          <Card>
            <SectionHead
              title="Note history"
              action={`${notes.length} entries`}
            />
            {!portal && (
              <div className="note-form" style={{ marginBottom: 16 }}>
                {noteSaved && (
                  <Notice tone="success">Note recorded.</Notice>
                )}
                <Field
                  label="Title *"
                  value={noteForm.title}
                  onChange={(e) =>
                    setNoteForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="e.g. Routine examination"
                />
                <label className="field">
                  <span>Clinical findings *</span>
                  <textarea
                    value={noteForm.findings}
                    onChange={(e) =>
                      setNoteForm((f) => ({ ...f, findings: e.target.value }))
                    }
                    placeholder="Describe what you examined and found."
                  />
                </label>
                <label className="field">
                  <span>Plan</span>
                  <textarea
                    value={noteForm.plan}
                    onChange={(e) =>
                      setNoteForm((f) => ({ ...f, plan: e.target.value }))
                    }
                    placeholder="Treatment plan."
                  />
                </label>
                <div className="form-actions">
                  <Button
                    disabled={!noteForm.title.trim() || !noteForm.findings.trim()}
                    onClick={saveNote}
                  >
                    <Check size={16} /> Record note
                  </Button>
                </div>
              </div>
            )}
            <div className="note-list">
              {notes.map((note) => (
                <article className="note-entry" key={`${note.date}-${note.title}`}>
                  <header className="note-head">
                    <strong>{note.date}</strong>
                    <small>{note.clinician}</small>
                    <Badge tone={note.tone}>{note.tag}</Badge>
                  </header>
                  <h3 className="note-title">{note.title}</h3>
                  <p className="body-copy">{note.findings}</p>
                  <p className="note-plan">
                    <span>Plan</span> {note.plan}
                  </p>
                </article>
              ))}
            </div>

          </Card>
          <div className="stack">
            <Card>
              <SectionHead title="Active problem list" />
              <p>
                <Badge tone="red">Active</Badge> Dental caries · tooth 16
              </p>
              <p>
                <Badge tone="amber">Monitor</Badge> Localized gingivitis
              </p>
              <hr />
              <Info label="Last examination" value="24 Sep 2026" />
              <Info label="Primary clinician" value={patient.clinician} />
            </Card>
            {portal ? (
              <Card>
                <SectionHead title="Questions about a note" />
                <p className="body-copy">
                  These are the notes your clinician wrote at each visit. If
                  anything reads incorrectly, raise it at your next appointment
                  and it will be reviewed against the examination.
                </p>
                <Link to="/my/appointments">
                  <Button variant="secondary" className="wide">
                    <CalendarDays size={16} /> See my appointments
                  </Button>
                </Link>
              </Card>
            ) : (
              <Card>
                <SectionHead title="Recording a new note" />
                <p className="body-copy">
                  Notes are written from the diagnosis form and cannot be edited
                  once filed. Add the tooth number and what you examined exactly
                  as found.
                </p>
                <Link to={`/patients/${patient.slug}/diagnosis`}>
                  <Button variant="secondary" className="wide">
                    <Check size={16} /> Open diagnosis form
                  </Button>
                </Link>
              </Card>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export function RecordDiagnosis() {
  const [saved, setSaved] = useState(false)
  const navigate = useNavigate()
  const routePatient = usePatientContext()
  if (!routePatient) {
    return <NoPatientSelected purpose="clinical notes" />
  }
  const patient = routePatient
  return (
    <>
      <PageTitle
        title="Record diagnosis"
        subtitle={`Patients / ${patient.name} / Clinical notes / New diagnosis`}
      />
      <PatientHeader patient={patient} active="Clinical notes" />
      <div className="content-grid wide-left" key={patient.slug}>
        <Card>
          <SectionHead title="Clinical assessment" />
          {saved && (
            <Notice tone="success">
              Diagnosis recorded in {patient.name}'s clinical record.
            </Notice>
          )}
          {!patient.populated && (
            <Notice tone="info">
              This is the first entry in {patient.name}'s record. Add the tooth
              number and findings exactly as examined.
            </Notice>
          )}
          <SelectField label="Diagnosis *">
            <option>Dental caries</option>
            <option>Localized gingivitis</option>
            <option>Periapical periodontitis</option>
          </SelectField>
          <div className="form-grid">
            <SelectField label="Tooth">
              <option>16</option>
              <option>26</option>
              <option>36</option>
            </SelectField>
            <SelectField label="Status">
              <option>Active</option>
              <option>Under review</option>
              <option>Resolved</option>
            </SelectField>
          </div>
          <Field
            label="Date identified *"
            type="date"
            defaultValue="2026-10-08"
          />
          <label className="field">
            <span>Clinical findings *</span>
            <textarea
              defaultValue={
                patient.populated
                  ? "Occlusal caries on upper right first molar, confirmed on bitewing radiograph."
                  : ""
              }
              placeholder="Describe what you examined and found."
            />
          </label>
          <label className="field">
            <span>Assessment and rationale</span>
            <textarea
              defaultValue={
                patient.populated
                  ? "Restorable tooth. Discussed composite restoration and preventive advice."
                  : ""
              }
              placeholder="Why this diagnosis and what it means for treatment."
            />
          </label>
          <label className="check">
            <input type="checkbox" defaultChecked /> Add diagnosis to active
            problem list
          </label>
          <div className="form-actions">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button onClick={() => setSaved(true)}>
              <Check size={16} /> Record diagnosis
            </Button>
          </div>
        </Card>
        <Card>
          <SectionHead title="Patient context" />
          {patient.populated ? (
            <Notice tone="info">
              Existing diagnosis: Dental caries · tooth 16. Do not create a
              duplicate active entry.
            </Notice>
          ) : (
            <Notice tone="warning">
              No diagnoses are recorded for {patient.name} yet.
            </Notice>
          )}
          <h3>Medical history</h3>
          <p className="body-copy">
            {patient.populated
              ? "Mild intermittent asthma · salbutamol as required."
              : "Not yet taken."}
          </p>
          <h3 className={patient.allergies.length ? "red-text" : undefined}>
            Allergy alert
          </h3>
          <p>
            {patient.allergies.length > 0
              ? patient.allergies.map((a) => a.agent).join(" · ")
              : "None recorded"}
          </p>
          <hr />
          <label className="check">
            <input type="checkbox" defaultChecked /> I have confirmed the
            patient&apos;s identity and reviewed allergies.
          </label>
        </Card>
      </div>
    </>
  )
}

const procedures = [
  ["Composite restoration", "16", "£180.00", "Scheduled", "08 Oct · 09:30"],
  ["Restoration polish", "26", "£40.00", "Planned", "15 Oct · proposed"],
  [
    "Scale & oral hygiene instruction",
    "Full mouth",
    "£90.00",
    "Planned",
    "15 Oct · proposed",
  ],
  ["Endodontic review", "36", "£60.00", "Scheduled", "22 Oct · 09:30"],
]
function ProcedureTable({ patient = false }: { patient?: boolean }) {
  return (
    <div className="procedure-table">
      <div className="table-head">
        <span>
          {patient ? "Procedure / what it means" : "Procedure / indication"}
        </span>
        <span>Tooth</span>
        <span>Cost</span>
        <span>Status</span>
        <span>Visit</span>
      </div>
      {procedures.map((r, i) => (
        <div className="table-row" key={r[0]}>
          <span>
            <strong>
              {r[0]}
              {i === 0 && " · tooth 16"}
            </strong>
            <small>
              {
                [
                  "A tooth-coloured filling for decay",
                  "Smooth an existing filling",
                  "Remove plaque and support gum health",
                  "Check an existing root canal and crown",
                ][i]
              }
            </small>
          </span>
          <span>{r[1]}</span>
          <span>{r[2]}</span>
          <span>
            <Badge tone={r[3] === "Scheduled" ? "blue" : "gray"}>{r[3]}</Badge>
          </span>
          <span className="link">{r[4]}</span>
        </div>
      ))}
    </div>
  )
}
export function TreatmentPlan() {
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)
  const [savedPlans, setSavedPlans] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("dentcare-treatment-plans") ?? "[]")
    } catch {
      return []
    }
  })
  const patient = usePatientContext()

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let cancelled = false
    supabase
      .from("treatment_plans")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }: { data: any }) => {
        if (cancelled || !Array.isArray(data)) return
        setSavedPlans(data)
      })
    return () => {
      cancelled = true
    }
  }, [])

  function exportPlan() {
    if (!patient) {
      return
    }
    downloadTextFile(
      `treatment-plan-${patient.id}.txt`,
      [
        `Treatment plan: ${patient.name} (${patient.id})`,
        "Composite restoration (tooth 16): £180.00",
        "Restoration polish (tooth 26): £40.00",
        "Scale and oral hygiene instruction: £90.00",
        "Endodontic review (tooth 36): £60.00",
        "Estimated total: £370.00",
      ].join("\n"),
    )
    setSaved(true)
  }

  if (!patient) {
    return <NoPatientSelected purpose="treatment plans" />
  }
  if (!patient.populated) {
    return (
      <>
        <PageTitle
          title="Treatment plan"
          subtitle={`Patients / ${patient.name} / No plan on record`}
        />
        <PatientHeader patient={patient} active="Treatment plan" />
        <EmptyRecord
          patient={patient}
          area="Treatment plan"
          actionTo={`/patients/${patient.slug}/diagnosis`}
          actionLabel="Record a diagnosis first"
        />
      </>
    )
  }

  return (
    <>
      <PageTitle
        title="Treatment plan"
        subtitle={`Patients / ${patient.name} / Plan TP-2026-084`}
        action={
          <div className="actions">
            <Button variant="secondary" onClick={exportPlan}>
              <Download size={16} /> Export plan
            </Button>
            <Button onClick={() => navigate("/treatment-plans/new")}>
              <Plus size={16} /> Add procedure
            </Button>
          </div>
        }
      />
      {saved && (
        <Notice tone="success">Plan export generated successfully.</Notice>
      )}
      <PatientHeader patient={patient} active="Treatment plan" />
      {savedPlans.length > 0 && (
        <Card className="saved-plans-card">
          <SectionHead title="Saved plans" action={`${savedPlans.length} total`} />
          <div className="audit-list">
            {savedPlans
              .filter((p: any) => !patient || p.patient_slug === patient.slug)
              .map((p: any) => (
                <article key={p.id}>
                  <div className="audit-icon">
                    <ClipboardList size={17} />
                  </div>
                  <div>
                    <strong>{p.title ?? "Treatment plan"}</strong>
                    <span>
                      {p.status ?? "Draft"} · £{Number(p.total ?? 0).toFixed(2)}
                    </span>
                    <small>{p.created_at ?? p.date ?? ""}</small>
                  </div>
                </article>
              ))}
          </div>
        </Card>
      )}
      <div className="content-grid wide-left" key={patient.slug}>
        <Card>
          <SectionHead
            title="Caries management & preventive care"
            action="Edit plan"
            actionTo="/treatment-plans/new"
          />
          <div className="status-line">
            <Badge tone="amber">16 · Dental caries</Badge>
            <Badge tone="amber">Localized gingivitis</Badge>
            <Badge tone="green">Patient accepted</Badge>
          </div>
          <ProcedureTable />
          <small>
            Created 24 Sep 2026 · Dr Mohamed Tareq · Consent recorded · GRP —
            Clinical fees are VAT exempt.
          </small>
        </Card>
        <PlanSummary />
      </div>
    </>
  )
}
function PlanSummary() {
  const navigate = useNavigate()

  return (
    <Card>
      <SectionHead title="Plan summary" />
      <Info label="Total estimated cost" value="£370.00" />
      <Info label="Paid to date" value="£0.00" />
      <Info label="Estimated balance" value="£370.00" />
      <hr />
      <h3>Follow-up scheduling</h3>
      <p>
        <CalendarDays size={16} /> <strong>22 Oct 2026 · 09:30–10:00</strong>
      </p>
      <small>Endodontic review · Dr Mohamed Tareq</small>
      <Button
        variant="secondary"
        className="wide"
        onClick={() => navigate("/appointments/manage")}
      >
        Schedule planned visits
      </Button>
      <Notice tone="info">
        <strong>Next session · Today, 09:30</strong>
        <br />
        Composite restoration · tooth 16
      </Notice>
    </Card>
  )
}

export function CreateTreatmentPlan() {
  const navigate = useNavigate()
  const patient = usePatientContext()
  const [draftProcedures, setDraftProcedures] = useState(() =>
    patient?.populated
      ? procedures.map((p) => ({ name: p[0], tooth: p[1] }))
      : [],
  )
  const [fees, setFees] = useState(() =>
    patient?.populated ? [180, 40, 90, 60] : [],
  )
  const total = fees.reduce((a, b) => a + b, 0)
  const [consent, setConsent] = useState("Not yet discussed")
  const [savedDraft, setSavedDraft] = useState(false)

  function addProcedure() {
    setDraftProcedures((prev) => [
      ...prev,
      { name: "New custom procedure", tooth: "TBD" },
    ])
    setFees((prev) => [...prev, 50])
  }

  if (!patient) {
    return <NoPatientSelected purpose="new treatment plan" />
  }

  return (
    <>
      <PageTitle
        title="Create treatment plan"
        subtitle={`Patients / ${patient.name} / New treatment plan`}
      />
      <PatientHeader patient={patient} active="Treatment plan" />
      {savedDraft && (
        <Notice tone="success">Draft plan saved locally in this demo.</Notice>
      )}
      <div className="content-grid wide-left" key={patient.slug}>
        <Card>
          <SectionHead title="Plan details" />
          <Field
            label="Plan title *"
            defaultValue={
              patient.populated
                ? "Caries management & preventive care"
                : "New plan title"
            }
          />
          <div className="form-grid">
            <SelectField label="Plan status">
              <option>Draft</option>
              <option>Proposed</option>
              <option>Accepted</option>
            </SelectField>
            <SelectField
              label="Responsible clinician"
              defaultValue={patient.clinician}
            >
              <option>Dr Mohamed Tareq</option>
              <option>Dr Mohamed Tareq</option>
            </SelectField>
          </div>
          <h3>Procedures</h3>
          {draftProcedures.length === 0 && (
            <p className="body-copy">
              No procedures on this draft yet. Add each item, its tooth and fee
              as the plan is agreed with the patient.
            </p>
          )}
          {draftProcedures.map((p, i) => (
            <div
              className="editable-procedure"
              key={`${p.name}-${p.tooth}-${i}`}
            >
              <span>
                <strong>{p.name}</strong>
                <small>Tooth {p.tooth}</small>
              </span>
              <label>
                Fee £
                <input
                  type="number"
                  value={fees[i]}
                  onChange={(e) =>
                    setFees(
                      fees.map((f, j) =>
                        j === i ? Number(e.target.value) : f,
                      ),
                    )
                  }
                />
              </label>
            </div>
          ))}
          <Button variant="secondary" onClick={addProcedure}>
            <Plus size={15} /> Add procedure
          </Button>
          <label className="field">
            <span>Plan notes</span>
            <textarea
              defaultValue={
                patient.populated
                  ? "Prioritise restoration of tooth 16, with maintenance and preventive care."
                  : ""
              }
              placeholder="Clinical rationale, sequencing and anything the patient should know."
            />
          </label>
        </Card>
        <Card>
          <SectionHead title="Summary" />
          <div className="total">
            <span>Estimated total</span>
            <strong>£{total.toFixed(2)}</strong>
          </div>
          <SelectField
            label="Consent status"
            value={consent}
            onChange={(e) => setConsent(e.target.value)}
          >
            <option>Not yet discussed</option>
            <option>Discussed · pending</option>
            <option>Patient accepted</option>
          </SelectField>
          {consent !== "Patient accepted" && (
            <Notice tone="warning">
              The plan cannot be marked active until patient consent is
              recorded.
            </Notice>
          )}
          <SelectField label="Payment category">
            <option>Self-pay</option>
            <option>Insurance</option>
          </SelectField>
          <div className="form-actions">
            <Button
             variant="secondary"
             onClick={() => {
               setSavedDraft(true)
               const plan = {
                 id: `TP-${Date.now()}`,
                 patient_slug: patient!.slug,
                 title: "Caries management & preventive care",
                 total,
                 status: consent === "Patient accepted" ? "Accepted" : "Draft",
                 data: { procedures: draftProcedures, fees, consent },
               }
               try {
                 const existing = JSON.parse(
                   localStorage.getItem("dentcare-treatment-plans") ?? "[]",
                 )
                 localStorage.setItem(
                   "dentcare-treatment-plans",
                   JSON.stringify([plan, ...existing]),
                 )
               } catch {
                 localStorage.setItem(
                   "dentcare-treatment-plans",
                   JSON.stringify([plan]),
                 )
               }
               if (isSupabaseConfigured) {
                 supabase
                   .from("treatment_plans")
                   .insert(plan)
                   .then(() => undefined)
                   .catch(() => undefined)
               }
             }}
           >
             Save draft
           </Button>
            <Button onClick={() => navigate("/treatment-plans")}>
              Create plan
            </Button>
          </div>
        </Card>
      </div>
    </>
  )
}

export function RegisterPatient() {
  const [valid, setValid] = useState(false)
  const [registered, setRegistered] = useState<Patient | null>(null)
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    sex: "Female",
    phone: "",
    email: "",
    address: "",
    postcode: "",
  })
  const set = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))
  const navigate = useNavigate()
  return (
    <>
      <PageTitle
        title="Register patient"
        subtitle="Patients / New registration · Reception workspace"
        action={<Badge tone="amber">New patient · unsaved</Badge>}
      />
      <Notice tone="info">
        Complete required fields (*) and confirm consent before creating the
        patient record. Fictional new registration.
      </Notice>
      {registered && (
        <Notice tone="success">
          {registered.name} ({registered.id}) is on the register.{" "}
          <Link className="text-link" to={`/patients/${registered.slug}`}>
            Open the record →
          </Link>
        </Notice>
      )}
      <div className="content-grid wide-left">
        <Card>
          <SectionHead title="Demographics & contact" />
          <div className="form-grid">
            <Field
              label="First name *"
              value={form.firstName}
              onChange={(e) => set("firstName")(e.target.value)}
            />
            <Field
              label="Last name *"
              value={form.lastName}
              onChange={(e) => set("lastName")(e.target.value)}
            />
            <Field
              label="Date of birth *"
              type="date"
              value={form.dob}
              onChange={(e) => set("dob")(e.target.value)}
            />
            <SelectField
              label="Sex"
              value={form.sex}
              onChange={(e) => set("sex")(e.target.value)}
            >
              <option>Female</option>
              <option>Male</option>
              <option>Other</option>
            </SelectField>
            <Field label="Preferred name" />
            <Field
              label="Mobile number *"
              value={form.phone}
              onChange={(e) => set("phone")(e.target.value)}
            />
            <Field
              label="Email address *"
              type="email"
              value={form.email}
              onChange={(e) => set("email")(e.target.value)}
            />
            <Field
              label="Address *"
              value={form.address}
              onChange={(e) => set("address")(e.target.value)}
            />
            <Field
              label="Postcode *"
              value={form.postcode}
              onChange={(e) => set("postcode")(e.target.value)}
            />
          </div>
          <h3>Emergency contact</h3>
          <div className="form-grid three">
            <Field label="Contact name *" />
            <SelectField label="Relationship">
              <option>Sibling</option>
              <option>Parent</option>
              <option>Spouse</option>
              <option>Friend</option>
            </SelectField>
            <Field label="Contact phone *" />
          </div>
          <div className="form-grid">
            <SelectField label="Communication preference">
              <option>Email reminders</option>
              <option>SMS reminders</option>
              <option>No reminders</option>
            </SelectField>
            <SelectField label="Payment category">
              <option>Self-pay</option>
              <option>Insurance</option>
              <option>NHS</option>
            </SelectField>
          </div>
          <label className="check">
            <input
              type="checkbox"
              checked={valid}
              onChange={(e) => setValid(e.target.checked)}
            />{" "}
            Patient agrees to storage and use of their information for dental
            care *
          </label>
          <label className="check">
            <input type="checkbox" defaultChecked /> Patient agrees to
            appointment reminders
          </label>
          <div className="form-actions">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button
              disabled={!valid}
              onClick={() => {
                setRegistered(
                  registerPatient({
                    name: `${form.firstName} ${form.lastName}`,
                    dob: dobFromIso(form.dob),
                    gender: form.sex,
                    address: `${form.address}, ${form.postcode}`,
                    email: form.email,
                    phone: form.phone,
                    clinician: "Not yet assigned",
                  }),
                )
              }}
            >
              <Check size={16} /> Register patient
            </Button>
          </div>
          {valid && (
            <small className="green-text" style={{ marginTop: 8 }}>
              No duplicate found · Required fields complete
            </small>
          )}
        </Card>
        <Card>
          <SectionHead title="Medical history & allergies" />
          <label className="field">
            <span>Medical conditions *</span>
            <textarea placeholder="No medical conditions reported" />
          </label>
          <label className="field">
            <span>Current medicines</span>
            <textarea placeholder="No regular medicines reported" />
          </label>
          <SelectField label="Allergies *">
            <option>No known allergies reported</option>
            <option>Yes — details recorded</option>
          </SelectField>
          <Field
            label="Allergy / reaction details"
            placeholder="Not applicable"
          />
          <label className="check">
            <input type="checkbox" defaultChecked /> Medical history provided by
            patient
          </label>
          <Notice tone="warning">
            Reception records patient-reported history. A clinician must review
            it before treatment.
          </Notice>
          <h3>Record identifier</h3>
          <Info
            label="Assigned on registration"
            value="Fady Morkos · 08 Oct 2026"
          />
          <small>
            Registration does not create an appointment or a treatment plan.
          </small>
        </Card>
      </div>
    </>
  )
}

type ScheduleTone = "green" | "blue" | "gray" | "amber"

const clinicians: {
  name: string
  role: string
  appts: [string, string, string, ScheduleTone][]
}[] = []
/** Flattened so the detail panel can resolve any booked slot, not just Maya's. */
const todaysAppointments = clinicians.flatMap((c) =>
  c.appts.map(([time, patientName, detail, tone]) => ({
    time,
    patientName,
    detail,
    tone,
    clinician: c.name,
    location: c.role.split(" · ")[0],
  })),
)

function addMinutes(start: string, mins: number) {
  const [h, m] = start.split(":").map(Number)
  const end = h * 60 + m + mins
  return `${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`
}

export function Appointments() {
  const navigate = useNavigate()
  const [items, setItems] = useState<
    { id: string; patientName: string; clinician: string; date: string; time: string; reason: string; status: string }[]
  >(() => {
    try {
      return JSON.parse(localStorage.getItem("dentcare-appointments") ?? "[]")
    } catch {
      return []
    }
  })
  const [booking, setBooking] = useState({
    patientName: "",
    clinician: "Dr Mohamed Tareq",
    date: new Date().toISOString().slice(0, 10),
    time: "09:00",
    reason: "Examination",
  })
  const [notice, setNotice] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let cancelled = false
    supabase
      .from("appointments")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }: { data: any }) => {
        if (cancelled || !Array.isArray(data)) return
        const mapped = data.map((row: any) => ({
          id: row.id,
          patientName: row.patient_name,
          clinician: row.clinician,
          date: row.date,
          time: row.time,
          reason: row.reason,
          status: row.status,
        }))
        setItems(mapped)
      })
    return () => {
      cancelled = true
    }
  }, [])

  function persist(next: typeof items) {
    setItems(next)
    localStorage.setItem("dentcare-appointments", JSON.stringify(next))
    if (isSupabaseConfigured) {
      // upsert all is heavy; instead upsert the latest added. We'll upsert each item individually is costly.
      // For simplicity, upsert the first (newest) item.
      const newest = next[0]
      if (newest) {
        supabase
          .from("appointments")
          .upsert({
            id: newest.id,
            patient_name: newest.patientName,
            clinician: newest.clinician,
            date: newest.date,
            time: newest.time,
            reason: newest.reason,
            status: newest.status,
          })
          .then(() => undefined)
          .catch(() => undefined)
      }
    }
  }

  function book() {
    if (!booking.patientName.trim()) return
    const next = [
      {
        id: `APPT-${Date.now()}`,
        patientName: booking.patientName.trim(),
        clinician: booking.clinician,
        date: booking.date,
        time: booking.time,
        reason: booking.reason,
        status: "Scheduled",
      },
      ...items,
    ]
    persist(next)
    setBooking({ ...booking, patientName: "", reason: "Examination" })
    setNotice(true)
  }

  function toggleStatus(id: string) {
    const next = items.map((a) =>
      a.id === id
        ? { ...a, status: a.status === "Completed" ? "Scheduled" : "Completed" }
        : a,
    )
    persist(next)
  }

  function remove(id: string) {
    persist(items.filter((a) => a.id !== id))
    if (isSupabaseConfigured) {
      supabase.from("appointments").delete().eq("id", id).then(() => undefined).catch(() => undefined)
    }
  }

  return (
    <>
      <PageTitle
        title="Appointments"
        subtitle="Manage the practice schedule"
        action={
          <Button onClick={() => navigate("/appointments/manage")}>
            <Plus size={16} /> New appointment
          </Button>
        }
      />
      {notice && <Notice tone="success">Appointment booked.</Notice>}
      <div className="content-grid wide-left">
        <Card>
          <SectionHead title="Book appointment" />
          <div className="form-grid">
            <Field
              label="Patient name *"
              value={booking.patientName}
              onChange={(e) =>
                setBooking((b) => ({ ...b, patientName: e.target.value }))
              }
              placeholder="e.g. Ahmed Ali"
            />
            <SelectField
              label="Clinician"
              value={booking.clinician}
              onChange={(e) =>
                setBooking((b) => ({ ...b, clinician: e.target.value }))
              }
            >
              <option>Dr Mohamed Tareq</option>
              <option>Dr Mohamed Tareq</option>
            </SelectField>
            <Field
              label="Date *"
              type="date"
              value={booking.date}
              onChange={(e) =>
                setBooking((b) => ({ ...b, date: e.target.value }))
              }
            />
            <SelectField
              label="Time"
              value={booking.time}
              onChange={(e) =>
                setBooking((b) => ({ ...b, time: e.target.value }))
              }
            >
              {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </SelectField>
            <SelectField
              label="Reason"
              value={booking.reason}
              onChange={(e) =>
                setBooking((b) => ({ ...b, reason: e.target.value }))
              }
            >
              <option>Examination</option>
              <option>Restoration</option>
              <option>Hygiene</option>
              <option>Consultation</option>
              <option>Follow-up</option>
            </SelectField>
          </div>
          <div className="form-actions">
            <Button
              disabled={!booking.patientName.trim()}
              onClick={book}
            >
              <Check size={16} /> Book
            </Button>
          </div>
        </Card>
        <Card>
          <SectionHead title="Scheduled appointments" action={`${items.length} total`} />
          {items.length === 0 ? (
            <Notice tone="info">No appointments booked yet.</Notice>
          ) : (
            <div className="audit-list">
              {items.map((a) => (
                <article key={a.id}>
                  <div className="audit-icon">
                    <CalendarDays size={17} />
                  </div>
                  <div>
                    <strong>{a.patientName} · {a.reason}</strong>
                    <span>{a.date} at {a.time} · {a.clinician}</span>
                    <small>{a.id}</small>
                  </div>
                  <div className="form-actions" style={{ marginTop: 0 }}>
                    <Badge tone={a.status === "Completed" ? "green" : "blue"}>
                      {a.status}
                    </Badge>
                    <Button variant="secondary" onClick={() => toggleStatus(a.id)}>
                      {a.status === "Completed" ? "Reopen" : "Complete"}
                    </Button>
                    <Button variant="ghost" onClick={() => remove(a.id)}>
                      Remove
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  )
}

type Tab =
  | "Book appointment"
  | "Reschedule"
  | "Cancel appointment"
  | "Requested"

export function ManageAppointment() {
  const [saved, setSaved] = useState(false)
  const [cancelled, setCancelled] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>("Reschedule")
  const navigate = useNavigate()
  const contextPatient = usePatientContext()
  const patient = contextPatient ?? portalPatient
  if (!patient) {
    return <NoPatientSelected purpose="manage appointment" />
  }
  return (
    <>
      <PageTitle
        title="Manage appointment"
        subtitle={`Appointments / ${patient.name} / Booking details`}
        action={
          <Button variant="secondary" onClick={() => navigate("/appointments")}>
            ← Back to calendar
          </Button>
        }
      />
      <PatientHeader patient={patient} allergy={false} showTabs={false} />
      <div className="tabs sub-tabs">
        {[
          "Book appointment",
          "Reschedule",
          "Cancel appointment",
          "Requested",
        ].map((tab) => (
          <button
            type="button"
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab as Tab)}
            key={tab}
          >
            {tab === "Requested" ? "Requested appointments (2)" : tab}
          </button>
        ))}
      </div>
      {activeTab === "Book appointment" && (
        <Notice tone="info">
          Complete the booking form below, then save to place{" "}
          {patient.name} in the calendar. A booked slot does not mean treatment
          has been completed.
        </Notice>
      )}
      {activeTab === "Cancel appointment" && (
        <Notice tone="warning">
          Cancelling releases the time slot and keeps{" "}
          {patient.name}&apos;s treatment planned, not completed. Use the
          cancellation controls on the right.
        </Notice>
      )}
      {activeTab === "Requested" && (
        <Card>
          <SectionHead title="Requests awaiting a booking" action="0 pending" />
          <Notice tone="info">
            No appointment requests are awaiting review.
          </Notice>
        </Card>
      )}
      {cancelled && (
        <Notice tone="success">
          Appointment cancelled and patient notification prepared.
        </Notice>
      )}
      <div className="content-grid wide-left">
        <Card>
          <SectionHead title="Appointment details" />
          {saved ? (
            <Notice tone="success">
              Appointment updated and confirmation sent to {patient.name}.
            </Notice>
          ) : (
            <Notice tone="info">
              Confirmed booking · Thu 08 Oct 2026, 09:30–10:15. Nothing changes
              until you save.
            </Notice>
          )}
          <div className="form-grid">
            <Field
              label="Patient *"
              value={`${patient.name} · ${patient.id}`}
              readOnly
            />
            <SelectField
              label="Appointment type *"
              defaultValue={
                patient.populated ? "Composite restoration · tooth 16" : ""
              }
            >
              <option value="" disabled>
                Select a type
              </option>
              <option>Composite restoration · tooth 16</option>
              <option>Examination · new patient</option>
              <option>Hygiene · scale and polish</option>
              <option>Post-extraction review</option>
              <option>Endodontic review</option>
            </SelectField>
            <SelectField
              label="Clinician *"
              defaultValue={patient.clinician}
            >
              <option>Dr Mohamed Tareq</option>
              <option>Dr Mohamed Tareq</option>
            </SelectField>
            <SelectField label="Location *" defaultValue="Surgery 1">
              <option>Surgery 1</option>
              <option>Surgery 2</option>
              <option>Hygiene room</option>
            </SelectField>
            <Field label="Date *" type="date" defaultValue="2026-10-08" />
            <SelectField label="Start time *">
              <option>09:30</option>
              <option>10:30</option>
            </SelectField>
            <SelectField label="Duration *">
              <option>15 minutes</option>
              <option>30 minutes</option>
              <option>45 minutes</option>
              <option>60 minutes</option>
            </SelectField>
            <SelectField label="Status *">
              <option>Confirmed</option>
              <option>Scheduled</option>
              <option>Cancelled</option>
            </SelectField>
          </div>
          <Field
            label="Linked plan"
            defaultValue={
              patient.populated ? "TP-2026-084 · £180.00" : "No plan on record"
            }
            readOnly
          />
          <label className="field">
            <span>Reception notes / reason for change</span>
            <textarea
              defaultValue={
                patient.populated
                  ? "Reconfirm arrival time by email. Leave booked time unchanged until patient agrees."
                  : ""
              }
              placeholder="Why is this appointment changing?"
            />
          </label>
          <label className="check">
            <input type="checkbox" defaultChecked /> Send updated appointment
            confirmation to {patient.email}
          </label>
          <small className="green-text">
            ✓ Clinician and Surgery 1 are available for this booked slot.
          </small>
          <div className="form-actions">
            <Button variant="ghost" onClick={() => navigate("/appointments")}>
              Cancel
            </Button>
            <Button onClick={() => setSaved(true)}>
              <Check size={16} /> Save changes
            </Button>
          </div>
          <small style={{ color: "var(--muted)" }}>
            09:12 BST · No changes saved
          </small>
        </Card>
        <div className="stack">
          <Card>
            <SectionHead title="Requested appointments" />
            <Badge tone="amber">2 awaiting review</Badge>
            <small
              style={{
                color: "var(--muted)",
                display: "block",
                marginBottom: 8,
              }}
            >
              Not confirmed bookings
            </small>
            <RequestMini
              name="Liam Turner"
              dc="DC-001198"
              slug="liam-turner"
              reason="Post-extraction review"
              pref="Prefers 09 Oct, morning · Dr Mohamed Tareq"
            />
            <RequestMini
              name="Isla Hughes"
              dc="DC-001076"
              slug="isla-hughes"
              reason="Periodontal reassessment"
              pref="Prefers 12 Oct, afternoon · any clinician"
            />
          </Card>
          <Card>
            <SectionHead title="Cancellation controls" />
            <SelectField label="Cancellation reason *">
              <option>Select a reason</option>
              <option>Patient request</option>
              <option>Clinician unavailable</option>
              <option>Emergency</option>
            </SelectField>
            <small className="body-copy">
              Cancelling releases the time slot. Treatment stays planned, not
              completed.
            </small>
            <label className="check">
              <input type="checkbox" defaultChecked /> Notify patient of
              cancellation
            </label>
            <Button variant="danger" onClick={() => setCancelled(true)}>
              Cancel appointment
            </Button>
          </Card>
        </div>
      </div>
    </>
  )
}
function RequestMini({
  name,
  dc,
  slug,
  reason,
  pref,
}: {
  name: string
  dc: string
  slug: string
  reason: string
  pref: string
}) {
  const [status, setStatus] = useState<"pending" | "reviewed" | "declined">(
    "pending",
  )

  return (
    <div className="request-mini">
      <strong>{name}</strong>
      <small>{dc}</small>
      <b>{reason}</b>
      <small>{pref}</small>
      <div>
        <Button onClick={() => setStatus("reviewed")}>Review &amp; book</Button>
        <Button variant="ghost" onClick={() => setStatus("declined")}>
          Decline
        </Button>
      </div>
      {status === "reviewed" && (
        <>
          <Badge tone="green">Marked for booking</Badge>
          <Link className="text-link" to={`/patients/${slug}`}>
            Open {name}&apos;s record to book →
          </Link>
        </>
      )}
      {status === "declined" && <Badge tone="gray">Declined</Badge>}
    </div>
  )
}

export function BillingPage() {
  const [recorded, setRecorded] = useState(false)
  const [ref, setRef] = useState("")
  const [receiptIssued, setReceiptIssued] = useState(false)
  const [savedInvoices, setSavedInvoices] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("dentcare-invoices") ?? "[]")
    } catch {
      return []
    }
  })
  const patient = usePatientContext() ?? portalPatient

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let cancelled = false
    supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }: { data: any }) => {
        if (cancelled || !Array.isArray(data)) return
        setSavedInvoices(data)
      })
    return () => {
      cancelled = true
    }
  }, [])
 
  function previewInvoice() {
    if (!patient) {
      return
    }
    downloadTextFile(
      "invoice-preview-INV-2026-1284.txt",
      [
        "Invoice preview: INV-2026-1284",
        `Patient: ${patient.name} (${patient.id})`,
        "Procedure: Composite restoration (tooth 16)",
        "Amount: £180.00",
        `Status: ${recorded ? "Payment recorded" : "Draft unpaid"}`,
      ].join("\n"),
    )
  }

  function issueReceipt() {
    if (!patient) {
      return
    }
    downloadTextFile(
      "receipt-INV-2026-1284.txt",
      [
        "Receipt",
        "Invoice: INV-2026-1284",
        `Patient: ${patient.name}`,
        "Amount received: £180.00",
        `Reference: ${ref}`,
      ].join("\n"),
    )
    setReceiptIssued(true)
  }

  if (!patient) {
    return <NoPatientSelected purpose="billing" />
  }
  if (!patient.populated) {
    return (
      <>
        <PageTitle
          title="Manage billing"
          subtitle={`Billing / ${patient.name} / Nothing invoiced`}
        />
        <PatientHeader patient={patient} allergy={false} active="Billing" />
        <EmptyRecord
          patient={patient}
          area="Invoice"
          actionTo={`/patients/${patient.slug}/treatment-plan`}
          actionLabel="Open treatment plan"
        />
      </>
    )
  }

  return (
    <>
      {savedInvoices.length > 0 && (
        <Notice tone="info">
          {savedInvoices.length} saved invoice(s) on record.
        </Notice>
      )}
      <PageTitle
        title="Manage billing"
        subtitle={`Billing / ${patient.name} / Draft invoice INV-2026-1284`}
        action={
          <Button variant="secondary" onClick={previewInvoice}>
            <FileText size={16} /> Preview invoice
          </Button>
        }
      />
      <PatientHeader patient={patient} allergy={false} active="Billing" />
      {receiptIssued && (
        <Notice tone="success">Receipt issued and downloaded.</Notice>
      )}
      <div className="content-grid wide-left" key={patient.slug}>
        <Card>
          <div className="section-head">
            <h2>Patient invoice · INV-2026-1284</h2>
            <Badge tone="amber">Draft · unpaid</Badge>
          </div>
          <div className="detail-grid">
            <Info label="Bill to" value={`${patient.name} · ${patient.id}`} />
            <Info label="Invoice date" value="08 Oct 2026" />
          </div>
          <small
            style={{
              color: "var(--muted)",
              display: "block",
              marginBottom: 10,
            }}
          >
            {patient.address} · {patient.email}
          </small>
          <div className="invoice-row head">
            <span>Procedure</span>
            <span>Tooth</span>
            <span>Qty</span>
            <span>Fee</span>
            <span>Line total</span>
          </div>
          <div className="invoice-row">
            <strong>Composite restoration · scheduled 08 Oct, 09:30</strong>
            <span>16</span>
            <span>1</span>
            <span>£180.00</span>
            <strong>£180.00</strong>
          </div>
          <div className="invoice-total">
            <Info label="Subtotal / VAT" value="£180.00 / VAT-exempt" />
            <Info label="Draft invoice total" value="£180.00" />
            <Info
              label="Payment recorded"
              value={recorded ? "£180.00" : "£0.00"}
            />
          </div>
          <Notice tone="warning">
            Scheduled procedure only; treatment has not been completed. This
            draft is not an issued invoice or receipt.
          </Notice>
          <h3>Whole treatment plan estimate · TP-2026-084</h3>
          <div
            className="table-head"
            style={{ gridTemplateColumns: "2fr 80px 90px", fontSize: 8 }}
          >
            <span>Other planned / scheduled procedures</span>
            <span>Tooth</span>
            <span>Estimate</span>
          </div>
          {procedures.slice(1).map((p) => (
            <div className="estimate" key={p[0]}>
              <span>
                {p[0]} · {p[4]}
              </span>
              <span>{p[1]}</span>
              <strong>{p[2]}</strong>
            </div>
          ))}
          <small className="body-copy">
            Whole plan £370.00 = this visit £180.00 + remaining estimate
            £190.00. Not all procedures are invoiced.
          </small>
        </Card>
        <Card>
          <SectionHead title="Payment & receipt" />
          <Info label="Whole-plan estimated total" value="£370.00" />
          <div className="detail-grid">
            <Info label="Paid to date" value={recorded ? "£180.00" : "£0.00"} />
            <Info
              label="Estimated balance"
              value={recorded ? "£190.00" : "£370.00"}
            />
          </div>
          <small className="body-copy">
            GBP · Clinical fees are VAT-exempt
          </small>
          <Field label="Payment amount" defaultValue="£180.00" />
          <SelectField label="Payment method">
            <option>Card</option>
            <option>Cash</option>
            <option>Bank transfer</option>
          </SelectField>
          <Field
            label="Reference"
            placeholder="Enter terminal / transaction reference"
            value={ref}
            onChange={(e) => setRef(e.target.value)}
          />
          <Notice tone="info">
            Payment has not been received. Record payment only after an actual
            transaction and invoice review.
          </Notice>
          <div className="form-actions">
            <Button
              variant="ghost"
              onClick={() => {
                setRef("")
                setRecorded(false)
                setReceiptIssued(false)
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={recorded || !ref.trim()}
              onClick={() => {
                setRecorded(true)
                const invoice = {
                  id: `INV-${Date.now()}`,
                  patient_slug: patient!.slug,
                  amount: 180,
                  status: "Paid",
                  reference: ref.trim(),
                  data: { ref: ref.trim() },
                }
                try {
                  const existing = JSON.parse(
                    localStorage.getItem("dentcare-invoices") ?? "[]",
                  )
                  localStorage.setItem(
                    "dentcare-invoices",
                    JSON.stringify([invoice, ...existing]),
                  )
                } catch {
                  localStorage.setItem(
                    "dentcare-invoices",
                    JSON.stringify([invoice]),
                  )
                }
                if (isSupabaseConfigured) {
                  supabase
                    .from("invoices")
                    .insert(invoice)
                    .then(() => undefined)
                    .catch(() => undefined)
                }
              }}
            >
              Record payment
            </Button>
          </div>
          <hr />
          <Button
            variant="secondary"
            className="wide"
            disabled={!recorded}
            onClick={issueReceipt}
          >
            <CircleDollarSign size={16} /> Issue receipt
          </Button>
          {!recorded && (
            <small
              className="body-copy"
              style={{ textAlign: "center", display: "block" }}
            >
              Receipt becomes available after payment is recorded. No payment or
              completion is implied by this draft.
            </small>
          )}
        </Card>
      </div>
    </>
  )
}

export function Imaging({ portal = false }: { portal?: boolean }) {
  const routePatient = usePatientContext()
  const patient = portal ? portalPatient : routePatient ?? portalPatient
  if (!patient) {
    return <NoPatientSelected purpose="imaging" />
  }
  if (!patient.populated) {
    return (
      <>
        <PageTitle
          title="Dental imaging"
          subtitle={`Patients / ${patient.name} / Imaging library`}
        />
        <PatientHeader patient={patient} active="Imaging" />
        <EmptyRecord
          patient={patient}
          area="Image"
          actionTo={`/patients/${patient.slug}/chart`}
          actionLabel="Open dental chart"
        />
      </>
    )
  }
  // Keyed so switching patient never carries the previous library over.
  return <ImagingLibrary key={patient.slug} patient={patient} portal={portal} />
}

function ImagingLibrary({
  patient,
  portal = false,
}: {
  patient: Patient
  portal?: boolean
}) {
  const [image, setImage] = useState(0)
  const [images, setImages] = useState(() => [
    {
      name: "Right bitewing",
      date: "24 Sep 2026",
      src: xrayRight,
      region: "Bitewing · Upper right (16)",
    },
    {
      name: "Left bitewing",
      date: "24 Sep 2026",
      src: xrayLeft,
      region: "Bitewing · Upper left",
    },
    {
      name: "Periapical · tooth 36",
      date: "12 Apr 2024",
      src: xrayPeriapical,
      region: "Periapical · Tooth 36",
    },
  ])
  const [zoom, setZoom] = useState(1)

  function addImage() {
    const nextIndex = images.length + 1
    const next = {
      name: `Uploaded image ${nextIndex}`,
      date: "08 Oct 2026",
      // Sample plates only; a real upload would carry its own file name.
      src: xrayRight,
      region: "Bitewing · Imported",
    }
    setImages((prev) => [...prev, next])
    setImage(images.length)
  }

  return (
    <>
      <PageTitle
        title={portal ? "My dental imaging" : "Dental imaging"}
        subtitle={
          portal
            ? "My care / Imaging library"
            : `Patients / ${patient.name} / Imaging library`
        }
        action={
          portal ? undefined : (
            <Button onClick={addImage}>
              <Plus size={16} /> Upload image
            </Button>
          )
        }
      />
      <PatientHeader patient={patient} active="Imaging" portal={portal} />
      <div className="imaging-layout">
        <Card className="gallery">
          <SectionHead
            title="Image gallery"
            action={`${images.length} images`}
          />
          {images.map((img, i) => (
            <button
              className={image === i ? "active" : ""}
              onClick={() => setImage(i)}
              key={`${img.src}-${i}`}
            >
              <img className="xray-thumb" src={img.src} alt={img.name} />
              <strong>{img.name}</strong>
              <small>{img.date} · Fictional image</small>
            </button>
          ))}
          {images.length === 0 && (
            <p className="body-copy">
              No images captured for {patient.name}. Upload to start the library.
            </p>
          )}
        </Card>
        <Card className="viewer">
          <div className="section-head">
            <h2>
              {images[image]?.name} · {images[image]?.date}
            </h2>
            <div className="viewer-actions">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.75, z - 0.1))}
              >
                -
              </button>
              <span>
                <Search size={16} /> {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
              >
                +
              </button>
            </div>
          </div>
          <div className="xray-main">
            <small>SYNTHETIC · EDUCATIONAL IMAGE</small>
            <img
              className="xray-full"
              style={{ transform: `scale(${zoom})` }}
              src={images[image]?.src}
              alt={`${images[image]?.name} dental image`}
              onError={(e) => {
                console.error("X-ray image failed to load:", e.currentTarget.src)
              }}
            />
          </div>

        </Card>
        <Card>
          <SectionHead title="Image metadata" />
          <Badge tone="amber">Educational sample</Badge>
          <Info label="Patient / record" value={`${patient.name} · ${patient.id}`} />
          <Info
            label="Image type / region"
            value={images[image]?.region || "Bitewing"}
          />
          <Info
            label="Date / uploaded by"
            value={`${images[image]?.date} · ${patient.clinician}`}
          />
          <Info label="File" value={`${images[image]?.src?.split("/").pop()} · 1600 × 1000`} />
          <Info label="Source" value="Synthetic educational illustration" />
        </Card>
      </div>
    </>
  )
}

export function ManageUsers() {
  const [allUsers, setAllUsers] = useState<AdminUser[]>(() => loadAdminUsers())
  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState(() => loadAdminUsers()[0]?.id ?? "")
  const [draft, setDraft] = useState<AdminUser>(() =>
    loadAdminUsers()[0] ?? {
      id: "",
      name: "",
      email: "",
      role: "Receptionist",
      access: "Operations",
      status: "Active",
      secureSignIn: true,
      lastActive: "Not signed in yet",
    },
  )
  const [isCreating, setIsCreating] = useState(false)
  const [notice, setNotice] = useState<{
    tone: "success" | "info" | "danger"
    message: string
  } | null>(null)
  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("All roles")
  const [accessFilter, setAccessFilter] = useState("All access levels")
  const [statusFilter, setStatusFilter] = useState("Active & disabled")

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return
    }
    let cancelled = false
    setLoading(true)
    supabase
      .from("admin_users")
      .select("*")
      .order("name", { ascending: true })
      .then(({ data, error }: { data: any; error: any }) => {
        if (cancelled) return
        setLoading(false)
        if (error || !Array.isArray(data)) {
          setNotice({
            tone: "danger",
            message: "Could not load users from Supabase.",
          })
          return
        }
        const mapped: AdminUser[] = data.map((row: any) => ({
          id: row.id,
          name: row.name,
          email: row.email,
          role: row.role,
          access: row.access,
          status: row.status,
          secureSignIn: row.secure_sign_in ?? row.secureSignIn ?? true,
          lastActive: row.last_active ?? row.lastActive ?? "Not signed in yet",
        }))
        setAllUsers(mapped)
        if (mapped[0]) {
          setSelectedId(mapped[0].id)
          setDraft({ ...mapped[0] })
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false)
          setNotice({ tone: "danger", message: "Could not load users from Supabase." })
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const selectedUser = allUsers.find((user) => user.id === selectedId)
  const filteredUsers = allUsers.filter((user) => {
    const normalizedQuery = query.trim().toLowerCase()
    const matchesQuery =
      !normalizedQuery ||
      user.name.toLowerCase().includes(normalizedQuery) ||
      user.email.toLowerCase().includes(normalizedQuery)
    const matchesRole = roleFilter === "All roles" || user.role === roleFilter
    const matchesAccess =
      accessFilter === "All access levels" || user.access === accessFilter
    const matchesStatus =
      statusFilter === "Active & disabled" ||
      (statusFilter === "Active only" && user.status === "Active") ||
      (statusFilter === "Disabled only" && user.status === "Disabled")
    return matchesQuery && matchesRole && matchesAccess && matchesStatus
  })
  const activeCount = allUsers.filter((user) => user.status === "Active").length
  const disabledCount = allUsers.length - activeCount
  const isDirty = isCreating || JSON.stringify(draft) !== JSON.stringify(selectedUser)

  function selectUser(user: AdminUser) {
    setSelectedId(user.id)
    setDraft({ ...user })
    setIsCreating(false)
    setNotice(null)
  }

  function createUser() {
    setSelectedId("")
    setDraft({
      id: `usr-${Date.now()}`,
      name: "",
      email: "",
      role: "Receptionist",
      access: "Operations",
      status: "Active",
      secureSignIn: true,
      lastActive: "Not signed in yet",
    })
    setIsCreating(true)
    setNotice(null)
  }

  function cancelChanges() {
    if (isCreating) {
      const fallback = allUsers[0]
      if (fallback) {
        setSelectedId(fallback.id)
        setDraft({ ...fallback })
      } else {
        setSelectedId("")
      }
      setIsCreating(false)
    } else if (selectedUser) {
      setDraft({ ...selectedUser })
    }
    setNotice(null)
  }

  function saveUser() {
    const normalizedName = draft.name.trim()
    const normalizedEmail = draft.email.trim().toLowerCase()
    if (!normalizedName || !normalizedEmail.includes("@")) {
      setNotice({
        tone: "danger",
        message: "Enter a full name and a valid email address before saving.",
      })
      return
    }
    if (
      allUsers.some(
        (user) =>
          user.id !== draft.id && user.email.toLowerCase() === normalizedEmail,
      )
    ) {
      setNotice({
        tone: "danger",
        message: "That email address already belongs to another user.",
      })
      return
    }

    const savedUser = {
      ...draft,
      name: normalizedName,
      email: normalizedEmail,
    }
    const nextUsers = isCreating
      ? [...allUsers, savedUser]
      : allUsers.map((user) => (user.id === savedUser.id ? savedUser : user))
    const action = isCreating
      ? "Account created"
      : selectedUser?.status !== savedUser.status
        ? savedUser.status === "Disabled"
          ? "Account disabled"
          : "Account enabled"
        : "Account updated"

    saveAdminUsers(nextUsers)
    if (isSupabaseConfigured) {
      supabase
        .from("admin_users")
        .upsert({
          id: savedUser.id,
          name: savedUser.name,
          email: savedUser.email,
          role: savedUser.role,
          access: savedUser.access,
          status: savedUser.status,
          secure_sign_in: savedUser.secureSignIn,
          last_active: savedUser.lastActive,
        })
        .then(() => undefined)
        .catch(() => {
          setNotice({
            tone: "danger",
            message: "Saved locally, but failed to persist to Supabase.",
          })
        })
    }
    appendAuditEvent({
      actor: "Marwan Morsy",
      action,
      target: savedUser.name,
      detail: `${savedUser.role} · ${savedUser.access} access · secure sign-in ${savedUser.secureSignIn ? "required" : "optional"}.`,
    })
    setAllUsers(nextUsers)
    setSelectedId(savedUser.id)
    setDraft({ ...savedUser })
    setIsCreating(false)
    setNotice({ tone: "success", message: `${savedUser.name} was saved.` })
  }

  function sendPasswordReset() {
    appendAuditEvent({
      actor: "Marwan Morsy",
      action: "Password reset sent",
      target: draft.name,
      detail: `Reset instructions queued for ${draft.email}.`,
    })
    setNotice({
      tone: "info",
      message: `Password reset instructions were queued for ${draft.email}.`,
    })
  }

  return (
    <>
      <PageTitle
        title="Manage users"
        subtitle="Administration / Users · Manage role-based access to this workspace"
        action={
          <Button onClick={createUser}>
            <Plus size={16} /> Create user
          </Button>
        }
      />
      {loading && <Notice tone="info">Loading users from Supabase…</Notice>}
      <div className="filter-row">
        <Field
          label="Search users"
          placeholder="Name or email address"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <SelectField
          label="Role"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option>All roles</option>
          {adminRoles.map((role) => (
            <option key={role}>{role}</option>
          ))}
        </SelectField>
        <SelectField
          label="Access"
          value={accessFilter}
          onChange={(e) => setAccessFilter(e.target.value)}
        >
          <option>All access levels</option>
          <option>Clinical</option>
          <option>Operations</option>
          <option>Administration</option>
          <option>Own information</option>
          <option>No access</option>
        </SelectField>
        <SelectField
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>Active & disabled</option>
          <option>Active only</option>
          <option>Disabled only</option>
        </SelectField>
      </div>
      <div className="content-grid wide-left">
        <Card>
          <SectionHead
            title="Practice users"
            action={`${filteredUsers.length} of ${allUsers.length} users`}
          />
          <Notice tone="info">
            Administrator access is limited to account administration. Clinical
            records are not available here.
          </Notice>
          <div className="user-table">
            <div className="table-head">
              <span>User / email</span>
              <span>Role</span>
              <span>Access</span>
              <span>Status</span>
            </div>
            {filteredUsers.map((user) => (
              <button
                type="button"
                key={user.id}
                onClick={() => selectUser(user)}
                className={!isCreating && selectedId === user.id ? "selected" : ""}
              >
                <span>
                  <strong>{user.name}</strong>
                  <small>{user.email}</small>
                </span>
                <span>{user.role}</span>
                <span>{user.access}</span>
                <Badge tone={user.status === "Active" ? "green" : "gray"}>
                  {user.status}
                </Badge>
              </button>
            ))}
          </div>
          {filteredUsers.length === 0 && (
            <Notice tone="warning">No users match your current filters.</Notice>
          )}
          <p className="user-counts">
            <span className="green-text">{activeCount} active</span> ·{" "}
            {disabledCount} disabled
          </p>
        </Card>
        <Card className="user-editor">
          <SectionHead
            title={isCreating ? "Create user" : `Edit user · ${draft.name}`}
            action={isDirty ? "Unsaved changes" : "Up to date"}
          />
          {notice && <Notice tone={notice.tone}>{notice.message}</Notice>}
          <Badge tone={draft.status === "Active" ? "green" : "gray"}>
            {draft.status}
          </Badge>
          <Field
            label="Full name *"
            value={draft.name}
            placeholder="e.g. Ahmed Ali"
            onChange={(event) => {
              setDraft((current) => ({ ...current, name: event.target.value }))
              setNotice(null)
            }}
          />
          <Field
            label="Email address *"
            type="email"
            value={draft.email}
            placeholder="name@practice.example"
            onChange={(event) => {
              setDraft((current) => ({ ...current, email: event.target.value }))
              setNotice(null)
            }}
          />
          <div className="form-grid">
            <SelectField
              label="Role *"
              value={draft.role}
              onChange={(event) => {
                const role = event.target.value as AdminUser["role"]
                setDraft((current) => ({
                  ...current,
                  role,
                  access: roleAccess[role],
                }))
                setNotice(null)
              }}
            >
              {adminRoles.map((role) => (
                <option key={role}>{role}</option>
              ))}
            </SelectField>
            <SelectField
              label="Account status *"
              value={draft.status}
              onChange={(event) => {
                setDraft((current) => ({
                  ...current,
                  status: event.target.value as AdminUser["status"],
                }))
                setNotice(null)
              }}
            >
              <option>Active</option>
              <option>Disabled</option>
            </SelectField>
          </div>
          <Info
            label="Access granted by role"
            value={`${draft.role} permissions · ${roleAccess[draft.role] ?? "No access"}`}
          />
          <Info label="Last active" value={draft.lastActive} />
          <label className="check">
            <input
              type="checkbox"
              checked={draft.secureSignIn}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  secureSignIn: event.target.checked,
                }))
              }
            />{" "}
            Require secure sign-in verification
          </label>
          <Notice tone="warning">
            Disabling this account prevents sign-in. It does not delete past
            activity.
          </Notice>
          {!isCreating && (
            <button
              type="button"
              className="text-link"
              onClick={sendPasswordReset}
              disabled={draft.status === "Disabled"}
            >
              Send password reset email →
            </button>
          )}
          <div className="form-actions">
            <Button variant="ghost" onClick={cancelChanges} disabled={!isDirty}>
              Cancel
            </Button>
            <Button onClick={saveUser} disabled={!isDirty}>
              <Check size={16} /> {isCreating ? "Create user" : "Save user"}
            </Button>
          </div>
        </Card>
      </div>
    </>
  )
}

export function MyAppointments() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "requests">(
    "upcoming",
  )
  
  if (!portalPatient) {
    return <NoPatientSelected purpose="my appointments" />
  }
  return (
    <>
      <PageTitle
        title="My appointments"
        subtitle={`Your appointments · Thursday, 08 October 2026`}
        action={
          <Link to="/my/request-appointment">
            <Button>
              <CalendarDays size={16} /> Request appointment
            </Button>
          </Link>
        }
      />
      <PatientHeader
        patient={portalPatient}
        allergy={false}
        portal
        active="My appointments"
      />
      <div className="tabs sub-tabs">
        <button
          type="button"
          className={activeTab === "upcoming" ? "active" : ""}
          onClick={() => setActiveTab("upcoming")}
        >
          Upcoming (2)
        </button>
        <button
          type="button"
          className={activeTab === "past" ? "active" : ""}
          onClick={() => setActiveTab("past")}
        >
          Past visits (1)
        </button>
        <button
          type="button"
          className={activeTab === "requests" ? "active" : ""}
          onClick={() => setActiveTab("requests")}
        >
          Requests (0)
        </button>
      </div>
      <div className="content-grid wide-left">
        <Card>
          {activeTab === "upcoming" && (
            <>
              <SectionHead title="Upcoming appointments" />
              <PortalAppointment
                date="Today · Thu 08 Oct 2026"
                time="09:30–10:15"
                name="Composite restoration · tooth 16"
                onView={() => navigate("/my/appointments")}
              />
              <PortalAppointment
                date="Thu 22 Oct 2026"
                time="09:30–10:00"
                name="Endodontic review · tooth 36"
                onView={() => navigate("/my/appointments")}
              />
            </>
          )}
          {activeTab === "past" && (
            <>
              <SectionHead title="Past visits" />
              <PortalAppointment
                date="24 Sep 2026 · Dr Mohamed Tareq"
                time=""
                name="Dental examination & treatment planning"
                past
                onView={() => navigate("/my/treatment-plan")}
              />
            </>
          )}
          {activeTab === "requests" && (
            <Notice tone="info">
              You have no pending appointment requests.
            </Notice>
          )}
        </Card>
        <Card>
          <SectionHead title="Today's appointment" />
          <Badge tone="green">Confirmed booking</Badge>
          <Info label="Appointment" value="Thu 08 Oct · 09:30–10:15" />
          <Info
            label="Treatment"
            value="Composite restoration · upper right molar (16)"
          />
          <Info
            label="Clinician / location"
            value="Dr Mohamed Tareq · Surgery 1"
          />
          <Notice tone="info">
            Please arrive 10 minutes early and bring your inhaler. Tell the team
            about any changes to your health.
          </Notice>
          <h3>Need to change your visit?</h3>
          <p className="body-copy">
            Contact reception to reschedule or cancel a confirmed appointment.
          </p>
          <Button variant="secondary" className="wide">
            Contact reception
          </Button>
        </Card>
      </div>
    </>
  )
}
function PortalAppointment({
  date,
  time,
  name,
  past = false,
  onView,
}: {
  date: string
  time: string
  name: string
  past?: boolean
  onView: () => void
}) {
  return (
    <div className="portal-appt">
      <div>
        <small>{date}</small>
        <strong>{time}</strong>
        <b>{name}</b>
        <span>
          {past ? "Appointment completed" : "Dr Mohamed Tareq · Surgery 1"}
        </span>
        <button type="button" className="text-link" onClick={onView}>
          {past ? "View my treatment plan" : "View appointment details"} →
        </button>
      </div>
      <Badge tone={past ? "gray" : "green"}>
        {past ? "Completed" : "Confirmed"}
      </Badge>
    </div>
  )
}

export function RequestAppointment() {
  const [submitted, setSubmitted] = useState(false)
  const [selectedTime, setSelectedTime] = useState("09:00")
  const navigate = useNavigate()
  if (!portalPatient) {
    return <NoPatientSelected purpose="request appointment" />
  }
  return (
    <>
      <PageTitle
        title="Request appointment"
        subtitle="My appointments / New request · Reception will confirm your booking"
        action={<Badge tone="amber">Request · not a booking</Badge>}
      />
      <PatientHeader
        patient={portalPatient}
        allergy={false}
        portal
        active="Request appointment"
      />
      <div className="content-grid wide-left">
        <Card>
          <SectionHead title="Your appointment preferences" />
          {submitted ? (
            <Notice tone="success">
              Request submitted. Reception will contact you to confirm a time.
            </Notice>
          ) : (
            <Notice tone="warning">
              Sending a request does not reserve a time. Wait for confirmation
              before attending.
            </Notice>
          )}
          <SelectField label="Reason for visit *">
            <option>
              Scale & oral hygiene + restoration polish · TP-2026-084
            </option>
          </SelectField>
          <div className="form-grid">
            <SelectField label="Preferred clinician">
              <option>Dr Mohamed Tareq · Dentist</option>
            </SelectField>
            <SelectField label="Preferred date *">
              <option>Thursday 15 Oct 2026</option>
            </SelectField>
            <SelectField label="Preferred time *">
              <option>09:00 · Morning</option>
            </SelectField>
            <SelectField label="Alternative preference">
              <option>Any morning · 15–16 Oct</option>
            </SelectField>
          </div>
          <label className="field">
            <span>Indicative times · not reserved</span>
            <div className="time-options">
              {[
                ["09:00", "selected"],
                ["10:30", ""],
                ["11:15", ""],
              ].map(([slot]) => (
                <button
                  key={slot}
                  type="button"
                  className={selectedTime === slot ? "active" : ""}
                  onClick={() => setSelectedTime(slot)}
                >
                  {selectedTime === slot ? `${slot} selected` : slot}
                </button>
              ))}
              <button disabled>14:00 unavailable</button>
            </div>
          </label>
          <label className="check">
            <input type="checkbox" defaultChecked /> I can see another suitable
            clinician if my preference is unavailable
          </label>
          <label className="field">
            <span>Anything we should know?</span>
            <textarea defaultValue="I would prefer a morning visit for the planned hygiene and polish. Please email to confirm." />
          </label>
          <label className="check">
            <input type="checkbox" defaultChecked /> I understand this is a
            request, not a confirmed appointment *
          </label>
          <div className="form-actions">
            <Button
              variant="ghost"
              onClick={() => navigate("/my/appointments")}
            >
              Cancel
            </Button>
            <Button onClick={() => setSubmitted(true)}>
              <Check size={16} /> Submit request
            </Button>
          </div>
        </Card>
        <Card>
          <SectionHead title="Request summary" />
          <Info
            label="Requested for"
            value={`${portalPatient.name} · ${portalPatient.id}`}
          />
          <Info label="Reason" value="Planned hygiene and restoration polish" />
          <Info
            label="First preference"
            value={`15 Oct 2026 · ${selectedTime} BST`}
          />
          <Info label="Preferred clinician" value="Dr Mohamed Tareq" />
          <Info
            label="Location"
            value="Room assigned on confirmation"
          />
          <Badge tone={submitted ? "green" : "amber"}>
            {submitted ? "Submitted" : "Not submitted yet"}
          </Badge>
          <h3>What happens next?</h3>
          <ol className="steps">
            <li>Reception reviews your request and preferences.</li>
            <li>
              The team checks the clinician, room and required visit length.
            </li>
            <li>A confirmed time is sent to {portalPatient.email}.</li>
          </ol>
          <Notice tone="info">
            For urgent pain, swelling or an emergency, contact the practice
            directly rather than waiting for a request.
          </Notice>
        </Card>
      </div>
    </>
  )
}

export function MyTreatmentPlan() {
  if (!portalPatient) {
    return <NoPatientSelected purpose="my treatment plan" />
  }
  function downloadPlan() {
    downloadTextFile(
      "my-treatment-plan-TP-2026-084.txt",
      [
        "My treatment plan: TP-2026-084",
        "Composite restoration tooth 16 - £180.00",
        "Restoration polish tooth 26 - £40.00",
        "Scale and oral hygiene instruction - £90.00",
        "Endodontic review tooth 36 - £60.00",
        "Total estimate: £370.00",
      ].join("\n"),
    )
  }

  return (
    <>
      <PageTitle
        title="My treatment plan"
        subtitle="My care / Plan TP-2026-084 · Created 24 Sep 2026"
        action={
          <Button variant="secondary" onClick={downloadPlan}>
            <Download size={16} /> Download my plan
          </Button>
        }
      />
      <PatientHeader
        patient={portalPatient}
        allergy={false}
        portal
        active="My treatment plan"
      />
      <div className="content-grid wide-left">
        <Card>
          <SectionHead title="Caries management & preventive care" />
          <div className="status-line">
            <Badge tone="green">Patient accepted</Badge>
            <Badge tone="green">Consent recorded · 24 Sep 2026</Badge>
            <Badge tone="blue">2 scheduled · 2 planned</Badge>
          </div>
          <p className="body-copy">
            Your plan treats decay in an upper right molar and inflammation of
            your gums, with maintenance and a review of an existing root canal.
          </p>
          <ProcedureTable patient />
          <Notice tone="info">
            Planned means a visit still needs to be booked. Scheduled does not
            mean treatment has been completed.
          </Notice>
        </Card>
        <Card>
          <SectionHead title="Costs & next steps" />
          <Info label="Total estimated cost" value="£370.00" />
          <div className="detail-grid">
            <Info label="Paid to date" value="£0.00" />
            <Info label="Estimated balance" value="£370.00" />
          </div>
          <h3>Next appointment · today</h3>
          <strong>Composite restoration · tooth 16</strong>
          <p>08 Oct 2026 · 09:30–10:15</p>
          <Link to="/my/appointments">
            <Button variant="secondary" className="wide">
              View my appointment
            </Button>
          </Link>
          <hr />
          <h3>Next review · tooth 36</h3>
          <p>22 Oct · 09:30–10:00</p>
          <Link to="/my/request-appointment">
            <Button variant="secondary" className="wide">
              Request planned visit
            </Button>
          </Link>
        </Card>
      </div>
    </>
  )
}

const rolePermissions: Record<AdminUser["role"], string[]> = {
  Dentist: [
    "View and update patient records",
    "Create diagnoses and treatment plans",
    "Manage clinical appointments and imaging",
  ],
  "Dental hygienist": [
    "View assigned patient records",
    "Record periodontal and hygiene care",
    "Manage assigned clinical appointments",
  ],
  Receptionist: [
    "Register patients and update demographics",
    "Manage appointments and billing",
    "No access to clinical notes or diagnoses",
  ],
  "System admin": [
    "Manage users, roles and security settings",
    "Review and export administrative audit events",
    "No access to patient clinical records",
  ],
  Patient: [
    "View their own chart, imaging and clinical notes",
    "View plans and request appointments",
    "No access to another patient or staff workspace",
  ],
}

const roleDescriptions: Record<AdminUser["role"], string> = {
  Dentist: "Full clinical care for patients assigned to the practice.",
  "Dental hygienist": "Preventive and periodontal care within assigned records.",
  Receptionist: "Front-desk operations without clinical decision-making access.",
  "System admin": "Account and security administration without clinical access.",
  Patient: "Read-only access to the person's own care information.",
}

export function AccessRoles() {
  const [selectedRole, setSelectedRole] = useState<AdminUser["role"]>("Dentist")
  const users = loadAdminUsers()

  return (
    <>
      <PageTitle
        title="Access & roles"
        subtitle="Administration / Access · Review role-based permissions"
        action={
          <Link to="/admin/settings">
            <Button variant="secondary">
              <ShieldCheck size={16} /> Security settings
            </Button>
          </Link>
        }
      />
      <div className="admin-summary-grid">
        <Card>
          <small>Defined roles</small>
          <strong>{adminRoles.length}</strong>
          <span>Clinical, operational and portal access</span>
        </Card>
        <Card>
          <small>Active accounts</small>
          <strong>{users.filter((user) => user.status === "Active").length}</strong>
          <span>Across staff and patient access</span>
        </Card>
        <Card>
          <small>Secure sign-in</small>
          <strong>
            {users.filter((user) => user.secureSignIn).length}/{users.length}
          </strong>
          <span>Accounts with verification required</span>
        </Card>
      </div>
      <div className="content-grid wide-left">
        <Card>
          <SectionHead title="Role directory" action="Select a role to inspect" />
          <div className="role-list">
            {adminRoles.map((role) => {
              const count = users.filter((user) => user.role === role).length
              return (
                <button
                  type="button"
                  key={role}
                  className={selectedRole === role ? "selected" : ""}
                  onClick={() => setSelectedRole(role)}
                >
                  <span>
                    <strong>{role}</strong>
                    <small>{roleDescriptions[role]}</small>
                  </span>
                  <span>{count} users</span>
                  <ChevronRight size={16} />
                </button>
              )
            })}
          </div>
        </Card>
        <Card>
          <SectionHead title={selectedRole} action={roleAccess[selectedRole]} />
          <Badge tone={selectedRole === "System admin" ? "amber" : "blue"}>
            {roleAccess[selectedRole]} access
          </Badge>
          <p className="body-copy">{roleDescriptions[selectedRole]}</p>
          <h3>Included permissions</h3>
          <ul className="permission-list">
            {rolePermissions[selectedRole].map((permission) => (
              <li key={permission}>
                <Check size={15} /> {permission}
              </li>
            ))}
          </ul>
          <Notice tone="info">
            Permissions are granted by role. Change an account's role from Manage
            users to update its access consistently.
          </Notice>
          <Link to="/admin/users">
            <Button variant="secondary" className="wide">
              Manage user roles
            </Button>
          </Link>
        </Card>
      </div>
    </>
  )
}

function formatAuditDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

function escapeCsv(value: string) {
  return `"${value.replace(/"/g, '""')}"`
}

export function AuditLog() {
  const [events, setEvents] = useState(loadAuditEvents)
  const [query, setQuery] = useState("")
  const [actionFilter, setActionFilter] = useState("All actions")

  useEffect(() => {
    const refresh = () => setEvents(loadAuditEvents())
    window.addEventListener(ADMIN_DATA_EVENT, refresh)
    return () => window.removeEventListener(ADMIN_DATA_EVENT, refresh)
  }, [])

  const actions = useMemo(
    () => [...new Set(events.map((event) => event.action))].sort(),
    [events],
  )
  const filteredEvents = events.filter((event) => {
    const searchable = `${event.actor} ${event.action} ${event.target} ${event.detail}`
    return (
      (actionFilter === "All actions" || event.action === actionFilter) &&
      searchable.toLowerCase().includes(query.trim().toLowerCase())
    )
  })

  function exportAuditLog() {
    const rows = filteredEvents.map((event) =>
      [event.at, event.actor, event.action, event.target, event.detail]
        .map(escapeCsv)
        .join(","),
    )
    downloadTextFile(
      "dentcare-administration-audit.csv",
      ["Timestamp,Actor,Action,Target,Detail", ...rows].join("\n"),
    )
  }

  return (
    <>
      <PageTitle
        title="Audit log"
        subtitle="Administration / Audit · Account and security activity"
        action={
          <Button variant="secondary" onClick={exportAuditLog}>
            <Download size={16} /> Export visible events
          </Button>
        }
      />
      <div className="audit-filters">
        <Field
          label="Search activity"
          placeholder="Actor, user or event"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <SelectField
          label="Action"
          value={actionFilter}
          onChange={(event) => setActionFilter(event.target.value)}
        >
          <option>All actions</option>
          {actions.map((action) => (
            <option key={action}>{action}</option>
          ))}
        </SelectField>
      </div>
      <Card>
        <SectionHead
          title="Administrative activity"
          action={`${filteredEvents.length} events`}
        />
        <Notice tone="info">
          This log records account and security changes. It does not expose patient
          clinical activity.
        </Notice>
        <div className="audit-list">
          {filteredEvents.map((event) => (
            <article key={event.id}>
              <div className="audit-icon">
                <ShieldCheck size={17} />
              </div>
              <div>
                <strong>{event.action}</strong>
                <span>{event.detail}</span>
                <small>
                  {event.actor} · {formatAuditDate(event.at)}
                </small>
              </div>
              <Badge tone={event.action.includes("disabled") ? "amber" : "blue"}>
                {event.target}
              </Badge>
            </article>
          ))}
        </div>
        {filteredEvents.length === 0 && (
          <Notice tone="warning">No audit events match the current filters.</Notice>
        )}
      </Card>
    </>
  )
}

export function AdministratorSettings() {
  const [savedSettings, setSavedSettings] = useState<AdminSettings>(loadAdminSettings)
  const [draft, setDraft] = useState<AdminSettings>(loadAdminSettings)
  const [notice, setNotice] = useState(false)
  const isDirty = JSON.stringify(draft) !== JSON.stringify(savedSettings)

  function updateSetting<K extends keyof AdminSettings>(
    key: K,
    value: AdminSettings[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }))
    setNotice(false)
  }

  function saveSettings() {
    saveAdminSettings(draft)
    appendAuditEvent({
      actor: "Marwan Morsy",
      action: "Security settings updated",
      target: "Administration workspace",
      detail: `Session timeout ${draft.sessionTimeout}; secure sign-in ${draft.requireSecureSignIn ? "required" : "optional"}.`,
    })
    setSavedSettings({ ...draft })
    setNotice(true)
  }

  function cancelSettings() {
    setDraft({ ...savedSettings })
    setNotice(false)
  }

  return (
    <>
      <PageTitle
        title="Administrator settings"
        subtitle="Administration / Settings · Sign-in, alerts and portal controls"
      />
      <div className="content-grid wide-left admin-settings">
        <Card>
          <SectionHead title="Security policy" action={isDirty ? "Unsaved" : "Saved"} />
          {notice && <Notice tone="success">Administrator settings saved.</Notice>}
          <SelectField
            label="Inactive session timeout"
            value={draft.sessionTimeout}
            onChange={(event) =>
              updateSetting(
                "sessionTimeout",
                event.target.value as AdminSettings["sessionTimeout"],
              )
            }
          >
            <option>15 minutes</option>
            <option>30 minutes</option>
            <option>1 hour</option>
            <option>4 hours</option>
          </SelectField>
          <div className="settings-options">
            <label>
              <input
                type="checkbox"
                checked={draft.requireSecureSignIn}
                onChange={(event) =>
                  updateSetting("requireSecureSignIn", event.target.checked)
                }
              />
              <span>
                <strong>Require secure sign-in for privileged accounts</strong>
                <small>Applies to clinical, operations and administration users.</small>
              </span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={draft.allowPatientPortal}
                onChange={(event) =>
                  updateSetting("allowPatientPortal", event.target.checked)
                }
              />
              <span>
                <strong>Allow patient portal access</strong>
                <small>Patients can view only their own published care information.</small>
              </span>
            </label>
          </div>
          <div className="form-actions">
            <Button variant="ghost" onClick={cancelSettings} disabled={!isDirty}>
              Cancel
            </Button>
            <Button onClick={saveSettings} disabled={!isDirty}>
              <Check size={16} /> Save settings
            </Button>
          </div>
        </Card>
        <Card>
          <SectionHead title="Administrator notifications" />
          <div className="settings-options">
            <label>
              <input
                type="checkbox"
                checked={draft.notifyAccountChanges}
                onChange={(event) =>
                  updateSetting("notifyAccountChanges", event.target.checked)
                }
              />
              <span>
                <strong>Account-change alerts</strong>
                <small>Notify administrators when accounts or roles change.</small>
              </span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={draft.notifyFailedSignIns}
                onChange={(event) =>
                  updateSetting("notifyFailedSignIns", event.target.checked)
                }
              />
              <span>
                <strong>Failed sign-in alerts</strong>
                <small>Surface security events that may require review.</small>
              </span>
            </label>
          </div>
          <Notice tone="warning">
            This demo stores settings in this browser only. No real accounts or
            messages are created.
          </Notice>
          <Link to="/admin/audit">
            <Button variant="secondary" className="wide">
              Review security activity
            </Button>
          </Link>
        </Card>
      </div>
    </>
  )
}

type Prescription = {
  id: string
  patientName: string
  medication: string
  dosage: string
  frequency: string
  duration: string
  notes: string
  clinician: string
  date: string
}

const PRESCRIPTIONS_KEY = "dentcare-prescriptions"

function loadPrescriptions(): Prescription[] {
  try {
    return JSON.parse(localStorage.getItem(PRESCRIPTIONS_KEY) ?? "[]")
  } catch {
    return []
  }
}

export function Prescriptions() {
  const navigate = useNavigate()
  const [items, setItems] = useState<Prescription[]>(loadPrescriptions)
  const [form, setForm] = useState({
    patientName: "",
    medication: "",
    dosage: "",
    frequency: "Once daily",
    duration: "7 days",
    notes: "",
    clinician: "Dr Mohamed Tareq",
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let cancelled = false
    supabase
      .from("prescriptions")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }: { data: any }) => {
        if (cancelled || !Array.isArray(data)) return
        const mapped: Prescription[] = data.map((row: any) => ({
          id: row.id,
          patientName: row.patient_name,
          medication: row.medication,
          dosage: row.dosage,
          frequency: row.frequency,
          duration: row.duration,
          notes: row.notes,
          clinician: row.clinician,
          date: row.date,
        }))
        setItems(mapped)
      })
    return () => {
      cancelled = true
    }
  }, [])

  function setField(key: keyof typeof form) {
    return (value: string) => setForm((prev) => ({ ...prev, [key]: value }))
  }

  function issue() {
    if (!form.patientName.trim() || !form.medication.trim() || !form.dosage.trim()) {
      return
    }
    const next: Prescription = {
      id: `RX-${Date.now()}`,
      patientName: form.patientName.trim(),
      medication: form.medication.trim(),
      dosage: form.dosage.trim(),
      frequency: form.frequency,
      duration: form.duration,
      notes: form.notes.trim(),
      clinician: form.clinician,
      date: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    }
    const updated = [next, ...items]
    setItems(updated)
    localStorage.setItem(PRESCRIPTIONS_KEY, JSON.stringify(updated))
    if (isSupabaseConfigured) {
      supabase
        .from("prescriptions")
        .insert({
          id: next.id,
          patient_name: next.patientName,
          medication: next.medication,
          dosage: next.dosage,
          frequency: next.frequency,
          duration: next.duration,
          notes: next.notes,
          clinician: next.clinician,
          date: next.date,
        })
        .then(() => undefined)
        .catch(() => undefined)
    }
    setForm({
      patientName: "",
      medication: "",
      dosage: "",
      frequency: "Once daily",
      duration: "7 days",
      notes: "",
      clinician: form.clinician,
    })
    setSaved(true)
  }

  function remove(id: string) {
    const updated = items.filter((item) => item.id !== id)
    setItems(updated)
    localStorage.setItem(PRESCRIPTIONS_KEY, JSON.stringify(updated))
    if (isSupabaseConfigured) {
      supabase.from("prescriptions").delete().eq("id", id).then(() => undefined).catch(() => undefined)
    }
  }

  function download(item: Prescription) {
    downloadTextFile(
      `${item.id}.txt`,
      [
        "DentCare · Prescription",
        `Reference: ${item.id}`,
        `Date: ${item.date}`,
        `Patient: ${item.patientName}`,
        `Clinician: ${item.clinician}`,
        "",
        `Medication: ${item.medication}`,
        `Dosage: ${item.dosage}`,
        `Frequency: ${item.frequency}`,
        `Duration: ${item.duration}`,
        "",
        `Notes: ${item.notes || "None"}`,
      ].join("\n"),
    )
  }

  return (
    <>
      <PageTitle
        title="Prescriptions"
        subtitle="Prescriptions / Issue and review medication"
        action={
          <Button variant="secondary" onClick={() => navigate("/patients")}>
            <Users size={16} /> Patients
          </Button>
        }
      />
      {saved && (
        <Notice tone="success">Prescription issued and saved.</Notice>
      )}
      <div className="content-grid wide-left">
        <Card>
          <SectionHead title="Issue prescription" />
          <div className="form-grid">
            <Field
              label="Patient name *"
              value={form.patientName}
              onChange={(e) => setField("patientName")(e.target.value)}
              placeholder="e.g. Ahmed Ali"
            />
            <Field
              label="Medication *"
              value={form.medication}
              onChange={(e) => setField("medication")(e.target.value)}
              placeholder="e.g. Amoxicillin"
            />
            <Field
              label="Dosage *"
              value={form.dosage}
              onChange={(e) => setField("dosage")(e.target.value)}
              placeholder="e.g. 500 mg"
            />
            <SelectField
              label="Frequency"
              value={form.frequency}
              onChange={(e) => setField("frequency")(e.target.value)}
            >
              <option>Once daily</option>
              <option>Twice daily</option>
              <option>Three times daily</option>
              <option>As required</option>
            </SelectField>
            <SelectField
              label="Duration"
              value={form.duration}
              onChange={(e) => setField("duration")(e.target.value)}
            >
              <option>3 days</option>
              <option>5 days</option>
              <option>7 days</option>
              <option>14 days</option>
              <option>Ongoing</option>
            </SelectField>
            <SelectField
              label="Clinician"
              value={form.clinician}
              onChange={(e) => setField("clinician")(e.target.value)}
            >
              <option>Dr Mohamed Tareq</option>
              <option>Dr Mohamed Tareq</option>
            </SelectField>
          </div>
          <label className="field">
            <span>Notes</span>
            <textarea
              value={form.notes}
              onChange={(e) => setField("notes")(e.target.value)}
              placeholder="Special instructions, allergies, etc."
            />
          </label>
          <div className="form-actions">
            <Button
              disabled={!form.patientName.trim() || !form.medication.trim() || !form.dosage.trim()}
              onClick={issue}
            >
              <Check size={16} /> Issue prescription
            </Button>
          </div>
        </Card>
        <Card>
          <SectionHead title="Issued prescriptions" action={`${items.length} total`} />
          {items.length === 0 ? (
            <Notice tone="info">
              No prescriptions issued yet. Use the form to create one.
            </Notice>
          ) : (
            <div className="audit-list">
              {items.map((item) => (
                <article key={item.id}>
                  <div className="audit-icon">
                    <FileText size={17} />
                  </div>
                  <div>
                    <strong>{item.medication} · {item.dosage}</strong>
                    <span>
                      {item.patientName} · {item.frequency} · {item.duration}
                    </span>
                    <small>
                      {item.clinician} · {item.date}
                    </small>
                    {item.notes && (
                      <small className="body-copy">{item.notes}</small>
                    )}
                  </div>
                  <div className="form-actions" style={{ marginTop: 0 }}>
                    <Button variant="secondary" onClick={() => download(item)}>
                      <Download size={16} /> Download
                    </Button>
                    <Button variant="ghost" onClick={() => remove(item.id)}>
                      Remove
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  )
}

export function Landing() {
  const navigate = useNavigate()
  const testimonials = [
    { name: "Sarah M.", text: "Booking and records in one place — finally a clinic that feels modern.", rating: "★★★★★" },
    { name: "Omar K.", text: "The dental chart explanations made my treatment easy to understand.", rating: "★★★★★" },
    { name: "Lina R.", text: "Friendly team and a seamless digital experience from check-in to billing.", rating: "★★★★★" },
  ]
  return (
    <>
      <style>{`
        @keyframes lv2FadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .landing-v2 .lv2-hero { animation: lv2FadeUp .7s ease both; }
        .landing-v2 .lv2-section { animation: lv2FadeUp .7s ease both; animation-delay: .08s; }
        .landing-v2 .lv2-section:nth-of-type(2) { animation-delay: .16s; }
        .landing-v2 .lv2-section:nth-of-type(3) { animation-delay: .24s; }
        .landing-v2 .lv2-section:nth-of-type(4) { animation-delay: .32s; }
        .landing-v2 .lv2-section:nth-of-type(5) { animation-delay: .40s; }
        .lv2-floating {
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          background: rgba(255,255,255,.82);
        }
        .lv2-hero-stats div + div {
          border-left: 1px solid rgba(255,255,255,.22);
          padding-left: 32px;
        }
        .lv2-testimonials {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 1000px; margin: 0 auto;
        }
        .lv2-testimonial {
          padding: 24px 22px; border-radius: var(--r-lg); background: var(--panel);
          border: 1px solid var(--border-soft); box-shadow: var(--sh-1);
          display: flex; flex-direction: column; gap: 10px;
        }
        .lv2-testimonial .lv2-stars { color: #f59e0b; font-size: 13px; letter-spacing: 2px; }
        .lv2-testimonial p { margin: 0; font-size: 14px; color: var(--ink-2); line-height: 1.6; font-style: italic; }
        .lv2-testimonial strong { font-size: 13px; color: var(--ink); }
        .lv2-trust-strip {
          display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; align-items: center;
          margin-top: 28px;
        }
        .lv2-trust-chip {
          padding: 8px 14px; border-radius: 999px; background: var(--surface);
          border: 1px solid var(--border-soft); font-size: 12.5px; color: var(--ink-2); font-weight: 600;
        }
        .lv2-contact {
          position: relative; overflow: hidden;
          background-image:
            radial-gradient(circle at 15% 25%, rgba(255,255,255,.08) 1px, transparent 1px),
            radial-gradient(circle at 85% 75%, rgba(255,255,255,.06) 1px, transparent 1px),
            linear-gradient(135deg, #0f172a, #1e3a5f);
          background-size: 26px 26px, 34px 34px, auto;
        }
        @media (max-width: 900px) {
          .lv2-testimonials { grid-template-columns: 1fr; }
        }
      `}</style>
      <div className="landing-v2">
        {/* Top bar */}
        <header className="lv2-nav">
          <div className="lv2-brand">
            <LoginToothIcon />
            <span>DentCare</span>
          </div>
          <nav className="lv2-nav-links">
            <a href="#services">Services</a>
            <a href="#features">Features</a>
            <a href="#doctors">Doctors</a>
            <a href="#contact">Contact</a>
          </nav>
          <div className="lv2-nav-actions">
            <Button variant="ghost" onClick={() => navigate("/login")}>
              Sign in
            </Button>
            <Button onClick={() => navigate("/login")}>
              Book appointment
            </Button>
          </div>
        </header>

        {/* Hero */}
        <section className="lv2-hero">
          <div className="lv2-hero-bg" />
          <div className="lv2-hero-inner">
            <div className="lv2-hero-text">
              <span className="lv2-pill">Trusted dental care</span>
              <h1>
                Your smile,
                <br />
                <span className="lv2-gradient">our priority.</span>
              </h1>
              <p>
                Book appointments, manage your dental records and connect with
                your dentist — all in one modern, secure platform.
              </p>
              <div className="lv2-hero-actions">
                <Button onClick={() => navigate("/login")}>
                  Book now <ArrowRight size={17} />
                </Button>
                <Button variant="secondary" onClick={() => navigate("/login")}>
                  Explore services
                </Button>
              </div>
              <div className="lv2-hero-stats">
                <div><strong>12k+</strong><span>Happy patients</span></div>
                <div><strong>15+</strong><span>Years experience</span></div>
                <div><strong>4.9★</strong><span>Patient rating</span></div>
              </div>
            </div>
            <div className="lv2-hero-visual">
              <div className="lv2-hero-card">
                <HeroTooth />
              </div>
              <div className="lv2-floating lv2-f1">
                <Check size={14} /> Appointment confirmed
              </div>
              <div className="lv2-floating lv2-f2">
                <ShieldCheck size={14} /> Secure records
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="lv2-section">
          <div className="lv2-section-head">
            <span className="lv2-eyebrow">What we offer</span>
            <h2>Comprehensive dental services</h2>
            <p>From routine check-ups to advanced procedures, all in one place.</p>
          </div>
          <div className="lv2-services">
            {[
              { icon: Stethoscope, title: "General dentistry", text: "Check-ups, cleanings and preventive care." },
              { icon: ClipboardCheck, title: "Restorative care", text: "Fillings, crowns and bridges." },
              { icon: ImageIcon, title: "Digital imaging", text: "Modern x-rays and diagnostics." },
              { icon: CalendarDays, title: "Orthodontics", text: "Braces and aligners for all ages." },
              { icon: Users, title: "Pediatric dentistry", text: "Gentle care for children." },
              { icon: CircleDollarSign, title: "Cosmetic dentistry", text: "Whitening and smile design." },
            ].map((s) => (
              <div key={s.title} className="lv2-service-card">
                <span className="lv2-service-icon">
                  <s.icon size={22} />
                </span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials / Trust */}
        <section id="testimonials" className="lv2-section">
          <div className="lv2-section-head">
            <span className="lv2-eyebrow">Trusted by patients</span>
            <h2>What our patients say</h2>
            <p>Real stories from people who chose DentCare for their smile.</p>
          </div>
          <div className="lv2-testimonials">
            {testimonials.map((t) => (
              <div key={t.name} className="lv2-testimonial">
                <span className="lv2-stars">{t.rating}</span>
                <p>“{t.text}”</p>
                <strong>— {t.name}</strong>
              </div>
            ))}
          </div>
          <div className="lv2-trust-strip">
            <span className="lv2-trust-chip">HIPAA-aligned</span>
            <span className="lv2-trust-chip">Role-based access</span>
            <span className="lv2-trust-chip">Encrypted records</span>
            <span className="lv2-trust-chip">24/7 portal</span>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="lv2-section lv2-features-section">
          <div className="lv2-section-head">
            <span className="lv2-eyebrow">Platform features</span>
            <h2>Built for modern practices</h2>
          </div>
          <div className="lv2-features">
            {[
              { icon: Users, title: "Patient records", text: "Complete digital files with history and allergies." },
              { icon: Stethoscope, title: "Dental charting", text: "Interactive odontogram per patient." },
              { icon: ClipboardCheck, title: "Treatment plans", text: "Build, price and track plans." },
              { icon: CalendarDays, title: "Appointments", text: "Book, check in, manage schedule." },
              { icon: FileText, title: "Prescriptions", text: "Issue and download prescriptions." },
              { icon: ShieldCheck, title: "Secure access", text: "Role-based access for the whole team." },
            ].map((f) => (
              <div key={f.title} className="lv2-feature">
                <f.icon size={18} />
                <div>
                  <strong>{f.title}</strong>
                  <span>{f.text}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Doctors */}
        <section id="doctors" className="lv2-section">
          <div className="lv2-section-head">
            <span className="lv2-eyebrow">Our team</span>
            <h2>Meet our doctors</h2>
          </div>
          <div className="lv2-doctors">
            {[
              { name: "Dr. Mohamed Tareq", role: "General Dentist", initials: "MT" },
              { name: "Dr. Mohamed Tareq", role: "Orthodontist", initials: "MT" },
            ].map((d, i) => (
              <div key={i} className="lv2-doctor">
                <div className="lv2-doctor-avatar">{d.initials}</div>
                <strong>{d.name}</strong>
                <span>{d.role}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="lv2-section lv2-contact">
          <div className="lv2-contact-inner">
            <div>
              <span className="lv2-eyebrow">Get in touch</span>
              <h2>Ready to book your visit?</h2>
              <p>Sign in to access the patient portal or contact reception.</p>
            </div>
            <Button onClick={() => navigate("/login")}>
              Sign in <ArrowRight size={17} />
            </Button>
          </div>
        </section>

        <footer className="lv2-footer">
          <span>DentCare © 2026</span>
          <span>Privacy · Terms · Contact</span>
        </footer>
      </div>
    </>
  )
}

export function SimplePage({
  title,
  backTo = "/dashboard",
}: {
  title: string
  backTo?: string
}) {
  return (
    <>
      <PageTitle title={title} subtitle="DentCare workspace" />
      <Card className="empty-state">
        <ShieldCheck size={36} />
        <h2>{title}</h2>
        <p>
          This secure workspace is ready for the next workflow. All displayed
          information is fictional and for educational use only.
        </p>
        <Link to={backTo}>
          <Button>Return to workspace</Button>
        </Link>
      </Card>
    </>
  )
}
