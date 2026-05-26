function RestoreIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5.25a6.75 6.75 0 1 1-4.773 1.977L5.56 8.895A.75.75 0 1 1 4.5 7.835l2.79-2.79a.75.75 0 0 1 1.06 0l2.79 2.79a.75.75 0 0 1-1.06 1.06L8.508 7.333A5.25 5.25 0 1 0 12 6.75a.75.75 0 0 1 0-1.5Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 3.75h6a1.5 1.5 0 0 1 1.5 1.5V6H21v1.5h-1.125l-.82 10.205A2.25 2.25 0 0 1 16.813 19.5H7.187a2.25 2.25 0 0 1-2.242-1.795L4.125 7.5H3V6h4.5v-.75A1.5 1.5 0 0 1 9 3.75Zm1.5 2.25h3V5.25h-3V6Zm-3.37 1.5.798 9.93a.75.75 0 0 0 .747.57h7.25a.75.75 0 0 0 .747-.57l.798-9.93H7.13Zm2.12 1.875h1.5v6.75h-1.5v-6.75Zm4.5 0h1.5v6.75h-1.5v-6.75Z" />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11.379 2.259a1.5 1.5 0 0 1 1.242 0l6.75 3a1.5 1.5 0 0 1 .879 1.371v10.74a1.5 1.5 0 0 1-.879 1.371l-6.75 3a1.5 1.5 0 0 1-1.242 0l-6.75-3a1.5 1.5 0 0 1-.879-1.371V6.63a1.5 1.5 0 0 1 .879-1.371l6.75-3ZM6.321 7.295 12 9.82l5.679-2.526L12 4.77 6.321 7.295ZM5.25 8.58v8.79L11.25 20v-8.79L5.25 8.58Zm7.5 11.42 6-2.63V8.58l-6 2.63V20Z" />
    </svg>
  );
}

function formatDeletedAt(value) {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

export default function DeletedProductsPanel({
  products,
  searchTerm,
  onSearchChange,
  onBack,
  onOpen,
  onRestore,
  onPermanentDelete,
  loading,
  error,
}) {
  return (
    <section className="workspace-shell deleted-shell">
      <div className="deleted-header">
        <button type="button" className="ghost-button deleted-back" onClick={onBack}>
          Back To Products
        </button>
        <div className="deleted-copy">
          <h2>Deleted Items</h2>
          <p>View and restore deleted templates</p>
        </div>
        <div className="deleted-summary">
          <div className="deleted-summary-icon">
            <TrashIcon />
          </div>
          <span>{products.length} items</span>
        </div>
      </div>

      <div className="catalog-toolbar deleted-toolbar">
        <label className="searchbox deleted-searchbox">
          <span>Search deleted templates</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Type a deleted product name"
          />
        </label>
      </div>

      {loading ? <div className="stack-state">Loading deleted products...</div> : null}
      {error ? <div className="stack-state">{error}</div> : null}
      {!loading && !error && products.length === 0 ? <div className="stack-state">No deleted products found.</div> : null}

      <div className="deleted-list">
        {products.map((product) => (
          <article key={product.id} className="deleted-card">
            <button type="button" className="deleted-card-main" onClick={() => onOpen(product)}>
              <div className="deleted-card-icon">
                <PackageIcon />
              </div>
              <div className="deleted-card-copy">
                <h3>{product.product_name}</h3>
                <p>Deleted on {formatDeletedAt(product.deleted_at)}</p>
              </div>
            </button>
            <div className="deleted-card-actions">
              <button type="button" className="secondary-button deleted-action-restore" onClick={() => onRestore(product)}>
                <RestoreIcon />
                <span>Restore</span>
              </button>
              <button type="button" className="secondary-button deleted-action-danger" onClick={() => onPermanentDelete(product)}>
                <TrashIcon />
                <span>Delete Forever</span>
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
