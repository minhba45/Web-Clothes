import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <p className="footer-brand">StyleHub</p>
          <p className="muted footer-desc">
            Thời trang hiện đại — chọn size, màu và đặt hàng giao tận nơi (COD).
          </p>
        </div>
        <div>
          <p className="footer-heading">Mua sắm</p>
          <Link to="/">Sản phẩm</Link>
          <Link to="/cart">Giỏ hàng</Link>
        </div>
        <div>
          <p className="footer-heading">Tài khoản</p>
          <Link to="/login">Đăng nhập</Link>
          <Link to="/register">Đăng ký</Link>
          <Link to="/profile">Hồ sơ</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>© {new Date().getFullYear()} StyleHub. Dự án fullstack demo.</p>
      </div>
    </footer>
  );
}
