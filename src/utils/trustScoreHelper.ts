export interface TrustFactors {
    emailVerified: boolean;
    phoneVerified: boolean;
    photoVerified: boolean;
    idVerified: boolean;
    isProfileComplete: boolean;
}

export function calculateTrustScore(factors: TrustFactors): number {
    let score = 0;

    // Verification Scores (Total 100 possible, but weighted)
    if (factors.emailVerified) score += 10;
    if (factors.phoneVerified) score += 10;
    if (factors.photoVerified) score += 30; // High signal
    if (factors.idVerified) score += 40;    // Highest signal

    // Engagement / Effort score
    if (factors.isProfileComplete) score += 10;

    return Math.min(score, 100);
}

export function getTrustLevel(score: number): 'LOW' | 'BRONZE' | 'SILVER' | 'GOLD' {
    if (score >= 90) return 'GOLD';
    if (score >= 60) return 'SILVER';
    if (score >= 30) return 'BRONZE';
    return 'LOW';
}
