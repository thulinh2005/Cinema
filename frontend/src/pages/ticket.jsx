import { useEffect, useState } from "react";
import axios from "axios";

function Tickets() {

const [data, setData] = useState([]);
const [search, setSearch] = useState("");

useEffect(() => {
axios.get(`http://localhost:5000/api/tickets?search=${search}`)
.then(res => setData(res.data));
}, [search]);

const cancel = (id) => {
axios.put(`http://localhost:5000/api/tickets/${id}/cancel`)
.then(() => window.location.reload());
};

return (
<div>

<h2>Vé</h2>

<input onChange={e => setSearch(e.target.value)} />

<table border="1">

<thead>
<tr>
<th>Mã vé</th>
<th>Ghế</th>
<th>Phòng</th>
<th>Giá</th>
<th>Trạng thái</th>
<th>Action</th>
</tr>
</thead>

<tbody>

{data.map(v => (

<tr key={v.ma_ve}>
<td>{v.ma_ve}</td>
<td>{v.so_ghe}</td>
<td>{v.ma_phong}</td>
<td>{v.gia_ve}</td>
<td>
{v.trang_thai === "Đã đặt" && "🟡 Đã đặt"}
{v.trang_thai === "Đã thanh toán" && "🟢 Đã thanh toán"}
{v.trang_thai === "Đã hủy" && "🔴 Đã hủy"}
</td>

<td>
<button onClick={() => cancel(v.ma_ve)}>Hủy</button>
</td>

</tr>

))}

</tbody>

</table>

</div>
);
}

export default Tickets;