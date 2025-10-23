import axios from 'axios'

type MaybeError = {
  message?: string
}

export const parseError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const errorMessage = (error.response?.data as MaybeError)?.message || error.message || 'Request failed'
    const statusCode = error.response?.status

    let statusMessage = ''
    if (statusCode) {
      switch (statusCode) {
        case 400:
          statusMessage = 'Bad Request'
          break
        case 401:
          statusMessage = 'Unauthorized'
          break
        case 403:
          statusMessage = 'Forbidden'
          break
        case 404:
          statusMessage = 'Not Found'
          break
        case 500:
          statusMessage = 'Server Error'
          break
        case 502:
          statusMessage = 'Bad Gateway'
          break
        case 503:
          statusMessage = 'Service Unavailable'
          break
        default:
          statusMessage = `Error ${statusCode}`
      }
    }

    return `${errorMessage}${statusCode ? ` (${statusMessage})` : ''}`
  }

  return `Error: ${String(error)}`
}
