/** Patient register for the whole app. One record is fully populated so the
 *  clinical features have something to show; every other row is genuinely
 *  empty, so the app never claims findings it does not have. */

import { isSupabaseConfigured, supabase } from "../lib/supabase"

export type Allergy = { agent: string; reaction: string }

export type Patient = {
  slug: string
  id: string
  name: string
  fullName: string
  initials: string
  dob: string
  age: number
  gender: string
  clinician: string
  lastVisit: string
  nextAppointment: string
  status: "Active" | "Inactive"
  address: string
  email: string
  phone: string
  nhsNumber: string
  registeredOn: string
  registeredBy: string
  allergies: Allergy[]
  /** True only for the record that carries charting, planning and billing data. */
  populated: boolean
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

/** App "today" is fixed at the demo date so ages never drift against the
 *  appointment strip that was authored around it. */
export const TODAY = new Date(2026, 9, 8)

function parseDob(value: string) {
  const [day, month, year] = value.split(" ")
  return new Date(Number(year), MONTHS.indexOf(month), Number(day))
}

function ageAt(dob: string) {
  const born = parseDob(dob)
  const years = TODAY.getFullYear() - born.getFullYear()
  const hadBirthday =
    TODAY.getMonth() > born.getMonth() ||
    (TODAY.getMonth() === born.getMonth() && TODAY.getDate() >= born.getDate())
  return years - (hadBirthday ? 0 : 1)
}

function initialsOf(name: string) {
  const parts = name.replace(/\bDr\.?\b/gi, "").trim().split(/\s+/)
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function slugOf(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

type Seed = Omit<
  Patient,
  "slug" | "initials" | "age" | "fullName" | "populated" | "registeredOn" | "registeredBy"
> &
  Partial<Pick<Patient, "fullName" | "populated" | "registeredOn" | "registeredBy">>

function build(seed: Seed): Patient {
  return {
    slug: slugOf(seed.name),
    fullName: seed.fullName ?? seed.name,
    initials: initialsOf(seed.name),
    age: ageAt(seed.dob),
    populated: false,
    registeredOn: seed.lastVisit === "Not recorded" ? "08 Oct 2026" : seed.lastVisit,
    registeredBy: "Sophie Reed",
    ...seed,
  }
}

const basePatients: Patient[] = []

const EXTRA_KEY = "dentcare-registered-patients"

function readExtra(): Patient[] {
  try {
    return JSON.parse(localStorage.getItem(EXTRA_KEY) ?? "[]") as Patient[]
  } catch {
    return []
  }
}

/** Register rows plus anything the demo's registration form has added. Kept in
 *  localStorage so a newly registered patient survives a refresh and can be
 *  opened like any other record. */
export const patients: Patient[] = [...basePatients, ...readExtra()]

export function registerPatient(input: {
  name: string
  dob: string
  gender: string
  address: string
  email: string
  phone: string
  clinician: string
}): Patient {
  const id = `DC-${String(1500 + patients.length).padStart(6, "0")}`
  const patient = build({
    id,
    name: input.name,
    dob: input.dob,
    gender: input.gender,
    clinician: input.clinician,
    lastVisit: "Not recorded",
    nextAppointment: "None booked",
    status: "Active",
    address: input.address,
    email: input.email,
    phone: input.phone,
    nhsNumber: "Not recorded",
    allergies: [],
  })
  patients.push(patient)
  localStorage.setItem(
    EXTRA_KEY,
    JSON.stringify(patients.slice(basePatients.length)),
  )
  if (isSupabaseConfigured) {
    supabase
      .from("patients")
      .upsert({
        id: patient.id,
        slug: patient.slug,
        name: patient.name,
        full_name: patient.fullName,
        initials: patient.initials,
        dob: patient.dob,
        age: patient.age,
        gender: patient.gender,
        clinician: patient.clinician,
        last_visit: patient.lastVisit,
        next_appointment: patient.nextAppointment,
        status: patient.status,
        address: patient.address,
        email: patient.email,
        phone: patient.phone,
        nhs_number: patient.nhsNumber,
        registered_on: patient.registeredOn,
        registered_by: patient.registeredBy,
        allergies: patient.allergies,
        populated: patient.populated,
      })
      .then(() => undefined)
      .catch(() => undefined)
  }
  return patient
}

export function findPatient(slug?: string): Patient | undefined {
  if (!slug) {
    return undefined
  }
  return patients.find((p) => p.slug === slug)
}

export function findPatientByName(name: string) {
  return patients.find((p) => p.name === name)
}

/** "1995-05-19" from a date input to the register's display format. */
export function dobFromIso(iso: string) {
  const [year, month, day] = iso.split("-")
  return `${day} ${MONTHS[Number(month) - 1]} ${year}`
}

/** The account the patient portal signs in as. */
export const portalPatient: Patient | null = patients[0] ?? null

/** The record a clinician is currently working in. Session-scoped so top-level
 *  nav (Imaging, Billing) can send the user at their chosen patient instead of
 *  defaulting to whoever happens to be first in the register. */
const SELECTION_KEY = "dentcare-selected-patient"

export function getSelectedSlug() {
  return sessionStorage.getItem(SELECTION_KEY) ?? undefined
}

export function setSelectedSlug(slug: string) {
  sessionStorage.setItem(SELECTION_KEY, slug)
}

export function allergiesText(patient: Patient) {
  return patient.allergies.map((a) => `${a.agent} — ${a.reaction}`).join("   •   ")
}
