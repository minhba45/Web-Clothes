import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cartApi } from "../api/client.js";
import { useCart } from "../context/CartContext.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Alert from "../components/Alert.jsx";
import Spinner from "../components/Spinner.jsx";
import EmptyState from "../components/EmptyState.jsx";
import {
  normalizeCartItem,
  computeCartTotal,
  formatPrice,
} from "../utils/cart.js";

export default function Cart() {
  const { refreshCart } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const loadCart = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await cartApi.get();
      const rawItems = res.data?.items || [];
      setItems(rawItems.map(normalizeCartItem));
      await refreshCart();
    } catch (err) {
      setError(err.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [refreshCart]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const total = computeCartTotal(items);

  const updateQuantity = async (variantId, quantity) => {
    setUpdatingId(variantId);
    setError("");
    try {
      await cartApi.update(variantId, quantity);
      await loadCart();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const removeItem = async (variantId) => {
    setUpdatingId(variantId);
    setError("");
    try {
      await cartApi.remove(variantId);
      await loadCart();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
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
    <div className="container cart-page">
      <PageHeader title="Giỏ hàng" subtitle="Kiểm tra sản phẩm trước khi thanh toán" />
      <Alert message={error} onClose={() => setError("")} />

      {items.length === 0 ? (
        <EmptyState
          icon="🛒"
          title="Giỏ hàng trống"
          description="Hãy thêm sản phẩm yêu thích từ cửa hàng."
          action={
            <Link to="/" className="btn btn-primary">
              Tiếp tục mua sắm
            </Link>
          }
        />
      ) : (
        <div className="cart-layout">
          <ul className="cart-list">
            {items.map((item) => (
              <li key={item.id ?? item.variantId} className="cart-item">
                <Link to={`/products/${item.productId}`} className="cart-item-image">
                  {item.productImage ? (
                    <img src={item.productImage} alt={item.productName} />
                  ) : (
                    <div className="image-placeholder small">
                      <span>{item.productName?.charAt(0)}</span>
                    </div>
                  )}
                </Link>
                <div className="cart-item-info">
                  <Link to={`/products/${item.productId}`}>
                    <h3>{item.productName}</h3>
                  </Link>
                  <p className="muted">
                    {item.size} · {item.color}
                  </p>
                  <p className="product-price">{formatPrice(item.unitPrice)}</p>
                </div>
                <div className="cart-item-actions">
                  <div className="qty-control">
                    <button
                      type="button"
                      disabled={updatingId === item.variantId || item.quantity <= 1}
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      disabled={
                        updatingId === item.variantId || item.quantity >= item.stock
                      }
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    disabled={updatingId === item.variantId}
                    onClick={() => removeItem(item.variantId)}
                  >
                    Xóa
                  </button>
                </div>
                <p className="cart-line-total">{formatPrice(item.lineTotal)}</p>
              </li>
            ))}
          </ul>

          <aside className="cart-summary">
            <h2>Tóm tắt</h2>
            <div className="summary-row">
              <span>Tạm tính</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="summary-row">
              <span>Phí ship</span>
              <span className="muted">Miễn phí (demo)</span>
            </div>
            <div className="summary-row total">
              <span>Tổng</span>
              <strong>{formatPrice(total)}</strong>
            </div>
            <Link to="/checkout" className="btn btn-primary btn-lg btn-block">
              Thanh toán
            </Link>
            <Link to="/" className="btn btn-ghost btn-block">
              Tiếp tục mua
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
