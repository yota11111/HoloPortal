export function escapeXml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&apos;");
}

export function absoluteUrl(site, path) {
  const base = import.meta.env.BASE_URL || "/";
  const cleanBase = base.endsWith("/") ? base : `${base}/`;
  const cleanPath = String(path).replace(/^\/+/, "");
  return new URL(`${cleanBase}${cleanPath}`, site).toString();
}

export function responseXml(body) {
  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8"
    }
  });
}

export function responseText(body) {
  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8"
    }
  });
}
