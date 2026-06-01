async function authLogin(emailOrUser, password) {
  try {
    const res = await fetch(API + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: emailOrUser, password }),
    });
    const data = await res.json();
    if (data.success && data.user) {
      localStorage.setItem('nx_user', JSON.stringify({
        id:       data.user.id,
        username: data.user.username,
        email:    data.user.email,
        role:     data.user.role,
        joined:   data.user.joined,
      }));
      return { success: true, user: data.user };
    }
    return { success: false, error: data.error || 'Invalid credentials' };
  } catch (e) {
    return { success: false, error: 'Cannot connect to server. Is the backend running?' };
  }
}
