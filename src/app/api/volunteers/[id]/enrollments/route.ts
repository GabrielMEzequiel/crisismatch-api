import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/volunteers/[id]/enrollments — getEnrollmentsByVolunteer
export async function GET(_request: NextRequest, { params }: RouteParams) {
    try {
        const { id: volunteerId } = await params
        const cookieStore = await cookies()
        const supabase = await createClient(cookieStore)

        const { data, error } = await supabase
            .from("enrollments")
            .select(`
                *,
                action:action_id (*)
            `)
            .eq("volunteer_id", volunteerId)
            .order("created_at", { ascending: false })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data, { status: 200 })
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}