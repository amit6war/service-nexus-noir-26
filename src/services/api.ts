
// Centralized API service with retry logic and error handling
import { supabase } from '@/integrations/supabase/client';
import { handleError, NetworkError } from '@/lib/errors';
import type { ApiResponse, PaginatedResponse } from '@/types';

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000
};

class ApiService {
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private calculateBackoffDelay(attempt: number, baseDelay: number, maxDelay: number): number {
    const exponentialDelay = baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 0.1 * exponentialDelay;
    return Math.min(exponentialDelay + jitter, maxDelay);
  }

  async withRetry<T>(
    operation: () => Promise<T>,
    config: RetryConfig = DEFAULT_RETRY_CONFIG
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        console.warn(`Attempt ${attempt + 1} failed:`, lastError.message);

        if (attempt === config.maxRetries) {
          break;
        }

        const delay = this.calculateBackoffDelay(attempt, config.baseDelay, config.maxDelay);
        await this.delay(delay);
      }
    }

    throw new NetworkError(
      `Operation failed after ${config.maxRetries + 1} attempts: ${lastError!.message}`,
      { originalError: lastError!.message, attempts: config.maxRetries + 1 }
    );
  }

  async query<T>(
    tableName: string,
    query: any,
    options?: { retryConfig?: RetryConfig }
  ): Promise<ApiResponse<T[]>> {
    try {
      const result = await this.withRetry(async () => {
        const { data, error } = await query;
        
        if (error) {
          throw new Error(error.message);
        }
        
        return data;
      }, options?.retryConfig);

      return { data: result, success: true };
    } catch (error) {
      const appError = handleError(error);
      console.error(`Query failed for table ${tableName}:`, appError);
      
      return { 
        error: appError.message, 
        success: false 
      };
    }
  }

  async mutate<T>(
    operation: () => Promise<any>,
    options?: { retryConfig?: RetryConfig }
  ): Promise<ApiResponse<T>> {
    try {
      const result = await this.withRetry(async () => {
        const { data, error } = await operation();
        
        if (error) {
          throw new Error(error.message);
        }
        
        return data;
      }, options?.retryConfig);

      return { data: result, success: true };
    } catch (error) {
      const appError = handleError(error);
      console.error('Mutation failed:', appError);
      
      return { 
        error: appError.message, 
        success: false 
      };
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('id')
        .limit(1);
      
      return !error;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

export const apiService = new ApiService();
