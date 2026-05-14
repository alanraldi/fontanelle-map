import { test, expect } from '@playwright/test'
import { mockFountainsApi, waitForFountainList } from './helpers/setup'

test.describe('Seleção de fontanela', () => {
  test.beforeEach(async ({ page }) => {
    await mockFountainsApi(page)
    await page.goto('/')
    await waitForFountainList(page)
  })

  test('clicar em fontanela exibe FountainCard com endereço', async ({ page }) => {
    await page
      .getByRole('button', { name: /Via della Conciliazione/i })
      .click()

    await expect(
      page.getByRole('article', { name: /Dettagli: Via della Conciliazione/i }),
    ).toBeVisible()
    await expect(page.getByText('Via della Conciliazione 5')).toBeVisible()
  })

  test('FountainCard exibe badge de status correto', async ({ page }) => {
    // rm-001 is active
    await page.getByRole('button', { name: /Via della Conciliazione/i }).click()
    await expect(page.getByText('Attiva')).toBeVisible()

    await page.getByRole('button', { name: 'Chiudi dettagli' }).click()

    // rm-002 is inactive
    await page.getByRole('button', { name: /Piazza del Colosseo/i }).click()
    await expect(page.getByText('Inattiva')).toBeVisible()
  })

  test('clicar em "Chiudi dettagli" fecha o card e restaura a lista', async ({ page }) => {
    await page.getByRole('button', { name: /Via della Conciliazione/i }).click()
    await expect(page.getByRole('article', { name: /Dettagli/i })).toBeVisible()

    await page.getByRole('button', { name: 'Chiudi dettagli' }).click()

    await expect(page.getByRole('article', { name: /Dettagli/i })).not.toBeVisible()
    await expect(page.getByRole('list', { name: /Lista fontanelle/i })).toBeVisible()
  })

  test('painel inferior expande ao selecionar fontanela', async ({ page }) => {
    const toggleBtn = page.getByRole('button', { name: 'Espandi pannello' })
    await expect(toggleBtn).toHaveAttribute('aria-expanded', 'false')

    await page.getByRole('button', { name: /Via della Conciliazione/i }).click()

    const expandedBtn = page.getByRole('button', { name: 'Riduci pannello' })
    await expect(expandedBtn).toHaveAttribute('aria-expanded', 'true')
  })

  test('região do painel altera label ao selecionar fontanela', async ({ page }) => {
    await expect(
      page.getByRole('region', { name: 'Lista fontanelle' }),
    ).toBeVisible()

    await page.getByRole('button', { name: /Via della Conciliazione/i }).click()

    await expect(
      page.getByRole('region', { name: 'Dettagli fontanella' }),
    ).toBeVisible()
  })

  test('clicar em outra fontanela atualiza o card', async ({ page }) => {
    await page.getByRole('button', { name: /Via della Conciliazione/i }).click()
    await expect(page.getByText('Via della Conciliazione 5')).toBeVisible()

    await page.getByRole('button', { name: 'Chiudi dettagli' }).click()

    await page.getByRole('button', { name: /Piazza del Colosseo/i }).click()
    await expect(page.getByText('Piazza del Colosseo 1')).toBeVisible()
  })
})
