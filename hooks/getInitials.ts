export const getInitials = (name: string = "") => {
  return (
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 3)
      .toUpperCase() || "U"
  );
};
