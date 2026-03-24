// React hook for using the architecture in components
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { RenderingAdapter } from './adapter';
import { CommandBus } from './commandBus';
import {
  CommandType,
  HomeDefinition,
  AdapterResponse,
  AdapterEvent,
  SyncStatus,
  SyncState,
  RenderEngineType,
} from './types';

interface UseRenderingEngineOptions {
  engineType: RenderEngineType;
  container?: HTMLElement | string;
}

interface UseRenderingEngineReturn {
  adapter: RenderingAdapter | null;
  commandBus: CommandBus | null;
  home: HomeDefinition | null;
  isLoading: boolean;
  error: string | null;
  syncStatus: SyncStatus;
  
  // Command execution
  executeCommand: (type: CommandType, payload: Record<string, any>) => Promise<AdapterResponse>;
  
  // Home management
  loadHome: (home: HomeDefinition) => Promise<AdapterResponse>;
  saveHome: () => Promise<AdapterResponse>;
  exportHome: (format: 'sh3d' | 'json') => Promise<AdapterResponse>;
  importHome: (data: Blob | string, format: 'sh3d' | 'json') => Promise<AdapterResponse>;
  
  // Undo/Redo
  undo: () => Promise<AdapterResponse>;
  redo: () => Promise<AdapterResponse>;
  canUndo: boolean;
  canRedo: boolean;
  
  // Events
  on: (eventType: string, listener: (event: AdapterEvent) => void) => () => void;
  
  // State management
  refreshHome: () => Promise<void>;
  initializeWithCanvas: (canvas: HTMLCanvasElement) => Promise<void>;
}

/**
 * React hook for using the rendering engine in components
 */
export function useRenderingEngine(
  options: UseRenderingEngineOptions,
): UseRenderingEngineReturn {
  const [adapter, setAdapter] = useState<RenderingAdapter | null>(null);
  const [commandBus, setCommandBus] = useState<CommandBus | null>(null);
  const [home, setHome] = useState<HomeDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    state: SyncState.SYNCED,
    pendingCommands: [],
    errors: [],
  });

  const adapterRef = useRef<RenderingAdapter | null>(null);
  const commandBusRef = useRef<CommandBus | null>(null);
  const unsubscribesRef = useRef<Map<string, () => void>>(new Map());

  const refreshHome = useCallback(async () => {
    if (!adapterRef.current) return;
    const result = await adapterRef.current.getHome();
    if (result.success) {
      setHome(result.data || null);
    }
  }, []);

  // Initialize adapter
  useEffect(() => {
    const initializeAdapter = async () => {
      try {
        setIsLoading(true);

        // Import here to avoid circular deps
        const { AdapterFactory } = await import('./adapter');
        const { SweetHome3DAdapter } = await import('./adapters/SweetHome3DAdapter');
        const { ThreeJSAdapter } = await import('./adapters/ThreeJSAdapter');

        // Register adapters
        AdapterFactory.register(RenderEngineType.SWEETHOME3D, SweetHome3DAdapter);
        AdapterFactory.register(RenderEngineType.THREEJS, ThreeJSAdapter);

        // Create adapter instance
        const newAdapter = AdapterFactory.create(options.engineType);
        adapterRef.current = newAdapter;
        setAdapter(newAdapter);

        // Note: Canvas initialization is deferred and should be called separately
        // to avoid passing refs during render

        // Create command bus
        const newCommandBus = new CommandBus(newAdapter);
        commandBusRef.current = newCommandBus;
        setCommandBus(newCommandBus);

        // Subscribe to events
        const unsubHome = newAdapter.on('home-loaded', () => {
          refreshHome();
        });
        const unsubWallCreated = newAdapter.on('wall-created', () => {
          refreshHome();
        });

        unsubscribesRef.current.set('home-loaded', unsubHome);
        unsubscribesRef.current.set('wall-created', unsubWallCreated);

        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(`Initialization error: ${message}`);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAdapter();

    return () => {
      const currentUnsubs = unsubscribesRef.current;
      currentUnsubs.forEach((unsub) => unsub());
      currentUnsubs.clear();
    };
  }, [options.engineType, options.container, refreshHome]);

  const executeCommand = useCallback(
    async (type: CommandType, payload: Record<string, unknown>) => {
      if (!commandBusRef.current) {
        return { success: false, error: 'Command bus not ready' };
      }

      try {
        setSyncStatus((prev) => ({ ...prev, state: SyncState.PENDING }));
        const result = await commandBusRef.current.execute(type, payload);

        if (result.success) {
          setSyncStatus((prev) => ({ ...prev, state: SyncState.SYNCED }));
        } else {
          setSyncStatus((prev) => ({
            ...prev,
            state: SyncState.ERROR,
            errors: [...prev.errors, result.error || 'Unknown error'],
          }));
        }

        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setSyncStatus((prev) => ({
          ...prev,
          state: SyncState.ERROR,
          errors: [...prev.errors, message],
        }));
        return { success: false, error: message };
      }
    },
    [],
  );

  const loadHome = useCallback(
    async (newHome: HomeDefinition) => {
      if (!adapterRef.current) return { success: false, error: 'Adapter not ready' };
      return adapterRef.current.loadHome(newHome);
    },
    [],
  );

  const saveHome = useCallback(async () => {
    return executeCommand(CommandType.SAVE_HOME, {});
  }, [executeCommand]);

  const exportHome = useCallback(
    async (format: 'sh3d' | 'json') => {
      if (!adapterRef.current) return { success: false, error: 'Adapter not ready' };
      return adapterRef.current.exportHome(format);
    },
    [],
  );

  const importHome = useCallback(
    async (data: Blob | string, format: 'sh3d' | 'json') => {
      if (!adapterRef.current) return { success: false, error: 'Adapter not ready' };
      return adapterRef.current.importHome(data, format);
    },
    [],
  );

  const undo = useCallback(async () => {
    if (!commandBusRef.current) return { success: false, error: 'Command bus not ready' };
    return commandBusRef.current.undo();
  }, []);

  const redo = useCallback(async () => {
    if (!commandBusRef.current) return { success: false, error: 'Command bus not ready' };
    return commandBusRef.current.redo();
  }, []);

  const canUndo = commandBusRef.current ? commandBusRef.current.getUndoCount() > 0 : false;
  const canRedo = commandBusRef.current ? commandBusRef.current.getRedoCount() > 0 : false;

  const on = useCallback((eventType: string, listener: (event: AdapterEvent) => void) => {
    if (!adapterRef.current) return () => {};
    return adapterRef.current.on(eventType, listener);
  }, []);

  const initializeWithCanvas = useCallback(async (canvas: HTMLCanvasElement) => {
    if (!adapterRef.current) {
      setError('Adapter not initialized');
      return;
    }
    try {
      await adapterRef.current.initialize(canvas);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Canvas initialization error: ${message}`);
    }
  }, []);

  return {
    adapter,
    commandBus,
    home,
    isLoading,
    error,
    syncStatus,
    executeCommand,
    loadHome,
    saveHome,
    exportHome,
    importHome,
    undo,
    redo,
    canUndo,
    canRedo,
    on,
    refreshHome,
    initializeWithCanvas,
  };
}
