import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { CreateOrganizationInput } from "@/types"

const TABLE = "organizations"

// GET /api/organizations?email=...
export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)
  const { searchParams } = new URL(request.url)

  const email = searchParams.get("email")

  if (!email) {
    return NextResponse.json(
      { error: "Provide 'email' as a query parameter." },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("email", email)
    .single()

  if (error) {
    const status = error.code === "PGRST116" ? 404 : 500
    return NextResponse.json({ error: error.message }, { status })
  }

  return NextResponse.json(data)
}

// POST /api/organizations
export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  let body: CreateOrganizationInput
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const { name, email, description } = body

  if (!name || !email || !description) {
    return NextResponse.json(
      { error: "Missing required fields: name, email, description." },
      { status: 422 }
    )
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert({ name, email, description })
    .select()
    .single()

  if (error) {
    const status = error.code === "23505" ? 409 : 500
    return NextResponse.json({ error: error.message }, { status })
  }

  return NextResponse.json(data, { status: 201 })
}