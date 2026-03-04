export function generateCurl(
  method: string,
  url: string,
  token: string,
  params?: Record<string, unknown>,
  body?: Record<string, unknown> | null
): string {
  let fullUrl = url;
  if (params && Object.keys(params).length > 0) {
    const qs = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&');
    if (qs) fullUrl += `?${qs}`;
  }

  const parts = [
    `curl -X ${method}`,
    `  '${fullUrl}'`,
    `  -H 'Content-Type: application/json'`,
    `  -H 'Api-Token: ${token}'`,
  ];

  if (body && Object.keys(body).length > 0 && ['POST', 'PUT', 'PATCH'].includes(method)) {
    parts.push(`  -d '${JSON.stringify(body, null, 2)}'`);
  }

  return parts.join(' \\\n');
}
