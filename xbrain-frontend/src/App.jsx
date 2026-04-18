import { useState, useRef, useEffect, useCallback } from "react";

const API_URL = "";

const CLASS_META = {
  glioma:     { color: "#E24B4A", bg: "#FCEBEB", label: "Glioma",      icon: "◈" },
  meningioma: { color: "#EF9F27", bg: "#FAEEDA", label: "Meningioma",  icon: "◉" },
  pituitary:  { color: "#378ADD", bg: "#E6F1FB", label: "Pituitary",   icon: "◎" },
  notumor:    { color: "#639922", bg: "#EAF3DE", label: "No Tumor",    icon: "◌" },
};

const URGENCY_META = {
  HIGH:           { color: "#E24B4A", bg: "#FCEBEB" },
  MODERATE:       { color: "#EF9F27", bg: "#FAEEDA" },
  "LOW-MODERATE": { color: "#378ADD", bg: "#E6F1FB" },
  NONE:           { color: "#639922", bg: "#EAF3DE" },
};

const SUGGESTED_QS = {
  glioma: [
    "What are the treatment options?",
    "What symptoms should be monitored?",
    "What does this confidence score mean?",
  ],
  meningioma: [
    "Can this tumor be treated without surgery?",
    "What follow-up is usually needed?",
    "What symptoms are common?",
  ],
  pituitary: [
    "Can this affect hormones?",
    "What symptoms are common?",
    "What is the usual treatment?",
  ],
  notumor: [
    "What does no tumor detected mean?",
    "Should a follow-up MRI be done?",
    "Can symptoms still occur without a tumor?",
  ],
};

const LANGUAGES = {
  "Hindi (हिन्दी)": "hi",
  "Telugu (తెలుగు)": "te",
  "Tamil (தமிழ்)": "ta",
  "Bengali (বাংলা)": "bn",
  "Marathi (मराठी)": "mr",
  "Gujarati (ગુજરાતી)": "gu",
  "Kannada (ಕನ್ನಡ)": "kn",
  "Malayalam (മലയാളം)": "ml",
  "Punjabi (ਪੰਜਾਬੀ)": "pa",
  "Urdu (اردو)": "ur",
  "English": "en",
  "Spanish": "es",
  "French": "fr",
  "German": "de",
  "Arabic": "ar",
  "Chinese": "zh",
  "Japanese": "ja",
  "Portuguese": "pt",
  "Russian": "ru",
};

function b64img(b64) {
  return `data:image/png;base64,${b64}`;
}

async function apiFetch(path, opts = {}) {
  const r = await fetch(`${API_URL}${path}`, opts);
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t || r.statusText);
  }
  return r.json();
}

function StatusDot({ ok }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: ok ? "var(--color-text-success)" : "var(--color-text-danger)",
        marginRight: 6,
        flexShrink: 0,
      }}
    />
  );
}

function Chip({ label, accent }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 10px",
        borderRadius: 99,
        fontSize: 12,
        fontWeight: 500,
        background: accent?.bg || "var(--color-background-secondary)",
        color: accent?.color || "var(--color-text-secondary)",
        border: `0.5px solid ${accent?.color || "var(--color-border-secondary)"}33`,
      }}
    >
      {label}
    </span>
  );
}

function Card({ children, style }) {
  return (
    <div
      style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: "var(--border-radius-lg)",
        padding: "1rem 1.25rem",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionHeading({ children }) {
  return (
    <h3
      style={{
        margin: "0 0 12px",
        fontSize: 13,
        fontWeight: 500,
        color: "var(--color-text-secondary)",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
      }}
    >
      {children}
    </h3>
  );
}

function ProgressBar({ value, color, label, pct }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 13,
          marginBottom: 4,
          color: "var(--color-text-primary)",
        }}
      >
        <span>{label}</span>
        <span style={{ color: "var(--color-text-secondary)" }}>{pct}</span>
      </div>
      <div
        style={{
          height: 6,
          borderRadius: 3,
          background: "var(--color-background-tertiary)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${value * 100}%`,
            height: "100%",
            borderRadius: 3,
            background: color,
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, accent }) {
  return (
    <Card>
      <div
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: "var(--color-text-secondary)",
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 500,
          color: accent || "var(--color-text-primary)",
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 4 }}>
          {sub}
        </div>
      )}
    </Card>
  );
}

