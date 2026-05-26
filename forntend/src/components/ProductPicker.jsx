function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 3.75h6a1.5 1.5 0 0 1 1.5 1.5V6H21v1.5h-1.125l-.82 10.205A2.25 2.25 0 0 1 16.813 19.5H7.187a2.25 2.25 0 0 1-2.242-1.795L4.125 7.5H3V6h4.5v-.75A1.5 1.5 0 0 1 9 3.75Zm1.5 2.25h3V5.25h-3V6Zm-3.37 1.5.798 9.93a.75.75 0 0 0 .747.57h7.25a.75.75 0 0 0 .747-.57l.798-9.93H7.13Zm2.12 1.875h1.5v6.75h-1.5v-6.75Zm4.5 0h1.5v6.75h-1.5v-6.75Z" />
    </svg>
  );
}

function ProductCard({ product, onSelect, onDelete, active, index, showDeleteButtons }) {
  return (
    <article className={`product-card-shell ${active ? "active" : ""}`}>
      <div className={`product-card ${active ? "active" : ""}`}>
        <div className="product-card-top">
          <span className="product-card-id">{String(index + 1).padStart(2, "0")}</span>
          {showDeleteButtons ? (
            <button
              type="button"
              className="icon-button icon-button-danger product-card-delete"
              onClick={() => onDelete(product)}
              aria-label={`Remove ${product.product_name}`}
              title="Remove product"
            >
              <TrashIcon />
            </button>
          ) : null}
        </div>
        <button
          type="button"
          className="product-card-main"
          onClick={() => onSelect(product)}
        >
          <strong>{product.product_name}</strong>
          <span className="product-card-arrow">Open Record</span>
        </button>
      </div>
    </article>
  );
}

export default function ProductPicker({
  products,
  searchTerm,
  onSearchChange,
  onSelect,
  onDelete,
  onPrimaryAction,
  onSecondaryAction,
  primaryActionLabel,
  secondaryActionLabel,
  selectedProductId,
  loading,
  error,
  metaLabel,
  showDeleteButtons = true,
}) {
  return (
    <section className="catalog-shell">
      <div className="catalog-toolbar">
        <label className="searchbox">
          <span>Search product names</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Type a product name"
          />
        </label>
        <div className="toolbar-actions">
          {onPrimaryAction ? (
            <button type="button" className="primary-button toolbar-button" onClick={onPrimaryAction}>
              {primaryActionLabel}
            </button>
          ) : null}
          {onSecondaryAction ? (
            <button type="button" className="secondary-button toolbar-button toolbar-button-secondary" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </button>
          ) : null}
        </div>
      </div>

      {loading ? <div className="stack-state">Loading products...</div> : null}
      {error ? <div className="stack-state">{error}</div> : null}
      {!loading && !error && products.length === 0 ? <div className="stack-state">No products found.</div> : null}

      <div className="catalog-meta">
        <p>{metaLabel || `${products.length} products available`}</p>
      </div>

      <div className="product-grid">
        {products.map((product, index) => (
          <div key={product.id} className="reveal-tile" style={{ animationDelay: `${index * 40}ms` }}>
            <ProductCard
              product={product}
              onSelect={onSelect}
              onDelete={onDelete}
              active={selectedProductId === product.id}
              index={index}
              showDeleteButtons={showDeleteButtons}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
