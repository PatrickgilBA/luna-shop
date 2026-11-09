"use client";
// The "Upload images" button in the product form. You choose one or more
// images; each one is made smaller in the browser (lib/resize-image.js) and
// sent to /api/admin/images. Once it is uploaded, the form gets
// the image's address (onUploaded).

import { useId, useState } from "react";
import { resizeImage } from "@/lib/resize-image";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

export default function ImageUpload({ onUploaded }) {
  const inputId = useId();
  const [status, setStatus] = useState(""); // e.g. "Uploading 1 of 3…"
  const [error, setError] = useState("");

  async function handleFiles(event) {
    const files = [...event.target.files];
    event.target.value = ""; // so the same file can be chosen again
    setError("");

    for (const [index, file] of files.entries()) {
      if (!ACCEPTED.includes(file.type)) {
        setError(`"${file.name}" isn't a JPEG, PNG or WebP image.`);
        continue;
      }
      setStatus(`Uploading ${index + 1} of ${files.length}…`);
      try {
        const body = new FormData();
        body.append("file", await resizeImage(file), "image.jpg");
        const response = await fetch("/api/admin/images", { method: "POST", body });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Upload failed.");
        onUploaded(data.url);
      } catch (err) {
        setError(`"${file.name}": ${err.message}`);
      }
    }
    setStatus("");
  }

  return (
    <div className="image-upload">
      <label htmlFor={inputId} className={status ? "button button--light is-busy" : "button button--light"}>
        {status || "Upload images"}
      </label>
      <input
        id={inputId}
        type="file"
        accept={ACCEPTED.join(",")}
        multiple
        onChange={handleFiles}
        disabled={Boolean(status)}
        className="visually-hidden"
      />
      <span className="field-hint">JPEG, PNG or WebP. Big photos are made smaller automatically.</span>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
