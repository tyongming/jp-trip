# Task: Add Save/Export/Import & Mobile Access to Japan Trip Planner

## Context
- File: `/mnt/user-data/outputs/japan-trip-planner.jsx`
- It's a React artifact (`.jsx`) rendered in Claude.ai's artifact panel
- Current state: Fully interactive trip planner with days, activities, maps, budget calculator
- All state is in React `useState` — lost on refresh

---

## Feature 1: Export to JSON

### Requirements
- Add a "📥 导出JSON" button in a new toolbar section below the "全部展开/折叠" buttons
- On click, serialize the entire `days` state array to a formatted JSON string
- Trigger a browser download of the JSON file named `japan-trip-{YYYY-MM-DD}.json`
- The JSON should include ALL activity fields: id, type, name, category, time, rating, reviews, img, la, lo, addr, notes, cost, currency

### Implementation
```jsx
const handleExport = () => {
  const data = JSON.stringify({ version: 1, exportDate: new Date().toISOString(), days }, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `japan-trip-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
```

---

## Feature 2: Import from JSON

### Requirements
- Add a "📤 导入JSON" button next to the export button
- Use a hidden `<input type="file" accept=".json">` triggered by the button click
- On file select, read the JSON, validate it has `days` array, and replace current state
- Show a confirmation count: "已导入 X 天, Y 个体验"
- Handle errors gracefully (show alert if invalid JSON)

### Implementation
```jsx
const fileRef = useRef(null);

const handleImport = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      if (data.days && Array.isArray(data.days)) {
        setDays(data.days);
        setExpanded({ [data.days[0]?.id]: true });
        alert(`✅ 已导入 ${data.days.length} 天, ${data.days.reduce((s, d) => s + d.activities.length, 0)} 个体验`);
      } else {
        alert("❌ 无效的JSON格式：缺少 days 数组");
      }
    } catch (err) {
      alert("❌ JSON解析失败: " + err.message);
    }
  };
  reader.readAsText(file);
  e.target.value = ""; // reset for re-import
};

// In JSX:
<input ref={fileRef} type="file" accept=".json" style={{ display: "none" }} onChange={handleImport} />
<button onClick={() => fileRef.current?.click()}>📤 导入JSON</button>
```

---

## Feature 3: Copy JSON to Clipboard

### Requirements
- Add a "📋 复制JSON" button — useful on mobile where file downloads may not work well
- Copy the full JSON string to clipboard
- Show brief feedback "已复制!" using a temporary state

### Implementation
```jsx
const [copied, setCopied] = useState(false);

const handleCopy = async () => {
  const data = JSON.stringify({ version: 1, exportDate: new Date().toISOString(), days }, null, 2);
  await navigator.clipboard.writeText(data);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};
```

---

## Feature 4: Import from Clipboard / Paste

### Requirements
- Add a "📋 从剪贴板导入" button — for mobile users who copied JSON from another device
- Reads from clipboard, parses, and imports
- Alternative: a textarea modal where user can paste JSON manually (more reliable cross-browser)

### Implementation (Textarea approach — more reliable)
```jsx
const [showPasteModal, setShowPasteModal] = useState(false);
const [pasteText, setPasteText] = useState("");

const handlePasteImport = () => {
  try {
    const data = JSON.parse(pasteText);
    if (data.days && Array.isArray(data.days)) {
      setDays(data.days);
      setShowPasteModal(false);
      setPasteText("");
      alert(`✅ 已导入 ${data.days.length} 天`);
    } else {
      alert("❌ 无效格式");
    }
  } catch (err) {
    alert("❌ JSON解析失败");
  }
};
```

---

## Feature 5: Auto-save to Artifact Storage

### Requirements
- Use the `window.storage` API (available in Claude artifacts with persistent storage)
- Auto-save on every state change (debounced 2 seconds)
- Auto-load on mount
- Show a small "已保存 ✓" indicator

### Implementation
```jsx
// Auto-save (debounced)
useEffect(() => {
  const timer = setTimeout(async () => {
    try {
      await window.storage.set("trip-planner-data", JSON.stringify({ version: 1, days }));
      setSaveStatus("saved");
    } catch (e) {
      console.error("Auto-save failed:", e);
    }
  }, 2000);
  return () => clearTimeout(timer);
}, [days]);

// Auto-load on mount
useEffect(() => {
  (async () => {
    try {
      const result = await window.storage.get("trip-planner-data");
      if (result?.value) {
        const data = JSON.parse(result.value);
        if (data.days) setDays(data.days);
      }
    } catch (e) {
      // Key doesn't exist yet, use defaults
    }
  })();
}, []);
```

---

## UI Layout for Toolbar

Place this section between the "全部展开/折叠" buttons and the BudgetSummary:

```jsx
{/* Save/Load Toolbar */}
<div style={{
  display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center",
  padding: "14px 0", margin: "0 0 16px",
  borderTop: "1px solid #e8e4de", borderBottom: "1px solid #e8e4de"
}}>
  <button onClick={handleExport} style={S.toolBtn}>📥 导出JSON</button>
  <button onClick={() => fileRef.current?.click()} style={S.toolBtn}>📤 导入JSON</button>
  <button onClick={handleCopy} style={{...S.toolBtn, background: copied ? "#ecf5ec" : "#fff"}}>
    {copied ? "✅ 已复制!" : "📋 复制JSON"}
  </button>
  <button onClick={() => setShowPasteModal(true)} style={S.toolBtn}>📋 粘贴导入</button>
  {saveStatus === "saved" && (
    <span style={{ fontSize: 12, color: "#2d7a3a", alignSelf: "center" }}>☁️ 已自动保存</span>
  )}
  <input ref={fileRef} type="file" accept=".json" style={{ display: "none" }} onChange={handleImport} />
