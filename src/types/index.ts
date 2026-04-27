export type Volunteer = {
    id: string
    name: string
    email: string
    skills: string[]
    interests: string[]
    availability: string
    created_at?: string
}
  
export type Organization = {
    id: string
    name: string
    email: string
    description: string
    created_at?: string
}

export type Action = {
    id: string
    title: string
    description: string
    organization_id: string
    location: string
    date: string
    required_skills: string[]
    interests: string[]
    vacancies: number
    created_at?: string
}
  
export type CreateVolunteerInput = Omit<Volunteer, "id" | "created_at">
export type CreateOrganizationInput = Omit<Organization, "id" | "created_at">
export type CreateActionInput = Omit<Action, "id" | "created_at">

export type UpdateVolunteerInput = {
    name?: string
    email?: string
    skills?: string[]
    interests?: string[]
    availability?: string
}
  
export type UpdateOrganizationInput = {
    name?: string
    email?: string
    description?: string
}

export type UpdateActionInput = {
    title?: string
    description?: string
    location?: string
    date?: string
    required_skills?: string[]
    interests?: string[]
    vacancies?: number
}