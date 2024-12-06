import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllPeminjaman = async (req, res) => {
  try {
    const result = await prisma.peminjaman.findMany();
    const formattedData = result.map((record) => {
      const formattedBorrowDate = new Date(record.borrow_date)
        .toISOString()
        .split("T")[0];
      const formattedReturnDate = new Date(record.return_date)
        .toISOString()
        .split("T")[0];
      return {
        ...record,
        borrow_date: formattedBorrowDate,
        return_date: formattedReturnDate,
      };
    });

    res.json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.log(error);
    res.json({
      msg: error,
    });
  }
};
export const getPeminjamanById = async (req, res) => {
  try {
    const result = await prisma.presensi.findMany({
      where: {
        id_user: Number(req.params.id),
      },
    });
    const formattedData = result.map((record) => {
      const formattedBorrowDate = new Date(record.borrow_date)
        .toISOString()
        .split("T")[0];
      const formattedReturnDate = new Date(record.return_date)
        .toISOString()
        .split("T")[0];
      return {
        ...record,
        borrow_date: formattedBorrowDate,
        return_date: formattedReturnDate,
      };
    });
    if (formattedData) {
      res.json({
        success: true,
        data: formattedData,
      });
    } else {
      res.status(401).json({
        success: false,
        message: "data not found",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: error,
    });
  }
};
export const addPeminjaman = async (req, res) => {
  const { id_user, item_id, borrow_date, return_date, qty } = req.body;

  const formattedBorrowDate = new Date(borrow_date).toISOString();
  const formattedReturnDate = new Date(return_date).toISOString();

  const [getUserId, getBarangId] = await Promise.all([
    prisma.user.findUnique({ where: { id_user: Number(id_user) } }),
    prisma.barang.findUnique({ where: { id_barang: Number(item_id) } }),
  ]);

  if (getUserId && getBarangId) {
    try {
      const result = await prisma.peminjaman.create({
        data: {
          user: {
            connect: {
              id_user: Number(id_user),
            },
          },
          barang: {
            connect: {
              id_barang: Number(item_id),
            },
          },
          qty: qty,
          borrow_date: formattedBorrowDate,
          return_date: formattedReturnDate,
        },
      });
      if (result) {
        const item = await prisma.barang.findUnique({
          where: { id_barang: Number(item_id) },
        });

        if (!item) {
          throw new Error(
            `barang dengan id_barang ${id_barang} tidak ditemukan`
          );
        } else {
          const minQty = item.quantity - qty;
          const result = await prisma.barang.update({
            where: {
              id_barang: Number(item_id),
            },
            data: {
              quantity: minQty,
            },
          });
        }
      }
      res.status(201).json({
        success: true,
        message: "Peminjaman Berhasil Dicatat",
        data: {
          id_user: result.id_user,
          id_barang: result.id_barang,
          qty: result.qty,
          borrow_date: result.borrow_date.toISOString().split("T")[0], // Format tanggal (YYYY-MM-DD)
          return_date: result.return_date.toISOString().split("T")[0], // Format tanggal (YYYY-MM-DD)
          status: result.status,
        },
      });
    } catch (error) {
      console.log(error);
      res.json({
        msg: error,
      });
    }
  } else {
    res.json({ msg: "user dan barangh belum ada" });
  }
};
export const pengembalianBarang = async (req, res) => {
  const { borrow_id, return_date } = req.body;

  const formattedReturnDate = new Date(return_date).toISOString();

  const cekBorrow = await prisma.peminjaman.findUnique({
    where: { id_peminjaman: Number(borrow_id) },
  });

  if (cekBorrow.status == "dipinjam") {
    try {
      const result = await prisma.peminjaman.update({
        where: {
          id_peminjaman: borrow_id,
        },
        data: {
          return_date: formattedReturnDate,
          status: "kembali",
        },
      });
      if (result) {
        const item = await prisma.barang.findUnique({
          where: { id_barang: Number(cekBorrow.id_barang) },
        });

        if (!item) {
          throw new Error(
            `barang dengan id_barang ${id_barang} tidak ditemukan`
          );
        } else {
          const restoreQty = cekBorrow.qty + item.quantity;
          const result = await prisma.barang.update({
            where: {
              id_barang: Number(cekBorrow.id_barang),
            },
            data: {
              quantity: restoreQty,
            },
          });
        }
      }
      res.status(201).json({
        success: true,
        message: "Pengembalian Berhasil Dicatat",
        data: {
          id_peminjaman: result.id_peminjaman,
          id_user: result.id_user,
          id_barang: result.id_barang,
          qty: result.qty,
          return_date: result.return_date.toISOString().split("T")[0], // Format tanggal (YYYY-MM-DD)
          status: result.status,
        },
      });
    } catch (error) {
      console.log(error);
      res.json({
        msg: error,
      });
    }
  } else {
    res.json({ msg: "user dan barang belum ada" });
  };
};
export const getUsageAnalysis = async (req, res) => {
  const { start_date, end_date, group_by } = req.body;

  // Validasi input
  if (!start_date || !end_date || !group_by) {
    return res.status(400).json({
      status: "error",
      message: "start_date, end_date, and group_by are required",
    });
  }

  try {
    // filter berdasarkan tanggal
    const borrowData = await prisma.peminjaman.findMany({
      where: {
        borrow_date: { gte: new Date(start_date) },
        return_date: { lte: new Date(end_date) },
      },
      include: {
        barang: true,
        user: true,
      },
    });

    // Debug log untuk memeriksa data
    console.log("Borrow Data:", borrowData);

    // data berdasarkan group_by
    const groupedData = borrowData.reduce((acc, record) => {
      let groupKey;
      if (group_by === "user") {
        groupKey = record.user ? record.user.name : "Unknown User";
      } else if (group_by === "item") {
        groupKey = record.barang ? record.barang.name : "Unknown Item";
      } else if (group_by === "category") {
        groupKey = record.barang ? record.barang.category : "Unknown Category";
      } else if (group_by === "location") {
        groupKey = record.barang ? record.barang.location : "Unknown Location";
      } else {
        throw new Error("Invalid group_by value");
      }

      if (!acc[groupKey]) {
        acc[groupKey] = {
          group: groupKey,
          total_borrowed: 0,
          total_returned: 0,
          items_in_use: 0,
        };
      }

      acc[groupKey].total_borrowed += record.qty;
      acc[groupKey].total_returned += record.status === "kembali" ? record.qty : 0;
      acc[groupKey].items_in_use += record.status === "dipinjam" ? record.qty : 0;

      return acc;
    }, {});

    //  respons
    const usageAnalysis = Object.values(groupedData);

    res.status(200).json({
      status: "success",
      data: {
        analysis_periode: {
          start_date,
          end_date,
        },
        usage_analysis: usageAnalysis,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

export const analyzeItems = async (req, res) => {
  const { start_date, end_date } = req.body;

  // validasi
  if (!start_date || !end_date) {
    return res.status(400).json({
      status: "error",
      message: "start_date and end_date are required",
    });
  }

  try {
    // Query untuk barang yang paling sering dipinjam
    const frequentlyBorrowed = await prisma.peminjaman.groupBy({
      by: ['id_barang'],
      where: {
        borrow_date: {
          gte: new Date(start_date),
        },
        return_date: {
          lte: new Date(end_date),
        },
      },
      _sum: {
        qty: true,
      },
      orderBy: {
        _sum: {
          qty: 'desc',
        },
      },
      take: 10, // Ambil 10 barang paling sering dipinjam
    });

    // detail barang
    const frequentlyBorrowedItems = await Promise.all(
      frequentlyBorrowed.map(async (item) => {
        const barang = await prisma.barang.findUnique({
          where: { id_barang: item.id_barang },
        });
        return {
          item_id: item.id_barang,
          name: barang.name,
          category: barang.category,
          total_borrowed: item._sum.qty,
        };
      })
    );

    // barang dengan pengembalian terlambat
    const inefficientItemsData = await prisma.peminjaman.findMany({
      where: {
        borrow_date: {
          gte: new Date(start_date),
        },
        return_date: {
          lte: new Date(end_date),
        },
        status: 'kembali',
      },
    });

    const inefficientItems = await Promise.all(
      inefficientItemsData.reduce((acc, item) => {
        const lateReturn = new Date(item.return_date) > new Date(item.borrow_date);
        if (lateReturn) {
          const existing = acc.find((i) => i.id_barang === item.id_barang);
          if (existing) {
            existing.total_late_returns += 1;
          } else {
            acc.push({
              item_id: item.id_barang,
              total_late_returns: 1,
            });
          }
        }
        return acc;
      }, [])
      .map(async (item) => {
        const barang = await prisma.barang.findUnique({
          where: { id_barang: item.item_id },
        });
        return {
          item_id: item.item_id,
          name: barang.name,
          category: barang.category,
          total_late_returns: item.total_late_returns,
        };
      })
    );

    // respon
    res.status(200).json({
      status: "success",
      data: {
        analysis_period: {
          start_date,
          end_date,
        },
        frequently_borrowed_items: frequentlyBorrowedItems,
        inefficient_items: inefficientItems,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};
