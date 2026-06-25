import { useEffect, useState } from "react";
import QRCode from "qrcode";
import logoImage from "../sribio.jpeg";

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 3.75h6a1.5 1.5 0 0 1 1.5 1.5V6H21v1.5h-1.125l-.82 10.205A2.25 2.25 0 0 1 16.813 19.5H7.187a2.25 2.25 0 0 1-2.242-1.795L4.125 7.5H3V6h4.5v-.75A1.5 1.5 0 0 1 9 3.75Zm1.5 2.25h3V5.25h-3V6Zm-3.37 1.5.798 9.93a.75.75 0 0 0 .747.57h7.25a.75.75 0 0 0 .747-.57l.798-9.93H7.13Zm2.12 1.875h1.5v6.75h-1.5v-6.75Zm4.5 0h1.5v6.75h-1.5v-6.75Z" />
    </svg>
  );
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB").format(parsed);
}

export default function ProductWorkspace({
  product,
  showBackButton,
  showManagementActions = showBackButton,
  onBack,
  onEdit,
  onCreateTemplate,
  onDelete,
  onRefreshQr,
  refreshingQr,
}) {
  const companyName = import.meta.env.VITE_COMPANY_NAME || "";
  const [generatedQrUrl, setGeneratedQrUrl] = useState("");
  const [qrImage, setQrImage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function buildQrImage() {
      if (!generatedQrUrl) {
        setQrImage("");
        return;
      }

      const dataUrl = await QRCode.toDataURL(generatedQrUrl, {
        margin: 1,
        width: 300,
        color: {
          dark: "#171717",
          light: "#ffffff",
        },
      });

      if (!cancelled) {
        setQrImage(dataUrl);
      }
    }

    void buildQrImage();

    return () => {
      cancelled = true;
    };
  }, [generatedQrUrl]);

  useEffect(() => {
    setGeneratedQrUrl("");
    setQrImage("");
  }, [product.id]);

  async function handleGenerateQr() {
    const { shareUrl } = await onRefreshQr();
    if (!shareUrl) {
      return;
    }

    setGeneratedQrUrl(shareUrl);
  }

  function handleDownloadQr() {
    if (!qrImage) {
      return;
    }

    const anchor = document.createElement("a");
    anchor.href = qrImage;
    anchor.download = `${product.product_name.replace(/\s+/g, "-").toLowerCase()}-qr.png`;
    anchor.click();
  }

  function handlePrintQr() {
    if (!qrImage) {
      return;
    }

    const printWindow = window.open("", "_blank", "width=720,height=900");
    if (!printWindow) {
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${product.product_name} </title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 32px;
              color: #111827;
            }
            h1 {
              font-size: 28px;
              margin-bottom: 12px;
            }
            img {
              width: 280px;
              height: 280px;
              display: block;
              margin: 24px 0;
            }
            p {
              margin: 8px 0;
              line-height: 1.6;
            }
            .footer {
              margin-top: 36px;
              padding-top: 16px;
              border-top: 1px solid #d1d5db;
              font-size: 12px;
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <h1>${product.product_name} </h1>
          <img src="${qrImage}" alt="QR code" />
          <p><strong>QR Link:</strong> ${generatedQrUrl}</p>
          <div class="footer">Designed and maintained by ${companyName}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  return (
    <section className="workspace-shell">
      <div className="workspace-topbar">
        <div className="workspace-topbar-left">
          {showBackButton ? (
            <button type="button" className="ghost-button" onClick={onBack}>
              Back To Products
            </button>
          ) : null}
        </div>
        {showManagementActions ? (
          <div className="workspace-actions">
            <button type="button" className="secondary-button" onClick={onEdit}>
              Edit Details
            </button>
            <button type="button" className="primary-button" onClick={onCreateTemplate}>
              Add New Template
            </button>
            <button
              type="button"
              className="icon-button icon-button-danger"
              onClick={onDelete}
              aria-label={`Remove ${product.product_name}`}
              title="Remove product"
            >
              <TrashIcon />
            </button>
          </div>
        ) : null}
      </div>

      <article className="document-sheet">
        <header className="document-header">
          <h2>{product.product_name} </h2>
          <img className="document-logo" src={logoImage} alt="Sri BioAesthetics Pvt. Ltd. logo" />
        </header>

        <section className="document-block document-common-grid">
          <div className="document-field">
            <span className="document-label">Gezette Notification</span>
            <p className="document-value">{product.details?.gazette_notification || ""}</p>
          </div>
          <div className="document-field">
            <span className="document-label">Dated</span>
            <p className="document-value">{formatDate(product.details?.dated || "")}</p>
          </div>
        </section>

        <section className="document-block detail-grid document-name-description">
          <div className="document-field">
            <span className="document-label">Name</span>
            <p className="document-value">{product.details?.name || ""}</p>
          </div>
          <div className="document-field">
            <span className="document-label">Product Description</span>
            <p className="document-value">{product.details?.product_description || ""}</p>
          </div>
        </section>

        <section className="document-block">
          <span className="document-label">Composition</span>
          <div className="table-wrap">
            <table className="document-table">
              <thead>
                <tr>
                  <th className="serial-column">S.No</th>
                  <th>Composition</th>
                  <th>Content</th>
                </tr>
              </thead>
              <tbody>
                {product.ingredients.length > 0 ? (
                  product.ingredients.map((item, index) => (
                    <tr key={`${item.ingredient_name}-${index}`}>
                      <td className="serial-column" data-label="S.No">{index + 1}</td>
                      <td data-label="Composition">{item.ingredient_name}</td>
                      <td data-label="Content">{item.content}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="serial-column" data-label="S.No"></td>
                    <td data-label="Composition"></td>
                    <td data-label="Content"></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="document-block detail-grid document-product-meta">
          <div className="document-field">
            <span className="document-label">Crop Name</span>
            <p className="document-value">{product.details?.crop_name || ""}</p>
          </div>
          <div className="document-field">
            <span className="document-label">Dosage</span>
            <p className="document-value">{product.details?.dosage || ""}</p>
          </div>
        </section>

        <section className="document-block detail-grid document-licenses">
          <div className="document-field">
            <span className="document-label">Marketing License Number</span>
            <p className="document-value">{product.details?.marketing_license_number || ""}</p>
          </div>
          <div className="document-field">
            <span className="document-label">Authorization Number</span>
            <p className="document-value">{product.details?.authorization_number || ""}</p>
          </div>
          <div className="document-field">
            <span className="document-label">Manufacturing License Number</span>
            <p className="document-value">{product.details?.manufacturing_license_number || ""}</p>
          </div>
        </section>

        <section className="document-block manufacturer-block">
          <span className="document-label">Manufactured and Marketed by</span>
          <p className="document-value">{product.details?.manufactured_and_marketed_by || ""}</p>
        </section>

        {showManagementActions ? (
          <section className="document-block qr-action-block">
            <button type="button" className="primary-button document-qr-button" onClick={() => void handleGenerateQr()} disabled={refreshingQr}>
              {refreshingQr ? "Generating QR..." : "Generate QR"}
            </button>

            {qrImage ? (
              <div className="generated-qr-section">
                <div className="generated-qr-card">
                  <img src={qrImage} alt={`${product.product_name} generated QR`} />
                  <div className="generated-qr-actions">
                    <button type="button" className="secondary-button" onClick={handleDownloadQr}>
                      Download QR
                    </button>
                    <button type="button" className="secondary-button" onClick={handlePrintQr}>
                      Print QR
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </section>
        ) : null}
      </article>
    </section>
  );
}
