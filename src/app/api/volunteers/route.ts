import { createClient } from "@/utils/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { CreateVolunteerInput, UpdateVolunteerInput } from "@/types"
import { cookies } from "next/headers"

const TABLE = "volunteers"

// GET /api/volunteers?email=...  or  /api/volunteers?id=...
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

// POST /api/volunteers
export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  let body: CreateVolunteerInput
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const { name, email, skills, interests, availability } = body

  if (!name || !email || !skills || !interests || !availability) {
    return NextResponse.json(
      { error: "Missing required fields: name, email, skills, interests, availability." },
      { status: 422 }
    )
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert({ name, email, skills, interests, availability })
    .select()
    .single()

  if (error) {
    const status = error.code === "23505" ? 409 : 500
    return NextResponse.json({ error: error.message }, { status })
  }

  return NextResponse.json(data, { status: 201 })
}

// PATCH /api/volunteers?id=...
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

  let body: Partial<UpdateVolunteerInput>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const allowedFields = ["name", "email", "skills", "interests", "availability"]
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