export enum Tier {
  UNVERIFIED = 'UNVERIFIED',
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
  DIAMOND = 'DIAMOND',
}

export enum Socials {
  FACEBOOK = 'FACEBOOK',
  INSTAGRAM = 'INSTAGRAM',
  TWITTER = 'TWITTER',
  LINKEDIN = 'LINKEDIN',
  TIKTOK = 'TIKTOK',
  WHATSAPP = 'WHATSAPP',
  YOUTUBE = 'YOUTUBE',
  OTHER = 'OTHER',
}

export enum BusinessVerificationTypes {
  CAC = 'CAC',
  NIN = 'NIN',
  UTILITY_BILL = 'UTILITY_BILL',
  SELFIE = 'SELFIE',
  TIN = 'TIN',
  OTHER = 'OTHER',
}

export const formatNairaCompact = (
  amount: number,
  options?: {
    decimals?: number;
    withSymbol?: boolean;
  }
): string => {
  const { decimals = 1, withSymbol = true } = options || {};

  const symbol = withSymbol ? '₦' : '';

  if (Math.abs(amount) >= 1_000_000_000) {
    return `${symbol}${(amount / 1_000_000_000).toFixed(decimals)}B`;
  }

  if (Math.abs(amount) >= 1_000_000) {
    return `${symbol}${(amount / 1_000_000).toFixed(decimals)}M`;
  }

  if (Math.abs(amount) >= 1_000) {
    return `${symbol}${(amount / 1_000).toFixed(decimals)}K`;
  }

  return `${symbol}${amount.toLocaleString()}`;
};
