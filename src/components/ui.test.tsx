import { render, screen } from "@testing-library/react"

import userEvent from "@testing-library/user-event"

import { describe, expect, it, vi } from "vitest"

import { Button, Field, Notice, PageTitle, SelectField } from "./ui"

describe("UI components", () => {
  it("renders page title and subtitle", () => {
    render(<PageTitle title="Appointments" subtitle="Today" />)

    expect(
      screen.getByRole("heading", { name: "Appointments" }),
    ).toBeInTheDocument()

    expect(screen.getByText("Today")).toBeInTheDocument()
  })

  it("fires button click handlers", async () => {
    const user = userEvent.setup()

    const onClick = vi.fn()

    render(<Button onClick={onClick}>Save</Button>)

    await user.click(screen.getByRole("button", { name: "Save" }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it("supports input changes in field", async () => {
    const user = userEvent.setup()

    render(<Field label="Email" defaultValue="a@example.com" />)

    const input = screen.getByLabelText("Email")

    await user.clear(input)

    await user.type(input, "b@example.com")

    expect(input).toHaveValue("b@example.com")
  })

  it("supports option selection", async () => {
    const user = userEvent.setup()

    render(
      <SelectField label="Role" defaultValue="Dentist">
        <option>Dentist</option>
        <option>Receptionist</option>
      </SelectField>,
    )

    const select = screen.getByLabelText("Role")

    await user.selectOptions(select, "Receptionist")

    expect(select).toHaveValue("Receptionist")
  })

  it("renders notice content", () => {
    render(<Notice tone="success">Saved</Notice>)

    expect(screen.getByText("Saved")).toBeInTheDocument()
  })
})
