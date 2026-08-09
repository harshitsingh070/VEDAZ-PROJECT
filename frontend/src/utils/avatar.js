const AVATAR_COLORS = [
  '#4f6ef7',
  '#0fa97a',
  '#e08a1e',
  '#c44a6b',
  '#7a5cf0',
  '#2fa8c4',
];

export function avatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % 997;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function initials(name) {
  return (name || '?').charAt(0).toUpperCase();
}
