export function json(data, status = 200) {
  if (status === 204) return new Response(null, { status: 204 });
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function errorResponse(message, status = 500) {
  return json({ error: message }, status);
}

export function withErrorHandling(handler) {
  return async (context) => {
    try {
      return await handler(context);
    } catch (err) {
      return errorResponse(err.message || 'Internal server error', 500);
    }
  };
}
