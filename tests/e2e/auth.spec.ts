import { test, expect } from '@playwright/test'

test.describe('Auth flows', () => {
  test('login page renders and accepts input', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password').fill('Password123')
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
  })

  test('signup page renders all fields', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.getByRole('heading', { name: 'Create your workspace' })).toBeVisible()
    await expect(page.getByLabel('Full name')).toBeVisible()
    await expect(page.getByLabel('Work email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
  })

  test('signup validates email format', async ({ page }) => {
    await page.goto('/signup')
    await page.getByLabel('Full name').fill('Alex Johnson')
    await page.getByLabel('Work email').fill('not-an-email')
    await page.getByRole('button', { name: 'Create account' }).click()
    await expect(page.getByText('Enter a valid email')).toBeVisible()
  })
})

test.describe('Navigation', () => {
  test('redirects root to dashboard (or login)', async ({ page }) => {
    await page.goto('/')
    // Should redirect somewhere — either /dashboard or /login
    await expect(page).toHaveURL(/\/(dashboard|login)/)
  })
})
