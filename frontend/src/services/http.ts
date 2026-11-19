import axios, { type AxiosRequestConfig } from 'axios'
import type { Paginated } from '../types'
import { ApiError } from './apiError'

// The Laravel backend's address, from VITE_API_URL in frontend/.env (see .env.example)
const API_URL = import.meta.env.VITE_API_URL?.trim()

if (!API_URL) {
  throw new Error('VITE_API_URL is not set. Copy frontend/.env.example to frontend/.env.')
}

// The settings backend/docs/API.md asks for: the session cookie goes with each request, and the
// CSRF token from the "XSRF-TOKEN" cookie goes back in the "X-XSRF-TOKEN" header.
const http = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  withXSRFToken: true,
  headers: { Accept: 'application/json' },
  timeout: 15000,
})

// Every answer from the API has this shape. Lists add "meta".
export type Envelope<T> = {
  success: boolean
  message: string
  data: T
  meta?: Paginated<unknown>['meta']
  errors: Record<string, string[]> | null
}

const GENERAL_ERROR = 'Un problème est survenu. Réessayez s’il vous plaît.'
const NETWORK_ERROR = 'Impossible de joindre la boutique. Vérifiez votre connexion et réessayez.'

// Turns whatever went wrong into an ApiError with a French message.
function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (axios.isAxiosError<Envelope<unknown>>(error)) {
    if (!error.response) return new ApiError(NETWORK_ERROR, 0)

    const body = error.response.data
    return new ApiError(body?.message || GENERAL_ERROR, error.response.status, body?.errors ?? null)
  }

  return new ApiError(GENERAL_ERROR, 0)
}

// Orders need a CSRF cookie first, even for guests. It's fetched once, and again if it expires.
let csrfCookie: Promise<unknown> | null = null

async function ensureCsrfCookie() {
  try {
    csrfCookie ??= http.get('/sanctum/csrf-cookie')
    await csrfCookie
  } catch (error) {
    csrfCookie = null // the next request tries again
    throw error
  }
}

const CSRF_EXPIRED = 419

// Sends one request and gives back the API's answer, or throws an ApiError.
export async function request<T>(config: AxiosRequestConfig): Promise<Envelope<T>> {
  const changesSomething = config.method !== undefined && config.method.toLowerCase() !== 'get'

  try {
    if (changesSomething) await ensureCsrfCookie()
    const response = await http.request<Envelope<T>>(config)
    return response.data
  } catch (error) {
    // an expired CSRF token: get a new one and try once more
    if (changesSomething && axios.isAxiosError(error) && error.response?.status === CSRF_EXPIRED) {
      csrfCookie = null
      try {
        await ensureCsrfCookie()
        const response = await http.request<Envelope<T>>(config)
        return response.data
      } catch (retryError) {
        throw toApiError(retryError)
      }
    }

    throw toApiError(error)
  }
}
