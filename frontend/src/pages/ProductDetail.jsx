import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { productsApi, cartApi } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { formatPrice, productImage, totalStock } from "../utils/format.js";
import Spinner from "../components/Spinner.jsx";
import Alert from "../components/Alert.jsx";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { refreshCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [adding, setAdding] = useState(false);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await productsApi.getById(id);
        if (!cancelled) setProduct(res.data);
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
  }, [id]);

  const variants = product?.variants || [];
  const sizes = useMemo(() => [...new Set(variants.map((v) => v.size))], [variants]);
  const colors = useMemo(() => {
    const filtered = selectedSize
      ? variants.filter((v) => v.size === selectedSize)
      : variants;
    return [...new Set(filtered.map((v) => v.color))];
  }, [variants, selectedSize]);

  const selectedVariant = useMemo(
    () =>
      variants.find(
        (v) => v.size === selectedSize && v.color === selectedColor
      ),
    [variants, selectedSize, selectedColor]
  );

  useEffect(() => {
    if (sizes.length) setSelectedSize(sizes[0]);
  }, [sizes]);

  useEffect(() => {
    if (colors.length) setSelectedColor(colors[0]);
  }, [colors]);

  const maxQty = selectedVariant?.stock ?? 1;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/products/${id}` } });
      return;
    }
    if (!selectedVariant) {
      setError("Vui lòng chọn size và màu");
      return;
    }
    if (selectedVariant.stock < 1) {
      setError("Biến thể này đã hết hàng");
      return;
    }

    setAdding(true);
    setError("");
    setSuccess("");
    try {
      await cartApi.add(selectedVariant.id, quantity);
      await refreshCart();
      setSuccess("Đã thêm vào giỏ hàng!");
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="container page-center">
        <Spinner />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container page-center">
        <Alert message={error || "Không tìm thấy sản phẩm"} />
        <Link to="/" className="btn btn-primary">
          Về cửa hàng
        </Link>
      </div>
    );
  }

  const img = productImage(product);
  const inStock = totalStock(variants) > 0;

  return (
    <div className="container product-detail">
      <nav className="breadcrumb">
        <Link to="/">Cửa hàng</Link>
        <span>/</span>
        <span>{product.name}</span>
      </nav>

      <div className="product-detail-grid">
        <div className="product-detail-image">
          {img ? (
            <img src={img} alt={product.name} />
          ) : (
            <div className="image-placeholder large">
              <span>{product.name?.charAt(0)}</span>
            </div>
          )}
        </div>

        <div className="product-detail-info">
          {product.category?.name && (
            <p className="product-category-tag">{product.category.name}</p>
          )}
          <h1>{product.name}</h1>
          <p className="product-price large">{formatPrice(product.price)}</p>
          {product.description && (
            <p className="product-description">{product.description}</p>
          )}

          {variants.length === 0 ? (
            <p className="muted">Sản phẩm chưa có phân loại size/màu.</p>
          ) : !inStock ? (
            <span className="badge badge-sold inline">Hết hàng</span>
          ) : (
            <>
              <div className="option-group">
                <label>Size</label>
                <div className="option-pills">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`pill ${selectedSize === size ? "active" : ""}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="option-group">
                <label>Màu</label>
                <div className="option-pills">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`pill ${selectedColor === color ? "active" : ""}`}
                      onClick={() => setSelectedColor(color)}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {selectedVariant && (
                <p className="stock-info">Còn {selectedVariant.stock} sản phẩm</p>
              )}

              <div className="quantity-row">
                <label htmlFor="qty">Số lượng</label>
                <input
                  id="qty"
                  type="number"
                  min={1}
                  max={maxQty}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.min(maxQty, Math.max(1, Number(e.target.value) || 1))
                    )
                  }
                />
              </div>

              <Alert message={error} onClose={() => setError("")} />
              <Alert type="success" message={success} onClose={() => setSuccess("")} />

              <div className="detail-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  disabled={adding || !selectedVariant || selectedVariant.stock < 1}
                  onClick={handleAddToCart}
                >
                  {adding ? "Đang thêm..." : "Thêm vào giỏ"}
                </button>
                {isAuthenticated && (
                  <Link to="/cart" className="btn btn-ghost btn-lg">
                    Xem giỏ
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
