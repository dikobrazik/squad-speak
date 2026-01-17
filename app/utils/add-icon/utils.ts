export const kebabTo = (str: string, type: "pascal" | "camel") => {
  return str
    .toLowerCase()
    .split("-")
    .map((word, index) => {
      if (type === "camel" && index === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join("");
};
