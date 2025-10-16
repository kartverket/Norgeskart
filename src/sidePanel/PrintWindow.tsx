import { useTranslation } from "react-i18next";
import { FC } from "react";

interface PrintWindowProps {
  onClose: () => void;
}

const INTERACTIVE_MEASUREMNT_OVERLAY_ID = "map"; 

const PrintWindow: FC<PrintWindowProps> = ({ onClose }) => {
  const { t } = useTranslation();

  return (
    <div
      style={{
        position: "fixed",
        top: "40px",
        left: 0,
        width: "400px",
        height: "calc(100vh - 40px)",
        background: "#fff",
        border: "1px solid #e67c30",
        padding: "0",
        borderRadius: "8px 0 0 8px",
        boxShadow: "0 0 10px rgba(0,0,0,0.2)",
        zIndex: 1000,
        fontFamily: "Arial, sans-serif",
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "#e5e5e5",
          padding: "12px 20px",
          borderTopLeftRadius: "8px",
          borderTopRightRadius: "8px",
          borderBottom: "1px solid #ddd",
        }}
      >
        <span style={{ marginRight: "10px", fontSize: "22px" }}>🖨️</span>
        <span style={{ fontWeight: "bold", fontSize: "22px", flex: 1 }}>
          {t("SKRIV UT")}
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #e67c30" }}>
        <div
          style={{
            background: "#e67c30",
            color: "#fff",
            padding: "12px 32px",
            borderTopLeftRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {t("Skriv ut")}
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          padding: "32px 16px 16px 16px",
          border: "1px solid #e67c30",
          borderTop: "none",
          borderBottomLeftRadius: "8px",
          borderBottomRightRadius: "8px",
        }}
      >
        {/* Maltype */}
        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              fontWeight: "bold",
              fontSize: "18px",
              display: "block",
              marginBottom: "8px",
            }}
          >
            {t("Maltype")}
          </label>
          <select
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
            defaultValue="A4 stående"
          >
            <option value="A4 stående">{t("A4 stående")}</option>
            <option value="A4 liggende">{t("A4 liggende")}</option>
            <option value="A3 stående">{t("A3 stående")}</option>
            <option value="A3 liggende">{t("A3 liggende")}</option>
          </select>
        </div>

        {/* Målestokk */}
        <div style={{ marginBottom: "32px" }}>
          <label
            style={{
              fontWeight: "bold",
              fontSize: "18px",
              display: "block",
              marginBottom: "8px",
            }}
          >
            {t("Målestokk")}
          </label>
          <select
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
            defaultValue="1 : 25000"
          >
            <option value="1 : 25000">1 : 25000</option>
            <option value="1 : 50000">1 : 50000</option>
            <option value="1 : 100000">1 : 100000</option>
          </select>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
          <button
            style={{
              background: "#7da4c7",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "12px 24px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          onClick={() => {
              const printContent = document.getElementById(INTERACTIVE_MEASUREMNT_OVERLAY_ID);
              if (printContent) {
                const printWindow = window.open("", "PRINT", "height=600,width=800");
                  if (printWindow) {
                      printWindow.document.write(`
                      <html>
                        <head>
                          <title>${t("Utskrift fra Norgeskart")}</title>
                          <style>
                            body {
                              margin: 0;
                              padding: 0;
                            }
                            img { 
                              max-width: 100%;
                              height: auto;
                            }
                          </style>
                        </head>
                        <body>  
                          ${printContent.innerHTML}
                        </body>
                      </html>
                      `);
                      printWindow.document.close();
                      printWindow.focus();
                      printWindow.print();
                      window.print();
                  }
              }
          }}
          >
            {t("GENERERE UTSKRIFT")}
          </button>

          <button
            style={{
              background: "#bfc2c4",
              color: "#444",
              border: "none",
              borderRadius: "6px",
              padding: "12px 24px",
              fontSize: "16px",
              cursor: "pointer",
            }}
            onClick={onClose}
          >
            {t("AVBRYT")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintWindow;