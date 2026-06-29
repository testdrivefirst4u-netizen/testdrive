"use client";
import { useState, useRef, useEffect } from "react";
import { Upload, Download, Loader2, CheckCircle2, AlertCircle, FileSpreadsheet, X } from "lucide-react";

interface ParsedRow { name: string; mobile: string; email?: string; city?: string; vehicle?: string; [k: string]: string | undefined }

function downloadTemplate() {
  const csv = [
    "name,mobile,email,city,vehicle,vehicleType",
    "Ravi Kumar,9876543210,ravi@email.com,Hyderabad,Hyundai Creta,CAR",
    "Priya Mehta,8765432109,priya@email.com,Mumbai,Maruti Swift,CAR",
  ].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
  a.download = "leads-upload-template.csv"; a.click();
}

export default function BulkUploadPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file,      setFile]      = useState<File | null>(null);
  const [preview,   setPreview]   = useState<ParsedRow[]>([]);
  const [dealerId,  setDealerId]  = useState("");
  const [brandId,   setBrandId]   = useState("");
  const [dealers,   setDealers]   = useState<any[]>([]);
  const [brands,    setBrands]    = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [result,    setResult]    = useState<any>(null);
  const [error,     setError]     = useState("");

  useEffect(() => {
    fetch("/api/admin/dealers?limit=200").then(r => r.json()).then(d => setDealers(d.dealers ?? []));
    fetch("/api/brands").then(r => r.json()).then(d => setBrands(Array.isArray(d) ? d : d.brands ?? []));
  }, []);

  async function handleFile(f: File) {
    setFile(f); setResult(null); setError("");
    // Quick preview using XLSX in-browser
    const XLSX = await import("xlsx");
    const buf  = await f.arrayBuffer();
    const wb   = XLSX.read(buf, { type: "array" });
    const ws   = wb.Sheets[wb.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });
    const normalised = rows.slice(0, 10).map(row => {
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(row)) out[k.toLowerCase().trim()] = String(v ?? "").trim();
      return out as ParsedRow;
    });
    setPreview(normalised);
  }

  async function upload() {
    if (!file) return;
    setUploading(true); setError(""); setResult(null);
    const fd = new FormData();
    fd.append("file", file);
    if (dealerId) fd.append("dealerId", dealerId);
    if (brandId)  fd.append("brandId",  brandId);
    const res  = await fetch("/api/admin/leads/bulk-upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) { setError(data.error ?? "Upload failed"); return; }
    setResult(data);
    setFile(null); setPreview([]);
  }

  const selectedDealer = dealers.find(d => d.id === dealerId);

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Bulk Lead Upload</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Upload CSV or Excel file. Leads are dripped to the dealer based on their daily limit.
          </p>
        </div>
        <button onClick={downloadTemplate}
          className="flex items-center gap-2 text-sm font-bold text-blue-600 border border-blue-200 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-colors">
          <Download className="w-4 h-4" /> Download Template
        </button>
      </div>

      {/* Daily limit info */}
      {selectedDealer && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold text-blue-800">{selectedDealer.name}</p>
            <p className="text-blue-600 mt-0.5">
              Daily limit: <strong>{selectedDealer.maxLeadsPerDay} leads/day</strong> —
              if you upload more, leads will be automatically dripped day by day.
            </p>
          </div>
        </div>
      )}

      {/* Assignment */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
        <p className="text-sm font-bold text-gray-700">Assign To</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Dealer (optional)</label>
            <select value={dealerId} onChange={e => setDealerId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">— Unassigned —</option>
              {dealers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.city})</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Brand (optional)</label>
            <select value={brandId} onChange={e => setBrandId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">— No Brand —</option>
              {brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Upload zone */}
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          file ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/30"
        }`}
        onClick={() => fileRef.current?.click()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onDragOver={e => e.preventDefault()}
      >
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            <div className="text-left">
              <p className="font-bold text-gray-900 text-sm">{file.name}</p>
              <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB · {preview.length}+ rows previewed</p>
            </div>
            <button onClick={e => { e.stopPropagation(); setFile(null); setPreview([]); }}
              className="ml-2 w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors">
              <X className="w-3.5 h-3.5 text-gray-600" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-600">Drop CSV or Excel file here</p>
            <p className="text-xs text-gray-400 mt-1">or click to browse · Max 5,000 rows</p>
            <p className="text-xs text-gray-400 mt-1">Required columns: <strong>name</strong>, <strong>mobile</strong></p>
          </>
        )}
      </div>

      {/* Preview table */}
      {preview.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-bold text-gray-700">Preview (first 10 rows)</p>
            <span className="text-xs text-gray-400">Scroll to see all columns →</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                  {Object.keys(preview[0]).map(k => (
                    <th key={k} className="text-left px-4 py-2.5 whitespace-nowrap">{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                    {Object.values(row).map((v, j) => (
                      <td key={j} className="px-4 py-2.5 text-gray-700 max-w-[150px] truncate">{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-2xl">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <p className="font-bold text-emerald-800">Upload Complete</p>
          </div>
          <p className="text-sm text-emerald-700">{result.message}</p>
          <div className="flex gap-4 text-sm">
            <span className="font-bold text-emerald-700">✓ {result.created} imported</span>
            {result.errors > 0 && <span className="font-bold text-red-600">✗ {result.errors} failed</span>}
          </div>
          {result.errorDetails?.length > 0 && (
            <div className="mt-2 bg-red-50 border border-red-100 rounded-xl p-3 text-xs space-y-1">
              <p className="font-bold text-red-700">Row errors (first 20):</p>
              {result.errorDetails.map((e: any, i: number) => (
                <p key={i} className="text-red-600">Row {e.row}: {e.error}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload button */}
      {file && !result && (
        <button onClick={upload} disabled={uploading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors text-sm">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? "Uploading…" : `Import Leads from ${file.name}`}
        </button>
      )}

      {/* Format guide */}
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
        <p className="text-sm font-bold text-gray-700 mb-3">Accepted Column Names</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4 text-xs text-gray-600">
          {[
            ["name", "Required — customer name"],
            ["mobile", "Required — phone number"],
            ["email", "Customer email"],
            ["city", "Customer city"],
            ["vehicle / vehicleName", "Vehicle of interest"],
            ["vehicleType", "CAR / BIKE / EV etc."],
          ].map(([col, desc]) => (
            <div key={col}>
              <code className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">{col}</code>
              <p className="text-gray-400 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
