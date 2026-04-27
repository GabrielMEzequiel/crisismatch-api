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

        // Buscamos as ações e fazemos um "count" das inscrições confirmadas
        const { data, error } = await supabase
            .from("actions")
            .select(`
                *,
                enrollments(count)
            `)
            .eq("enrollments.status", "confirmed") // Apenas as preenchidas
            .gte("date", now)
            .order("date", { ascending: true })

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        // Filtramos: vagas totais > vagas ocupadas
        const availableActions = data.filter(action => {
            const confirmedCount = action.enrollments?.[0]?.count ?? 0
            return action.vacancies > confirmedCount
        })

        return NextResponse.json(availableActions, { status: 200 })
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}