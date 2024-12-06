import express from 'express'
import {
   getAllPeminjaman,
   getPeminjamanById,
   addPeminjaman,
   pengembalianBarang,
   getUsageAnalysis,
   analyzeItems
} from '../controllers/peminjaman_controller.js'


const app = express()
import { authorize } from '../controllers/auth_controller.js'
import { IsMember, IsAdmin } from '../middleware/role_validation.js'


app.get('/borrow', getAllPeminjaman)
app.get('/borrow/:id', getPeminjamanById)
app.post('/borrow', authorize,[IsMember],addPeminjaman)
app.post('/return', pengembalianBarang)
app.post('/usage-report',authorize, getUsageAnalysis)
app.post('/borrow-analysis', authorize,analyzeItems)

export default app