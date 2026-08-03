import { useEffect, useState } from "react";
import { Navigate, Routes, Route, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  createProduct,
  clearStoredAuthToken,
  deleteProduct,
  fetchCurrentUser,
  fetchDeletedProduct,
  fetchDeletedProducts,
  fetchProduct,
  fetchProducts,
  getStoredAuthToken,
  loginUser,
  permanentlyDeleteProduct,
  registerUser,
  restoreProduct,
  setStoredAuthToken,
  storeQr,
  updateProduct,
  verifyReferral,
} from "./api";
import DeletedProductsPanel from "./components/DeletedProductsPanel";
import ProductEditor from "./components/ProductEditor";
import ProductPicker from "./components/ProductPicker";
import ProductWorkspace from "./components/ProductWorkspace";
import logoUrl from "./sribio.jpeg";

const COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME || "";
const PROJECT_NAME = "Sri BioAesthetics Pvt. Ltd.";

function AppLayout({ children, user, onLogout }) {
  useEffect(() => {
    document.title = PROJECT_NAME;

    let favicon = document.querySelector("link[rel='icon']");
    if (!favicon) {
      favicon = document.createElement("link");
      favicon.setAttribute("rel", "icon");
      document.head.appendChild(favicon);
    }

    favicon.setAttribute("href", logoUrl);
  }, []);

  return (
    <div className="app-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <header className="app-header">
        <div className="brand-block">
          <div className="brand-mark">
            <img src={logoUrl} alt={`${PROJECT_NAME} logo`} />
          </div>
          <div>
            <p className="brand-kicker">Product QR Information System</p>
            <span className="brand-name">{PROJECT_NAME}</span>
          </div>
        </div>
        {user ? (
          <div className="header-actions">
            <span className="user-chip">{user.first_name} {user.last_name}</span>
            <button type="button" className="secondary-button logout-button" onClick={onLogout}>
              Logout
            </button>
          </div>
        ) : null}
      </header>

      {children}

      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.</p>
      </footer>
    </div>
  );
}

