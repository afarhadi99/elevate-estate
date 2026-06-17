'use server'

import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface ListingFacts {
  address: string
  city?: string
  state?: string
  price?: string
  bedrooms?: number | null
  bathrooms?: string | null
  squareFeet?: number | null
  yearBuilt?: number | null
  propertyType?: string
  tone?: string
}

export async function generateDescription(facts: ListingFacts): Promise<string> {
  const {
    address,
    city,
    state,
    price,
    bedrooms,
    bathrooms,
    squareFeet,
    yearBuilt,
    propertyType = 'residential',
    tone = 'Luxury',
  } = facts

  const factsText = [
    `Address: ${address}${city ? `, ${city}` : ''}${state ? `, ${state}` : ''}`,
    price && `Asking price: $${parseFloat(price).toLocaleString()}`,
    bedrooms !== null && bedrooms !== undefined && `Bedrooms: ${bedrooms}`,
    bathrooms && `Bathrooms: ${bathrooms}`,
    squareFeet && `Square feet: ${squareFeet.toLocaleString()}`,
    yearBuilt && `Year built: ${yearBuilt}`,
    `Property type: ${propertyType}`,
  ]
    .filter(Boolean)
    .join('\n')

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `You are an expert real estate copywriter. Write a compelling property description for the following listing.

Tone: ${tone}
Listing facts:
${factsText}

Write 2-3 paragraphs (150-250 words total). Be specific, evocative, and highlight the best features. Do not make up features not mentioned in the facts. Return only the description text, no headers or labels.`,
      },
    ],
  })

  const block = message.content[0]
  if (block.type !== 'text') throw new Error('Unexpected response type')
  return block.text.trim()
}
