export async function onRequest(context) {
  const { env } = context;
  const hasAiBinding = !!env.AI;
  const cfAccountId = env.CLOUDFLARE_ACCOUNT_ID || "";
  const cfToken = env.CLOUDFLARE_API_TOKEN || "";
  const cfWorker = env.CLOUDFLARE_WORKER_URL || "";

  return new Response(JSON.stringify({
    status: "ok",
    primaryEngine: "cloudflare",
    platform: "cloudflare-pages",
    hasCloudflare: hasAiBinding || (!!cfAccountId && !!cfToken) || !!cfWorker,
    hasNativeWorkersAi: hasAiBinding,
    hasCloudflareWorker: !!cfWorker,
    configuredCloudflareAccountId: cfAccountId ? `${cfAccountId.slice(0, 4)}...` : null
  }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS"
    }
  });
}
