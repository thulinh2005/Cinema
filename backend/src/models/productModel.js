const db = require("../config/db");

// Convert callback to Promise for easier async/await handling
const queryPromise = (sql, args) => {
    return new Promise((resolve, reject) => {
        db.query(sql, args, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

const beginTransaction = () => new Promise((res, rej) => db.beginTransaction(err => err ? rej(err) : res()));
const commit = () => new Promise((res, rej) => db.commit(err => err ? rej(err) : res()));
const rollback = () => new Promise((res) => db.rollback(() => res()));

const productModel = {
    getAllProducts: async ({ search = "", type = "", status = "", page = 1, limit = 10 }) => {
        const offset = (page - 1) * limit;

        // Cho phép search theo cả table products hoặc san_pham (tuỳ thuộc CSDL, user dùng `products` hay `san_pham`, giả định là `products` / `san_pham` = nhau)
        // Mình sẽ dùng bảng \`san_pham\` như code cũ hoặc \`products\` tuỳ DB bạn cấu hình. Ở đây dùng \`products\` theo yêu cầu gần nhất.
        let sql = "SELECT * FROM san_pham WHERE 1=1";
        let countSql = "SELECT COUNT(*) as total FROM san_pham WHERE 1=1";
        const params = [];
        const countParams = [];

        if (search) {
            sql += " AND ten_sp LIKE ?";
            countSql += " AND ten_sp LIKE ?";
            params.push(`%${search}%`);
            countParams.push(`%${search}%`);
        }

        if (type) {
            sql += " AND loai_sp = ?";
            countSql += " AND loai_sp = ?";
            params.push(type);
            countParams.push(type);
        }

        if (status) {
            sql += " AND trang_thai = ?";
            countSql += " AND trang_thai = ?";
            params.push(status);
            countParams.push(status);
        }

        sql += " ORDER BY ma_sp DESC LIMIT ? OFFSET ?";
        params.push(parseInt(limit), parseInt(offset));

        try {
            const products = await queryPromise(sql, params);
            const [countResult] = await queryPromise(countSql, countParams);
            const total = countResult.total;
            return { products, total, totalPages: Math.ceil(total / limit) };
        } catch (error) {
            console.error("Lỗi lấy danh sách sản phẩm (có thể sai tên bảng sản phẩm/products):", error);
            throw error;
        }
    },

    getProductById: async (id) => {
        const products = await queryPromise("SELECT * FROM san_pham WHERE ma_sp = ?", [id]);
        if (products.length === 0) return null;

        const product = products[0];

        if (product.loai_sp === "Combo") {
            const items = await queryPromise(`
                SELECT p.ma_sp, p.ten_sp, p.loai_sp, p.gia_ban, p.anh_san_pham, ci.so_luong
                FROM combo_items ci
                JOIN san_pham p ON ci.ma_sp = p.ma_sp
                WHERE ci.ma_combo = ?
            `, [id]);
            product.combo_items = items;
        }

        return product;
    },

    createProduct: async ({ ten_sp, loai_sp, gia_ban, anh_san_pham, trang_thai }, combo_items) => {
        await beginTransaction();
        try {
            const sql = `
                INSERT INTO san_pham (ten_sp, loai_sp, gia_ban, anh_san_pham, trang_thai)
                VALUES (?, ?, ?, ?, ?)
            `;
            const result = await queryPromise(sql, [ten_sp, loai_sp, gia_ban, anh_san_pham, trang_thai]);
            const newProductId = result.insertId;

            if (loai_sp === 'Combo' && Array.isArray(combo_items) && combo_items.length > 0) {
                const values = combo_items.map(item => {
                    if (typeof item === 'object' && item !== null) {
                        return [newProductId, item.ma_sp, item.so_luong || 1];
                    }
                    return [newProductId, item, 1];
                });
                await queryPromise("INSERT INTO combo_items (ma_combo, ma_sp, so_luong) VALUES ?", [values]);
            }

            await commit();
            return newProductId;
        } catch (error) {
            await rollback();
            throw error;
        }
    },

    updateProduct: async (id, { ten_sp, loai_sp, gia_ban, anh_san_pham, trang_thai }, combo_items) => {
        await beginTransaction();
        try {
            let updateSql = `
                UPDATE san_pham 
                SET ten_sp = ?, loai_sp = ?, gia_ban = ?, trang_thai = ?
            `;
            const params = [ten_sp, loai_sp, gia_ban, trang_thai];

            if (anh_san_pham !== undefined) {
                updateSql += ", anh_san_pham = ?";
                params.push(anh_san_pham);
            }

            updateSql += " WHERE ma_sp = ?";
            params.push(id);

            await queryPromise(updateSql, params);

            if (loai_sp === 'Combo') {
                await queryPromise("DELETE FROM combo_items WHERE ma_combo = ?", [id]);
                if (Array.isArray(combo_items) && combo_items.length > 0) {
                    const values = combo_items.map(item => {
                        if (typeof item === 'object' && item !== null) {
                            return [id, item.ma_sp, item.so_luong || 1];
                        }
                        return [id, item, 1];
                    });
                    await queryPromise("INSERT INTO combo_items (ma_combo, ma_sp, so_luong) VALUES ?", [values]);
                }
            } else {
                await queryPromise("DELETE FROM combo_items WHERE ma_combo = ?", [id]);
            }

            await commit();
            return true;
        } catch (error) {
            await rollback();
            throw error;
        }
    },

    deleteProduct: async (id) => {
        await beginTransaction();
        try {
            // Kiểm tra xem sản phẩm có đang nằm trong combo nào không (nếu nó là sản phẩm đơn)
            const check = await queryPromise("SELECT count(*) as count FROM combo_items WHERE ma_sp = ?", [id]);
            if (check && check.length > 0 && check[0].count > 0) {
                // Nếu xóa ngang 1 món ăn đang có trong combo thì combo đó sẽ bị vô lý (vd: Combo cần 2 món nhưng bị xóa 1) -> Khóa lại
                throw new Error("Sản phẩm này đang nằm trong một Combo. Vui lòng gỡ khỏi Combo trước khi xóa!");
            }

            // Xóa các sản phẩm con nếu đây là 1 Combo
            await queryPromise("DELETE FROM combo_items WHERE ma_combo = ?", [id]);
            
            // Xóa sản phẩm
            await queryPromise("DELETE FROM san_pham WHERE ma_sp = ?", [id]);
            
            await commit();
            return true;
        } catch (error) {
            await rollback();
            throw error;
        }
    },

    getSingleProducts: async () => {
        return await queryPromise("SELECT ma_sp, ten_sp, gia_ban, anh_san_pham FROM san_pham WHERE loai_sp IN ('Đồ ăn', 'Nước uống') AND trang_thai = 'Còn bán'", []);
    }
};

module.exports = productModel;