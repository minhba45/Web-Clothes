import { Link, useLocation } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import { formatPrice } from "../utils/format.js";

export default function OrderSuccess() {
  const { state } = useLocation();
  const order = state?.order;

  return (
    <div className="container order-success-page">
      <div className="success-card card">
        <div className="success-icon" aria-hidden>
          ✓
        </div>
        <PageHeader
          title="Đặt hàng thành công!"
          subtitle="Cảm ơn bạn đã mua sắm tại StyleHub"
        />
        {order && (
          <dl className="order-meta">
            <div>
              <dt>Mã đơn</dt>
              <dd>#{order.id}</dd>
            </div>
            <div>
              <dt>Tổng tiền</dt>
              <dd>{formatPrice(order.totalAmount)}</dd>
            </div>
            <div>
              <dt>Trạng thái</dt>
              <dd>
                <span className="status-pill">{order.status}</span>
              </dd>
            </div>
            <div>
              <dt>Địa chỉ</dt>
              <dd>{order.shippingAddress}</dd>
            </div>
          </dl>
        )}
        <div className="success-actions">
          <Link to="/" className="btn btn-primary">
            Tiếp tục mua sắm
          </Link>
          <Link to="/profile" className="btn btn-ghost">
            Tài khoản
          </Link>
        </div>
      </div>
    </div>
  );
}
