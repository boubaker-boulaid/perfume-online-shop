// Every failed API call ends up as one of these, whether it came from the backend, the fake
// backend or the network. Pages read `status` (404: show "not found"), `errors` (the messages
// for each form field) and `message` (in French, ready to show).
export class ApiError extends Error {
  status: number
  errors: Record<string, string[]> | null

  constructor(message: string, status: number, errors: Record<string, string[]> | null = null) {
    super(message)
    this.status = status
    this.errors = errors
  }
}