function ImagePanel({ src, caption, isBase64 }) {
  return (
    <div style={{ textAlign: "center" }}>
      <img
        src={isBase64 ? b64img(src) : src}
        alt={caption}
        style={{
          width: "100%",
          borderRadius: "var(--border-radius-md)",
          border: "0.5px solid var(--color-border-tertiary)",
          display: "block",
        }}
      />
      <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 6 }}>
        {caption}
      </div>
    </div>
  );
}

function ChatBubble({ role, content }) {
  const isUser = role === "user";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: 10,
      }}
    >
      <div
        style={{
          maxWidth: "78%",
          padding: "10px 14px",
          borderRadius: isUser ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
          background: isUser ? "var(--color-background-info)" : "var(--color-background-secondary)",
          color: "var(--color-text-primary)",
          fontSize: 14,
          lineHeight: 1.6,
          border: "0.5px solid var(--color-border-tertiary)",
          whiteSpace: "pre-wrap",
        }}
      >
        {!isUser && (
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "var(--color-text-secondary)",
              marginBottom: 4,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            X-Brain AI
          </div>
        )}
        {content}
      </div>
    </div>
  );
}

function UploadZone({ onFile }) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef();

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDrag(false);
      const f = e.dataTransfer.files[0];
      if (f && f.type.startsWith("image/")) onFile(f);
    },
    [onFile]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current.click()}
      style={{
        border: `1.5px dashed ${drag ? "var(--color-border-info)" : "var(--color-border-secondary)"}`,
        borderRadius: "var(--border-radius-lg)",
        padding: "3rem 2rem",
        textAlign: "center",
        cursor: "pointer",
        transition: "all 0.15s",
        background: drag ? "var(--color-background-info)" : "var(--color-background-secondary)",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files[0]) onFile(e.target.files[0]);
        }}
      />
      <div style={{ fontSize: 32, marginBottom: 12 }}>🧠</div>
      <div
        style={{
          fontSize: 15,
          fontWeight: 500,
          color: "var(--color-text-primary)",
          marginBottom: 6,
        }}
      >
        Drop an MRI scan or click to upload
      </div>
      <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
        JPG, PNG — any brain MRI image
      </div>
    </div>
  );
}

