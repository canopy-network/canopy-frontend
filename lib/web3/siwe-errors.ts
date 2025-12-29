/**
 * @fileoverview SIWE Error Handling Utilities
 *
 * Utilities for handling and formatting SIWE-related errors with user-friendly messages.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 */

export interface SiweError {
  title: string;
  message: string;
  suggestion?: string;
}

/**
 * Parse and format SIWE-related errors into user-friendly messages
 * @param error - The error object from the SIWE flow
 * @param context - Context about where the error occurred ('login' | 'link')
 * @returns Formatted error object with title, message, and suggestion
 */
export function parseSiweError(error: any, context: 'login' | 'link' = 'login'): SiweError {
  const errorMessage = error?.message?.toLowerCase() || '';
  const errorCode = error?.code;

  // User rejected the signature request
  if (
    errorCode === 4001 ||
    errorCode === 'ACTION_REJECTED' ||
    errorMessage.includes('user rejected') ||
    errorMessage.includes('user denied') ||
    errorMessage.includes('user cancelled')
  ) {
    return {
      title: 'Signature Rejected',
      message: 'You rejected the signature request in your wallet.',
      suggestion: 'Please try again and approve the signature to continue.'
    };
  }

  // Wallet not connected
  if (
    errorMessage.includes('wallet not connected') ||
    errorMessage.includes('no provider') ||
    errorMessage.includes('not connected')
  ) {
    return {
      title: 'Wallet Not Connected',
      message: 'Your wallet is not connected.',
      suggestion: 'Please connect your wallet and try again.'
    };
  }

  // Network/Chain mismatch or error
  if (
    errorMessage.includes('chain') ||
    errorMessage.includes('network') ||
    errorCode === -32603
  ) {
    return {
      title: 'Network Error',
      message: 'There was an issue with the blockchain network.',
      suggestion: 'Please check your wallet network settings and try again.'
    };
  }

  // Nonce errors
  if (
    errorMessage.includes('nonce') ||
    errorMessage.includes('expired') ||
    errorMessage.includes('invalid nonce')
  ) {
    return {
      title: 'Session Expired',
      message: 'Your authentication session has expired.',
      suggestion: 'Please try again to generate a new session.'
    };
  }

  // Wallet already linked
  if (
    errorMessage.includes('already linked') ||
    errorMessage.includes('wallet exists') ||
    errorMessage.includes('duplicate')
  ) {
    return {
      title: 'Wallet Already Linked',
      message: 'This wallet is already linked to an account.',
      suggestion: context === 'link'
        ? 'Please use a different wallet or sign in with this wallet instead.'
        : 'Please use a different wallet to create a new account.'
    };
  }

  // Backend/API errors
  if (
    errorMessage.includes('server') ||
    errorMessage.includes('500') ||
    errorMessage.includes('503') ||
    errorMessage.includes('network error') ||
    errorMessage.includes('fetch')
  ) {
    return {
      title: 'Server Error',
      message: 'Unable to connect to the server.',
      suggestion: 'Please check your internet connection and try again.'
    };
  }

  // Signature verification failed
  if (
    errorMessage.includes('verification failed') ||
    errorMessage.includes('invalid signature') ||
    errorMessage.includes('signature mismatch')
  ) {
    return {
      title: 'Verification Failed',
      message: 'The wallet signature could not be verified.',
      suggestion: 'Please try signing in again.'
    };
  }

  // Timeout errors
  if (
    errorMessage.includes('timeout') ||
    errorMessage.includes('timed out')
  ) {
    return {
      title: 'Request Timeout',
      message: 'The request took too long to complete.',
      suggestion: 'Please try again. If the issue persists, check your internet connection.'
    };
  }

  // Generic/Unknown error
  return {
    title: context === 'login' ? 'Sign In Failed' : 'Wallet Linking Failed',
    message: error?.message || 'An unexpected error occurred.',
    suggestion: 'Please try again. If the problem persists, contact support.'
  };
}

/**
 * Format error for display in UI (combines title and message)
 * @param error - The SiweError object
 * @returns Formatted error string
 */
export function formatErrorMessage(error: SiweError): string {
  return error.suggestion
    ? `${error.message} ${error.suggestion}`
    : error.message;
}

/**
 * Log SIWE errors for debugging (includes full error details)
 * @param error - The original error object
 * @param context - Context about where the error occurred
 */
export function logSiweError(error: any, context: string): void {
  console.error(`[SIWE Error - ${context}]:`, {
    message: error?.message,
    code: error?.code,
    stack: error?.stack,
    fullError: error
  });
}
