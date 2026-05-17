export type Recipe = {
    slug: string;
    title: string;
    cuisine: string;
    timeCategory: "fast" | "medium" | "slow";
};