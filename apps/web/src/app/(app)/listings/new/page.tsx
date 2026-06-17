import type { Metadata } from 'next'
import { ChevronRight } from 'lucide-react'
import { NewListingForm } from '@/components/listings/new-listing-form'

export const metadata: Metadata = { title: 'New Listing' }

export default function NewListingPage() {
  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span>Listings</span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium">New listing</span>
      </nav>

      <div className="space-y-1.5">
        <h2 className="text-2xl font-semibold tracking-tight">Create a listing</h2>
        <p className="text-sm text-muted-foreground">
          Add the property details to get started. You can fill in more later.
        </p>
      </div>

      <NewListingForm />
    </div>
  )
}