function Sidebar({ health, language, setLanguage, activeTab, setActiveTab, hasResult }) {
  const navItems = hasResult
    ? [
        { id: "summary", label: "Summary" },
        { id: "visuals", label: "Visual Analysis" },
        { id: "clinical", label: "Clinical Report" },
        { id: "rag", label: "RAG Report" },
        { id: "qa", label: "Clinical Q&A" },
      ]
    : [];

  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        borderRight: "0.5px solid var(--color-border-tertiary)",
        padding: "1.5rem 1rem",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 500,
            color: "var(--color-text-primary)",
            marginBottom: 2,
          }}
        >
          X-Brain
        </div>
        <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
          Explainable AI · Brain Tumor Analysis
        </div>
      </div>

      {health && (
        <div>
          <SectionHeading>System</SectionHeading>
          {[
            ["Classifier", health.classifier],
            ["Segmentor", health.segmentor],
            ["RAG Index", health.rag_index],
            ["Groq LLM", health.groq_llm],
          ].map(([label, ok]) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: 13,
                color: "var(--color-text-primary)",
                marginBottom: 6,
              }}
            >
              <StatusDot ok={ok} />
              {label}
            </div>
          ))}
        </div>
      )}

      <div>
        <SectionHeading>Report Language</SectionHeading>
        <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ width: "100%", fontSize: 13 }}>
          <optgroup label="── Indian Languages ──">
            {Object.entries(LANGUAGES)
              .slice(0, 10)
              .map(([name, code]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
          </optgroup>
          <optgroup label="── Foreign Languages ──">
            {Object.entries(LANGUAGES)
              .slice(10)
              .map(([name, code]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
          </optgroup>
        </select>
      </div>

      {navItems.length > 0 && (
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <SectionHeading>Results</SectionHeading>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                background: activeTab === item.id ? "var(--color-background-secondary)" : "transparent",
                border: "none",
                borderRadius: "var(--border-radius-md)",
                padding: "7px 10px",
                textAlign: "left",
                fontSize: 13,
                fontWeight: activeTab === item.id ? 500 : 400,
                color: activeTab === item.id ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                cursor: "pointer",
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}

      <div
        style={{
          marginTop: "auto",
          fontSize: 11,
          color: "var(--color-text-secondary)",
          lineHeight: 1.6,
        }}
      >
        For research &amp; educational use only. Not a clinical diagnostic tool.
      </div>
    </aside>
  );
}

function TabSummary({ result }) {
  const { classification: clf, segmentation: seg, clinical_report: report, inference_time_ms: ms } = result;
  const classMeta = CLASS_META[clf.class_name] || {};
  const urgencyMeta = URGENCY_META[report?.urgency] || {};

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Analysis complete in</div>
        <Chip label={`${ms} ms`} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        <MetricCard
          label="Tumor Type"
          value={`${classMeta.icon || "◈"} ${report?.tumor_type || classMeta.label || clf.class_name}`}
          sub="Predicted class"
          accent={classMeta.color}
        />
        <MetricCard
          label="Confidence"
          value={`${(clf.confidence * 100).toFixed(1)}%`}
          sub={report?.confidence_label || "—"}
        />
        <MetricCard
          label="Tumor Area"
          value={seg.skipped ? "N/A" : `${seg.tumor_area_pct.toFixed(1)}%`}
          sub="Of scan region"
        />
        <MetricCard
          label="Clinical Urgency"
          value={report?.urgency || "—"}
          accent={urgencyMeta.color}
        />
      </div>

      <Card>
        <SectionHeading>Classification probabilities</SectionHeading>
        {Object.entries(clf.probabilities)
          .sort((a, b) => b[1] - a[1])
          .map(([cls, prob]) => (
            <ProgressBar
              key={cls}
              value={prob}
              color={CLASS_META[cls]?.color || "#888"}
              label={CLASS_META[cls]?.label || cls}
              pct={`${(prob * 100).toFixed(1)}%`}
            />
          ))}
      </Card>

      {!seg.skipped && (
        <Card>
          <SectionHeading>Segmentation statistics</SectionHeading>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {[
              ["Tumor pixels", seg.tumor_pixels.toLocaleString()],
              ["Total pixels", seg.total_pixels.toLocaleString()],
              ["Mask present", seg.has_mask ? "Yes" : "No"],
            ].map(([l, v]) => (
              <div key={l}>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--color-text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 4,
                  }}
                >
                  {l}
                </div>
                <div style={{ fontSize: 18, fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function TabVisuals({ result, uploadedFile }) {
  const { images: imgs, segmentation: seg } = result;

  const panels = [
    { src: URL.createObjectURL(uploadedFile), caption: "Original MRI", isBase64: false },
    { src: imgs.gradcam_overlay, caption: "Grad-CAM overlay", isBase64: true },
    { src: imgs.gradcam_heatmap, caption: "Grad-CAM heatmap", isBase64: true },
    ...(!seg.skipped
      ? [
          { src: imgs.seg_overlay, caption: "Segmentation overlay", isBase64: true },
          { src: imgs.seg_mask, caption: "Segmentation mask", isBase64: true },
        ]
      : []),
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        {panels.map((p) => (
          <Card key={p.caption}>
            <ImagePanel {...p} />
          </Card>
        ))}
      </div>

      {seg.skipped && (
        <div
          style={{
            marginTop: 16,
            padding: "10px 14px",
            borderRadius: "var(--border-radius-md)",
            background: "var(--color-background-success)",
            color: "var(--color-text-success)",
            fontSize: 13,
          }}
        >
          Segmentation skipped — no tumor detected.
        </div>
      )}
    </div>
  );
}

function TabClinical({ result }) {
  const { clinical_report: r } = result;

  if (!r) return <div style={{ color: "var(--color-text-secondary)" }}>No clinical report available.</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <SectionHeading>Overview</SectionHeading>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7 }}>{r.description}</p>
        {r.who_classification && (
          <div style={{ marginTop: 10, fontSize: 12, color: "var(--color-text-secondary)" }}>
            WHO: {r.who_classification}
          </div>
        )}
      </Card>

      <Card>
        <SectionHeading>AI confidence assessment</SectionHeading>
        <div style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>
          <strong style={{ color: "var(--color-text-primary)" }}>{r.confidence_label}</strong> — {r.confidence_note}
        </div>
      </Card>

      {[
        { title: "Clinical features & symptoms", key: "symptoms" },
        { title: "Diagnostic workup", key: "diagnosis_methods" },
        { title: "Treatment options", key: "treatment_options" },
      ].map(({ title, key }) =>
        r[key]?.length > 0 ? (
          <Card key={key}>
            <SectionHeading>{title}</SectionHeading>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {r[key].map((item, i) => (
                <li key={i} style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 4 }}>
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        ) : null
      )}

      {r.prognosis && Object.keys(r.prognosis).length > 0 && (
        <Card>
          <SectionHeading>Prognosis</SectionHeading>
          {Object.entries(r.prognosis).map(([k, v]) => (
            <div key={k} style={{ marginBottom: 8, fontSize: 14 }}>
              <span style={{ fontWeight: 500 }}>{k.replace(/_/g, " ")}:</span>{" "}
              <span style={{ color: "var(--color-text-secondary)" }}>{v}</span>
            </div>
          ))}
        </Card>
      )}

      {r.disclaimer && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "var(--border-radius-md)",
            border: "0.5px solid var(--color-border-danger)",
            background: "var(--color-background-danger)",
            color: "var(--color-text-danger)",
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          {r.disclaimer}
        </div>
      )}
    </div>
  );
}

function TabRAG({ result, language }) {
  const { rag_report: rag } = result;
  const [translated, setTranslated] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [showDocs, setShowDocs] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function autoTranslate() {
      if (!rag) return;

      if (language === "en") {
        setTranslated(null);
        return;
      }

      setTranslating(true);
      try {
        const res = await apiFetch("/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: rag.llm_report, language }),
        });

        if (!cancelled) setTranslated(res.translated);
      } catch {
        if (!cancelled) setTranslated(rag.llm_report);
      } finally {
        if (!cancelled) setTranslating(false);
      }
    }

    autoTranslate();

    return () => {
      cancelled = true;
    };
  }, [language, rag]);

  if (!rag) return <div style={{ color: "var(--color-text-secondary)" }}>No RAG report available.</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <SectionHeading>RAG-enhanced report</SectionHeading>
        <div style={{ fontSize: 14, lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
          {translating ? "Translating…" : translated || rag.llm_report}
        </div>
      </Card>

      {rag.retrieved_docs?.length > 0 && (
        <Card>
          <SectionHeading>Retrieved sources</SectionHeading>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {rag.retrieved_docs.map((d, i) => (
              <Chip key={i} label={`${d.source} · ${d.score?.toFixed(2) || "—"}`} />
            ))}
          </div>

          <button onClick={() => setShowDocs(!showDocs)} style={{ fontSize: 13 }}>
            {showDocs ? "Hide passages" : "View retrieved passages"}
          </button>

          {showDocs && (
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
              {rag.retrieved_docs.map((d, i) => (
                <div
                  key={i}
                  style={{
                    borderTop: "0.5px solid var(--color-border-tertiary)",
                    paddingTop: 12,
                  }}
                >
                  <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 4 }}>
                    [{i + 1}] {d.source}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--color-text-secondary)",
                      lineHeight: 1.6,
                    }}
                  >
                    {d.snippet}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function TabQA({ result, language }) {
  const { classification: clf, segmentation: seg, clinical_report: report, rag_report: rag } = result;

  const [history, setHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [translatedSuggestions, setTranslatedSuggestions] = useState([]);

  const chatRef = useRef();

  const suggestions = SUGGESTED_QS[clf.class_name] || [];

  useEffect(() => {
    let cancelled = false;

    async function translateSuggestions() {
      if (language === "en") {
        setTranslatedSuggestions(suggestions);
        return;
      }

      try {
        const translated = await Promise.all(
          suggestions.map(async (s) => {
            try {
              const r = await apiFetch("/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: s, language }),
              });
              return r.translated || s;
            } catch {
              return s;
            }
          })
        );

        if (!cancelled) setTranslatedSuggestions(translated);
      } catch {
        if (!cancelled) setTranslatedSuggestions(suggestions);
      }
    }

    translateSuggestions();

    return () => {
      cancelled = true;
    };
  }, [language, clf.class_name]);

  const reportCtx = `Tumor: ${clf.class_name} | Confidence: ${(clf.confidence * 100).toFixed(
    1
  )}% | Area: ${seg.tumor_area_pct.toFixed(1)}% | Urgency: ${report?.urgency || ""}\n\n${(
    rag?.llm_report || ""
  ).slice(0, 1500)}`;

  const ask = async (q) => {
    const text = q || question;
    if (!text.trim()) return;

    const updatedHistory = [...history, { role: "user", content: text }];

    setQuestion("");
    setLoading(true);
    setHistory(updatedHistory);

    try {
      const res = await apiFetch("/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: text,
          report_context: reportCtx,
          class_name: clf.class_name,
          conversation_history: updatedHistory,
          language,
        }),
      });

      setHistory((h) => [...h, { role: "assistant", content: res.answer }]);
    } catch (e) {
      setHistory((h) => [...h, { role: "assistant", content: `Error: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [history, loading]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {translatedSuggestions.length > 0 && history.length === 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {translatedSuggestions.map((s, i) => (
            <button key={i} onClick={() => ask(s)} style={{ fontSize: 13, borderRadius: 99 }}>
              {s}
            </button>
          ))}
        </div>
      )}

      <Card style={{ flex: 1 }}>
        <div ref={chatRef} style={{ minHeight: 200, maxHeight: 380, overflowY: "auto", paddingRight: 4 }}>
          {history.length === 0 && !loading && (
            <div
              style={{
                color: "var(--color-text-secondary)",
                fontSize: 13,
                textAlign: "center",
                paddingTop: 40,
              }}
            >
              Ask a question about this analysis or select a suggestion above.
            </div>
          )}

          {history.map((m, i) => (
            <ChatBubble key={i} role={m.role} content={m.content} />
          ))}

          {loading && (
            <div style={{ fontSize: 13, color: "var(--color-text-secondary)", padding: "8px 14px" }}>
              X-Brain AI is thinking…
            </div>
          )}
        </div>
      </Card>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && ask()}
          placeholder="e.g. What are the treatment options?"
          style={{ flex: 1, fontSize: 14 }}
          disabled={loading}
        />
        <button
          onClick={() => ask()}
          disabled={loading || !question.trim()}
          style={{ fontSize: 13, padding: "0 16px" }}
        >
          Ask
        </button>
        <button onClick={() => setHistory([])} style={{ fontSize: 13 }}>
          Clear
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [health, setHealth] = useState(null);
  const [language, setLanguage] = useState("en");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");

  useEffect(() => {
    apiFetch("/health")
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  const handleFile = useCallback((file) => {
    setUploadedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setError(null);
    setActiveTab("summary");
  }, []);

  const handleAnalyze = async () => {
    if (!uploadedFile) return;

    setLoading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("file", uploadedFile);

      const r = await fetch(`${API_URL}/analyze?language=${language}`, {
        method: "POST",
        body: fd,
      });

      if (!r.ok) {
        const t = await r.text();
        throw new Error(t);
      }

      setResult(await r.json());
      setActiveTab("summary");
    } catch (e) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const renderTab = () => {
    if (!result) return null;

    switch (activeTab) {
      case "summary":
        return <TabSummary result={result} />;
      case "visuals":
        return <TabVisuals result={result} uploadedFile={uploadedFile} />;
      case "clinical":
        return <TabClinical result={result} />;
      case "rag":
        return <TabRAG result={result} language={language} />;
      case "qa":
        return <TabQA result={result} language={language} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "var(--font-sans)" }}>
      <Sidebar
        health={health}
        language={language}
        setLanguage={setLanguage}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasResult={!!result}
      />

      <main style={{ flex: 1, padding: "1.5rem 2rem", overflowY: "auto", maxWidth: 900 }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, margin: "0 0 4px" }}>Brain MRI Analysis</h1>
        <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: "0 0 24px" }}>
          Upload an MRI scan for AI-powered classification, segmentation, and clinical reporting.
        </p>

        {!uploadedFile ? (
          <UploadZone onFile={handleFile} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <img
                src={previewUrl}
                alt="MRI preview"
                style={{
                  width: 120,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: "var(--border-radius-md)",
                  border: "0.5px solid var(--color-border-tertiary)",
                  flexShrink: 0,
                }}
              />

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>{uploadedFile.name}</div>
                <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 12 }}>
                  {(uploadedFile.size / 1024).toFixed(0)} KB ·{" "}
                  {Object.keys(LANGUAGES).find((k) => LANGUAGES[k] === language) || "English"}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={handleAnalyze} disabled={loading} style={{ fontSize: 14, fontWeight: 500 }}>
                    {loading ? "Analyzing…" : "Run full analysis"}
                  </button>
                  <button
                    onClick={() => {
                      setUploadedFile(null);
                      setPreviewUrl(null);
                      setResult(null);
                    }}
                    style={{ fontSize: 13 }}
                  >
                    Change image
                  </button>
                </div>
              </div>
            </Card>

            {loading && (
              <div
                style={{
                  padding: "14px 18px",
                  borderRadius: "var(--border-radius-md)",
                  background: "var(--color-background-info)",
                  color: "var(--color-text-info)",
                  fontSize: 13,
                }}
              >
                Running classification, Grad-CAM, segmentation, and RAG pipeline…
              </div>
            )}

            {error && (
              <div
                style={{
                  padding: "14px 18px",
                  borderRadius: "var(--border-radius-md)",
                  background: "var(--color-background-danger)",
                  color: "var(--color-text-danger)",
                  fontSize: 13,
                }}
              >
                {error}
              </div>
            )}

            {result && (
              <div>
                <div
                  style={{
                    display: "flex",
                    gap: 0,
                    borderBottom: "0.5px solid var(--color-border-tertiary)",
                    marginBottom: 20,
                  }}
                >
                  {[
                    { id: "summary", label: "Summary" },
                    { id: "visuals", label: "Visuals" },
                    { id: "clinical", label: "Clinical" },
                    { id: "rag", label: "RAG" },
                    { id: "qa", label: "Q&A" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        borderBottom:
                          activeTab === tab.id ? "2px solid var(--color-text-primary)" : "2px solid transparent",
                        borderRadius: 0,
                        padding: "8px 16px",
                        fontSize: 14,
                        fontWeight: activeTab === tab.id ? 500 : 400,
                        color: activeTab === tab.id ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                        cursor: "pointer",
                        marginBottom: -0.5,
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {renderTab()}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}