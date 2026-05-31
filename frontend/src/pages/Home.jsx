import { useEffect, useState } from "react";
import { productsApi, categoriesApi } from "../api/client.js";
import ProductCard from "../components/ProductCard.jsx";
import Spinner from "../components/Spinner.jsx";
import Alert from "../components/Alert.jsx";

const emptyFilters = () => ({
  search: "",
  categoryId: "",
  minprice: "",
  maxprice: "",
});

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [draft, setDraft] = useState(emptyFilters);
  const [applied, setApplied] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const limit = 12;

  useEffect(() => {
    categoriesApi
      .list()
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await productsApi.list({
          search: applied.search.trim() || undefined,
          categoryId: applied.categoryId || undefined,
          minprice: applied.minprice || undefined,
          maxprice: applied.maxprice || undefined,
          page,
          limit,
        });
        if (!cancelled) {
          setProducts(res.data || []);
          setPagination(res.pagination || null);
        }
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
  }, [applied, page]);

  const updateDraft = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setApplied({ ...draft });
    setPage(1);
  };

  const resetFilters = () => {
    const empty = emptyFilters();
    setDraft(empty);
    setApplied(empty);
    setPage(1);
  };

  return (
    <>
      <section className="hero-banner">
        <div className="container hero-banner-inner">
          <div>
            <p className="hero-eyebrow">Bộ sưu tập 2026</p>
            <h1 className="hero-title">Thời trang cho mọi phong cách</h1>
            <p className="hero-sub">
              Chọn size, màu sắc phù hợp — giao hàng COD, thanh toán khi nhận.
            </p>
          </div>
        </div>
      </section>

      <div className="shop-page">
        <aside className="shop-filters" aria-label="Bộ lọc sản phẩm">
          <h2 className="filters-title">Bộ lọc</h2>
          <form onSubmit={handleApplyFilters} className="filters-form">
            <div className="filter-group">
              <label htmlFor="filter-search">Tìm kiếm</label>
              <input
                id="filter-search"
                type="search"
                placeholder="Tên sản phẩm..."
                value={draft.search}
                onChange={(e) => updateDraft("search", e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="filter-category">Danh mục</label>
              <select
                id="filter-category"
                value={draft.categoryId}
                onChange={(e) => updateDraft("categoryId", e.target.value)}
              >
                <option value="">Tất cả</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="filter-min">Giá từ (₫)</label>
              <input
                id="filter-min"
                type="number"
                min="0"
                placeholder="0"
                value={draft.minprice}
                onChange={(e) => updateDraft("minprice", e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="filter-max">Giá đến (₫)</label>
              <input
                id="filter-max"
                type="number"
                min="0"
                placeholder="Không giới hạn"
                value={draft.maxprice}
                onChange={(e) => updateDraft("maxprice", e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              Tìm kiếm
            </button>
          </form>

          <button
            type="button"
            className="btn btn-ghost btn-block filters-reset"
            onClick={resetFilters}
          >
            Xóa bộ lọc
          </button>
        </aside>

        <section className="shop-results" aria-label="Kết quả tìm kiếm">
          <div className="shop-results-header">
            <h2 className="shop-results-title">Sản phẩm</h2>
            <p className="muted shop-results-count">
              {loading
                ? "Đang tải..."
                : pagination
                  ? `${pagination.totalItem} kết quả`
                  : "0 kết quả"}
            </p>
          </div>

          <Alert message={error} onClose={() => setError("")} />

          <div className="shop-results-body">
            {loading ? (
              <div className="page-center">
                <Spinner />
              </div>
            ) : products.length === 0 ? (
              <p className="empty-state">Không tìm thấy sản phẩm phù hợp.</p>
            ) : (
              <>
                <div className="product-grid">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                {pagination && pagination.totalPages > 1 && (
                  <div className="pagination">
                    <button
                      type="button"
                      className="btn btn-ghost"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Trước
                    </button>
                    <span className="muted">
                      Trang {pagination.currentPage} / {pagination.totalPages}
                    </span>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      disabled={page >= pagination.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
