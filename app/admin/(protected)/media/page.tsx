"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Upload, Trash2, Copy, Check, Search, Grid3X3, List,
  Folder, FolderOpen, ChevronRight, Image as ImageIcon,
  X, Loader2, RefreshCw, FileVideo, File, ZoomIn,
  ArrowLeft, Info, Download, AlertTriangle,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────── */
interface IKFile {
  fileId: string;
  name: string;
  url: string;
  thumbnail?: string;
  filePath: string;
  fileType: string;
  size: number;
  width?: number;
  height?: number;
  createdAt: string;
  type?: string;
}

interface IKFolder {
  folderId?: string;
  name: string;
  folderPath: string;
  type: "folder";
}

/* ─── Helpers ─────────────────────────────────────────────── */
function fmt(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function thumb(file: IKFile) {
  if (file.thumbnail) return file.thumbnail;
  if (file.fileType === "image") return `${file.url}?tr=w-240,h-180,fo-auto,q-60`;
  return null;
}

function FileIcon({ fileType, className }: { fileType: string; className?: string }) {
  if (fileType === "image") return <ImageIcon className={className} />;
  if (fileType === "non-image" && /video/i.test(fileType)) return <FileVideo className={className} />;
  return <File className={className} />;
}

const FOLDERS = [
  { label: "All Media",  path: "/walley"          },
  { label: "Vehicles",   path: "/walley/vehicles"  },
  { label: "Brands",     path: "/walley/brands"    },
  { label: "News",       path: "/walley/news"      },
  { label: "Blogs",      path: "/walley/blogs"     },
  { label: "Banners",    path: "/walley/banners"   },
  { label: "Misc",       path: "/walley/misc"      },
];

/* ─── Main Component ──────────────────────────────────────── */
export default function MediaLibraryPage() {
  const [folder, setFolder]   = useState("/walley");
  const [search, setSearch]   = useState("");
  const [type, setType]       = useState("image");
  const [view, setView]       = useState<"grid" | "list">("grid");
  const [page, setPage]       = useState(1);

  const [files, setFiles]     = useState<IKFile[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [preview, setPreview]   = useState<IKFile | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileRef = useRef<HTMLInputElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (reset = false) => {
    setLoading(true);
    setError("");
    const p = reset ? 1 : page;
    if (reset) setPage(1);

    try {
      const params = new URLSearchParams({ folder, type, page: String(p), limit: "48" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/media?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setFiles(reset ? data.files : (prev) => [...prev, ...data.files]);
      setHasMore(data.hasMore);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [folder, search, type, page]);

  useEffect(() => {
    load(true);
  }, [folder, type]);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(true), 400);
  }, [search]);

  function toggleSelect(fileId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(fileId)) next.delete(fileId);
      else next.add(fileId);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(files.map((f) => f.fileId)));
  }

  function clearSelection() {
    setSelected(new Set());
  }

  async function copyUrl(file: IKFile) {
    await navigator.clipboard.writeText(file.url).catch(() => {});
    setCopiedId(file.fileId);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function deleteSelected() {
    if (!selected.size) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileIds: Array.from(selected) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setFiles((prev) => prev.filter((f) => !selected.has(f.fileId)));
      if (preview && selected.has(preview.fileId)) setPreview(null);
      setSelected(new Set());
      setDeleteConfirm(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  }

  async function deleteSingle(file: IKFile) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/media/${file.fileId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setFiles((prev) => prev.filter((f) => f.fileId !== file.fileId));
      if (preview?.fileId === file.fileId) setPreview(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (!fileList?.length) return;
    setUploading(true);
    setUploadProgress(0);

    const total = fileList.length;
    let done = 0;

    for (const f of Array.from(fileList)) {
      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(f);
        });

        const subFolder = folder.replace("/walley", "").replace(/^\//, "") || "";

        await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: base64, fileName: f.name, folder: subFolder }),
        });
      } catch {}
      done++;
      setUploadProgress(Math.round((done / total) * 100));
    }

    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    load(true);
  }

  const folderLabel = FOLDERS.find((f) => f.path === folder)?.label ?? folder.split("/").pop();

  return (
    <div className="flex h-full gap-0 -m-6">

      {/* ── Sidebar ─────────────────────────────────── */}
      <aside className="w-52 shrink-0 bg-white border-r border-gray-100 flex flex-col py-4 overflow-y-auto">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-4 mb-3">Folders</p>
        {FOLDERS.map((f) => (
          <button key={f.path} onClick={() => { setFolder(f.path); setSelected(new Set()); setPreview(null); }}
            className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-all text-left ${
              folder === f.path
                ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                : "text-gray-500 hover:bg-slate-50 hover:text-gray-800"
            }`}>
            {folder === f.path
              ? <FolderOpen className="w-4 h-4 text-blue-600 shrink-0" />
              : <Folder className="w-4 h-4 shrink-0" />
            }
            {f.label}
          </button>
        ))}
      </aside>

      {/* ── Main panel ──────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <div className="bg-white border-b border-gray-100 px-5 py-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 min-w-0">
            <span className="text-gray-400">Media</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
            <span className="truncate">{folderLabel}</span>
            {files.length > 0 && <span className="text-gray-400 font-normal text-xs">({files.length})</span>}
          </div>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files…"
              className="pl-8 pr-3 h-8 w-48 rounded-xl border border-gray-200 text-xs focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>

          {/* Type filter */}
          <div className="flex rounded-xl border border-gray-200 overflow-hidden">
            {(["image", "non-image", "all"] as const).map((t) => (
              <button key={t} onClick={() => setType(t)}
                className={`px-3 h-8 text-xs font-semibold transition-all ${
                  type === t ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"
                }`}>
                {t === "image" ? "Images" : t === "non-image" ? "Videos/Docs" : "All"}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex rounded-xl border border-gray-200 overflow-hidden">
            <button onClick={() => setView("grid")} className={`px-3 h-8 transition-all ${view === "grid" ? "bg-gray-100 text-gray-700" : "text-gray-400 hover:bg-gray-50"}`}>
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setView("list")} className={`px-3 h-8 transition-all ${view === "list" ? "bg-gray-100 text-gray-700" : "text-gray-400 hover:bg-gray-50"}`}>
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Refresh */}
          <button onClick={() => load(true)} disabled={loading}
            className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>

          {/* Upload */}
          <label className="flex items-center gap-1.5 h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-all">
            <Upload className="w-3.5 h-3.5" />
            {uploading ? `${uploadProgress}%` : "Upload"}
            <input ref={fileRef} type="file" multiple accept="image/*,video/*,.pdf,.svg" className="hidden" onChange={handleUpload} />
          </label>
        </div>

        {/* Selection toolbar */}
        {selected.size > 0 && (
          <div className="bg-blue-50 border-b border-blue-100 px-5 py-2 flex items-center gap-3">
            <span className="text-xs font-bold text-blue-700">{selected.size} selected</span>
            <button onClick={clearSelection} className="text-xs text-blue-500 hover:text-blue-700">Deselect all</button>
            <button onClick={selectAll} className="text-xs text-blue-500 hover:text-blue-700">Select all</button>
            <div className="flex-1" />
            {!deleteConfirm ? (
              <button onClick={() => setDeleteConfirm(true)}
                className="flex items-center gap-1.5 h-7 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all">
                <Trash2 className="w-3 h-3" /> Delete {selected.size} file{selected.size > 1 ? "s" : ""}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-xs font-semibold text-red-700">Permanently delete {selected.size} files?</span>
                <button onClick={deleteSelected} disabled={deleting}
                  className="h-7 px-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1">
                  {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                  Yes, delete
                </button>
                <button onClick={() => setDeleteConfirm(false)} className="h-7 px-3 bg-white border border-gray-200 text-xs font-semibold rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="m-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-xs text-red-700">
            <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
            <button onClick={() => setError("")} className="ml-auto"><X className="w-3.5 h-3.5" /></button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">

          {loading && files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-sm text-gray-400">Loading media from ImageKit…</p>
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <ImageIcon className="w-12 h-12 text-gray-200" />
              <p className="text-sm font-semibold text-gray-400">No files found</p>
              <p className="text-xs text-gray-300">Upload images to see them here</p>
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {files.map((file) => {
                const isSelected = selected.has(file.fileId);
                const thumbnailUrl = thumb(file);
                return (
                  <div key={file.fileId}
                    onClick={() => { setPreview(file); }}
                    className={`group relative rounded-2xl border-2 overflow-hidden cursor-pointer transition-all duration-150 ${
                      isSelected ? "border-blue-500 shadow-lg shadow-blue-500/20" : "border-transparent hover:border-blue-200"
                    }`}>

                    {/* Thumbnail */}
                    <div className="aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">
                      {thumbnailUrl ? (
                        <img src={thumbnailUrl} alt={file.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                      ) : (
                        <File className="w-8 h-8 text-gray-300" />
                      )}
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-150 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSelect(file.fileId); }}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-white transition-all ${
                          isSelected ? "bg-blue-600" : "bg-white/20 hover:bg-blue-600"
                        }`}>
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); copyUrl(file); }}
                        className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-all">
                        {copiedId === file.fileId ? <Check className="w-3.5 h-3.5 text-green-300" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteSingle(file); }}
                        className="w-7 h-7 rounded-lg bg-white/20 hover:bg-red-600 flex items-center justify-center text-white transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Selected checkmark */}
                    {isSelected && (
                      <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}

                    {/* File name */}
                    <div className="p-2 bg-white">
                      <p className="text-[10px] text-gray-600 truncate leading-tight">{file.name}</p>
                      <p className="text-[9px] text-gray-400 mt-0.5">{fmt(file.size)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List view */
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-slate-50/60">
                    <th className="w-8 px-4 py-3">
                      <input type="checkbox"
                        checked={selected.size === files.length && files.length > 0}
                        onChange={(e) => e.target.checked ? selectAll() : clearSelection()}
                        className="rounded accent-blue-600 cursor-pointer" />
                    </th>
                    <th className="text-left px-3 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">File</th>
                    <th className="text-left px-3 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Path</th>
                    <th className="text-left px-3 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Size</th>
                    <th className="text-left px-3 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Dimensions</th>
                    <th className="text-left px-3 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden xl:table-cell">Date</th>
                    <th className="px-3 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {files.map((file) => {
                    const thumbnailUrl = thumb(file);
                    const isSelected = selected.has(file.fileId);
                    return (
                      <tr key={file.fileId} onClick={() => setPreview(file)}
                        className={`hover:bg-slate-50 cursor-pointer transition-colors ${isSelected ? "bg-blue-50" : ""}`}>
                        <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" checked={isSelected}
                            onChange={() => toggleSelect(file.fileId)}
                            className="rounded accent-blue-600 cursor-pointer" />
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                              {thumbnailUrl
                                ? <img src={thumbnailUrl} alt={file.name} className="w-full h-full object-cover" />
                                : <File className="w-4 h-4 text-gray-300" />
                              }
                            </div>
                            <p className="text-xs font-semibold text-gray-800 truncate max-w-[160px]">{file.name}</p>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 hidden md:table-cell">
                          <p className="text-[10px] text-gray-400 truncate max-w-[180px]">{file.filePath}</p>
                        </td>
                        <td className="px-3 py-2.5 hidden sm:table-cell">
                          <p className="text-xs text-gray-500">{fmt(file.size)}</p>
                        </td>
                        <td className="px-3 py-2.5 hidden lg:table-cell">
                          <p className="text-xs text-gray-500">
                            {file.width && file.height ? `${file.width}×${file.height}` : "—"}
                          </p>
                        </td>
                        <td className="px-3 py-2.5 hidden xl:table-cell">
                          <p className="text-[10px] text-gray-400">
                            {new Date(file.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </td>
                        <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <button onClick={() => copyUrl(file)}
                              className="w-7 h-7 rounded-lg border border-gray-200 hover:border-blue-300 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-all">
                              {copiedId === file.fileId ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => deleteSingle(file)}
                              className="w-7 h-7 rounded-lg border border-gray-200 hover:border-red-300 flex items-center justify-center text-gray-400 hover:text-red-600 transition-all">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Load more */}
          {hasMore && (
            <div className="mt-6 text-center">
              <button onClick={() => { setPage((p) => p + 1); load(); }} disabled={loading}
                className="h-9 px-6 bg-white border border-gray-200 hover:border-blue-300 text-sm font-semibold text-gray-600 hover:text-blue-700 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 mx-auto">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Load more
              </button>
            </div>
          )}

          {uploading && (
            <div className="fixed bottom-6 right-6 bg-white border border-blue-100 rounded-2xl shadow-xl p-4 flex items-center gap-3 z-50">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-gray-800">Uploading to ImageKit…</p>
                <div className="mt-1.5 w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
              <span className="text-xs font-bold text-blue-600">{uploadProgress}%</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Detail Panel ─────────────────────────────── */}
      {preview && (
        <aside className="w-72 shrink-0 bg-white border-l border-gray-100 flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-500" /> File Details
            </p>
            <button onClick={() => setPreview(null)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Preview */}
          <div className="p-4 border-b border-gray-50">
            {thumb(preview) ? (
              <div className="rounded-xl overflow-hidden bg-slate-100 aspect-video flex items-center justify-center">
                <img src={thumb(preview)!} alt={preview.name} className="max-w-full max-h-full object-contain" />
              </div>
            ) : (
              <div className="rounded-xl bg-slate-100 aspect-video flex items-center justify-center">
                <File className="w-10 h-10 text-gray-300" />
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="p-4 space-y-3 flex-1">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">File Name</p>
              <p className="text-sm font-semibold text-gray-800 break-all">{preview.name}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Path</p>
              <p className="text-xs text-gray-600 break-all">{preview.filePath}</p>
            </div>
            {preview.width && preview.height && (
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Dimensions</p>
                <p className="text-xs text-gray-600">{preview.width} × {preview.height} px</p>
              </div>
            )}
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">File Size</p>
              <p className="text-xs text-gray-600">{fmt(preview.size)}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Type</p>
              <p className="text-xs text-gray-600">{preview.fileType}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Uploaded</p>
              <p className="text-xs text-gray-600">
                {new Date(preview.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>

            {/* URL */}
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-1">URL</p>
              <div className="flex items-center gap-1.5">
                <input readOnly value={preview.url}
                  className="flex-1 min-w-0 text-[10px] text-gray-500 bg-slate-50 border border-gray-200 rounded-lg px-2 py-1.5 outline-none truncate" />
                <button onClick={() => copyUrl(preview)}
                  className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white transition-all shrink-0">
                  {copiedId === preview.fileId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-gray-50 space-y-2">
            <a href={preview.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 h-8 w-full bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs font-semibold rounded-xl transition-all">
              <ZoomIn className="w-3.5 h-3.5" /> Open Original
            </a>
            <a href={preview.url} download={preview.name}
              className="flex items-center justify-center gap-2 h-8 w-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl transition-all">
              <Download className="w-3.5 h-3.5" /> Download
            </a>
            <button onClick={() => deleteSingle(preview)} disabled={deleting}
              className="flex items-center justify-center gap-2 h-8 w-full bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 text-xs font-semibold rounded-xl transition-all">
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Delete File
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
