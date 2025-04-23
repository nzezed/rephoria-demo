type ErrorResponse = {
  message: string;
  code: string;
  status: number;
  details?: any;
};

export class AppError extends Error {
  code: string;
  status: number;
  details?: any;

  constructor(message: string, code: string, status: number, details?: any) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export const errorCodes = {
  INVALID_INPUT: 'INVALID_INPUT',
  UNAUTHORIZED: 'UNAUTHORIZED',
  API_ERROR: 'API_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  FILE_PROCESSING_ERROR: 'FILE_PROCESSING_ERROR',
  INTEGRATION_ERROR: 'INTEGRATION_ERROR',
} as const;

export function handleError(error: unknown): ErrorResponse {
  console.error('Error:', error);

  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.details,
    };
  }

  // Handle OpenAI API errors
  if (error && typeof error === 'object' && 'status' in error) {
    return {
      message: 'AI processing error',
      code: errorCodes.API_ERROR,
      status: 500,
      details: error,
    };
  }

  // Default error response
  return {
    message: 'An unexpected error occurred',
    code: 'INTERNAL_SERVER_ERROR',
    status: 500,
  };
}

export function validateApiKey(): void {
  if (!process.env.OPENAI_API_KEY) {
    throw new AppError(
      'OpenAI API key is not configured',
      errorCodes.UNAUTHORIZED,
      401
    );
  }
}

// Rate limiting implementation
const requestCounts = new Map<string, { count: number; timestamp: number }>();

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000; // 15 minutes default
  const maxRequests = Number(process.env.MAX_REQUESTS_PER_IP) || 100;

  const requestInfo = requestCounts.get(ip) || { count: 0, timestamp: now };

  // Reset count if window has passed
  if (now - requestInfo.timestamp > windowMs) {
    requestInfo.count = 0;
    requestInfo.timestamp = now;
  }

  // Increment count and check limit
  requestInfo.count++;
  requestCounts.set(ip, requestInfo);

  return requestInfo.count <= maxRequests;
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000;

  for (const [ip, info] of requestCounts.entries()) {
    if (now - info.timestamp > windowMs) {
      requestCounts.delete(ip);
    }
  }
}, 300000); // Clean up every 5 minutes 