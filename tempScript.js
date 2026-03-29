const fs = require('fs');
let content = fs.readFileSync('d:\\laptrinhweb\\Cinema\\frontend\\src\\pages\\Products.jsx', 'utf8');

content = content.replace('mode, reload', 'isEdit, reload');
content = content.replaceAll('/api/products/singles', '/api/products/single');
content = content.replaceAll('if (mode === "edit"', 'if (isEdit');
content = content.replaceAll('if (mode === "add")', 'if (!isEdit)');
content = content.replaceAll('mode === "add" ? "Thêm Sản Phẩm Mới" : "Chỉnh Sửa Sản Phẩm"', '!isEdit ? "Thêm Sản Phẩm Mới" : "Chỉnh Sửa Sản Phẩm"');
content = content.replaceAll('{mode === "add" ? "thêm" : "cập nhật"}', '{!isEdit ? "thêm" : "cập nhật"}');
content = content.replaceAll('loading ? "Đang xử lý..." : "Lưu Thay Đổi"', 'loading ? "Đang xử lý..." : (isEdit ? "Lưu thay đổi" : "Thêm sản phẩm")');
content = content.replaceAll('const [mode, setMode] = useState("edit");', 'const [isEdit, setIsEdit] = useState(false);');
content = content.replace('setProducts(res.data.products || [])', 'setProducts(res.data.data || [])');
content = content.replaceAll('setMode("add");', 'setIsEdit(false);');
content = content.replaceAll('setMode("edit");', 'setIsEdit(true);');
content = content.replaceAll('mode={mode}', 'isEdit={isEdit}');
content = content.replaceAll('Không có sản phẩm phù hợp', 'Không có sản phẩm');
content = content.replace(/type="number"[\s\S]*?value=\{giaBan\}/, 'type="number" min="1000"\r\n                                value={giaBan}');

fs.writeFileSync('d:\\laptrinhweb\\Cinema\\frontend\\src\\pages\\Products.jsx', content);
console.log('Replaced successfully!');
