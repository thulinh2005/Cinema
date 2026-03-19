import React, { useEffect, useState } from "react"
import axios from "axios"
import { Search, Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog"

const STATUS = ["Sắp chiếu", "Đang chiếu", "Ngừng chiếu"]
const GENRES = ["Hành động", "Kinh dị", "Tình cảm", "Hoạt hình"]

const Movies = () => {

  const [movies, setMovies] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const itemsPerPage = 5

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const [editingMovie, setEditingMovie] = useState(null)

  const defaultMovie = {
    ten_phim: "",
    the_loai: "",
    thoi_luong: "",
    ngay_khoi_chieu: "",
    mo_ta: "",
    anh_poster: null,
    link_trailer: "",
    do_tuoi_gioi_han: "",
    nuoc_san_xuat: "",
    tinh_trang: "Sắp chiếu"
  }

  const [newMovie, setNewMovie] = useState(defaultMovie)

  // ================= VALIDATION =================
  const validateMovie = (movie) => {
    if (!movie.ten_phim?.trim()) {
      toast.error("Tên phim không được để trống")
      return false
    }
    if (!movie.the_loai) {
      toast.error("Chọn thể loại")
      return false
    }
    if (!movie.thoi_luong || movie.thoi_luong <= 0) {
      toast.error("Thời lượng phải > 0")
      return false
    }
    if (!movie.ngay_khoi_chieu) {
      toast.error("Chọn ngày khởi chiếu")
      return false
    }
    if (!movie.link_trailer.includes("youtube.com")) {
      toast.error("Trailer phải là YouTube")
      return false
    }
    return true
  }

  // ================= FETCH =================
  const fetchMovies = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/phim")
      setMovies(res.data)
    } catch(err) {
        console.error(err)
      toast.error("Không tải được dữ liệu")
    }
  }

  useEffect(() => {
    const load = async () => {
    await fetchMovies()
  }
  load()
    //fetchMovies()
  }, [])

  // ================= FILTER =================
  const filteredMovies = movies
    .filter(m =>
      m.ten_phim?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.the_loai?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.mo_ta?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.nuoc_san_xuat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.do_tuoi_gioi_han?.toString().includes(searchTerm)
    )
    .filter(m => statusFilter ? m.tinh_trang === statusFilter : true)

  const indexOfLast = currentPage * itemsPerPage
  const currentMovies = filteredMovies.slice(indexOfLast - itemsPerPage, indexOfLast)

  // ================= ADD =================
  const handleAddMovie = async () => {
    if (!validateMovie(newMovie)) return

    try {
      const formData = new FormData()
      Object.keys(newMovie).forEach(key => {
        formData.append(key, newMovie[key])
      })

      await axios.post("http://localhost:5000/api/phim", formData)

      toast.success("Thêm thành công")
      setIsAddModalOpen(false)
      setNewMovie(defaultMovie)
      fetchMovies()

    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi thêm phim")
    }
  }

  // ================= UPDATE =================
  const handleUpdateMovie = async () => {
    if (!validateMovie(editingMovie)) return

    try {
      await axios.put(
        `http://localhost:5000/api/phim/${editingMovie.ma_phim}`,
        editingMovie
      )

      toast.success("Cập nhật thành công")
      setIsEditModalOpen(false)
      fetchMovies()

    } catch (err) {
        console.error(err)
        toast.error("Lỗi cập nhật")
    }
  }

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa không?")) return

    try {
      await axios.delete(`http://localhost:5000/api/phim/${id}`)
      toast.success("Xóa thành công")
      fetchMovies()
    } catch {
      toast.error("Không thể xóa")
    }
  }

  // ================= IMAGE =================
  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setNewMovie({ ...newMovie, anh_poster: file })
  }

  // ================= YOUTUBE =================
  const getEmbedLink = (url) => {
    try {
      return url.replace("watch?v=", "embed/")
    } catch {
      return ""
    }
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý phim</h1>

        <Dialog
  open={isAddModalOpen}
  onOpenChange={(open) => {
    setIsAddModalOpen(open)
    if (!open) setNewMovie(defaultMovie)
  }}
>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2" /> Thêm phim</Button>
          </DialogTrigger>

          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Thêm phim</DialogTitle>
            </DialogHeader>

            <div className="grid gap-3">

              <Input placeholder="Tên phim"
                value={newMovie.ten_phim}
                onChange={e => setNewMovie({ ...newMovie, ten_phim: e.target.value })}
              />

              <select onChange={e => setNewMovie({ ...newMovie, the_loai: e.target.value })}>
                <option value="">Chọn thể loại</option>
                {GENRES.map(g => <option key={g}>{g}</option>)}
              </select>

              <Input type="number" placeholder="Thời lượng"
                onChange={e => setNewMovie({ ...newMovie, thoi_luong: e.target.value })}
              />

              <Input type="date"
                onChange={e => setNewMovie({ ...newMovie, ngay_khoi_chieu: e.target.value })}
              />

              <Input placeholder="Mô tả"
                onChange={e => setNewMovie({ ...newMovie, mo_ta: e.target.value })}
              />

              <input type="file" onChange={handleImageUpload} />

              <Input placeholder="Link trailer"
                onChange={e => setNewMovie({ ...newMovie, link_trailer: e.target.value })}
              />

              {newMovie.link_trailer && (
                <iframe width="100%" height="200"
                  src={getEmbedLink(newMovie.link_trailer)}
                />
              )}

              <Input placeholder="Độ tuổi"
                onChange={e => setNewMovie({ ...newMovie, do_tuoi_gioi_han: e.target.value })}
              />

              <Input placeholder="Nước sản xuất"
                onChange={e => setNewMovie({ ...newMovie, nuoc_san_xuat: e.target.value })}
              />

              <select onChange={e => setNewMovie({ ...newMovie, tinh_trang: e.target.value })}>
                {STATUS.map(s => <option key={s}>{s}</option>)}
              </select>

            </div>

            <DialogFooter>
              <Button onClick={handleAddMovie}
              disabled={!newMovie.ten_phim}
              >Lưu</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* SEARCH */}
      <div className="flex gap-3">
        <div className="relative">
          <Search className="absolute left-2 top-2" />
          <Input className="pl-8"
            placeholder="Tìm kiếm..."
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <select onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          {STATUS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <Table className="min-w-[1400px]">
          <TableHeader>
            <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>Mã</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Thể loại</TableHead>
              <TableHead>Thời lượng</TableHead>
              <TableHead>Ngày</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Poster</TableHead>
              <TableHead>Trailer</TableHead>
              <TableHead>Tuổi</TableHead>
              <TableHead>Nước</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentMovies.map((m, i) => (
              <TableRow key={m.ma_phim}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{m.ma_phim}</TableCell>
                <TableCell>{m.ten_phim}</TableCell>
                <TableCell>{m.the_loai}</TableCell>
                <TableCell>{m.thoi_luong}</TableCell>
                <TableCell>{m.ngay_khoi_chieu ? new Date(m.ngay_khoi_chieu).toLocaleDateString() : ""}</TableCell>
                <TableCell>{m.mo_ta}</TableCell>

                <TableCell>
                  {m.anh_poster && (
                    <img src={m.anh_poster} className="w-12 h-16 object-cover" />
                  )}
                </TableCell>

                <TableCell>
                  <a href={m.link_trailer} target="_blank">Xem</a>
                </TableCell>

                <TableCell>{m.do_tuoi_gioi_han}+</TableCell>
                <TableCell>{m.nuoc_san_xuat}</TableCell>

                <TableCell>
                  <Badge>{m.tinh_trang}</Badge>
                </TableCell>

                <TableCell className="space-x-2">
                  <Button size="icon" onClick={() => {
                    setEditingMovie(m)
                    setIsEditModalOpen(true)
                  }}>
                    <Pencil />
                  </Button>

                  <Button size="icon" onClick={() => handleDelete(m.ma_phim)}>
                    <Trash2 />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* EDIT MODAL */}
<Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
  <DialogContent className="max-w-xl">
    <DialogHeader>
      <DialogTitle>Sửa phim</DialogTitle>
    </DialogHeader>

    {editingMovie && (
      <div className="grid gap-3">

        <Input
          placeholder="Tên phim"
          value={editingMovie.ten_phim || ""}
          onChange={e =>
            setEditingMovie({ ...editingMovie, ten_phim: e.target.value })
          }
        />

        {/* GENRE */}
        <select
          value={editingMovie.the_loai || ""}
          onChange={e =>
            setEditingMovie({ ...editingMovie, the_loai: e.target.value })
          }
        >
          <option value="">Chọn thể loại</option>
          {GENRES.map(g => <option key={g}>{g}</option>)}
        </select>

        <Input
          type="number"
          placeholder="Thời lượng"
          value={editingMovie.thoi_luong || ""}
          onChange={e =>
            setEditingMovie({ ...editingMovie, thoi_luong: e.target.value })
          }
        />

        <Input
          type="date"
          value={editingMovie.ngay_khoi_chieu || ""}
          onChange={e =>
            setEditingMovie({ ...editingMovie, ngay_khoi_chieu: e.target.value })
          }
        />

        <Input
          placeholder="Mô tả"
          value={editingMovie.mo_ta || ""}
          onChange={e =>
            setEditingMovie({ ...editingMovie, mo_ta: e.target.value })
          }
        />

        <Input
          placeholder="Link trailer"
          value={editingMovie.link_trailer || ""}
          onChange={e =>
            setEditingMovie({ ...editingMovie, link_trailer: e.target.value })
          }
        />

        {/* PREVIEW */}
        {editingMovie.link_trailer && (
          <iframe
            width="100%"
            height="200"
            src={editingMovie.link_trailer.replace("watch?v=", "embed/")}
          />
        )}

        <Input
          placeholder="Độ tuổi"
          value={editingMovie.do_tuoi_gioi_han || ""}
          onChange={e =>
            setEditingMovie({
              ...editingMovie,
              do_tuoi_gioi_han: e.target.value
            })
          }
        />

        <Input
          placeholder="Nước sản xuất"
          value={editingMovie.nuoc_san_xuat || ""}
          onChange={e =>
            setEditingMovie({
              ...editingMovie,
              nuoc_san_xuat: e.target.value
            })
          }
        />

        {/* STATUS */}
        <select
          value={editingMovie.tinh_trang || ""}
          onChange={e =>
            setEditingMovie({
              ...editingMovie,
              tinh_trang: e.target.value
            })
          }
        >
          {STATUS.map(s => <option key={s}>{s}</option>)}
        </select>

      </div>
    )}

    <DialogFooter>
      <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
        Hủy
      </Button>
      <Button onClick={handleUpdateMovie}>
        Lưu
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

      {/* PAGINATION */}
      <div className="flex gap-2">
        <Button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}>Prev</Button>
        <Button onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
      </div>

    </div>
  )
}

export default Movies