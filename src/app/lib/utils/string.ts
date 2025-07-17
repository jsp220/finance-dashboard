export const capitalize = (str: string): string => {
    const words = str.split(" ");
    return words
        .map(
            (word) =>
                word.trim().charAt(0).toUpperCase() +
                word.slice(1).toLowerCase()
        )
        .join(" ");
};
