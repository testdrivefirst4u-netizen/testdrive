"use client";

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ImageUpload({ setImage }: { setImage: (url: string) => void }) {
  const handleUpload = async (file: File) => {
    const base64 = await fileToBase64(file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: JSON.stringify({ file: base64, fileName: file.name }),
    });
    const data = await res.json();
    setImage(data.url);
  };

  return (
    <div
      className="border p-6"
      onDrop={(e) => { e.preventDefault(); handleUpload(e.dataTransfer.files[0]); }}
      onDragOver={(e) => e.preventDefault()}
    >
      Drag & Drop Image
    </div>
  );
}
