export const onRequest = async () => {
  return Response.json({
    ok: true,
    service: 'suhird-blog',
    timestamp: new Date().toISOString(),
  });
};
