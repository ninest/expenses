// const categoryKeys = ["living", "food", "transport", "entertainment", "education", "savings"] as const;
// export type CategoryType = (typeof categoryKeys)[number];

type DisplayCategory = {
  key: string;
  emoji: string;
  softLimit?: number;
  limit?: number;
};

// Display categories
export const categories: DisplayCategory[] = [
  { key: "living", emoji: "🛟", softLimit: 175, limit: 200 },
  { key: "food", emoji: "🌮", softLimit: 100, limit: 125 },
  { key: "transport", emoji: "🚋", softLimit: 35, limit: 50 },
  { key: "entertainment", emoji: "🍿", softLimit: 125, limit: 150 },
  { key: "education", emoji: "🎒" },
  { key: "savings", emoji: "💵" },
];

export function isAbove(categoryKey: string, amount: number) {
  const category = categories.find((category) => category.key === categoryKey);
  return {
    softLimit: category?.softLimit ? amount >= category.softLimit : false,
    limit: category?.limit ? amount >= category.limit : false,
  };
}
