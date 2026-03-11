import { useEffect, useState } from "react";

export default function SuatChieu() {

  const [danhSachSuat, setDanhSachSuat] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/suatchieu")
      .then(res => res.json())
      .then(data => setDanhSachSuat(data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div style={{ padding: "40px" }}>

      <h2>Quản lý suất chiếu</h2>

      <table border="1" cellPadding="10">

        <thead>
          <tr>
            <th>Mã suất chiếu</th>
            <th>Mã phim</th>
            <th>Mã phòng</th>
            <th>Ngày chiếu</th>
            <th>Giờ chiếu</th>
            <th>Giờ kết thúc</th>
            <th>Trạng thái</th>
            <th>Sửa</th>
            <th>Xóa</th>
          </tr>
        </thead>

        <tbody>

          {danhSachSuat.map((suat) => (

            <tr key={suat.ma_suat_chieu}>
              <td>{suat.ma_suat_chieu}</td>
              <td>{suat.ma_phim}</td>
              <td>{suat.ma_phong}</td>
              <td>{suat.ngay_chieu}</td>
              <td>{suat.gio_chieu}</td>
              <td>{suat.gio_ket_thuc}</td>
              <td>{suat.trang_thai}</td>

              <td>
                <button>Sửa</button>
              </td>

              <td>
                <button>Xóa</button>
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}