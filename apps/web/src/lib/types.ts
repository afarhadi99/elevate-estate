export type UUID = string

export interface UserResponse {
  id: UUID
  email: string
  full_name: string
  is_active: boolean
  is_email_verified: boolean
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface SessionResponse {
  user: UserResponse
  message: string
}

export interface ListingAddress {
  id: UUID
  street_1: string
  street_2: string | null
  city: string
  state: string
  postal_code: string
  country: string
  latitude: string | null
  longitude: string | null
}

export interface Listing {
  id: UUID
  organization_id: UUID
  agent_id: UUID | null
  title: string
  description: string | null
  property_type: 'residential' | 'commercial' | 'land' | 'rental'
  listing_type: 'for_sale' | 'for_rent' | 'sold' | 'off_market'
  stage: string
  asking_price: string | null
  sale_price: string | null
  bedrooms: number | null
  bathrooms: string | null
  square_feet: number | null
  lot_size_sqft: number | null
  year_built: number | null
  mls_number: string | null
  listed_at: string | null
  closed_at: string | null
  created_at: string
  updated_at: string
  address: ListingAddress | null
}

export interface ListingNote {
  id: UUID
  body: string
  author_id: UUID | null
  created_at: string
  updated_at: string
}

export interface ListingStageHistory {
  id: UUID
  from_stage: string | null
  to_stage: string
  changed_by_id: UUID | null
  changed_at: string
}

export interface ListingDetail extends Listing {
  notes: ListingNote[]
  stage_history: ListingStageHistory[]
}

export interface PaginatedListings {
  items: Listing[]
  total: number
  page: number
  page_size: number
  pages: number
}

export interface OrgResponse {
  id: UUID
  name: string
  slug: string
  logo_url: string | null
  website: string | null
  phone: string | null
  address: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface OrgSettingsResponse {
  listing_stages: string[] | null
  currency: string
  locale: string
  extra: Record<string, unknown> | null
}

export interface MemberResponse {
  user_id: UUID
  email: string
  full_name: string
  role: string
  is_active: boolean
  joined_at: string
}

export interface InvitationResponse {
  id: UUID
  email: string
  role: string
  expires_at: string
  accepted_at: string | null
  created_at: string
}

export interface RoleResponse {
  id: UUID
  name: string
  description: string | null
  is_system: boolean
  permissions: string[]
}

export interface PermissionResponse {
  id: UUID
  codename: string
  description: string | null
}

export interface MessageResponse {
  message: string
}
