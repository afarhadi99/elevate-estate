import { describe, it, expect } from 'vitest'
import { formatCurrency, formatRelativeTime, slugify, initials, cn } from '@/lib/utils'

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(2850000)).toBe('$2,850,000')
    expect(formatCurrency(1000)).toBe('$1,000')
  })
})

describe('slugify', () => {
  it('converts address to slug', () => {
    expect(slugify('142 Riverside Drive')).toBe('142-riverside-drive')
    expect(slugify('New York, NY 10024')).toBe('new-york-ny-10024')
  })
})

describe('initials', () => {
  it('extracts initials from name', () => {
    expect(initials('Sarah Chen')).toBe('SC')
    expect(initials('Marcus Lee Johnson')).toBe('ML')
  })
})

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })
})
