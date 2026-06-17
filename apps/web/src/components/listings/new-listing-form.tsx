'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { api } from '@/lib/api'
import type { Listing } from '@/lib/types'

type FormState = {
  address: string
  unit: string
  city: string
  state: string
  zip: string
  price: string
  beds: string
  baths: string
  sqft: string
  type: string
  description: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

const PROPERTY_TYPES = [
  'Condo',
  'Co-op',
  'Single Family',
  'Multi-Family',
  'Townhouse',
  'Penthouse',
  'Land',
  'Commercial',
]

const PROPERTY_TYPE_MAP: Record<string, 'residential' | 'commercial' | 'land' | 'rental'> = {
  Commercial: 'commercial',
  Land: 'land',
}

function validate(data: FormState): FormErrors {
  const errors: FormErrors = {}
  if (data.address.length < 5) errors.address = 'Enter a valid address'
  if (data.city.length < 2) errors.city = 'City is required'
  if (data.state.length !== 2) errors.state = 'Use 2-letter state code'
  if (data.zip.length < 5) errors.zip = 'ZIP is required'
  if (!data.price || isNaN(Number(data.price))) errors.price = 'Enter a valid price'
  if (!data.type) errors.type = 'Select a property type'
  return errors
}

export function NewListingForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState<FormState>({
    address: '',
    unit: '',
    city: '',
    state: '',
    zip: '',
    price: '',
    beds: '',
    baths: '',
    sqft: '',
    type: '',
    description: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  function set(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }))
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors = validate(form)
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setIsSubmitting(true)
    try {
      const title = [form.address, form.unit].filter(Boolean).join(' ')
      const listing = await api.post<Listing>('/listings', {
        title,
        description: form.description || undefined,
        property_type: PROPERTY_TYPE_MAP[form.type] ?? 'residential',
        listing_type: 'for_sale',
        stage: 'Lead',
        asking_price: Number(form.price),
        bedrooms: form.beds ? Number(form.beds) : undefined,
        bathrooms: form.baths ? Number(form.baths) : undefined,
        square_feet: form.sqft ? Number(form.sqft) : undefined,
        address: {
          street_1: form.address,
          street_2: form.unit || undefined,
          city: form.city,
          state: form.state.toUpperCase(),
          postal_code: form.zip,
          country: 'US',
        },
      })
      toast.success('Listing created')
      router.push(`/listings/${listing.id}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not create listing'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card className="border-border/60 shadow-sm">
        <CardContent className="pt-5 space-y-4">
          <h3 className="text-sm font-semibold">Property Address</h3>

          <div className="space-y-2">
            <Label htmlFor="address">Street address</Label>
            <Input
              id="address"
              placeholder="142 Riverside Drive"
              value={form.address}
              onChange={set('address')}
            />
            {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Unit / Apt (optional)</Label>
            <Input id="unit" placeholder="12C" value={form.unit} onChange={set('unit')} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="New York"
                value={form.city}
                onChange={set('city')}
              />
              {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                placeholder="NY"
                maxLength={2}
                value={form.state}
                onChange={set('state')}
              />
              {errors.state && <p className="text-xs text-destructive">{errors.state}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zip">ZIP code</Label>
            <Input id="zip" placeholder="10024" value={form.zip} onChange={set('zip')} />
            {errors.zip && <p className="text-xs text-destructive">{errors.zip}</p>}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm">
        <CardContent className="pt-5 space-y-4">
          <h3 className="text-sm font-semibold">Property Details</h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="price">List price ($)</Label>
              <Input
                id="price"
                type="number"
                placeholder="2850000"
                value={form.price}
                onChange={set('price')}
              />
              {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
            </div>
            <div className="space-y-2">
              <Label>Property type</Label>
              <Select
                onValueChange={(v: string | null) =>
                  setForm((prev) => ({ ...prev, type: v ?? '' }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="beds">Bedrooms</Label>
              <Input
                id="beds"
                type="number"
                min="0"
                placeholder="4"
                value={form.beds}
                onChange={set('beds')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baths">Bathrooms</Label>
              <Input
                id="baths"
                type="number"
                min="0"
                step="0.5"
                placeholder="3"
                value={form.baths}
                onChange={set('baths')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sqft">Sq. ft.</Label>
              <Input
                id="sqft"
                type="number"
                placeholder="2400"
                value={form.sqft}
                onChange={set('sqft')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Internal notes (optional)</Label>
            <Textarea
              id="description"
              placeholder="Any initial notes about the property…"
              className="min-h-20 resize-none"
              value={form.description}
              onChange={set('description')}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating…
            </>
          ) : (
            'Create listing'
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
