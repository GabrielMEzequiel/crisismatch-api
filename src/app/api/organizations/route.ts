import { createClient } from "@/utils/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { CreateOrganizationInput, UpdateOrganizationInput } from "@/types"
import { cookies } from "next/headers"

const TABLE = "organizations"

// GET /api/organizations?email=...  or  /api/organizations?id=...
export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)
  const { searchParams } = new URL(request.url)

  const email = searchParams.get("email")
  const id = searchParams.get("id")

  if (!email && !id) {
    return NextResponse.json(
      { error: "Provide either 'email' or 'id' as a query parameter." },
      { status: 400 }
    )
  }

  const query = supabase.from(TABLE).select("*")
  const { data, error } = email
    ? await query.eq("email", email).single()
    : await query.eq("id", id!).single()

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

// PATCH /api/organizations?id=...
export async function PATCH(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)
  const { searchParams } = new URL(request.url)

  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json(
      { error: "Provide 'id' as a query parameter." },
      { status: 400 }
    )
  }

  let body: Partial<UpdateOrganizationInput>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const allowedFields = ["name", "email", "description"]
  const updates = Object.fromEntries(
    Object.entries(body).filter(([key]) => allowedFields.includes(key))
  )

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No valid fields provided for update." },
      { status: 422 }
    )
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    const status = error.code === "PGRST116" ? 404 : error.code === "23505" ? 409 : 500
    return NextResponse.json({ error: error.message }, { status })
  }

  return NextResponse.json(data)
}