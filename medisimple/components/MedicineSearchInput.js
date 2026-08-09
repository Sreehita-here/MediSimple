import { useState, useEffect, useRef } from "react";

export default function MedicineSearchInput({
  onSelect,
  placeholder = "🔍 Search medicine name...",
  initialValue = "",
  id,
  allowFreeText = false,
}) {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Sync internal query state if initialValue changes (e.g. from router query)
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  const search = async (q) => {
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/medicines/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results || []);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 300);

    // For free text mode, also notify parent of raw text as user types
    if (allowFreeText && val.trim().length >= 2) {
      if (onSelect) onSelect({ _id: `freetext-${val}`, name: val.trim(), strength: "", freeText: true });
    }
  };

  const handleSelect = (medicine) => {
    setQuery(`${medicine.name} ${medicine.strength || ""}`.trim());
    setOpen(false);
    setResults([]);
    if (onSelect) onSelect(medicine);
  };

  const handleFreeTextSelect = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setOpen(false);
    setResults([]);
    if (onSelect) onSelect({ _id: `freetext-${trimmed}`, name: trimmed, strength: "", freeText: true });
  };

  return (
    <div className="search-wrapper" ref={wrapperRef}>
      <div className="input-with-icon">
        <span className="input-icon">💊</span>
        <input
          id={id}
          type="text"
          className="input"
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          autoComplete="off"
          aria-label="Medicine search"
          aria-autocomplete="list"
          aria-expanded={open}
        />
        {loading && (
          <span
            style={{
              position: "absolute",
              right: 14,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
          </span>
        )}
      </div>

      {open && (
        <div className="search-dropdown slide-down" role="listbox">
          {/* Database results */}
          {results.map((med) => (
            <div
              key={med._id}
              className="search-option"
              role="option"
              onClick={() => handleSelect(med)}
              onKeyDown={(e) => e.key === "Enter" && handleSelect(med)}
              tabIndex={0}
            >
              <div>
                <div className="search-option-name">{med.name}</div>
                {med.commonBrands?.length > 0 && (
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                    Also known as: {med.commonBrands.slice(0, 2).join(", ")}
                  </div>
                )}
              </div>
              <div className="search-option-strength">
                {med.strength}
                {med.verified && (
                  <span style={{ marginLeft: 6, fontSize: 11, color: "var(--success)" }}>✅ Verified</span>
                )}
              </div>
            </div>
          ))}

          {/* Free text fallback — always shown when there are no results or even alongside results */}
          {query.trim().length >= 2 && !loading && (
            <div
              className="search-option"
              role="option"
              onClick={handleFreeTextSelect}
              onKeyDown={(e) => e.key === "Enter" && handleFreeTextSelect()}
              tabIndex={0}
              style={{
                borderTop: results.length > 0 ? "1px solid var(--gray-200)" : "none",
                background: "var(--primary-light)",
              }}
            >
              <div>
                <div className="search-option-name" style={{ color: "var(--primary)" }}>
                  🔍 Search for &quot;{query.trim()}&quot;
                </div>
              </div>
              <div style={{ fontSize: 20 }}>→</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
