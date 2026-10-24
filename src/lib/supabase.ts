// Lightweight Supabase client built on fetch so the app has no extra runtime
// dependency. It talks to the same REST/Auth endpoints the official SDK uses,
// which keeps the bundle small and deployable on Vercel without native modules.
//
// Configure via VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local
// (see .env.example). When these are missing the client is disabled and callers
// fall back to local storage, so the app still runs offline.

export type SupabaseSession = {
  access_token: string
  refresh_token: string
  user: { id: string; email: string }
}

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(
  /\/$/,
  "",
)
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

const SESSION_KEY = "dentcare-supabase-session"

function readSession(): SupabaseSession | null {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) ?? "null") as SupabaseSession | null
  } catch {
    return null
  }
}

function writeSession(session: SupabaseSession | null) {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } else {
    localStorage.removeItem(SESSION_KEY)
  }
}

async function request<T = unknown>(
  path: string,
  init: RequestInit & { prefer?: string } = {},
): Promise<T> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase is not configured")
  }
  const session = readSession()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${session?.access_token ?? SUPABASE_ANON_KEY}`,
  }
  if (init.prefer) {
    headers.Prefer = init.prefer
  }
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers as Record<string, string> | undefined) },
  })
  const text = await response.text()
  const data = text ? JSON.parse(text) : null
  if (!response.ok) {
    const message =
      (data && (data.message || data.error_description || data.error)) ||
      response.statusText
    throw new Error(String(message))
  }
  return data as T
}

// ---------- Auth ----------

export const auth = {
  async signUp(email: string, password: string) {
    const data = await request<SupabaseSession>("/auth/v1/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
    if (data?.access_token) writeSession(data)
    return data
  },
  async signInWithPassword(email: string, password: string) {
    const data = await request<SupabaseSession>(
      "/auth/v1/token?grant_type=password",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
    )
    if (data?.access_token) writeSession(data)
    return data
  },
  async signOut() {
    try {
      await request("/auth/v1/logout", { method: "POST" })
    } catch {
      /* ignore */
    }
    writeSession(null)
  },
  async getUser() {
    const session = readSession()
    if (!session) return null
    try {
      return await request<{ id: string; email: string }>("/auth/v1/user", {
        method: "GET",
      })
    } catch {
      return null
    }
  },
  getSession() {
    return readSession()
  },
}

// ---------- Query builder ----------

type Filter = { column: string; operator: string; value: unknown }

class QueryBuilder<T = any> {
  private table: string
  private mode: "select" | "insert" | "update" | "delete" | "upsert" = "select"
  private columns = "*"
  private payload: unknown = null
  private filters: Filter[] = []
  private orderColumn: string | null = null
  private ascending = true
  private limitCount: number | null = null
  private singleRow = false
  private preferReturn = true

  constructor(table: string) {
    this.table = table
  }

  select(columns = "*") {
    this.mode = "select"
    this.columns = columns
    return this
  }

  insert(rows: unknown) {
    this.mode = "insert"
    this.payload = rows
    return this
  }

  update(patch: unknown) {
    this.mode = "update"
    this.payload = patch
    return this
  }

  delete() {
    this.mode = "delete"
    return this
  }

  upsert(rows: unknown) {
    this.mode = "upsert"
    this.payload = rows
    return this
  }

  eq(column: string, value: unknown) {
    this.filters.push({ column, operator: "eq", value })
    return this
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderColumn = column
    this.ascending = options?.ascending ?? true
    return this
  }

  limit(count: number) {
    this.limitCount = count
    return this
  }

  single() {
    this.singleRow = true
    return this
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled as any, onrejected as any)
  }

  private async execute(): Promise<any> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured")
    }
    const tablePath = `/rest/v1/${encodeURIComponent(this.table)}`

    if (this.mode === "select") {
      const params = new URLSearchParams()
      params.set("select", this.columns)
      for (const filter of this.filters) {
        params.set(filter.column, `${filter.operator}.${String(filter.value)}`)
      }
      if (this.orderColumn) {
        params.set("order", `${this.orderColumn}.${this.ascending ? "asc" : "desc"}`)
      }
      if (this.limitCount !== null) {
        params.set("limit", String(this.limitCount))
      }
      const headers: Record<string, string> = {}
      if (this.singleRow) {
        headers.Accept = "application/vnd.pgrst.object+json"
      }
      const data = await request(`${tablePath}?${params.toString()}`, {
        method: "GET",
        headers,
      })
      return { data, error: null }
    }

    if (this.mode === "insert") {
      const data = await request(tablePath, {
        method: "POST",
        body: JSON.stringify(this.payload),
        prefer: "return=representation",
      })
      return { data, error: null }
    }

    if (this.mode === "upsert") {
      const data = await request(tablePath, {
        method: "POST",
        body: JSON.stringify(this.payload),
        prefer: "return=representation,resolution=merge-duplicates",
      })
      return { data, error: null }
    }

    if (this.mode === "update") {
      const params = new URLSearchParams()
      for (const filter of this.filters) {
        params.set(filter.column, `${filter.operator}.${String(filter.value)}`)
      }
      const query = params.toString() ? `?${params.toString()}` : ""
      const data = await request(`${tablePath}${query}`, {
        method: "PATCH",
        body: JSON.stringify(this.payload),
        prefer: "return=representation",
      })
      return { data, error: null }
    }

    if (this.mode === "delete") {
      const params = new URLSearchParams()
      for (const filter of this.filters) {
        params.set(filter.column, `${filter.operator}.${String(filter.value)}`)
      }
      const query = params.toString() ? `?${params.toString()}` : ""
      await request(`${tablePath}${query}`, { method: "DELETE" })
      return { data: null, error: null }
    }

    return { data: null, error: null }
  }
}

export function from(table: string) {
  return new QueryBuilder(table)
}

export const supabase = { auth, from }
