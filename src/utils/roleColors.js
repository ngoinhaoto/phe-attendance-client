export const getRoleColors = (role) => {
  switch (role) {
    case "admin":
      return ["#E1A6B8", "#7C6FC4"]; // Deeper pink to purple
    case "teacher":
      return ["#6EC6CA", "#3B82B8"]; // Deeper teal to blue
    case "student":
      return ["#F7E07A", "#7BC47F"]; // Deeper yellow to green
    default:
      return ["#C7C7C7", "#A3A1C6"]; // Muted gray to lavender
  }
};

export const getAvatarGradient = (role) => {
  const [color1, color2] = getRoleColors(role);
  return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
};

export const getBackgroundGradient = (role) => {
  const [color1, color2] = getRoleColors(role);
  return `linear-gradient(135deg, ${color1}30 0%, ${color2}10 100%)`;
};
