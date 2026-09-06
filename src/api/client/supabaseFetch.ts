// Supabase fetch implementation commented out for MongoDB integration
// export type CapturedRateLimit = {
//   retryAfterSeconds?: number;
//   rateLimitReset?: number;
//   rateLimitRemaining?: number;
// };

// let capturedRateLimit: CapturedRateLimit | null = null;

// export const consumeCapturedRateLimit = (): CapturedRateLimit | null => {
//   const value = capturedRateLimit;
//   capturedRateLimit = null;
//   return value;
// };

// const parseRetryAfterHeader = (value: string | null): number | undefined => {
//   if (!value) return undefined;

//   const seconds = Number(value);
//   if (!Number.isNaN(seconds) && seconds >= 0) {
//     return Math.ceil(seconds);
//   }

//   const resetDate = Date.parse(value);
//   if (!Number.isNaN(resetDate)) {
//     return Math.max(Math.ceil((resetDate - Date.now()) / 1000), 0);
//   }

//   return undefined;
// };

// const parseRateLimitReset = (value: string | null): number | undefined => {
//   if (!value) return undefined;

//   const numeric = Number(value);
//   if (Number.isNaN(numeric)) return undefined;

//   const resetMs = numeric > 1_000_000_000_000 ? numeric : numeric * 1000;
//   return Math.max(Math.ceil((resetMs - Date.now()) / 1000), 0);
// };

// const captureRateLimitHeaders = (response: Response) => {
//   const retryAfterSeconds = parseRetryAfterHeader(
//     response.headers.get('retry-after') ?? response.headers.get('Retry-After')
//   );
//   const rateLimitReset = parseRateLimitReset(
//     response.headers.get('x-ratelimit-reset') ?? response.headers.get('X-RateLimit-Reset')
//   );
//   const remainingHeader =
//     response.headers.get('x-ratelimit-remaining') ?? response.headers.get('X-RateLimit-Remaining');
//   const rateLimitRemaining =
//     remainingHeader !== null && remainingHeader !== '' ? Number(remainingHeader) : undefined;

//   if (
//     retryAfterSeconds !== undefined ||
//     rateLimitReset !== undefined ||
//     (rateLimitRemaining !== undefined && !Number.isNaN(rateLimitRemaining))
//   ) {
//     capturedRateLimit = {
//       retryAfterSeconds,
//       rateLimitReset,
//       rateLimitRemaining: Number.isNaN(rateLimitRemaining) ? undefined : rateLimitRemaining,
//     };
//   }
// };

// export const rateLimitAwareFetch: typeof fetch = async (input, init) => {
//   const response = await fetch(input, init);

//   if (response.status === 429) {
//     captureRateLimitHeaders(response);
//   }

//   return response;
// };

// Placeholder exports to prevent errors
export type CapturedRateLimit = {
  retryAfterSeconds?: number;
  rateLimitReset?: number;
  rateLimitRemaining?: number;
};

export const consumeCapturedRateLimit = (): CapturedRateLimit | null => null;
export const rateLimitAwareFetch: typeof fetch = fetch;