import { analyzeReplicaRejection } from './replicaRejection';

/**
 * Converts unknown errors (including candid/trap-style messages, timeouts, and replica rejections)
 * into actionable English messages suitable for toasts and inline errors.
 */
export function getErrorMessage(error: unknown): string {
  if (!error) {
    return 'An unknown error occurred';
  }

  // First check for stopped/unavailable canister patterns
  const replicaInfo = analyzeReplicaRejection(error);
  if (replicaInfo.isStoppedCanister) {
    return replicaInfo.userMessage;
  }

  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message;

    // Check for internal runtime error patterns that should never be shown to users
    if (
      message.includes('processError') ||
      message.includes('Cannot read properties of undefined') ||
      message.includes('reading \'processError\'')
    ) {
      return 'An unexpected error occurred. Please try again or contact support.';
    }

    // Check for timeout errors (expanded patterns)
    if (
      message.includes('timed out') || 
      message.includes('timeout') || 
      message.includes('Timeout') ||
      message.includes('after 10 seconds') ||
      message.includes('after 15 seconds')
    ) {
      return `Request timed out. Please check your connection and try again.`;
    }

    // Check for unauthorized/permission errors
    if (message.includes('Unauthorized') || message.includes('permission')) {
      return `Access denied: ${message}`;
    }

    // Check for date validation errors
    if (message.includes('Invalid check-in date') || message.includes('Invalid check-out date')) {
      return message.replace('Invalid check-in date:', 'Check-in date error:').replace('Invalid check-out date:', 'Check-out date error:');
    }

    // Check for validation errors
    if (message.includes('Invalid') || message.includes('required') || message.includes('wajib')) {
      return `Validation error: ${message}`;
    }

    // Check for invite-related errors
    if (message.includes('invite') || message.includes('token')) {
      return `Invite error: ${message}`;
    }

    // Check for actor/connection errors
    if (message.includes('Actor not available') || message.includes('not available')) {
      return 'Connection error: Backend service is not available. Please refresh and try again.';
    }

    // Return the original message if it's already descriptive
    return message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    // Check for internal runtime error patterns in string errors
    if (
      error.includes('processError') ||
      error.includes('Cannot read properties of undefined') ||
      error.includes('reading \'processError\'')
    ) {
      return 'An unexpected error occurred. Please try again or contact support.';
    }

    // Check for timeout patterns in string errors
    if (
      error.includes('timed out') || 
      error.includes('timeout') || 
      error.includes('Timeout') ||
      error.includes('after 10 seconds') ||
      error.includes('after 15 seconds')
    ) {
      return `Request timed out. Please check your connection and try again.`;
    }
    
    // Check for date validation errors in string
    if (error.includes('Invalid check-in date') || error.includes('Invalid check-out date')) {
      return error.replace('Invalid check-in date:', 'Check-in date error:').replace('Invalid check-out date:', 'Check-out date error:');
    }
    
    return error;
  }

  // Handle objects with message property (including nested error objects)
  if (typeof error === 'object' && error !== null) {
    // Try to extract message from various error object shapes
    if ('message' in error) {
      const message = (error as { message: unknown }).message;
      if (typeof message === 'string') {
        // Check for internal runtime patterns before recursing
        if (
          message.includes('processError') ||
          message.includes('Cannot read properties of undefined') ||
          message.includes('reading \'processError\'')
        ) {
          return 'An unexpected error occurred. Please try again or contact support.';
        }
        return getErrorMessage(message);
      }
      if (message && typeof message === 'object') {
        return getErrorMessage(message);
      }
    }

    // Handle candid/agent error objects with nested properties
    if ('props' in error && typeof (error as any).props === 'object') {
      const props = (error as any).props;
      if (props.message) {
        return getErrorMessage(props.message);
      }
    }

    // Try to stringify the error object safely
    try {
      const stringified = JSON.stringify(error);
      if (stringified && stringified !== '{}') {
        // Check if it contains internal runtime error patterns
        if (
          stringified.includes('processError') ||
          stringified.includes('Cannot read properties of undefined') ||
          stringified.includes('reading \'processError\'')
        ) {
          return 'An unexpected error occurred. Please try again or contact support.';
        }
        return `Error: ${stringified}`;
      }
    } catch {
      // JSON.stringify failed, continue to fallback
    }
  }

  // Fallback
  return 'An unexpected error occurred. Please try again.';
}
