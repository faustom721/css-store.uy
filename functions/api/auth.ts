type Env = { GITHUB_CLIENT_ID?: string };

const SCOPES = 'public_repo read:user';

/**
 * Inicia el flujo OAuth con GitHub para Decap CMS. GitHub app: callback = {origin}/api/callback
 */
export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
	const clientId = context.env.GITHUB_CLIENT_ID;
	if (!clientId) {
		return new Response('Missing GITHUB_CLIENT_ID on the server', { status: 500 });
	}
	try {
		const url = new URL(context.request.url);
		const callback = `${url.origin}/api/callback`;
		const redirect = new URL('https://github.com/login/oauth/authorize');
		redirect.searchParams.set('client_id', clientId);
		redirect.searchParams.set('redirect_uri', callback);
		redirect.searchParams.set('scope', SCOPES);
		redirect.searchParams.set('state', btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16)))));
		return Response.redirect(redirect.toString(), 302);
	} catch (e) {
		const message = e instanceof Error ? e.message : 'Unknown error';
		return new Response(message, { status: 500 });
	}
}
