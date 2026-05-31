import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cartApi, ordersApi } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
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

export default function Checkout() {
  const { user, refreshProfile } = useAuth();
  const { refreshCart } = useCart();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [shippingAddress, setShippingAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const profile = await refreshProfile().catch(() => user);
        const cartRes = await cartApi.get();
        setItems((cartRes.data?.items || []).map(normalizeCartItem));
        if (profile?.address) setShippingAddress(profile.address);
        if (profile?.phone) setPhoneNumber(profile.phone);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const total = computeCartTotal(items);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      setError("Giỏ hàng trống");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const res = await ordersApi.create(
        shippingAddress.trim(),
        phoneNumber.trim()
      );
      await refreshCart();
      navigate("/order-success", {
        state: { order: res.data, total: formatPrice(total) },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
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
    <div className="container checkout-page">
      <PageHeader
        title="Thanh toán"
        subtitle="Thanh toán khi nhận hàng (COD)"
      />
      <Alert message={error} onClose={() => setError("")} />

      {items.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Không có sản phẩm"
          description="Giỏ hàng trống, không thể đặt hàng."
          action={
            <Link to="/" className="btn btn-primary">
              Mua sắm ngay
            </Link>
          }
        />
      ) : (
        <div className="checkout-grid">
          <form className="checkout-form card" onSubmit={handleSubmit}>
            <h2>Thông tin giao hàng</h2>
            <label>
              Địa chỉ
              <textarea
                required
                rows={3}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Số nhà, đường, quận, thành phố..."
              />
            </label>
            <label>
              Số điện thoại
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="09xxxxxxxx"
              />
            </label>
            <p className="payment-note">
              💵 Phương thức: <strong>COD</strong> — thanh toán khi nhận hàng
            </p>
            <button
              type="submit"
              className="btn btn-primary btn-lg btn-block"
              disabled={submitting}
            >
              {submitting ? "Đang đặt hàng..." : "Xác nhận đặt hàng"}
            </button>
          </form>

          <aside className="checkout-summary card">
            <h2>Đơn hàng ({items.length})</h2>
            <ul className="checkout-items">
              {items.map((item) => (
                <li key={item.variantId}>
                  <span>
                    {item.productName} × {item.quantity}
                  </span>
                  <span>{formatPrice(item.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <div className="summary-row total">
              <span>Tổng</span>
              <strong>{formatPrice(total)}</strong>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
