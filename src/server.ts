import dotenv from 'dotenv'
import app from './app'
import { appDataSource } from './database/appDataSource'

dotenv.config()

const PORT = process.env.PORT || 6060

if (process.env.NODE_ENV !== 'test') {
  appDataSource
    .initialize()
    .then(() => {
      console.log('Conectou com o banco!')

      app.listen(PORT, () => {
        console.log(`Server is running in port: ${PORT}`)
      })
    })
    .catch(console.error)
}
