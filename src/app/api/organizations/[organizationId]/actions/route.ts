import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

type RouteParams = { params: { organizationId: string } }

// GET /api/organizations/[organizationId]/actions — getActionsByOrganization
export async function GET(_request: NextRequest, { params }: RouteParams) {
    try {
        const cookieStore = await cookies()
        const supabase = await createClient(cookieStore)

        const { organizationId } = params

        if (!organizationId) {
            return NextResponse.json(
                { error: "organizationId is required" },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from("actions")
            .select("*")
            .eq("organization_id", organizationId)
            .order("created_at", { ascending: false })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data, { status: 200 })
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}