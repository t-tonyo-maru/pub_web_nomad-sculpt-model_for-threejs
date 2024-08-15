import path from 'path'
import { defineConfig } from 'vite'
import dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  // baseUrl = github pages path
  base: process.env.VITE_GITHUB_PAGES_PATH || '/',
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src')
    }
  }
})
