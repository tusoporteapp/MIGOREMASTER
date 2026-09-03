export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    let body = {};
    try {
      body = await request.json();
    } catch (_) {}

    const targetAccountId = body.accountId || env.CLOUDFLARE_ACCOUNT_ID;
    const targetToken = body.apiToken || env.CLOUDFLARE_API_TOKEN;

    if (!targetToken) {
      return new Response(JSON.stringify({
        success: false,
        error: "Se requiere Cloudflare API Token para la verificación."
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    const testUrl = "https://api.cloudflare.com/client/v4/user/tokens/verify";
    const pingRes = await fetch(testUrl, {
      headers: { "Authorization": `Bearer ${targetToken}` }
    });
    const pingJson = await pingRes.json();

    if (pingRes.ok && pingJson.success) {
      return new Response(JSON.stringify({
        success: true,
        message: "¡Conexión exitosa con Cloudflare API!",
        tokenStatus: pingJson.result?.status,
        accountIdProvided: targetAccountId ? `${targetAccountId.slice(0, 5)}...` : "Configurado"
      }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: pingJson.errors?.[0]?.message || "Token de Cloudflare no válido o sin permisos suficientes."
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err?.message || "Fallo de conexión." }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
