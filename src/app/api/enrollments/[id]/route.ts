import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/enrollments/[id] — getEnrollmentsById
export async function GET(_request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const cookieStore = await cookies()
        const supabase = await createClient(cookieStore)

        const { data, error } = await supabase
            .from("enrollments")
            .select(`
                *,
                action:action_id (*),
                volunteer:volunteer_id (*)
            `)
            .eq("id", id)
            .single()

        if (error) {
            if (error.code === "PGRST116") return NextResponse.json({ error: "Enrollment not found" }, { status: 404 })
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data, { status: 200 })
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// PATCH /api/enrollments/[id] — cancelEnrollment
// Usamos PATCH para apenas alterar o status para 'cancelled'
export async function PATCH(_request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const cookieStore = await cookies()
        const supabase = await createClient(cookieStore)

        const { data, error } = await supabase
            .from("enrollments")
            .update({ status: "cancelled" })
            .eq("id", id)
            .select()
            .single()

        if (error) {
            if (error.code === "PGRST116") return NextResponse.json({ error: "Enrollment not found" }, { status: 404 })
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data, { status: 200 })
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}