export function generateAvatar(alias: string, size: number = 40): string {
  // Ensure alias is a string and get the first letter
  const aliasString = typeof alias === 'string' ? alias : String(alias || 'User');
  const firstLetter = aliasString?.charAt(0)?.toUpperCase() || 'U';
  
  // Generate a consistent color based on the alias
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
  ];
  
  const colorIndex = aliasString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const backgroundColor = colors[colorIndex];
  
  // Create SVG avatar
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${backgroundColor}"/>
      <text x="50%" y="50%" text-anchor="middle" dy="0.35em" fill="white" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold">${firstLetter}</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export function getAvatarProps(alias: string, size: number = 40) {
  // Ensure alias is a string
  const aliasString = typeof alias === 'string' ? alias : String(alias || 'User');
  return {
    src: generateAvatar(aliasString, size),
    alt: `${aliasString}'s avatar`,
    className: "rounded-full border-2 border-white shadow-sm"
  };
}

