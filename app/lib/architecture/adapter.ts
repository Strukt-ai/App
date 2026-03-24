// Abstract adapter interface - implement for each rendering engine
import {
  Command,
  CommandType,
  HomeDefinition,
  AdapterResponse,
  AdapterEvent,
  RenderEngineType,
  SyncStatus,
  SyncState,
  UUID,
} from './types';

/**
 * RenderingAdapter is the abstract interface that any rendering engine
 * must implement. This decouples the UI from the engine.
 */
export abstract class RenderingAdapter {
  protected engineType: RenderEngineType;
  protected home: HomeDefinition | null = null;
  protected listeners: Map<string, Set<(event: AdapterEvent) => void>> = new Map();
  protected commandHistory: Command[] = [];
  protected syncStatus: SyncStatus = {
    state: SyncState.SYNCED,
    pendingCommands: [],
    errors: [],
  };

  constructor(engineType: RenderEngineType) {
    this.engineType = engineType;
  }

  /**
   * Initialize the adapter with a rendering context
   */
  abstract initialize(container: HTMLElement | string): Promise<AdapterResponse<void>>;

  /**
   * Load a home definition into the rendering engine
   */
  abstract loadHome(home: HomeDefinition): Promise<AdapterResponse<HomeDefinition>>;

  /**
   * Execute a normalized command on the rendering engine
   */
  abstract executeCommand(command: Command): Promise<AdapterResponse<any>>;

  /**
   * Get current home definition from engine
   */
  abstract getHome(): Promise<AdapterResponse<HomeDefinition>>;

  /**
   * Export home to storage format (.sh3d or JSON)
   */
  abstract exportHome(format: 'sh3d' | 'json'): Promise<AdapterResponse<Blob | string>>;

  /**
   * Import home from storage format
   */
  abstract importHome(data: Blob | string, format: 'sh3d' | 'json'): Promise<AdapterResponse<HomeDefinition>>;

  /**
   * Undo last command
   */
  abstract undo(): Promise<AdapterResponse<HomeDefinition>>;

  /**
   * Redo last undone command
   */
  abstract redo(): Promise<AdapterResponse<HomeDefinition>>;

  /**
   * Get rendering engine type
   */
  getEngineType(): RenderEngineType {
    return this.engineType;
  }

  /**
   * Subscribe to adapter events
   */
  on(eventType: string, listener: (event: AdapterEvent) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(listener);
    };
  }

  /**
   * Emit event to all listeners
   */
  protected emit(eventType: string, data: any): void {
    const event: AdapterEvent = {
      type: eventType,
      data,
      timestamp: Date.now(),
    };

    this.listeners.get(eventType)?.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error(`Error in listener for ${eventType}:`, error);
      }
    });
  }

  /**
   * Get current sync status
   */
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Check if adapter is ready
   */
  abstract isReady(): boolean;

  /**
   * Dispose resources
   */
  abstract dispose(): Promise<void>;
}

/**
 * Factory for creating adapters
 */
export class AdapterFactory {
  private static adapters: Map<RenderEngineType, new (engineType: RenderEngineType) => RenderingAdapter> = new Map();

  /**
   * Register an adapter class for an engine type
   */
  static register(engineType: RenderEngineType, adapterClass: new (engineType: RenderEngineType) => RenderingAdapter): void {
    this.adapters.set(engineType, adapterClass);
  }

  /**
   * Create an adapter instance for the specified engine
   */
  static create(engineType: RenderEngineType): RenderingAdapter {
    const adapterClass = this.adapters.get(engineType);
    if (!adapterClass) {
      throw new Error(`No adapter registered for engine type: ${engineType}`);
    }
    return new adapterClass(engineType);
  }

  /**
   * List available adapters
   */
  static getAvailable(): RenderEngineType[] {
    return Array.from(this.adapters.keys());
  }
}
