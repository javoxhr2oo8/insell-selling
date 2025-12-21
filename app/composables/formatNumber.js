export const formatPhoneNumber = (value) => {
    const cypher = value.replace(/\D/g, '');

    const trimmed = cypher.substring(0, 9);

    const code = trimmed.substring(0, 2);      // 90
    const part1 = trimmed.substring(2, 5);     // 123
    const part2 = trimmed.substring(5, 7);     // 45
    const part3 = trimmed.substring(7, 9);     // 67

    if (trimmed.length > 7) {
        return `(${code}) ${part1}-${part2}-${part3}`;
    } else if (trimmed.length > 5) {
        return `(${code}) ${part1}-${part2}`;
    } else if (trimmed.length > 2) {
        return `(${code}) ${part1}`;
    } else if (trimmed.length > 0) {
        return `(${code}`;
    }

    return trimmed;
};