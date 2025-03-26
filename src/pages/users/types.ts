export type UserRole = 'admin' | 'business' | 'freelancer'

export type UUID = `${string}-${string}-${string}-${string}-${string}`

export type User = {
  id: UUID
  fullname: string
  email: string
  password: string
  phone: string
  category: string
  date_of_birth: string
  joining_date: string
  update_date: string
  username: string
  role: UserRole
  avatar: string
  projects: UUID[]
  notes: string
  active: boolean
}
