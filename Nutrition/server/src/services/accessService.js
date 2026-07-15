export function canAccessClient(user, client) {
  if (!user || !client) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'dietitian') return String(client.dietitian?._id || client.dietitian) === String(user._id);
  return String(client.user?._id || client.user) === String(user._id);
}

export function canManageClient(user, client) {
  if (!user || !client) return false;
  if (user.role === 'admin') return true;
  return user.role === 'dietitian' && String(client.dietitian?._id || client.dietitian) === String(user._id);
}
