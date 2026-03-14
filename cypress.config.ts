import { defineConfig } from 'cypress';

export default defineConfig({
  allowCypressEnv: false,
  e2e: {
    baseUrl: 'http://localhost:3000',
    defaultCommandTimeout: 8000,
    pageLoadTimeout: 30000,
    retries: {
      runMode: 2, // retry failing tests up to 2x in CI
      openMode: 0,
    },
    setupNodeEvents(_on, _config) {
      // implement node event listeners here
    },
    screenshotOnRunFailure: false,
  },
});
