import express from 'express'

import {
    getAllUser,
    getUserById,
    updateUser,
    addUser,
    deleteUser
} from '../controllers/user_controller.js'

const app = express()
app.use(express.json())

app.get('/:id',getAllUser)
app.get('/:id',getUserById)
app.post('/:id',addUser)
app.put('/:id',updateUser)
app.delete('/:id',deleteUser)

export default app