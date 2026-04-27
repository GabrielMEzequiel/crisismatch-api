import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { CreateActionInput } from "@/types"

// POST /api/actions — createAction
export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const supabase = await createClient(cookieStore)

        const body: CreateActionInput = await request.json()

        const {
            title,
            description,
            organization_id,
            location,
            date,
            required_skills,
            interests,
            vacancies,
        } = body

        if (
            !title ||
            !description ||
            !organization_id ||
            !location ||
            !date ||
            vacancies === undefined
        ) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from("actions")
            .insert({
                title,
                description,
                organization_id,
                location,
                date,
                required_skills: required_skills ?? [],
                interests: interests ?? [],
                vacancies,
            })
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data, { status: 201 })
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// GET /api/actions — getAvailableActions
export async function GET() {
    try {
        const cookieStore = await cookies()
        const supabase = await createClient(cookieStore)

        const now = new Date().toISOString()

        const { data, error } = await supabase
            .from("actions")
            .select("*")
            .gt("vacancies", 0)        // Tem que ter vagas
            .gte("date", now)          // A data tem que ser maior ou igual a agora
            .order("date", { ascending: true }) // Ordena pelas mais próximas

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data, { status: 200 })
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}