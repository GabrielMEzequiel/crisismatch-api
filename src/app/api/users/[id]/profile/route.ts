import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

// ✏️ PATCH /api/users/abc-123/profile
export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { id } = params
    const body = await req.json()

    const { name, skills, interests, availability, organization_type, description } = body

    const { data: existing, error: fetchError } = await supabase
        .from("users")
        .select("type")
        .eq("id", id)
        .single()

    if (fetchError) {
        return Response.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const updates: Record<string, unknown> = {}
    if (name !== undefined)         updates.name = name
    if (skills !== undefined)       updates.skills = skills
    if (interests !== undefined)    updates.interests = interests
    if (availability !== undefined) updates.availability = availability

    // 🏢 Campos exclusivos de Instituição
    if (existing.type === "Instituição") {
        if (organization_type !== undefined) updates.organization_type = organization_type
        if (description !== undefined)       updates.description = description
    }

    if (Object.keys(updates).length === 0) {
        return Response.json({ error: "Nenhum campo para atualizar" }, { status: 400 })
    }

    const { data, error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", id)
        .select("id, name, email, type, skills, interests, availability, organization_type, description")
        .single()

    if (error) {
        return Response.json({ error: error.message }, { status: 400 })
    }

    return Response.json(data)
}