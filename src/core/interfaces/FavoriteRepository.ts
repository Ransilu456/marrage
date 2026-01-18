
export interface FavoriteRepository {
    toggle(userId: string, favoritedId: string): Promise<{ isFavorited: boolean }>;
    isFavorited(userId: string, favoritedId: string): Promise<boolean>;
    getFavorites(userId: string): Promise<string[]>; // Returns list of favorited IDs
}
