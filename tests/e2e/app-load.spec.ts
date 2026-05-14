import { test, expect } from '@playwright/test'
import { mockFountainsApi, waitForFountainList } from './helpers/setup'

test.describe('App — carregamento inicial', () => {
  test.beforeEach(async ({ page }) => {
    await mockFountainsApi(page)
    await page.goto('/')
  })

  test('página carrega com título correto', async ({ page }) => {
    await expect(page).toHaveTitle(/Fontanelle Map/)
  })

  test('meta description está presente', async ({ page }) => {
    const description = page.locator('meta[name="description"]')
    await expect(description).toHaveAttribute('content', /fontanelle/i)
  })

  test('header com nome do app é visível', async ({ page }) => {
    await expect(page.getByText('Fontanelle Map')).toBeVisible()
  })

  test('skip link está presente no DOM', async ({ page }) => {
    const skipLink = page.getByRole('link', { name: /vai alla lista/i })
    await expect(skipLink).toBeAttached()
    // Deve ser visível ao receber foco
    await skipLink.focus()
    await expect(skipLink).toBeVisible()
  })

  test('botão GPS é visível', async ({ page }) => {
    await expect(page.getByRole('button', { name: /posizione/i })).toBeVisible()
  })

  test('fontanelle carregam e lista é exibida', async ({ page }) => {
    await waitForFountainList(page)
    await expect(
      page.getByRole('list', { name: /lista fontanelle/i }),
    ).toBeVisible()
  })

  test('exibe contagem de fontanelle no header', async ({ page }) => {
    await waitForFountainList(page)
    // 5 fontanelle no fixture — scoped to the banner to avoid ambiguity
    await expect(page.getByRole('banner')).toContainText('5')
  })
})
