import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import "./styles/odontogram.scoped.css"
import { refreshPatients } from "./app/patients"

await refreshPatients()

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)