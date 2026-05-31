import { NavLink, Outlet } from "react-router-dom";
import PageHeader from "./PageHeader.jsx";

const links = [
  { to: "/admin", end: true, label: "Sản phẩm" },
  { to: "/admin/categories", label: "Danh mục" },
];

export default function AdminLayout() {
  return (
    <div className="container admin-shell">
      <PageHeader
        eyebrow="Admin"
        title="Bảng quản trị"
        subtitle="Quản lý sản phẩm và danh mục cửa hàng"
      />
      <nav className="admin-tabs" aria-label="Admin">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className="admin-tab">
            {l.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
