import { connect } from 'mongoose'

const connectionString = process.env.MONGODB_ATLAS_CLUSTER_URI || ''
export const connectDB = async () => {
  try {
    connect(connectionString)
    console.log('Server connected to DB')
  } catch (error) {
    if (error instanceof Error) console.error(error.message)
  }
}
