import { useEffect, useState } from "react";

export default function Phim() {

  const [danhSachPhim, setDanhSachPhim] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/phim")
      .then(res => res.json())
      .then(data => setDanhSachPhim(data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div style={{ padding: "40px" }}>

      <h2>Quản lý phim</h2>

      <table border="1" cellPadding="10">

        <thead>
          <tr>
            <th>Mã phim</th>
            <th>Tên phim</th>
            <th>Thể loại</th>
            <th>Thời lượng</th>
            <th>Ngày khởi chiếu</th>
            <th>Mô tả</th>
            <th>Poster</th>
            <th>Trailer</th>
            <th>Độ tuổi</th>
            <th>Nước SX</th>
            <th>Tình trạng</th>
            <th>Sửa</th>
            <th>Xóa</th>
          </tr>
        </thead>

        <tbody>

          {danhSachPhim.map((phim) => (

            <tr key={phim.ma_phim}>
              <td>{phim.ma_phim}</td>
              <td>{phim.ten_phim}</td>
              <td>{phim.the_loai}</td>
              <td>{phim.thoi_luong}</td>
              <td>{phim.ngay_khoi_chieu}</td>
              <td>{phim.mo_ta}</td>

              <td>
                <img
                  src={phim.anh_poster}
                  width="60"
                />
              </td>

              <td>
                <a href={phim.link_trailer} target="_blank">
                  Xem
                </a>
              </td>

              <td>{phim.do_tuoi_gioi_han}</td>
              <td>{phim.nuoc_san_xuat}</td>
              <td>{phim.tinh_trang}</td>

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