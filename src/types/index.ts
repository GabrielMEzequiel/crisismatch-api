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
  
  export type CreateVolunteerInput = Omit<Volunteer, "id" | "created_at">
  export type CreateOrganizationInput = Omit<Organization, "id" | "created_at">

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