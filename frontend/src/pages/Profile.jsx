import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usersApi } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Alert from "../components/Alert.jsx";
import Spinner from "../components/Spinner.jsx";

export default function Profile() {
  const { user, refreshProfile, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const profile = await refreshProfile();
        setName(profile.name || "");
        setAddress(profile.address || "");
        setPhone(profile.phone || "");
      } catch (err) {
        setError(err.message);
        if (user) {
          setName(user.name || "");
          setAddress(user.address || "");
          setPhone(user.phone || "");
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await usersApi.updateProfile({ name, address, phone });
      await refreshProfile();
      setSuccess("Cập nhật hồ sơ thành công!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container page-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container profile-page">
      <PageHeader
        title="Tài khoản"
        subtitle={user?.email}
      />

      <div className="profile-grid">
        <aside className="profile-sidebar card">
          <div className="profile-avatar">{name?.charAt(0)?.toUpperCase() || "?"}</div>
          <p className="profile-name">{name}</p>
          <p className="muted">{user?.email}</p>
          <p className="role-badge">{user?.role === "ADMIN" ? "Quản trị viên" : "Khách hàng"}</p>
          {isAdmin && (
            <Link to="/admin" className="btn btn-primary btn-block">
              Bảng quản trị
            </Link>
          )}
          <Link to="/cart" className="btn btn-ghost btn-block">
            Giỏ hàng
          </Link>
        </aside>

        <form className="profile-form card" onSubmit={handleSubmit}>
          <h2>Thông tin cá nhân</h2>
          <Alert message={error} onClose={() => setError("")} />
          <Alert type="success" message={success} onClose={() => setSuccess("")} />

          <label>
            Họ tên
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label>
            Địa chỉ
            <textarea
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Dùng khi thanh toán..."
            />
          </label>
          <label>
            Số điện thoại
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </form>
      </div>
    </div>
  );
}