function ProtectedRoute({ authReady, user, children }) {
  if (!authReady) {
    return (
      <AppLayout>
        <div className="overlay-loader">
          <div className="loader-card">
            <div className="loader-orbit" />
            <p>Checking session...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AuthPage({ mode, onAuthenticated }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isRegisterMode = mode === "register";
  const [referralId, setReferralId] = useState("");
  const [referralAllowed, setReferralAllowed] = useState(!isRegisterMode);
  const [formState, setFormState] = useState({
    identifier: "",
    password: "",
    first_name: "",
    last_name: "",
    employee_id: "",
    email: "",
    phone_number: "",
    joining_date: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const successMessage = !isRegisterMode ? location.state?.message || "" : "";

  useEffect(() => {
    if (mode === "login") {
      clearStoredAuthToken();
      onAuthenticated(null);
    }

    setReferralId("");
    setReferralAllowed(mode !== "register");
    setError("");
    setLoading(false);
    setFormState({
      identifier: "",
      password: "",
      first_name: "",
      last_name: "",
      employee_id: "",
      email: "",
      phone_number: "",
      joining_date: "",
    });
  }, [mode, onAuthenticated]);

  function updateField(field, value) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleReferralSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await verifyReferral(referralId);
      if (!result.allowed) {
        setError("Invalid referral ID.");
        return;
      }
      setReferralAllowed(true);
    } catch (referralError) {
      setError(referralError instanceof Error ? referralError.message : "Unable to verify referral ID.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    if (isRegisterMode && !referralAllowed) {
      setError("Please verify the referral ID before registration.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isRegisterMode) {
        await registerUser({
          referral_id: referralId,
          first_name: formState.first_name,
          last_name: formState.last_name,
          employee_id: formState.employee_id,
          password: formState.password,
          email: formState.email,
          phone_number: formState.phone_number,
          joining_date: formState.joining_date,
        });
        clearStoredAuthToken();
        onAuthenticated(null);
        navigate("/login", {
          replace: true,
          state: { message: "Registration successful. Please login with your credentials." },
        });
        return;
      }

      const response = await loginUser(formState.identifier, formState.password);
      setStoredAuthToken(response.access_token);
      onAuthenticated(response.user);
      navigate("/", { replace: true });
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <section className="auth-shell">
        <div className="auth-panel">
          <p className="brand-kicker">Secure Access</p>
          <h1>{isRegisterMode ? "Register User" : "Login"}</h1>
          <p className="auth-copy">
            {isRegisterMode ? "Enter the referral ID to unlock employee registration." : "Use employee ID, phone number, or email to continue."}
          </p>

          {error ? <div className="stack-state auth-error">{error}</div> : null}
          {successMessage ? <div className="stack-state auth-success">{successMessage}</div> : null}

          {isRegisterMode && !referralAllowed ? (
            <form className="auth-form" onSubmit={handleReferralSubmit}>
              <label className="editor-field">
                <span className="document-label">Referral ID</span>
                <input
                  type="password"
                  value={referralId}
                  onChange={(event) => setReferralId(event.target.value)}
                  required
                />
              </label>
              <button type="submit" className="primary-button" disabled={loading}>
                {loading ? "Verifying..." : "Continue To Register"}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleAuthSubmit}>
              {isRegisterMode ? (
                <>
                  <div className="auth-grid">
                    <label className="editor-field">
                      <span className="document-label">First Name</span>
                      <input type="text" value={formState.first_name} onChange={(event) => updateField("first_name", event.target.value)} required />
                    </label>
                    <label className="editor-field">
                      <span className="document-label">Last Name</span>
                      <input type="text" value={formState.last_name} onChange={(event) => updateField("last_name", event.target.value)} required />
                    </label>
                  </div>
                  <label className="editor-field">
                    <span className="document-label">Employee ID</span>
                    <input type="text" value={formState.employee_id} onChange={(event) => updateField("employee_id", event.target.value)} required />
                  </label>
                  <label className="editor-field">
                    <span className="document-label">Email</span>
                    <input type="email" value={formState.email} onChange={(event) => updateField("email", event.target.value)} required />
                  </label>
                  <label className="editor-field">
                    <span className="document-label">Phone Number</span>
                    <input type="tel" value={formState.phone_number} onChange={(event) => updateField("phone_number", event.target.value)} required />
                  </label>
                  <label className="editor-field">
                    <span className="document-label">Joining Date</span>
                    <input type="date" value={formState.joining_date} onChange={(event) => updateField("joining_date", event.target.value)} required />
                  </label>
                </>
              ) : (
                <label className="editor-field">
                  <span className="document-label">Employee ID / Phone / Email</span>
                  <input type="text" value={formState.identifier} onChange={(event) => updateField("identifier", event.target.value)} required />
                </label>
              )}

              <label className="editor-field">
                <span className="document-label">Password</span>
                <input type="password" value={formState.password} onChange={(event) => updateField("password", event.target.value)} minLength={isRegisterMode ? 8 : 1} required />
              </label>
              <button type="submit" className="primary-button" disabled={loading}>
                {loading ? "Please wait..." : isRegisterMode ? "Create Account" : "Login"}
              </button>
            </form>
          )}

          <button
            type="button"
            className="ghost-button auth-switch"
            onClick={() => navigate(isRegisterMode ? "/login" : "/register")}
          >
            {isRegisterMode ? "Already registered? Login" : "Register New User"}
          </button>
        </div>
      </section>
    </AppLayout>
  );
}

function CatalogPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");

  useEffect(() => {
    void loadCatalog();
  }, []);

  useEffect(() => {
    const normalized = searchTerm.trim().toLowerCase();
    setFilteredProducts(
      normalized
        ? products.filter((product) => product.product_name.toLowerCase().includes(normalized))
        : products,
    );
  }, [products, searchTerm]);

  async function loadCatalog() {
    setCatalogLoading(true);
    setCatalogError("");

    try {
      const productList = await fetchProducts();
      setProducts(productList);
      setFilteredProducts(productList);
    } catch (error) {
      setCatalogError(error instanceof Error ? error.message : "Unable to load products.");
    } finally {
      setCatalogLoading(false);
    }
  }

  async function handleDeleteProduct(product) {
    const shouldDelete = window.confirm(`Remove ${product.product_name} from the app view?`);
    if (!shouldDelete) {
      return;
    }

    try {
      await deleteProduct(product.id);
      await loadCatalog();
    } catch (error) {
      setCatalogError(error instanceof Error ? error.message : "Unable to remove product.");
    }
  }

  return (
    <AppLayout user={user} onLogout={onLogout}>
      <ProductPicker
        products={filteredProducts}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSelect={(product) => navigate(`/product/${product.id}`, { state: { fromCatalog: true } })}
        onDelete={(product) => void handleDeleteProduct(product)}
        onPrimaryAction={() => navigate("/product/new", { state: { fromCatalog: true } })}
        onSecondaryAction={() => navigate("/deleted-products", { state: { fromCatalog: true } })}
        primaryActionLabel="Add New Template"
        secondaryActionLabel="View Deleted Items"
        selectedProductId={null}
        loading={catalogLoading}
        error={catalogError}
        metaLabel={`${products.length} products available`}
        showDeleteButtons
      />
    </AppLayout>
  );
}

function DeletedProductsPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadDeletedProducts();
  }, []);

  useEffect(() => {
    const normalized = searchTerm.trim().toLowerCase();
    setFilteredProducts(
      normalized
        ? products.filter((product) => product.product_name.toLowerCase().includes(normalized))
        : products,
    );
  }, [products, searchTerm]);

  async function loadDeletedProducts() {
    setLoading(true);
    setError("");

    try {
      const productList = await fetchDeletedProducts();
      setProducts(productList);
      setFilteredProducts(productList);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load deleted products.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRestoreProduct(product) {
    try {
      await restoreProduct(product.id);
      await loadDeletedProducts();
    } catch (restoreError) {
      setError(restoreError instanceof Error ? restoreError.message : "Unable to restore product.");
    }
  }

  async function handlePermanentDelete(product) {
    const shouldDelete = window.confirm(`Permanently delete ${product.product_name}? This cannot be undone.`);
    if (!shouldDelete) {
      return;
    }

    try {
      await permanentlyDeleteProduct(product.id);
      await loadDeletedProducts();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to permanently delete product.");
    }
  }

  return (
    <AppLayout user={user} onLogout={onLogout}>
      <DeletedProductsPanel
        products={filteredProducts}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onBack={() => navigate("/")}
        onOpen={(product) => navigate(`/deleted-products/${product.id}`, { state: { fromDeletedList: true } })}
        onRestore={(product) => void handleRestoreProduct(product)}
        onPermanentDelete={(product) => void handlePermanentDelete(product)}
        loading={loading}
        error={error}
      />
    </AppLayout>
  );
}

function ProductPage({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { productId } = useParams();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [detailError, setDetailError] = useState("");
  const [refreshingQr, setRefreshingQr] = useState(false);
  const showBackButton = location.state?.fromCatalog === true;

  useEffect(() => {
    void loadProduct();
  }, [productId]);

  async function loadProduct() {
    setDetailLoading(true);
    setDetailError("");

    try {
      const productPayload = await fetchProduct(productId);
      setSelectedProduct(productPayload);
    } catch (error) {
      setDetailError(error instanceof Error ? error.message : "Unable to open product.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function refreshQr() {
    if (!selectedProduct?.id) {
      return { qrPayload: "", shareUrl: "" };
    }

    setRefreshingQr(true);

    try {
      const qrRecord = await storeQr(selectedProduct.id);
      const shareUrl = `${window.location.origin}${window.location.pathname}${window.location.search}#/product/${selectedProduct.id}`;

      setSelectedProduct((current) =>
        current
          ? {
              ...current,
              qr: {
                ...current.qr,
                qr_payload: qrRecord.qr_payload,
              },
            }
          : current,
      );

      return {
        qrPayload: qrRecord.qr_payload,
        shareUrl,
      };
    } catch (error) {
      setDetailError(error instanceof Error ? error.message : "Unable to refresh QR.");
      return { qrPayload: "", shareUrl: "" };
    } finally {
      setRefreshingQr(false);
    }
  }

  async function handleDeleteProduct() {
    if (!selectedProduct) {
      return;
    }

    const shouldDelete = window.confirm(`Remove ${selectedProduct.product_name} from the app view?`);
    if (!shouldDelete) {
      return;
    }

    try {
      await deleteProduct(selectedProduct.id);
      navigate("/");
    } catch (error) {
      setDetailError(error instanceof Error ? error.message : "Unable to remove product.");
    }
  }

  return (
    <AppLayout user={user} onLogout={onLogout}>
      {detailLoading ? (
        <div className="overlay-loader">
          <div className="loader-card">
            <div className="loader-orbit" />
            <p>Opening product record...</p>
          </div>
        </div>
      ) : null}

      {detailError && !detailLoading ? <div className="stack-state detail-error">{detailError}</div> : null}

      {!detailLoading && !detailError && selectedProduct ? (
        <ProductWorkspace
          product={selectedProduct}
          showBackButton={showBackButton}
          showManagementActions={showBackButton}
          onBack={() => navigate("/")}
          onEdit={() => navigate(`/product/${selectedProduct.id}/edit`, { state: { fromDetail: true } })}
          onCreateTemplate={() => navigate("/product/new", { state: { fromDetail: true } })}
          onDelete={() => void handleDeleteProduct()}
          onRefreshQr={refreshQr}
          refreshingQr={refreshingQr}
        />
      ) : null}
    </AppLayout>
  );
}

function DeletedProductPage({ user, onLogout }) {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
    void loadProduct();
  }, [productId]);

  async function loadProduct() {
    setDetailLoading(true);
    setDetailError("");

    try {
      const productPayload = await fetchDeletedProduct(productId);
      setSelectedProduct(productPayload);
    } catch (error) {
      setDetailError(error instanceof Error ? error.message : "Unable to open deleted product.");
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <AppLayout user={user} onLogout={onLogout}>
      {detailLoading ? (
        <div className="overlay-loader">
          <div className="loader-card">
            <div className="loader-orbit" />
            <p>Opening product record...</p>
          </div>
        </div>
      ) : null}

      {detailError && !detailLoading ? <div className="stack-state detail-error">{detailError}</div> : null}

      {!detailLoading && !detailError && selectedProduct ? (
        <ProductWorkspace
          product={selectedProduct}
          showBackButton
          showManagementActions={false}
          onBack={() => navigate("/deleted-products")}
          onEdit={() => {}}
          onCreateTemplate={() => {}}
          onDelete={() => {}}
          onRefreshQr={async () => ({ qrPayload: "", shareUrl: "" })}
          refreshingQr={false}
        />
      ) : null}
    </AppLayout>
  );
}

function ProductEditorPage({ mode, user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(mode === "edit");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode !== "edit" || !productId) {
      setProduct(null);
      setLoading(false);
      return;
    }

    void loadProduct();
  }, [mode, productId]);

  async function loadProduct() {
    setLoading(true);
    setError("");

    try {
      const productPayload = await fetchProduct(productId);
      setProduct(productPayload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load product for editing.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(formState) {
    setSaving(true);
    setError("");

    try {
      const savedProduct =
        mode === "create"
          ? await createProduct(formState)
          : await updateProduct(productId, formState);

      navigate(`/product/${savedProduct.id}`, {
        state: { fromCatalog: location.state?.fromCatalog === true || location.state?.fromDetail === true },
      });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save product.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (mode !== "edit" || !productId || !product) {
      return;
    }

    const shouldDelete = window.confirm(`Remove ${product.product_name} from the app view?`);
    if (!shouldDelete) {
      return;
    }

    try {
      await deleteProduct(productId);
      navigate("/");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to remove product.");
    }
  }

  function handleCancel() {
    if (mode === "edit" && productId) {
      navigate(`/product/${productId}`, { state: { fromCatalog: true } });
      return;
    }

    navigate("/");
  }

  return (
    <AppLayout user={user} onLogout={onLogout}>
      {loading ? (
        <div className="overlay-loader">
          <div className="loader-card">
            <div className="loader-orbit" />
            <p>Preparing editor...</p>
          </div>
        </div>
      ) : null}

      {!loading ? (
        <ProductEditor
          mode={mode}
          product={product}
          saving={saving}
          error={error}
          onCancel={handleCancel}
          onDelete={mode === "edit" ? () => void handleDelete() : undefined}
          onSubmit={handleSubmit}
        />
      ) : null}
    </AppLayout>
  );
}

export default function App() {
  const navigate = useNavigate();
  const [authReady, setAuthReady] = useState(false);
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    async function restoreSession() {
      const token = getStoredAuthToken();
      if (!token) {
        clearStoredAuthToken();
        setAuthReady(true);
        return;
      }

      try {
        const currentUser = await fetchCurrentUser();
        setAuthUser(currentUser);
      } catch {
        clearStoredAuthToken();
        setAuthUser(null);
      } finally {
        setAuthReady(true);
      }
    }

    void restoreSession();
  }, []);

  function handleLogout() {
    clearStoredAuthToken();
    setAuthUser(null);
    navigate("/login", { replace: true });
  }

  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" onAuthenticated={setAuthUser} />} />
      <Route path="/register" element={<AuthPage mode="register" onAuthenticated={setAuthUser} />} />
      <Route path="/" element={<ProtectedRoute authReady={authReady} user={authUser}><CatalogPage user={authUser} onLogout={handleLogout} /></ProtectedRoute>} />
      <Route path="/deleted-products" element={<ProtectedRoute authReady={authReady} user={authUser}><DeletedProductsPage user={authUser} onLogout={handleLogout} /></ProtectedRoute>} />
      <Route path="/deleted-products/:productId" element={<ProtectedRoute authReady={authReady} user={authUser}><DeletedProductPage user={authUser} onLogout={handleLogout} /></ProtectedRoute>} />
      <Route path="/product/new" element={<ProtectedRoute authReady={authReady} user={authUser}><ProductEditorPage mode="create" user={authUser} onLogout={handleLogout} /></ProtectedRoute>} />
      <Route path="/product/:productId/edit" element={<ProtectedRoute authReady={authReady} user={authUser}><ProductEditorPage mode="edit" user={authUser} onLogout={handleLogout} /></ProtectedRoute>} />
      <Route path="/product/:productId" element={<ProductPage user={authUser} onLogout={handleLogout} />} />
    </Routes>
  );
}
