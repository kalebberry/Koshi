// The download is generated directly from the canonical grid stylesheet.
// Preserves the published Core v0.2.0 release distribution baseline (17,757 bytes, CRLF, SHA-256: 07abbaedb54132bff9288de58c6ab60733a06f82a5274d828433a1bb481dd135).
import css from '../../styles/koshi.css?raw';

export const prerender = true;

export function GET() {
  // Normalize line endings to CRLF to guarantee exact byte-identity with published v0.2.0 baseline
  const distributionCss = css.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');
  return new Response(distributionCss, {
    status: 200,
    headers: {
      'Content-Type': 'text/css; charset=utf-8',
      'Content-Disposition': 'attachment; filename="koshi.css"',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
