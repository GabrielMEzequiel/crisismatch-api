import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { CreateEnrollmentInput } from "@/types"

// POST /api/enrollments — createEnrollment
export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const supabase = await createClient(cookieStore)
        const { volunteer_id, action_id }: CreateEnrollmentInput = await request.json()

        if (!volunteer_id || !action_id) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 })
        }

        // 1. Verificar vagas da ação e contagem atual
        const { data: action, error: actionError } = await supabase
            .from("actions")
            .select(`
                vacancies,
                enrollments(count)
            `)
            .eq("id", action_id)
            .eq("enrollments.status", "confirmed")
            .single()

        if (actionError || !action) {
            return NextResponse.json({ error: "Action not found" }, { status: 404 })
        }

        const occupied = action.enrollments?.[0]?.count ?? 0
        if (occupied >= action.vacancies) {
            return NextResponse.json({ error: "No vacancies available" }, { status: 400 })
        }

        // 2. Criar a inscrição
        const { data, error } = await supabase
            .from("enrollments")
            .insert({ volunteer_id, action_id, status: "confirmed" })
            .select()
            .single()

        if (error) {
            if (error.code === "23505") return NextResponse.json({ error: "Already enrolled" }, { status: 409 })
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data, { status: 201 })
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}