'use client'
import { Upload, X } from "lucide-react";
import { useState } from "react";

interface Props {
  label: string;
  value: string;
  uploadFn: (file: File) => Promise<string>;
  onChange: (url: string) => void;
  className?: string;
}

export const ImageUpload = ({ label, value, uploadFn, onChange, className = "" }: Props) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File) => {
    setError("");
    setUploading(true);
    try {
      const url = await uploadFn(file);
      onChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`grid gap-2 ${className}`}>
      <p className="text-sm font-medium">{label}</p>
      {value ? (
        <div className="relative w-fit">
          <img src={value} alt={label} className="h-32 w-auto border border-line object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-1 top-1 rounded bg-white p-0.5 shadow-sm hover:bg-bone"
          >
            <X size={13} />
          </button>
        </div>
      ) : null}
      <label
        className={`flex cursor-pointer items-center gap-2 border border-dashed border-line bg-bone/50 p-3 text-sm text-muted transition-colors hover:border-ink hover:text-ink ${uploading ? "cursor-not-allowed opacity-50" : ""}`}
      >
        <Upload size={15} />
        {uploading ? "Uploading…" : "Choose image"}
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </label>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
};