</div>
```

### Style for toolbar buttons
```jsx
toolBtn: {
  padding: "8px 16px",
  borderRadius: 10,
  border: "1px solid #e8e4de",
  background: "#fff",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600,
  color: "#4a4a5a",
  fontFamily: "inherit",
  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
  transition: "all 0.15s",
}
```

---

## Paste Modal (for mobile import)

```jsx
{showPasteModal && (
  <div style={S.overlay} onClick={() => setShowPasteModal(false)}>
    <div style={S.modal} onClick={e => e.stopPropagation()}>
      <div style={{ padding: "20px 24px" }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>📋 粘贴JSON导入</h3>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>
          将之前导出的JSON内容粘贴到下方：
        </p>
        <textarea
          value={pasteText}
          onChange={e => setPasteText(e.target.value)}
          placeholder='{"version":1,"days":[...]}'
          style={{
            ...S.inp,
            minHeight: 200,
            resize: "vertical",
            fontFamily: "monospace",
            fontSize: 12,
          }}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button onClick={() => setShowPasteModal(false)} style={S.canBtn}>取消</button>
          <button onClick={handlePasteImport} style={{ ...S.savBtn, flex: 1 }}>导入</button>
        </div>
      </div>
    </div>
  </div>
)}
```

---

## Mobile Access Instructions

Add a collapsible section at the bottom of the app (before the footer hint):

```jsx
<div style={{ ...S.notesBox, marginTop: 14 }}>
  <div style={{ display: "flex", justifyContent: "space-between", cursor: "pointer" }}
    onClick={() => setShowMobile(!showMobile)}>
    <span style={{ fontSize: 16, fontWeight: 700 }}>📱 如何在手机上使用</span>
    <span style={{ transform: showMobile ? "rotate(180deg)" : "", transition: "0.2s" }}>▾</span>
  </div>
  {showMobile && (
    <div style={{ marginTop: 14, fontSize: 14, color: "#4a4a5a", lineHeight: 1.9 }}>
      <div><strong>方法1: Claude App (推荐)</strong></div>
      <div>◆ 下载 Claude iOS/Android App</div>
      <div>◆ 打开同一个对话，artifact会自动渲染</div>
      <div>◆ 所有交互功能（点击、编辑、地图）均可用</div>
      <div style={{ marginTop: 8 }}><strong>方法2: 导出JSON → 其他设备</strong></div>
      <div>◆ 在电脑上点击"📋 复制JSON"</div>
      <div>◆ 通过微信/Telegram/邮件发给自己</div>
      <div>◆ 在手机Claude App中打开对话，点击"📋 粘贴导入"</div>
      <div style={{ marginTop: 8 }}><strong>方法3: 分享链接</strong></div>
      <div>◆ 在Claude.ai网页版，点击对话右上角"Share"</div>
      <div>◆ 生成分享链接，手机浏览器直接打开</div>
      <div style={{ marginTop: 8 }}><strong>离线使用提示:</strong></div>
      <div>◆ 导出JSON保存到手机本地</div>
      <div>◆ 旅途中可随时导入恢复行程</div>
      <div>◆ Google Maps链接在离线状态也能打开（如已缓存）</div>
    </div>
  )}
</div>
```

---

## New State Variables to Add

```jsx
const [copied, setCopied] = useState(false);
const [saveStatus, setSaveStatus] = useState(""); // "", "saving", "saved"
const [showPasteModal, setShowPasteModal] = useState(false);
const [pasteText, setPasteText] = useState("");
const [showMobile, setShowMobile] = useState(false);
const fileRef = useRef(null);
```

---

## Summary of Changes

1. Add `useRef` for file input
2. Add state: `copied`, `saveStatus`, `showPasteModal`, `pasteText`, `showMobile`
3. Add functions: `handleExport`, `handleImport`, `handleCopy`, `handlePasteImport`
4. Add `useEffect` for auto-save and auto-load with `window.storage`
5. Add toolbar section with 4 buttons between expand/collapse and budget
6. Add paste modal
7. Add mobile instructions collapsible section
8. Add `toolBtn` to styles object `S`
9. Wrap auto-save in try-catch (storage may not be available in all environments)

---

## Testing Checklist

- [ ] Export downloads valid JSON file
- [ ] Import file replaces state correctly
- [ ] Import with invalid JSON shows error
- [ ] Copy to clipboard works
- [ ] Paste modal imports correctly
- [ ] Auto-save persists across page refreshes (in Claude artifacts)
- [ ] Auto-load restores state on mount
- [ ] All buttons are touch-friendly on mobile (min 44px tap target)
- [ ] Toolbar wraps properly on narrow screens
