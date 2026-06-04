import { NextResponse } from "next/server";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://asset-lens.vercel.app";

/**
 * RFC 9727 API Catalog endpoint.
 * Returns application/linkset+json with a "linkset" array describing
 * available APIs for automated agent discovery.
 *
 * @see https://www.rfc-editor.org/rfc/rfc9727
 * @see https://www.rfc-editor.org/rfc/rfc9264
 */
export function GET() {
  const catalog = {
    linkset: [
      {
        anchor: `${BASE_URL}/api`,
        "service-desc": [
          {
            href: `${BASE_URL}/.well-known/api-catalog`,
            type: "application/linkset+json",
          },
        ],
        "service-doc": [
          {
            href: `${BASE_URL}/`,
            type: "text/html",
          },
        ],
        status: [
          {
            href: `${BASE_URL}/api/health`,
            type: "application/json",
          },
        ],
      },
    ],
  };

  return NextResponse.json(catalog, {
    status: 200,
    headers: {
      "Content-Type": "application/linkset+json",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
