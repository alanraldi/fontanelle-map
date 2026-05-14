import { test, expect } from '@playwright/test'
import {
  mockFountainsApi,
  mockFountainsApiError,
  mockFountainsApiTimeout,
  waitForFountainList,
} from './helpers/setup'

test.describe('Estados de erro da API', () => {
  test('erro HTTP 500 exibe botão de retry', async ({ page }) => {
    await mockFountainsApiError(page, 500)
    await page.goto('/')

    await expect(page.getByRole('button', { name: /Riprova/i }).first()).toBeVisible({
      timeout: 12_000,
    })
  })

  test('erro HTTP 404 exibe botão de retry', async ({ page }) => {
    await mockFountainsApiError(page, 404)
    await page.goto('/')

    await expect(page.getByRole('button', { name: /Riprova/i }).first()).toBeVisible({
      timeout: 12_000,
    })
  })

  test('mensagem de erro é exibida ao usuário', async ({ page }) => {
    await mockFountainsApiError(page, 500)
    await page.goto('/')

    // MapView renders "Errore nel caricamento" when loadingState=error
    await expect(page.getByText(/errore nel caricamento/i)).toBeVisible({ timeout: 12_000 })
  })

  test('clicar em retry carrega a lista com sucesso', async ({ page }) => {
    await mockFountainsApiError(page, 500)
    await page.goto('/')

    const retryBtn = page.getByRole('button', { name: /Riprova/i }).first()
    await expect(retryBtn).toBeVisible({ timeout: 12_000 })

    // Re-mock with success before clicking retry
    await mockFountainsApi(page)
    await retryBtn.click()

    await waitForFountainList(page)
    await expect(page.getByRole('list', { name: /Lista fontanelle/i })).toBeVisible()
  })

  test('timeout exibe mensagem de timeout e botão de retry', async ({ page }) => {
    await mockFountainsApiTimeout(page)
    await page.goto('/')

    // Wait slightly beyond the app's 10s timeout
    await expect(page.getByRole('button', { name: /Riprova/i }).first()).toBeVisible({
      timeout: 15_000,
    })
    await expect(page.getByText(/Timeout/i).first()).toBeVisible()
  })
})
