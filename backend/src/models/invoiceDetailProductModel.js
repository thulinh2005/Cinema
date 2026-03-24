const db = require("../config/db");

const InvoiceDetailProduct = {

    getByInvoice: (invoiceId, callback) => {

        const sql = `
        SELECT ct.*, sp.ten_sp
        FROM chi_tiet_hoa_don_sp ct
        JOIN san_pham sp ON ct.ma_sp = sp.ma_sp
        WHERE ct.ma_hd = ?
        `;

        db.query(sql, [invoiceId], callback);
    },

    create: (data, callback) => {

        const sql = `
        INSERT INTO chi_tiet_hoa_don_sp
        (ma_hd, ma_sp, so_luong, don_gia)
        VALUES (?, ?, ?, ?)
        `;

        db.query(sql, [
            data.ma_hd,
            data.ma_sp,
            data.so_luong,
            data.don_gia
        ], callback);
    }

};

module.exports = InvoiceDetailProduct;