
// Production-grade error handling system
export enum ErrorCode {
  AUTHENTICATION_REQUIRED = 'AUTHENTICATION_REQUIRED',
  INVALID_DATA = 'INVALID_DATA',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  BOOKING_CREATION_FAILED = 'BOOKING_CREATION_FAILED',
  BOOKING_NOT_FOUND = 'BOOKING_NOT_FOUND',
  PROVIDER_NOT_FOUND = 'PROVIDER_NOT_FOUND',
  DUPLICATE_BOOKING = 'DUPLICATE_BOOKING',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', context?: Record<string, any>) {
    super(message, ErrorCode.AUTHENTICATION_REQUIRED, 401, true, context);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Invalid data provided', context?: Record<string, any>) {
    super(message, ErrorCode.INVALID_DATA, 400, true, context);
  }
}

export class PaymentError extends AppError {
  constructor(message: string = 'Payment processing failed', context?: Record<string, any>) {
    super(message, ErrorCode.PAYMENT_FAILED, 402, true, context);
  }
}

export class BookingError extends AppError {
  constructor(message: string = 'Booking operation failed', context?: Record<string, any>) {
    super(message, ErrorCode.BOOKING_CREATION_FAILED, 400, true, context);
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network request failed', context?: Record<string, any>) {
    super(message, ErrorCode.NETWORK_ERROR, 503, true, context);
  }
}

export function handleError(error: unknown): AppError {
  console.error('Error occurred:', error);

  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(
      error.message,
      ErrorCode.UNKNOWN_ERROR,
      500,
      true,
      { originalError: error.name }
    );
  }

  return new AppError(
    'An unknown error occurred',
    ErrorCode.UNKNOWN_ERROR,
    500,
    false
  );
}
