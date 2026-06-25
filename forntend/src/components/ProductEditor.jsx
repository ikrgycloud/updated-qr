import { useEffect, useState } from "react";

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 3.75h6a1.5 1.5 0 0 1 1.5 1.5V6H21v1.5h-1.125l-.82 10.205A2.25 2.25 0 0 1 16.813 19.5H7.187a2.25 2.25 0 0 1-2.242-1.795L4.125 7.5H3V6h4.5v-.75A1.5 1.5 0 0 1 9 3.75Zm1.5 2.25h3V5.25h-3V6Zm-3.37 1.5.798 9.93a.75.75 0 0 0 .747.57h7.25a.75.75 0 0 0 .747-.57l.798-9.93H7.13Zm2.12 1.875h1.5v6.75h-1.5v-6.75Zm4.5 0h1.5v6.75h-1.5v-6.75Z" />
    </svg>
  );
}

function createEmptyIngredient() {
  return {
    ingredient_name: "",
    content: "",
  };
}

function createEmptyForm() {
  return {
    product_name: "",
    details: {
      name: "",
      product_description: "",
      crop_name: "",
      dosage: "",
      gazette_notification: "",
      dated: "",
      marketing_license_number: "",
      authorization_number: "",
      manufacturing_license_number: "",
      manufactured_and_marketed_by: "",
    },
    ingredients: [createEmptyIngredient()],
  };
}

function buildFormState(product) {
  if (!product) {
    return createEmptyForm();
  }

  return {
    product_name: product.product_name || "",
    details: {
      name: product.details?.name || product.product_name || "",
      product_description: product.details?.product_description || "",
      crop_name: product.details?.crop_name || "",
      dosage: product.details?.dosage || "",
      gazette_notification: product.details?.gazette_notification || "",
      dated: product.details?.dated || "",
      marketing_license_number: product.details?.marketing_license_number || "",
      authorization_number: product.details?.authorization_number || "",
      manufacturing_license_number: product.details?.manufacturing_license_number || "",
      manufactured_and_marketed_by: product.details?.manufactured_and_marketed_by || "",
    },
    ingredients:
      product.ingredients?.length > 0
        ? product.ingredients.map((item) => ({
            ingredient_name: item.ingredient_name || "",
            content: item.content || "",
          }))
        : [createEmptyIngredient()],
  };
}

