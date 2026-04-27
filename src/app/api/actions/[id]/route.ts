import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { UpdateActionInput } from "@/types"

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/actions/[id] — getActionById
export async function GET(_request: NextRequest, { params }: RouteParams) {
    try {
        const cookieStore = await cookies()
        const supabase = await createClient(cookieStore)

        const { id } = await params

        const { data, error } = await supabase
            .from("actions")
            .select("*")
            .eq("id", id)
            .single()

        if (error) {
            if (error.code === "PGRST116") {
                return NextResponse.json({ error: "Action not found" }, { status: 404 })
            }
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data, { status: 200 })
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// PATCH /api/actions/[id] — updateAction
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const cookieStore = await cookies()
        const supabase = await createClient(cookieStore)

        const { id } = await params
        const body: UpdateActionInput = await request.json()

        const allowedFields: (keyof UpdateActionInput)[] = [
            "title",
            "description",
            "location",
            "date",
            "required_skills",
            "interests",
            "vacancies",
        ]

        const updates = Object.fromEntries(
            Object.entries(body).filter(([key]) =>
                allowedFields.includes(key as keyof UpdateActionInput)
            )
        )

        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { error: "No valid fields provided for update" },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from("actions")
            .update(updates)
            .eq("id", id)
            .select()
            .single()

        if (error) {
            if (error.code === "PGRST116") {
                return NextResponse.json({ error: "Action not found" }, { status: 404 })
            }
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data, { status: 200 })
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}