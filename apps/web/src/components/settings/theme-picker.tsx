'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const THEMES = [
  { id: 'manhattan', name: 'Manhattan', description: 'Slate · Indigo', accent: '#4f46e5', bg: '#f8faff' },
  { id: 'coastline', name: 'Coastline', description: 'Sand · Cyan', accent: '#0891b2', bg: '#fdf9f0' },
  { id: 'heritage', name: 'Heritage', description: 'Warm gray · Amber', accent: '#d97706', bg: '#faf8f0' },
  { id: 'forest', name: 'Forest Estate', description: 'Olive · Emerald', accent: '#059669', bg: '#f4faf5' },
  { id: 'luxury', name: 'Luxury Night', description: 'Zinc · Violet', accent: '#7c3aed', bg: '#1a1a2e', dark: true },
  { id: 'gallery', name: 'Gallery White', description: 'Pure · Rose', accent: '#e11d48', bg: '#ffffff' },
  { id: 'copper', name: 'Urban Copper', description: 'Stone · Orange', accent: '#ea580c', bg: '#faf7f2' },
  { id: 'modern', name: 'Modern Black', description: 'Gray · Blue', accent: '#2563eb', bg: '#f5f7fb' },
] as const

type ThemeId = (typeof THEMES)[number]['id']

export function ThemePicker() {
  const [selected, setSelected] = useState<ThemeId>('manhattan')

  useEffect(() => {
    const root = document.documentElement
    if (selected === 'manhattan') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', selected)
    }
  }, [selected])

  return (
    <div className="grid grid-cols-4 gap-2">
      {THEMES.map((theme) => (
        <button
          key={theme.id}
          onClick={() => setSelected(theme.id as ThemeId)}
          className={cn(
            'relative flex flex-col gap-1.5 rounded-xl p-3 border-2 transition-all text-left',
            selected === theme.id
              ? 'border-primary shadow-sm'
              : 'border-border/60 hover:border-border hover:shadow-sm'
          )}
        >
          {/* Color swatch */}
          <div
            className="h-10 w-full rounded-lg"
            style={{ backgroundColor: theme.bg }}
          >
            <div
              className="h-3 w-3/4 rounded-md mt-3.5 ml-1.5"
              style={{ backgroundColor: theme.accent }}
            />
          </div>
          <div>
            <p className="text-xs font-semibold leading-none">{theme.name}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{theme.description}</p>
          </div>
          {selected === theme.id && (
            <CheckCircle2 className="absolute top-1.5 right-1.5 h-3.5 w-3.5 text-primary" />
          )}
        </button>
      ))}
    </div>
  )
}
