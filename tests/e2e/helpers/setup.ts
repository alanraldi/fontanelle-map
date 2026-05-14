import { type Page } from '@playwright/test'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const GEOJSON_URL_PATTERN = /.*fountains\.geojson.*/

export async function mockFountainsApi(page: Page): Promise<void> {
  const fixture = readFileSync(
    join(__dirname, '../fixtures/fountains.geojson'),
    'utf-8',
  )
  await page.route(GEOJSON_URL_PATTERN, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/geo+json',
      body: fixture,
    })
  })
}

export async function mockFountainsApiError(page: Page, status = 500): Promise<void> {
  await page.route(GEOJSON_URL_PATTERN, (route) => {
    route.fulfill({ status, body: 'Internal Server Error' })
  })
}

export async function mockFountainsApiTimeout(page: Page): Promise<void> {
  await page.route(GEOJSON_URL_PATTERN, (_route) => {
    // Never fulfill — simulates timeout
  })
}

export async function waitForFountainList(page: Page): Promise<void> {
  // #fountain-list is the <ul> rendered only when data loads successfully
  await page.waitForSelector('#fountain-list', { timeout: 10_000 })
}
