import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

// 📧 GET /api/users/email?email=gabriel@example.com
export async function GET(req: Request) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { searchParams } = new URL(req.url)
    const email = searchParams.get("email")

    if (!email) {
        return Response.json({ error: "Email é obrigatório" }, { status: 400 })
    }

    const { data, error } = await supabase
        .from("users")
        .select("id, name, email, type, skills, interests, availability, organization_type, description")
        .eq("email", email)
        .single()

    if (error) {
        return Response.json(
            { error: error.message, code: error.code, details: error.details },
            { status: 404 }
        )
    }

    return Response.json(data)
}