export const fallbackValue = (type: string) => {
  switch (type) {
    case "string":
      return "text";
    case "number":
      return 10;
    case "boolean":
      return false;
    default:
      return undefined;
  }
};
