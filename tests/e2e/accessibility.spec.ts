import { test, expect } from '@playwright/test'
import { mockFountainsApi, waitForFountainList } from './helpers/setup'

test.describe('Acessibilidade', () => {
  test.beforeEach(async ({ page }) => {
    await mockFountainsApi(page)
    await page.goto('/')
  })

  test('skip link aponta para #fountain-list', async ({ page }) => {
    const skipLink = page.getByRole('link', { name: /vai alla lista/i })
    await expect(skipLink).toHaveAttribute('href', '#fountain-list')
  })

  test('skip link fica visível ao receber foco via teclado', async ({ page }) => {
    const skipLink = page.getByRole('link', { name: /vai alla lista/i })
    await skipLink.focus()
    await expect(skipLink).toBeVisible()
  })

  test('lista de fontanelas tem id="fountain-list" para o skip link', async ({ page }) => {
    await waitForFountainList(page)
    await expect(page.locator('#fountain-list')).toBeAttached()
  })

  test('lista tem aria-live="polite" para anúncio de atualizações', async ({ page }) => {
    await waitForFountainList(page)
    await expect(page.locator('[aria-live="polite"]')).toBeVisible()
  })

  test('todos os botões de filtro têm atributo aria-pressed', async ({ page }) => {
    await waitForFountainList(page)

    const filterNav = page.getByRole('navigation', { name: /filtra fontanelle/i })
    const buttons = filterNav.getByRole('button')
    const count = await buttons.count()

    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      await expect(buttons.nth(i)).toHaveAttribute('aria-pressed', /(true|false)/)
    }
  })

  test('painel inferior tem role="region" acessível', async ({ page }) => {
    await expect(
      page.getByRole('region', { name: /Lista fontanelle/i }),
    ).toBeVisible()
  })

  test('mapa é ocultado dos leitores de tela com aria-hidden', async ({ page }) => {
    await waitForFountainList(page)
    // The map wrapper div carries aria-hidden="true"
    const hiddenMapWrapper = page.locator('div[aria-hidden="true"]:has(.leaflet-container)')
    await expect(hiddenMapWrapper).toBeAttached()
  })

  test('botão de toggle do painel tem aria-expanded', async ({ page }) => {
    const toggleBtn = page.getByRole('button', { name: /espandi pannello|riduci pannello/i })
    await expect(toggleBtn).toHaveAttribute('aria-expanded', /(true|false)/)
  })

  test('botão GPS tem aria-label descritivo', async ({ page }) => {
    const gpsBtn = page.getByRole('button', { name: /posizione|GPS/i })
    await expect(gpsBtn).toBeVisible()
    const label = await gpsBtn.getAttribute('aria-label')
    expect(label).toBeTruthy()
    expect(label!.length).toBeGreaterThan(5)
  })

  test('header tem role de landmark', async ({ page }) => {
    await expect(page.getByRole('banner')).toBeAttached()
  })
})
