// GET /api/logout -> clears the session cookie and returns to the login page
module.exports = (req, res) => {
  res.setHeader('Set-Cookie', 'jip_auth=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
  res.statusCode = 302;
  res.setHeader('Location', '/login.html');
  res.end();
};
