"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Youtube from "@tiptap/extension-youtube";
import CharacterCount from "@tiptap/extension-character-count";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import { useCallback, useState } from "react";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, Code2,
  Heading1, Heading2, Heading3, List, ListOrdered, Quote,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link as LinkIcon, Image as ImageIcon, Youtube as YoutubeIcon,
  Undo, Redo, Minus, Table as TableIcon, Highlighter, Pilcrow,
  ChevronDown, X, Upload, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: number;
  showCharCount?: boolean;
}

const COLORS = [
  "#000000", "#374151", "#6B7280", "#EF4444", "#F97316",
  "#EAB308", "#22C55E", "#3B82F6", "#8B5CF6", "#EC4899",
  "#FFFFFF", "#F3F4F6", "#D1D5DB", "#FCA5A5", "#FCD34D",
  "#86EFAC", "#93C5FD", "#C4B5FD", "#F9A8D4", "#FED7AA",
];

function ToolbarButton({
  onClick, active, disabled, title, children, className,
}: {
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick?.(); }}
      disabled={disabled}
      title={title}
      className={cn(
        "h-8 w-8 flex items-center justify-center rounded-md text-sm transition-all",
        "hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed",
        active ? "bg-gray-900 text-white hover:bg-gray-800" : "text-gray-700",
        className
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-0.5" />;
}

export function RichTextEditor({ value, onChange, placeholder = "Start writing…", minHeight = 320, showCharCount = false }: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [ytOpen, setYtOpen] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-blue-600 underline cursor-pointer" } }),
      Image.configure({ HTMLAttributes: { class: "max-w-full rounded-lg my-2" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
      Youtube.configure({ HTMLAttributes: { class: "w-full aspect-video rounded-lg my-2" } }),
      CharacterCount,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none px-6 py-5",
        style: `min-height: ${minHeight}px`,
      },
    },
  });

  const addLink = useCallback(() => {
    if (!editor) return;
    if (!linkUrl.trim()) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: linkUrl.trim() }).run();
    }
    setLinkUrl("");
    setLinkOpen(false);
  }, [editor, linkUrl]);

  const addYoutube = useCallback(() => {
    if (!editor || !youtubeUrl.trim()) return;
    editor.chain().focus().setYoutubeVideo({ src: youtubeUrl.trim() }).run();
    setYoutubeUrl("");
    setYtOpen(false);
  }, [editor, youtubeUrl]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    setImgUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: reader.result, fileName: file.name, folder: "content" }),
        });
        const d = await res.json();
        if (d.url) {
          editor.chain().focus().setImage({ src: d.url, alt: file.name }).run();
          toast.success("Image inserted");
        }
        setImgUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Image upload failed");
      setImgUploading(false);
    }
  }

  if (!editor) return null;

  const charCount = editor.storage.characterCount?.characters?.() ?? 0;
  const wordCount = editor.storage.characterCount?.words?.() ?? 0;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
      {/* Bubble Menu (appears on text selection) */}
      <BubbleMenu editor={editor} tippyOptions={{ duration: 150 }} className="flex items-center gap-0.5 bg-gray-900 text-white rounded-lg shadow-xl p-1 border border-gray-700">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold" className="hover:bg-gray-700 text-white">
          <Bold className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic" className="hover:bg-gray-700 text-white">
          <Italic className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline" className="hover:bg-gray-700 text-white">
          <UnderlineIcon className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight({ color: "#FDE047" }).run()} active={editor.isActive("highlight")} title="Highlight" className="hover:bg-gray-700 text-white">
          <Highlighter className="w-3.5 h-3.5" />
        </ToolbarButton>
        <div className="w-px h-4 bg-gray-600 mx-0.5" />
        <ToolbarButton onClick={() => { const url = editor.getAttributes("link").href; setLinkUrl(url || ""); setLinkOpen(true); }} active={editor.isActive("link")} title="Link" className="hover:bg-gray-700 text-white">
          <LinkIcon className="w-3.5 h-3.5" />
        </ToolbarButton>
      </BubbleMenu>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-gray-100 bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
        {/* Undo/Redo */}
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
          <Redo className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Headings */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="h-8 flex items-center gap-1 px-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 font-medium"
            >
              {editor.isActive("heading", { level: 1 }) ? "H1" :
               editor.isActive("heading", { level: 2 }) ? "H2" :
               editor.isActive("heading", { level: 3 }) ? "H3" : "Para"}
              <ChevronDown className="w-3 h-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-44 p-1" align="start">
            {[
              { label: "Paragraph", icon: Pilcrow, action: () => editor.chain().focus().setParagraph().run(), active: editor.isActive("paragraph") },
              { label: "Heading 1", icon: Heading1, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive("heading", { level: 1 }) },
              { label: "Heading 2", icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }) },
              { label: "Heading 3", icon: Heading3, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive("heading", { level: 3 }) },
            ].map(({ label, icon: Icon, action, active }) => (
              <button
                key={label}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); action(); }}
                className={cn("flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-gray-50", active && "bg-gray-100 font-semibold")}
              >
                <Icon className="w-4 h-4 text-gray-500" /> {label}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        <Divider />

        {/* Format */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold (Ctrl+B)">
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic (Ctrl+I)">
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline (Ctrl+U)">
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Inline Code">
          <Code className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight({ color: "#FDE047" }).run()} active={editor.isActive("highlight")} title="Highlight">
          <Highlighter className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Text Color */}
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" className="h-8 w-8 flex flex-col items-center justify-center gap-0.5 rounded-md hover:bg-gray-100" title="Text color">
              <span className="text-xs font-bold text-gray-700 leading-none">A</span>
              <span className="w-4 h-1 rounded-sm" style={{ backgroundColor: editor.getAttributes("textStyle").color || "#000" }} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="start">
            <p className="text-xs text-gray-500 mb-2 font-medium">Text Color</p>
            <div className="grid grid-cols-10 gap-1">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setColor(c).run(); }}
                  className="w-4 h-4 rounded-sm border border-gray-200 hover:scale-110 transition-transform"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetColor().run(); }} className="mt-2 text-xs text-gray-500 hover:text-gray-700 w-full text-left">
              Remove color
            </button>
          </PopoverContent>
        </Popover>

        <Divider />

        {/* Lists */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered List">
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Quote">
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code Block">
          <Code2 className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Alignment */}
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align Left">
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Center">
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align Right">
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} title="Justify">
          <AlignJustify className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Insert */}
        <Popover open={linkOpen} onOpenChange={setLinkOpen}>
          <PopoverTrigger asChild>
            <ToolbarButton active={editor.isActive("link")} title="Insert Link">
              <LinkIcon className="w-4 h-4" />
            </ToolbarButton>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3" align="start">
            <p className="text-sm font-semibold mb-2">Insert Link</p>
            <div className="flex gap-2">
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addLink()}
                placeholder="https://..."
                className="text-sm h-8"
              />
              <Button size="sm" onClick={addLink} className="h-8 shrink-0">Add</Button>
            </div>
            {editor.isActive("link") && (
              <button type="button" onClick={() => { editor.chain().focus().unsetLink().run(); setLinkOpen(false); }} className="text-xs text-red-500 mt-2 hover:text-red-700">
                Remove link
              </button>
            )}
          </PopoverContent>
        </Popover>

        {/* Image upload */}
        <label className={cn("h-8 w-8 flex items-center justify-center rounded-md cursor-pointer hover:bg-gray-100 text-gray-700", imgUploading && "opacity-50 cursor-not-allowed")} title="Upload Image">
          {imgUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={imgUploading} />
        </label>

        {/* YouTube embed */}
        <Popover open={ytOpen} onOpenChange={setYtOpen}>
          <PopoverTrigger asChild>
            <ToolbarButton title="Embed YouTube Video">
              <YoutubeIcon className="w-4 h-4" />
            </ToolbarButton>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3" align="start">
            <p className="text-sm font-semibold mb-2">Embed YouTube</p>
            <div className="flex gap-2">
              <Input
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addYoutube()}
                placeholder="YouTube URL…"
                className="text-sm h-8"
              />
              <Button size="sm" onClick={addYoutube} className="h-8 shrink-0">Embed</Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Table */}
        <Popover>
          <PopoverTrigger asChild>
            <ToolbarButton title="Insert Table">
              <TableIcon className="w-4 h-4" />
            </ToolbarButton>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="start">
            <p className="text-xs text-gray-500 mb-2 font-medium">Table</p>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); }} className="text-sm w-full text-left px-2 py-1.5 hover:bg-gray-50 rounded">
              Insert 3×3 Table
            </button>
            {editor.isActive("table") && (
              <>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addColumnAfter().run(); }} className="text-sm w-full text-left px-2 py-1.5 hover:bg-gray-50 rounded">Add Column</button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addRowAfter().run(); }} className="text-sm w-full text-left px-2 py-1.5 hover:bg-gray-50 rounded">Add Row</button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().deleteTable().run(); }} className="text-sm w-full text-left px-2 py-1.5 hover:bg-gray-50 rounded text-red-600">Delete Table</button>
              </>
            )}
          </PopoverContent>
        </Popover>

        <Divider />

        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
          <Minus className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} className="w-full" />

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-400">
        <span>{wordCount} words · {charCount} characters</span>
        <span className="text-gray-300">Ctrl+B Bold · Ctrl+I Italic · Ctrl+K Link</span>
      </div>
    </div>
  );
}
