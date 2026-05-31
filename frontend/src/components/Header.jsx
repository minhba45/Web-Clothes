import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="logo">
          <span className="logo-mark">S</span>
          <span className="logo-text">StyleHub</span>
        </Link>

        <nav className="nav-links" aria-label="Chính">
          <NavLink to="/" end>
            Cửa hàng
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/cart" className="nav-cart">
                Giỏ hàng
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </NavLink>
              <NavLink to="/profile">Tài khoản</NavLink>
            </>
          )}
          {isAdmin && (
            <NavLink to="/admin" className="nav-admin">
              Quản trị
            </NavLink>
          )}
        </nav>

        <div className="header-actions">
          {isAuthenticated ? (
            <>
              <span className="user-greeting">{user?.name}</span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Đăng nhập
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
