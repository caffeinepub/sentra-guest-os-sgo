/**
 * Utility to detect and classify replica rejection errors,
 * particularly "canister stopped" scenarios (IC0508).
 */

export interface ReplicaRejectionInfo {
  isStoppedCanister: boolean;
  isReplicaRejection: boolean;
  userMessage: string;
  rawMessage: string;
  canisterId: string | null;
}

/**
 * Detects if an error indicates a stopped/unavailable canister.
 * Checks for IC0508 error code and "is stopped" text patterns.
 * Extracts canister ID when present.
 */
export function analyzeReplicaRejection(error: unknown): ReplicaRejectionInfo {
  const rawMessage = extractRawMessage(error);
  
  // Check for stopped canister patterns
  const isStoppedCanister = 
    rawMessage.includes('IC0508') || 
    rawMessage.toLowerCase().includes('is stopped') ||
    (rawMessage.toLowerCase().includes('canister') && rawMessage.toLowerCase().includes('stopped'));
  
  // Check for general replica rejection patterns
  const isReplicaRejection = 
    isStoppedCanister ||
    rawMessage.includes('replica returned a rejection error') ||
    rawMessage.includes('Reject code:') ||
    rawMessage.includes('Reject text:');
  
  // Extract canister ID if present
  const canisterId = extractCanisterId(rawMessage);
  
  // Generate user-friendly message
  let userMessage: string;
  if (isStoppedCanister) {
    userMessage = 'Backend is currently unavailable (canister stopped). Please retry in a moment.';
  } else if (isReplicaRejection) {
    userMessage = 'Backend service temporarily unavailable. Please retry.';
  } else {
    userMessage = rawMessage;
  }
  
  return {
    isStoppedCanister,
    isReplicaRejection,
    userMessage,
    rawMessage,
    canisterId,
  };
}

/**
 * Extracts canister ID from error messages.
 * Looks for patterns like "Canister mhjpy-6qaaa-aaaai-qbzaq-cai is stopped"
 */
function extractCanisterId(message: string): string | null {
  // Pattern 1: "Canister <id> is stopped"
  const pattern1 = /Canister\s+([a-z0-9-]+)\s+is\s+stopped/i;
  const match1 = message.match(pattern1);
  if (match1 && match1[1]) {
    return match1[1];
  }
  
  // Pattern 2: "canister_id": "<id>" or similar JSON-like patterns
  const pattern2 = /canister[_-]?id["']?\s*[:=]\s*["']?([a-z0-9-]+)["']?/i;
  const match2 = message.match(pattern2);
  if (match2 && match2[1]) {
    return match2[1];
  }
  
  // Pattern 3: Look for IC canister ID format (ends with -cai)
  const pattern3 = /([a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-[a-z0-9]{5}-cai)/i;
  const match3 = message.match(pattern3);
  if (match3 && match3[1]) {
    return match3[1];
  }
  
  return null;
}

/**
 * Extracts the raw error message from various error types.
 */
function extractRawMessage(error: unknown): string {
  if (!error) {
    return 'Unknown error occurred';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return extractRawMessage((error as { message: unknown }).message);
  }
  
  return String(error);
}
