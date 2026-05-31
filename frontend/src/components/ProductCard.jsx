import { Link } from "react-router-dom";
import { formatPrice, productImage, totalStock } from "../utils/format.js";

export default function ProductCard({ product }) {
  const img = productImage(product);
  const inStock = totalStock(product.variants) > 0;

  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-card-link">
        <div className="product-card-image">
          {img ? (
            <img src={img} alt={product.name} loading="lazy" />
          ) : (
            <div className="image-placeholder">
              <span>{product.name?.charAt(0) || "?"}</span>
            </div>
          )}
          {!inStock && <span className="badge badge-sold">Hết hàng</span>}
        </div>
        <div className="product-card-body">
          {product.category?.name && (
            <p className="product-category">{product.category.name}</p>
          )}
          <h3 className="product-name">{product.name}</h3>
          <p className="product-price">{formatPrice(product.price)}</p>
        </div>
      </Link>
    </article>
  );
}
