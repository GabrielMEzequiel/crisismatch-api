import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { CreateVolunteerInput } from "@/types"

const TABLE = "volunteers"

// GET /api/volunteers?email=...
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
    const status = error.code === "23505" ? 409 : 500 // 23505 = unique violation
    return NextResponse.json({ error: error.message }, { status })
  }

  return NextResponse.json(data, { status: 201 })
}