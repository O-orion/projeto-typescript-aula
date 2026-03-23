import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// 1. Criar o equivalente ao __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 2. Agora você pode usar normalmente
const pathFile = path.resolve(__dirname, '..', 'database')

export async function read(nameFile: string) {
  try {
    const filePath = path.resolve(pathFile, nameFile as string)
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.log(error)
    throw new Error('Erro ao ler o arquivo')
  }
}

export async function write(nameFile: string, data: any) {
  try {
    const filePath = path.resolve(pathFile, nameFile)
    await fs.writeFile(filePath, JSON.stringify(data, null, 2))
  } catch (_error) {
    throw new Error('Erro ao escrever no arquivo')
  }
}
