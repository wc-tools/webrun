/**
 * Type definitions for component testing helpers
 */

export type PropertyValue = string | number | boolean | object | Function | null | undefined;

export interface PropertyDescriptor {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function' | 'null' | 'undefined';
  value: PropertyValue;
}

export interface TrackedEvent {
  type: string;
  detail: unknown;
  timestamp: number;
  bubbles: boolean;
  cancelable: boolean;
  composed: boolean;
}

export interface FunctionCall {
  timestamp: number;
  args: unknown[];
}

/**
 * Global window extensions for tracking
 */
declare global {
  interface Window {
    __componentHelpers?: {
      functionCalls?: Record<string, FunctionCall[]>;
      events?: Record<string, TrackedEvent[]>;
    };
    // Test-specific dynamic properties
    callbackResults?: unknown[];
    testComponent?: unknown;
    eventLog?: unknown[];
    receivedData?: unknown;
    callCount?: number;
    [key: string]: unknown;
  }
}
