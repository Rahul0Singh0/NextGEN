import dotevn from 'dotenv'

dotevn.config()

export const PORT = process.env.PORT || 3000

export const MONGO_URI = process.env.MONGO_URI