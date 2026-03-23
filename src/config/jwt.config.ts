interface JwtConfig {
  access: {
    secret: string
    expiresIn: string
  }
  refresh: {
    secret: string
    expiresIn: string
  }
}

function getEnvOrThrow(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Variável de ambiente ${name} não definida`)
  }
  return value
}

// Retorna a config ao ser chamada, evitando crash no import
export function getJwtConfig(): JwtConfig {
  return {
    access: {
      secret: getEnvOrThrow('JWT_ACCESS_SECRET'),
      expiresIn: getEnvOrThrow('JWT_ACCESS_EXPIRATION'),
    },
    refresh: {
      secret: getEnvOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: getEnvOrThrow('JWT_REFRESH_EXPIRATION'),
    },
  }
}
