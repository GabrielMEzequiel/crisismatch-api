import { User } from "@/types/user"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

// ➕ Criar usuário
export async function POST(req: Request) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const body: Partial<User> = await req.json()

    const { name, email, type, organization_type, description } = body

    if (!name || !email || !type) {
        return Response.json(
            { error: "Campos obrigatórios: name, email, type" },
            { status: 400 }
        )
    }

    if (type !== "Voluntário" && type !== "Instituição") {
        return Response.json(
            { error: "type deve ser 'Voluntário' ou 'Instituição'" },
            { status: 400 }
        )
    }

    if (type === "Instituição" && !organization_type) {
        return Response.json(
            { error: "organization_type é obrigatório para Instituições" },
            { status: 400 }
        )
    }

    const { data, error } = await supabase
        .from("users")
        .insert([{
            name,
            email,
            type,
            skills: [],
            interests: [],
            availability: null,
            organization_type: type === "Instituição" ? organization_type : null,
            description:       type === "Instituição" ? (description ?? null) : null,
        }])
        .select("id, name, email, type, skills, interests, availability, organization_type, description")
        .single()

    if (error) {
        return Response.json({ error: error.message }, { status: 400 })
    }

    return Response.json(data, { status: 201 })
}