import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

type UserType = "Voluntário" | "Instituição"

interface User {
    id: string
    name: string
    email: string
    type: UserType
}

// 🔍 Buscar usuário por email
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
        .select("id, nome, email, type")
        .eq("email", email)
        .single()

    if (error) {
        return Response.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    return Response.json(data)
}

// ➕ Criar usuário
export async function POST(req: Request) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const body: Partial<User> = await req.json()

    const { name, email, type } = body

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

    const { data, error } = await supabase
        .from("users")
        .insert([{ name, email, type }])
        .select("id, name, email, type")
        .single()

    if (error) {
        return Response.json({ error: error.message }, { status: 400 })
    }

    return Response.json(data, { status: 201 })
}