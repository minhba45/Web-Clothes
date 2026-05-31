import { useEffect, useState } from "react";
import { categoriesApi } from "../../api/client.js";
import Alert from "../../components/Alert.jsx";
import Spinner from "../../components/Spinner.jsx";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await categoriesApi.list();
      setCategories(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await categoriesApi.create({ name, description: description || null });
      setName("");
      setDescription("");
      setSuccess("Đã thêm danh mục!");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="admin-section">
      <div className="admin-grid-2">
        <form className="admin-form card" onSubmit={handleSubmit}>
          <h2>Thêm danh mục</h2>
          <Alert message={error} onClose={() => setError("")} />
          <Alert type="success" message={success} onClose={() => setSuccess("")} />
          <label>
            Tên *
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label>
            Mô tả
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Đang lưu..." : "Thêm"}
          </button>
        </form>

        <div className="card">
          <h2>Danh sách ({categories.length})</h2>
          <ul className="category-list">
            {categories.map((c) => (
              <li key={c.id}>
                <strong>{c.name}</strong>
                {c.description && <span className="muted"> — {c.description}</span>}
              </li>
            ))}
          </ul>
          {categories.length === 0 && (
            <p className="muted">Chưa có danh mục nào.</p>
          )}
        </div>
      </div>
    </div>
  );
}
