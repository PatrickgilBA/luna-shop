"use client";
// Knappen "Upload images" i produktformuläret. Man väljer en eller flera
// bilder; varje bild görs mindre i webbläsaren (lib/resize-image.js) och
// skickas till /api/admin/images. När den är uppladdad får formuläret
// bildens adress (onUploaded).

import { useId, useState } from "react";
import { resizeImage } from "@/lib/resize-image";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

export default function ImageUpload({ onUploaded }) {
  const inputId = useId();
  const [status, setStatus] = useState(""); // t.ex. "Uploading 1 of 3…"
  const [error, setError] = useState("");

  async function handleFiles(event) {
    const files = [...event.target.files];
    event.target.value = ""; // så att samma fil kan väljas igen
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
