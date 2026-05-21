import { defineConfig, devices } from '@playwright/test'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '.env.local') })

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  timeout: 60000,
  reporter: 'list',
  use: {
    baseURL: 'https://www.careified.com',
    trace: 'on-first-retry',
  },
  workers: 1,
  projects: [
    {
      name: 'caregiver-setup',
      testMatch: '**/caregiver.setup.ts',
      use: { storageState: { cookies: [], origins: [] } },
    },
    {
      name: 'agency-setup',
      testMatch: '**/agency.setup.ts',
      use: { storageState: { cookies: [], origins: [] } },
    },
    {
      name: 'caregiver',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/caregiver.json',
      },
      testMatch: '**/caregiver-flow.spec.ts',
      dependencies: ['caregiver-setup'],
    },
    {
      name: 'agency',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/agency.json',
      },
      testMatch: '**/agency-flow.spec.ts',
      dependencies: ['agency-setup'],
    },
  ],
  /*
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
*/
})
