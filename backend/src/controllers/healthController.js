export function getHealth(_req, res) {
  res.json({
    ok: true,
    service: "ly-node-api",
    mode: "general_query_only",
  });
}
