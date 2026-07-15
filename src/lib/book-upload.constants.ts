export const UPLOAD_FEE = 40;
export const BOOK_PRICE = 20;
export const MAX_FILE_MB = 25;
export const MAX_COVER_MB = 5;

/** Extensiones peligrosas — ejecutables, scripts, instaladores. */
export const BLOCKED_EXT = new Set([
  "exe",
  "msi",
  "msp",
  "bat",
  "cmd",
  "com",
  "scr",
  "ps1",
  "psm1",
  "vbs",
  "vbe",
  "js",
  "jse",
  "ws",
  "wsf",
  "wsh",
  "jar",
  "apk",
  "app",
  "dmg",
  "pkg",
  "deb",
  "rpm",
  "sh",
  "bash",
  "run",
  "dll",
  "sys",
  "drv",
  "reg",
  "inf",
  "cpl",
  "msc",
  "hta",
  "lnk",
  "iso",
  "img",
  "bin",
  "php",
  "asp",
  "aspx",
  "cgi",
]);

export function isBlockedExtension(ext: string): boolean {
  return BLOCKED_EXT.has(ext.toLowerCase());
}

export function validateBookFile(
  file: File,
): { ok: true } | { ok: false; message: string } {
  const parts = file.name.split(".");
  if (parts.length < 2) {
    return {
      ok: false,
      message: "El archivo debe tener extensión (ej. .pdf, .docx)",
    };
  }
  const ext = (parts.pop() || "").toLowerCase();
  if (!ext || ext.length > 10) {
    return { ok: false, message: "Extensión de archivo no válida" };
  }
  if (isBlockedExtension(ext)) {
    return {
      ok: false,
      message: `Formato .${ext} no permitido por seguridad (ejecutables/scripts)`,
    };
  }
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    return { ok: false, message: `El archivo supera ${MAX_FILE_MB} MB` };
  }
  return { ok: true };
}

export const BOOK_FILE_ACCEPT =
  ".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.epub,.odt,.ods,.xls,.xlsx,.rtf,.csv,.mp3,.mp4,.png,.jpg,.jpeg,.webp";
