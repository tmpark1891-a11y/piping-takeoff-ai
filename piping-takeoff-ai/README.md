# 🔧 PipeAI — Mechanical Piping & HVAC Takeoff

An AI-powered mechanical material takeoff tool. Upload PDF drawings → AI generates piping LF, HVAC equipment lists, fittings, valves, and more → Export to Excel.

> Similar to Stack'd construction takeoff software, but AI-driven with no cost database required.

![PipeAI Screenshot](https://via.placeholder.com/800x400/0a0c0f/e8a020?text=PipeAI+Mechanical+Takeoff)

---

## ✅ What It Does

| Feature | Details |
|---|---|
| 📄 PDF Import | Upload one or multiple mechanical PDF drawings |
| 🤖 AI Analysis | Claude AI reads and extracts all mechanical items |
| 📏 Piping LF | Linear footage by pipe size and material |
| 🌀 Fittings | Elbows, tees, reducers, flanges by size and type |
| 🚰 Valves | Gate, ball, butterfly, check by size and type |
| 🏭 HVAC Equipment | AHUs, FCUs, VAV boxes, chillers, pumps, boilers |
| 💨 Ductwork | Rectangular/round duct in LF by size and gauge |
| 🧱 Insulation | Pipe insulation by type, thickness, LF/SF |
| 🔩 Hangers & Supports | By type and quantity |
| ✏️ Editable | Click any cell to edit quantities, descriptions, sizes |
| 📊 Excel Export | Multi-tab spreadsheet with summary + one tab per category |

---

## 🚀 Step-by-Step: Launch the App

### Prerequisites

Make sure you have installed:
- **Node.js** v18 or newer — [download at nodejs.org](https://nodejs.org)
- **Git** — [download at git-scm.com](https://git-scm.com)

Verify by running:
```bash
node --version   # should say v18.x.x or higher
npm --version    # should say 9.x.x or higher
```

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/piping-takeoff-ai.git
cd piping-takeoff-ai
```

> Replace `YOUR_USERNAME` with your actual GitHub username after pushing.

---

### Step 2 — Install Dependencies

```bash
npm install
```

This installs:
- `react` & `react-dom` — UI framework
- `vite` — fast development server
- `pdfjs-dist` — PDF text extraction
- `xlsx` — Excel file generation
- `lucide-react` — icons

---

### Step 3 — Get Your Anthropic API Key

1. Go to [https://console.anthropic.com/api-keys](https://console.anthropic.com/api-keys)
2. Sign up or log in
3. Click **"Create Key"**
4. Copy the key — it starts with `sk-ant-api03-...`

> ⚠️ Keep your API key private. Never commit it to GitHub.

---

### Step 4 — Start the Development Server

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in 300 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.x.x:3000/
```

---

### Step 5 — Open the App

Open your browser and go to:
```
http://localhost:3000
```

---

### Step 6 — Add Your API Key in the App

1. Click **"Settings"** in the top-right corner
2. Paste your Anthropic API key into the field
3. Click **"Save Settings"**
4. The status badge will change to **"AI READY"** ✅

---

### Step 7 — Run Your First Takeoff

1. **Upload PDFs** — Drag and drop mechanical drawing PDFs into the upload zone
   - Works with: piping plans, HVAC schedules, equipment schedules, mechanical specs
   
2. **Enter project name** — Type your project name in the top bar (used for the Excel filename)

3. **Click "Generate AI Takeoff"** — AI will:
   - Extract text from all PDF pages
   - Analyze for all mechanical items
   - Generate categorized line items

4. **Review & Edit** — Click any cell in the table to edit quantities, sizes, or descriptions

5. **Export to Excel** — Click "Export Excel" to download a formatted spreadsheet

---

## 🏗️ Build for Production

To create an optimized production build:

```bash
npm run build
```

Files are output to the `/dist` folder. To preview the production build locally:

```bash
npm run preview
```

---

## 🌐 Deploy to GitHub Pages (Free Hosting)

### Option A: GitHub Pages

1. Update `vite.config.js` — add your repo name as `base`:
```js
export default defineConfig({
  base: '/piping-takeoff-ai/',   // ← add this line
  plugins: [react()],
  // ...
})
```

2. Install the deploy tool:
```bash
npm install --save-dev gh-pages
```

3. Add these scripts to `package.json`:
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

4. Deploy:
```bash
npm run deploy
```

5. Go to your repo on GitHub → **Settings → Pages** → set source to `gh-pages` branch

Your app will be live at: `https://YOUR_USERNAME.github.io/piping-takeoff-ai/`

---

### Option B: Netlify (Easiest)

1. Run `npm run build`
2. Go to [netlify.com](https://netlify.com) → drag the `/dist` folder into the deploy area
3. Done — you get a free URL instantly

---

### Option C: Vercel

```bash
npm install -g vercel
vercel
```

Follow the prompts — it auto-detects Vite and deploys.

---

## 📁 Project Structure

```
piping-takeoff-ai/
├── public/
│   └── pipe-icon.svg           # App favicon
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Top navigation bar
│   │   ├── SettingsModal.jsx   # API key settings
│   │   ├── UploadZone.jsx      # PDF drag-and-drop upload
│   │   └── TakeoffTable.jsx    # Editable takeoff table
│   ├── utils/
│   │   ├── pdfExtractor.js     # PDF.js text extraction
│   │   ├── aiAnalyzer.js       # Anthropic API integration
│   │   └── excelExporter.js    # SheetJS Excel export
│   ├── App.jsx                 # Main application
│   ├── main.jsx                # React entry point
│   └── index.css               # Global styles
├── index.html                  # HTML template
├── vite.config.js              # Vite configuration
├── package.json                # Dependencies
└── README.md                   # This file
```

---

## 🎯 Supported Takeoff Categories

| Category | Examples |
|---|---|
| **Piping** | 2" CS SCH 40, 4" SS SCH 10, 1" Copper Type L |
| **Fittings** | 90° Elbows, Tees, Reducers, Flanges, Unions |
| **Valves** | Gate, Ball, Butterfly, Globe, Check, PRV |
| **HVAC Equipment** | AHU, FCU, VAV, Chiller, Boiler, Pump, Cooling Tower |
| **Ductwork** | Rectangular galv. duct, round spiral duct in LF |
| **Insulation** | 1.5" fiberglass, 2" calcium silicate, vapor barrier |
| **Hangers & Supports** | Clevis, trapeze, rod, strut, pipe clamps |
| **Sheet Metal** | Duct fittings, transitions, diffusers, registers |

---

## 💡 Tips for Best Results

- **Text-based PDFs** work best. Scanned/image PDFs will have lower accuracy.
- Upload **multiple files at once** — the AI analyzes them all together.
- Use the **Refine** panel to ask the AI to add missing items or adjust quantities.
- Always **review and edit** AI output before finalizing — AI is a starting point.
- Include **equipment schedules** and **pipe size schedules** for highest accuracy.

---

## 🔑 API Usage & Cost

This app uses the **Claude claude-sonnet-4** model. Approximate costs per takeoff:
- Small drawings (1-3 pages): ~$0.01–$0.05
- Large set (10-20 pages): ~$0.10–$0.50

Monitor usage at [console.anthropic.com](https://console.anthropic.com)

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---|---|
| `AI READY` not showing | Add API key in Settings |
| PDF text not extracted | Make sure PDF is not password-protected |
| Low accuracy | Add more context in Refine panel; check if PDF is image-based |
| Excel not downloading | Allow pop-ups/downloads in your browser |
| CORS error | Make sure you're running `npm run dev`, not opening HTML directly |

---

## 📜 License

MIT — free for personal and commercial use.

---

Built with React + Vite + Anthropic Claude AI + PDF.js + SheetJS
