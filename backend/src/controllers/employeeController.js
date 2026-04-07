const employeeModel = require("../models/employeeModel");

exports.getEmployees = (req, res) => {
    const { search = "" } = req.query;

    console.log("🔍 Search:", search);

    employeeModel.getAll(search, (err, results) => {
        if (err) {
            console.error("❌ Error fetching employees:", err.message);
            return res.status(500).json({ message: "Lỗi lấy danh sách nhân viên", error: err });
        }

        console.log("✅ Found", results.length, "employees");
        res.json(results);
    });
};

exports.createEmployee = (req, res) => {
    const { ho_ten, ngay_sinh, dia_chi, so_dien_thoai, email, anh_dai_dien, ma_tk, trang_thai, chuc_vu } = req.body;

    if (!ho_ten || ho_ten.trim() === "") {
        return res.status(400).json({ message: "Họ tên không được bỏ trống" });
    }

    if (!ngay_sinh || ngay_sinh.trim() === "") {
        return res.status(400).json({ message: "Ngày sinh không được bỏ trống" });
    }

    const birthDate = new Date(ngay_sinh);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (age < 16 || (age === 16 && monthDiff < 0)) {
        return res.status(400).json({ message: "Nhân viên phải từ 16 tuổi trở lên (sinh từ năm 2010)" });
    }

    if (!dia_chi || dia_chi.trim() === "") {
        return res.status(400).json({ message: "Địa chỉ không được bỏ trống" });
    }

    if (!so_dien_thoai || so_dien_thoai.trim() === "") {
        return res.status(400).json({ message: "Số điện thoại không được bỏ trống" });
    }

    if (!/^[0-9]{10}$/.test(so_dien_thoai)) {
        return res.status(400).json({ message: "Số điện thoại phải đủ 10 số" });
    }

    if (!email || email.trim() === "") {
        return res.status(400).json({ message: "Email không được bỏ trống" });
    }

    if (!chuc_vu || chuc_vu.trim() === "") {
        return res.status(400).json({ message: "Chức vụ không được bỏ trống" });
    }

    const validChucVu = ['Nhân viên quầy vé', 'Nhân viên quầy đồ ăn', 'Nhân viên vệ sinh', 'Quản lý', 'Kế toán'];
    if (!validChucVu.includes(chuc_vu)) {
        return res.status(400).json({ message: "Chức vụ không hợp lệ" });
    }

    employeeModel.checkPhoneExists(so_dien_thoai, (err, exist) => {
        if (err) {
            console.error("❌ Error checking phone:", err.message);
            return res.status(500).json({ message: "Lỗi kiểm tra số điện thoại" });
        }

        if (exist.length > 0) {
            return res.status(400).json({ message: "Số điện thoại này đã tồn tại" });
        }

        employeeModel.create({
            ho_ten,
            ngay_sinh,
            dia_chi,
            so_dien_thoai,
            email,
            anh_dai_dien: anh_dai_dien || null,
            ma_tk: ma_tk || null,
            trang_thai: trang_thai || "Còn làm",
            chuc_vu
        }, (errCreate) => {
            if (errCreate) {
                console.error("❌ Error creating employee:", errCreate.message);
                return res.status(500).json({ message: "Lỗi thêm nhân viên" });
            }

            console.log("✅ Employee created:", ho_ten);
            res.json({ message: "Thêm nhân viên thành công" });
        });
    });
};

exports.updateEmployee = (req, res) => {
    const { id } = req.params;
    const { ho_ten, ngay_sinh, dia_chi, so_dien_thoai, email, anh_dai_dien, ma_tk, trang_thai, chuc_vu } = req.body;

    if (!ho_ten || ho_ten.trim() === "") {
        return res.status(400).json({ message: "Họ tên không được bỏ trống" });
    }

    if (!ngay_sinh || ngay_sinh.trim() === "") {
        return res.status(400).json({ message: "Ngày sinh không được bỏ trống" });
    }

    const birthDate = new Date(ngay_sinh);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (age < 16 || (age === 16 && monthDiff < 0)) {
        return res.status(400).json({ message: "Nhân viên phải từ 16 tuổi trở lên (sinh từ năm 2010)" });
    }

    if (!dia_chi || dia_chi.trim() === "") {
        return res.status(400).json({ message: "Địa chỉ không được bỏ trống" });
    }

    if (!so_dien_thoai || so_dien_thoai.trim() === "") {
        return res.status(400).json({ message: "Số điện thoại không được bỏ trống" });
    }

    if (!/^[0-9]{10}$/.test(so_dien_thoai)) {
        return res.status(400).json({ message: "Số điện thoại phải đủ 10 số" });
    }

    if (!email || email.trim() === "") {
        return res.status(400).json({ message: "Email không được bỏ trống" });
    }

    if (!chuc_vu || chuc_vu.trim() === "") {
        return res.status(400).json({ message: "Chức vụ không được bỏ trống" });
    }

    const validChucVu = ['Nhân viên quầy vé', 'Nhân viên quầy đồ ăn', 'Nhân viên vệ sinh', 'Quản lý', 'Kế toán'];
    if (!validChucVu.includes(chuc_vu)) {
        return res.status(400).json({ message: "Chức vụ không hợp lệ" });
    }

    employeeModel.checkPhoneExistsExclude(so_dien_thoai, id, (err, exist) => {
        if (err) {
            console.error("❌ Error checking phone:", err.message);
            return res.status(500).json({ message: "Lỗi kiểm tra số điện thoại" });
        }

        if (exist.length > 0) {
            return res.status(400).json({ message: "Số điện thoại này đã được sử dụng bởi nhân viên khác" });
        }

        employeeModel.update(id, {
            ho_ten,
            ngay_sinh,
            dia_chi,
            so_dien_thoai,
            email,
            anh_dai_dien: anh_dai_dien || null,
            ma_tk: ma_tk || null,
            trang_thai: trang_thai || "Còn làm",
            chuc_vu
        }, (errUpdate) => {
            if (errUpdate) {
                console.error("❌ Error updating employee:", errUpdate.message);
                return res.status(500).json({ message: "Lỗi cập nhật nhân viên" });
            }

            console.log("✅ Employee updated:", id);
            res.json({ message: "Cập nhật nhân viên thành công" });
        });
    });
};

exports.deleteEmployee = (req, res) => {
    const { id } = req.params;

    employeeModel.delete(id, (err) => {
        if (err) {
            console.error("❌ Error deleting employee:", err.message);
            return res.status(500).json({ message: "Lỗi xóa nhân viên" });
        }

        console.log("✅ Employee deleted:", id);
        res.json({ message: "Xóa nhân viên thành công" });
    });
};
