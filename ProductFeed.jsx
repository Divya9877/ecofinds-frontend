import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const LS_PRODUCTS = "eco_products_v1";

export default function ProductFeed({ auth }) {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("relevance"); // relevance | price-asc | price-desc | newest

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem(LS_PRODUCTS) || "[]");
    setProducts(all);
  }, []);

  // relevance score helper
  function relevanceScore(product, q) {
    if (!q) return 0;
    const t = (product.title || "").toLowerCase();
    const d = (product.description || "").toLowerCase();
    const ql = q.toLowerCase();
    let score = 0;
    if (t.includes(ql)) score += 2;
    if (d.includes(ql)) score += 1;
    return score;
  }

  // filter
  const filtered = products.filter((p) => {
    const matchesQuery =
      !query ||
      (p.title && p.title.toLowerCase().includes(query.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(query.toLowerCase()));
    const matchesCategory = !category || p.category === category;
    return matchesQuery && matchesCategory;
  });

  // sort
  const sorted = filtered.slice().sort((a, b) => {
    if (sortBy === "price-asc") return (a.price || 0) - (b.price || 0);
    if (sortBy === "price-desc") return (b.price || 0) - (a.price || 0);
    if (sortBy === "newest") {
      const ta = parseInt(a.id?.replace(/\D/g, "") || "0", 10);
      const tb = parseInt(b.id?.replace(/\D/g, "") || "0", 10);
      return tb - ta;
    }
    const ra = relevanceScore(a, query);
    const rb = relevanceScore(b, query);
    if (ra !== rb) return rb - ra;
    return (a.price || 0) - (b.price || 0);
  });

  const categories = ["", "Electronics", "Furniture", "Books", "Clothing", "Other"];

  // nice labels for sort
  const sortLabels = {
    relevance: "Relevance",
    "price-asc": "Price — Low to High",
    "price-desc": "Price — High to Low",
    newest: "Newest First"
  };

  return (
    <div className="container">
      <h2>Browse Products</h2>

      {/* Search + Filter + Sort controls */}
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 10
        }}
      >
        <input
          placeholder="Search by title or description..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ minWidth: 160 }}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c || "All Categories"}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ minWidth: 160 }}
        >
          <option value="relevance">Sort: Relevance</option>
          <option value="price-asc">Sort: Price — Low to High</option>
          <option value="price-desc">Sort: Price — High to Low</option>
          <option value="newest">Sort: Newest First</option>
        </select>
      </div>

      {/* ✅ Results summary */}
      <div style={{ marginBottom: 12, fontSize: 14, color: "#555" }}>
        Showing {sorted.length} {sorted.length === 1 ? "result" : "results"}
        {query || category ? " (filtered)" : ""}
        {" • Sorted by " + sortLabels[sortBy]}
      </div>

      {/* Products grid */}
      <div className="grid">
        {sorted.length ? (
          sorted.map((p) => (
            <div key={p.id} className="card product-card">
              <div className="img-placeholder">
                {p.image ? (
                  <img src={p.image} alt={p.title} />
                ) : (
                  <div className="placeholder-text">Image</div>
                )}
              </div>
              <div className="product-info">
                <Link to={`/product/${p.id}`} className="title">
                  {p.title}
                </Link>
                <div className="price">₹ {p.price}</div>
                <div className="meta">{p.category}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="card">No products match your search.</div>
        )}
      </div>
    </div>
  );
}
