# StyleHub — Frontend (React)

Giao diện cửa hàng thời trang, kết nối đầy đủ API backend.

## Chạy

```bash
# Terminal 1 — backend (port 5000)
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm install && npm run dev
```

Mở http://localhost:5173

## Trang & tính năng

| Route | Mô tả | API |
|-------|--------|-----|
| `/` | Cửa hàng, lọc danh mục/giá/tìm kiếm | `GET /products`, `GET /categories` |
| `/products/:id` | Chi tiết, chọn size/màu, thêm giỏ | `GET /products/:id`, `POST /cart/add` |
| `/login`, `/register` | Đăng nhập / đăng ký | `POST /auth/*` |
| `/cart` | Giỏ hàng | `GET/PATCH/DELETE /cart` |
| `/checkout` | Thanh toán COD | `POST /orders/create` |
| `/order-success` | Xác nhận đặt hàng | — |
| `/profile` | Hồ sơ, cập nhật địa chỉ/SĐT | `GET/PATCH /users/profile` |
| `/admin` | Quản lý sản phẩm (ADMIN) | `GET/POST/PATCH/DELETE /products` |
| `/admin/products/new` | Thêm sản phẩm + biến thể | `POST /products` |
| `/admin/products/:id/edit` | Sửa sản phẩm | `PATCH /products/:id` |
| `/admin/categories` | Quản lý danh mục | `GET /categories`, `POST /categories/addCategory` |

## Cấu trúc

- `src/api/client.js` — gọi API
- `src/context/` — Auth, Cart (badge giỏ hàng)
- `src/pages/` — trang khách hàng
- `src/pages/admin/` — trang quản trị

## Admin

Tài khoản cần `role: ADMIN` trong database. Đăng nhập sẽ thấy menu **Quản trị**.
