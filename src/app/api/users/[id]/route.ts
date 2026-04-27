import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

// 👤 GET /api/users/abc-123
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { id } = await params

    const { data, error } = await supabase
        .from("users")
        .select("id, name, email, type, skills, interests, availability, organization_type, description")
        .eq("id", id)
        .single()

    if (error) {
        return Response.json(
            { error: error.message, code: error.code, details: error.details },
            { status: 404 }
        )
    }

    return Response.json(data)
}