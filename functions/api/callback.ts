type Env = { GITHUB_CLIENT_ID?: string; GITHUB_CLIENT_SECRET?: string };

function renderBody(status: 'success' | 'error', content: unknown): string {
	const contentStr = JSON.stringify(content);
	/* Decap: window.opener receives "authorization:github:success:{"token":"...","provider":"github"}" */
	return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/></head><body>
<script>
(function() {
  var st = ${JSON.stringify(status)};
  var data = ${JSON.stringify(contentStr)};
  function receiveMessage(e) {
    if (window.opener) {
      window.opener.postMessage("authorization:github:" + st + ":" + data, e.origin);
    }
    window.removeEventListener("message", receiveMessage, false);
  }
  window.addEventListener("message", receiveMessage, false);
  if (window.opener) { window.opener.postMessage("authorizing:github", "*"); }
})();
<\/script></body></html>`;
}

/**
 * Intercambia ?code= por un access_token y se lo pasa a Decap vía postMessage.
 */
export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
	const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = context.env;
	if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
		return new Response(
			renderBody('error', { message: 'Missing GITHUB client env on the server' }),
			{ status: 500, headers: { 'content-type': 'text/html; charset=utf-8' } },
		);
	}
	try {
		const url = new URL(context.request.url);
		const code = url.searchParams.get('code');
		if (!code) {
			return new Response(
				renderBody('error', { message: 'Missing ?code' }),
				{ status: 400, headers: { 'content-type': 'text/html; charset=utf-8' } },
			);
		}
		const callback = `${url.origin}/api/callback`;
		const res = await fetch('https://github.com/login/oauth/access_token', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded',
				'User-Agent': 'css-store-decap-cms',
			},
			body: new URLSearchParams({
				client_id: GITHUB_CLIENT_ID,
				client_secret: GITHUB_CLIENT_SECRET,
				code,
				redirect_uri: callback,
			}).toString(),
		});
		const result: { access_token?: string; error?: string; error_description?: string } = await res.json();
		if (result.error || !result.access_token) {
			return new Response(
				renderBody('error', { error: result.error, error_description: result.error_description ?? result.error }),
				{ status: 401, headers: { 'content-type': 'text/html; charset=utf-8' } },
			);
		}
		return new Response(
			renderBody('success', { token: result.access_token, provider: 'github' }),
			{ status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } },
		);
	} catch (e) {
		const message = e instanceof Error ? e.message : 'Unknown error';
		return new Response(renderBody('error', { message }), {
			status: 500,
			headers: { 'content-type': 'text/html; charset=utf-8' },
		});
	}
}
