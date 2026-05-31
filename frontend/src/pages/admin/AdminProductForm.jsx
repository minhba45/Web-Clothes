import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { productsApi, categoriesApi } from "../../api/client.js";
import Alert from "../../components/Alert.jsx";
import Spinner from "../../components/Spinner.jsx";

const emptyVariant = () => ({ size: "M", color: "Đen", stock: 0, sku: "" });

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [variants, setVariants] = useState([emptyVariant()]);

  useEffect(() => {
    categoriesApi
      .list()
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await productsApi.getById(id);
        if (cancelled) return;
        const p = res.data;
        setCategoryId(String(p.categoryId));
        setName(p.name || "");
        setDescription(p.description || "");
        setPrice(String(p.price));
        setImageUrl(p.imageUrl || "");
        setVariants(
          p.variants?.length
            ? p.variants.map((v) => ({
                id: v.id,
                size: v.size,
                color: v.color,
                stock: v.stock,
                sku: v.sku || "",
              }))
            : [emptyVariant()]
        );
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  const updateVariant = (index, field, value) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const addVariantRow = () => setVariants((prev) => [...prev, emptyVariant()]);

  const removeVariantRow = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      categoryId: Number(categoryId),
      name,
      description: description || null,
      price: Number(price),
      imageUrl: imageUrl || null,
      variants: variants.map((v) => ({
        ...(v.id ? { id: v.id } : {}),
        size: v.size,
        color: v.color,
        stock: Number(v.stock),
        sku: v.sku || null,
      })),
    };

    try {
      if (isEdit) {
        await productsApi.update(id, payload);
      } else {
        await productsApi.create(payload);
      }
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-form-page">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="admin-form-page">
      <div className="admin-form-centered">
        <header className="admin-form-header">
          <h2 className="admin-form-title">
            {isEdit ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
          </h2>
          <p className="muted">
            {isEdit
              ? "Cập nhật thông tin và biến thể sản phẩm"
              : "Điền thông tin sản phẩm và biến thể (size, màu, tồn kho)"}
          </p>
        </header>

        <Alert message={error} onClose={() => setError("")} />

        <form className="admin-form card" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>
            Danh mục *
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Chọn danh mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Giá (VNĐ) *
            <input
              type="number"
              required
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </label>
        </div>

        <label>
          Tên sản phẩm *
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label>
          Mô tả
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <label>
          URL hình ảnh
          <input
            type="url"
            placeholder="https://..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </label>

        <fieldset className="variants-fieldset">
          <legend>Biến thể (size / màu / tồn kho)</legend>
          {variants.map((v, i) => (
            <div key={v.id ?? i} className="variant-row">
              <input
                placeholder="Size"
                value={v.size}
                onChange={(e) => updateVariant(i, "size", e.target.value)}
                required
              />
              <input
                placeholder="Màu"
                value={v.color}
                onChange={(e) => updateVariant(i, "color", e.target.value)}
                required
              />
              <input
                type="number"
                min="0"
                placeholder="Tồn"
                value={v.stock}
                onChange={(e) => updateVariant(i, "stock", e.target.value)}
                required
              />
              <input
                placeholder="SKU"
                value={v.sku}
                onChange={(e) => updateVariant(i, "sku", e.target.value)}
              />
              {variants.length > 1 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => removeVariantRow(i)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn btn-ghost btn-sm" onClick={addVariantRow}>
            + Thêm biến thể
          </button>
        </fieldset>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo sản phẩm"}
          </button>
          <Link to="/admin" className="btn btn-ghost">
            Hủy
          </Link>
        </div>
        </form>
      </div>
    </div>
  );
}