export default function ProductEditor({
  mode,
  product,
  saving,
  error,
  onCancel,
  onDelete,
  onSubmit,
}) {
  const [formState, setFormState] = useState(createEmptyForm());

  useEffect(() => {
    setFormState(buildFormState(product));
  }, [product, mode]);

  function updateRootField(field, value) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateDetailField(field, value) {
    setFormState((current) => ({
      ...current,
      details: {
        ...current.details,
        [field]: value,
      },
    }));
  }

  function updateIngredient(index, field, value) {
    setFormState((current) => ({
      ...current,
      ingredients: current.ingredients.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    }));
  }

  function addIngredient() {
    setFormState((current) => ({
      ...current,
      ingredients: [...current.ingredients, createEmptyIngredient()],
    }));
  }

  function removeIngredient(index) {
    setFormState((current) => {
      const nextIngredients = current.ingredients.filter((_, itemIndex) => itemIndex !== index);
      return {
        ...current,
        ingredients: nextIngredients.length > 0 ? nextIngredients : [createEmptyIngredient()],
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit(formState);
  }

  const heading = mode === "create" ? "Add New Product Template" : `Edit ${product?.product_name || "Product"} Details`;
  const submitLabel = saving ? "Saving..." : mode === "create" ? "Create Template" : "Save Changes";

  return (
    <section className="workspace-shell">
      <div className="workspace-topbar">
        <div className="workspace-topbar-left">
          <button type="button" className="ghost-button" onClick={onCancel}>
            Cancel
          </button>
        </div>
        {mode === "edit" && onDelete ? (
          <div className="workspace-actions">
            <button
              type="button"
              className="icon-button icon-button-danger"
              onClick={onDelete}
              aria-label={`Remove ${product?.product_name || "product"}`}
              title="Remove product"
            >
              <TrashIcon />
            </button>
          </div>
        ) : null}
      </div>

      <article className="document-sheet">
        <header className="document-header">
          <h2>{heading}</h2>
        </header>

        {error ? <div className="stack-state detail-error">{error}</div> : null}

        <form className="editor-form" onSubmit={handleSubmit}>
          <section className="document-block detail-grid document-product-meta">
            <label className="editor-field">
              <span className="document-label">Product Name</span>
              <input
                type="text"
                value={formState.product_name}
                onChange={(event) => updateRootField("product_name", event.target.value)}
                required
              />
            </label>
            <label className="editor-field">
              <span className="document-label">Name</span>
              <input
                type="text"
                value={formState.details.name}
                onChange={(event) => updateDetailField("name", event.target.value)}
              />
            </label>
            <label className="editor-field">
              <span className="document-label">Product Description</span>
              <textarea
                rows="3"
                value={formState.details.product_description}
                onChange={(event) => updateDetailField("product_description", event.target.value)}
              />
            </label>
            <label className="editor-field">
              <span className="document-label">Crop Name</span>
              <input
                type="text"
                value={formState.details.crop_name}
                onChange={(event) => updateDetailField("crop_name", event.target.value)}
              />
            </label>
          </section>

          <section className="document-block detail-grid">
            <label className="editor-field">
              <span className="document-label">Dosage</span>
              <textarea
                rows="3"
                value={formState.details.dosage}
                onChange={(event) => updateDetailField("dosage", event.target.value)}
              />
            </label>
            <label className="editor-field">
              <span className="document-label">Gezette Notification</span>
              <input
                type="text"
                value={formState.details.gazette_notification}
                onChange={(event) => updateDetailField("gazette_notification", event.target.value)}
              />
            </label>
            <label className="editor-field">
              <span className="document-label">Dated</span>
              <input
                type="date"
                value={formState.details.dated}
                onChange={(event) => updateDetailField("dated", event.target.value)}
              />
            </label>
          </section>

          <section className="document-block detail-grid document-licenses">
            <label className="editor-field">
              <span className="document-label">Marketing License Number</span>
              <input
                type="text"
                value={formState.details.marketing_license_number}
                onChange={(event) => updateDetailField("marketing_license_number", event.target.value)}
              />
            </label>
            <label className="editor-field">
              <span className="document-label">Authorization Number</span>
              <input
                type="text"
                value={formState.details.authorization_number}
                onChange={(event) => updateDetailField("authorization_number", event.target.value)}
              />
            </label>
            <label className="editor-field">
              <span className="document-label">Manufacturing License Number</span>
              <input
                type="text"
                value={formState.details.manufacturing_license_number}
                onChange={(event) => updateDetailField("manufacturing_license_number", event.target.value)}
              />
            </label>
          </section>

          <section className="document-block">
            <label className="editor-field editor-field-full">
              <span className="document-label">Manufactured and Marketed by</span>
              <textarea
                rows="5"
                value={formState.details.manufactured_and_marketed_by}
                onChange={(event) => updateDetailField("manufactured_and_marketed_by", event.target.value)}
              />
            </label>
          </section>

          <section className="document-block">
            <div className="editor-section-head">
              <div>
                <span className="document-label">Composition</span>
                <p className="editor-section-copy">Add ingredient and content rows for this product template.</p>
              </div>
              <button type="button" className="secondary-button" onClick={addIngredient}>
                Add Ingredient
              </button>
            </div>

            <div className="editor-ingredients">
              {formState.ingredients.map((ingredient, index) => (
                <div key={`ingredient-${index}`} className="editor-ingredient-row">
                  <label className="editor-field">
                    <span className="document-label">Ingredient Name</span>
                    <textarea
                      rows="3"
                      value={ingredient.ingredient_name}
                      onChange={(event) => updateIngredient(index, "ingredient_name", event.target.value)}
                    />
                  </label>
                  <label className="editor-field">
                    <span className="document-label">Content</span>
                    <input
                      type="text"
                      value={ingredient.content}
                      onChange={(event) => updateIngredient(index, "content", event.target.value)}
                    />
                  </label>
                  <button type="button" className="ghost-button ingredient-remove" onClick={() => removeIngredient(index)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="document-block editor-actions">
            <button type="submit" className="primary-button" disabled={saving}>
              {submitLabel}
            </button>
          </section>
        </form>
      </article>
    </section>
  );
}
