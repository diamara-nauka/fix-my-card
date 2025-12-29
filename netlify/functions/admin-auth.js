export default async (req) => {
  const { password } = await req.json()

  if (password === process.env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ error: 'Mot de passe incorrect' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  })
}
