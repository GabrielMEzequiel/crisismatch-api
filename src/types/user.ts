export type UserType = "Voluntário" | "Instituição"

export interface User {
    id: string
    name: string
    email: string
    type: UserType
    skills: string[]
    interests: string[]
    availability: string
    organization_type: string | null
    description: string | null
}