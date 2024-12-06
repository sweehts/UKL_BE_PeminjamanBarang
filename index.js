import express from 'express'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import cors from 'cors'
import userRoute from './routes/user_route.js'
import authRoute from './routes/auth_route.js'
import barangRoute from './routes/barang_route.js'
import peminjamanRoute from './routes/peminjaman_route.js'

const app = express()

dotenv.config()

app.use(express.json())
app.use(express.urlencoded({ extended: true })); 
app.use(cors())

app.use('/api/auth', authRoute)
app.use('/api/users', userRoute)
app.use('/api/barang', barangRoute)
app.use('/api/peminjaman', peminjamanRoute)


app.use(bodyParser.json())

app.listen(process.env.APP_PORT, () => {
    console.log("server run on port "+ process.env.APP_PORT);
})