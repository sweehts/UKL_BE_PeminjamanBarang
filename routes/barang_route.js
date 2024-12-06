import express from 'express'

import {
    getAllBarang,
    getBarangById,
    updateBarang,
    addBarang,
    deleteBarang
} from '../controllers/barang_controller.js'

import { authenticate,authorize } from '../controllers/auth_controller.js'
import { IsAdmin } from '../middleware/role_validation.js'
const app = express()
app.use(express.json())

app.get('/:id',getAllBarang)
app.get('/:id',getBarangById)
app.post('/:id',authorize,addBarang)
app.put('/:id',authorize,updateBarang)
app.delete('/:id',deleteBarang)

export default app