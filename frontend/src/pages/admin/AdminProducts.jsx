import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productsApi } from "../../api/client.js";
import { formatPrice, productImage } from "../../utils/format.js";
import Alert from "../../components/Alert.jsx";
import Spinner from "../../components/Spinner.jsx";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await productsApi.list({ limit: 100, page: 1 });
      setProducts(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Ngừng bán sản phẩm "${name}"?`)) return;
    setDeletingId(id);
    try {
      await productsApi.remove(id);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="admin-section">
      <div className="admin-toolbar">
        <p className="muted">{products.length} sản phẩm</p>
        <Link to="/admin/products/new" className="btn btn-primary btn-sm">
          + Thêm sản phẩm
        </Link>
      </div>
      <Alert message={error} onClose={() => setError("")} />

      <div className="admin-table-wrap card">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="col-thumb">Ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Danh mục</th>
              <th>Giá</th>
              <th className="col-num">Biến thể</th>
              <th className="col-actions">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const img = productImage(p);
              return (
                <tr key={p.id}>
                  <td className="col-thumb">
                    <div className="admin-thumb" title={img ? p.name : "Chưa có ảnh"}>
                      {img ? (
                        <img src={img} alt={p.name} />
                      ) : (
                        <span className="admin-thumb-placeholder">Chưa có ảnh</span>
                      )}
                    </div>
                  </td>
                  <td>{p.name}</td>
                  <td>{p.category?.name || "—"}</td>
                  <td>{formatPrice(p.price)}</td>
                  <td className="col-num">{p.variants?.length || 0}</td>
                  <td className="col-actions">
                    <div className="admin-actions-inner">
                      <Link
                        to={`/admin/products/${p.id}/edit`}
                        className="btn btn-ghost btn-sm"
                      >
                        Sửa
                      </Link>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm danger"
                        disabled={deletingId === p.id}
                        onClick={() => handleDelete(p.id, p.name)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="empty-state">Chưa có sản phẩm. Thêm sản phẩm mới.</p>
        )}
      </div>
    </div>
  );
}
