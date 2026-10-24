import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react"
import { ChevronDown } from "lucide-react"

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost"
}) {
  return <button className={`btn btn-${variant} ${className}`} {...props} />
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return <section className={`card ${className}`}>{children}</section>
}

export function Field({
  label,
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string
  hint?: string
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...props} />
      {hint && <small>{hint}</small>}
    </label>
  )
}

export function SelectField({
  label,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  children: ReactNode
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <span className="select-wrap">
        <select {...props}>{children}</select>
        <ChevronDown size={14} />
      </span>
    </label>
  )
}

export function Badge({
  children,
  tone = "blue",
}: {
  children: ReactNode
  tone?: "blue" | "green" | "amber" | "red" | "gray"
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

export function Notice({
  children,
  tone = "info",
}: {
  children: ReactNode
  tone?: "info" | "warning" | "danger" | "success"
}) {
  return <div className={`notice notice-${tone}`}>{children}</div>
}

export function PageTitle({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="page-title">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
