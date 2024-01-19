export const calculateScore = (timeTaken: number): number => {
    let score = Math.max(0, -0.00057 * timeTaken * timeTaken * timeTaken + 0.037 * timeTaken * timeTaken - 0.96 * timeTaken + 10);
    return score;
}
