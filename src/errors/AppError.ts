export class AppError extends Error {
  public readonly statusCode: number
  public readonly message: string

  constructor(status: number, message: string) {
    super()
    this.statusCode = status
    this.message = message
  }
}
