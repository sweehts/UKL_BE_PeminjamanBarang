import { PrismaClient } from "@prisma/client";
import md5 from "md5";

const prisma = new PrismaClient ()

export const getAllBarang = async (req, res) => {
try {
    const response = await prisma.barang.findMany() 
    res.status(200).json(response)
} catch (error) {
    res.status(500).json({msg: error.message})
}
}


export const getBarangById = async (req, res) => {
try {
    const result = await prisma.barang.findUnique({
        where:{
            id_barang: Number(req.params.id)
        }
    })

    res.status(200).json({
        status: true,
        data: result})
} catch (error) {
    res.status(400).json({msg: error.message})
}
}

export const addBarang = async (req, res) => {
    try {
      // Ambil data dari body request
    const { nama_barang, category, location, quantity } = req.body;

      // Konversi quantity ke tipe Integer
    const qty = Number(quantity);

      // Masukkan data ke database
    const result = await prisma.barang.create({
        data: {
        nama_barang,
        category,
        location,
        quantity: qty,
        },
      });
  
      // Berikan respon sukses
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: error.message });
    }
  };
  

export const updateBarang = async (req, res) => {
try {
    const {nama_barang, category, location, quantity} = req.body
    const result = await prisma.barang.update({
        where:{
            id_barang: Number(req.params.id)
        },
        data: {
            nama_barang: nama_barang,
            category: category,
            location: location,
            quantity: quantity
        }
    })
    res.status(200).json(result)
} catch (error) {
    res.status(400).json({msg: error.message})
}
}

export const deleteBarang = async (req, res) => {
try {
    const result = await prisma.barang.delete({
        where: {
            id_barang: Number(req.params.id)
        },
    })
    res.status(200).json(result)
} catch (error) {
    res.status(400).json({msg: error.message})
}
};

export const getUsageReport = async (req, res) => {
const { start_date, end_date, group_by } = req.body;

  // Validasi input
if (!start_date || !end_date || !group_by) {
    return res.status(400).json({
    success: false,
    message: "start_date, end_date, dan group_by wajib diisi.",
    });
}

if (!["category", "location"].includes(group_by)) {
    return res.status(400).json({
    success: false,
    message: "group_by hanya dapat berupa 'category' atau 'location'.",
    });
}

try {
    // Query database untuk menghitung penggunaan barang berdasarkan kategori atau lokasi
    const usageReport = await prisma.barang.groupBy({
    by: [group_by],
    where: {
        created_at: {
        gte: new Date(start_date),
        lte: new Date(end_date),
        },
    },
    _sum: {
        quantity: true,
    },
    });

    res.status(200).json({
    success: true,
    data: usageReport,
    });
} catch (error) {
    console.error(error);
    res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server.",
    error: error.message,
    });
}
};

