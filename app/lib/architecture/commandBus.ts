// Command Bus - normalized command execution pipeline
import { v4 as uuidv4 } from 'uuid';
import {
  Command,
  CommandType,
  AdapterResponse,
  UUID,
  HomeDefinition,
} from './types';
import { RenderingAdapter } from './adapter';

/**
 * Command validator - ensure command is well-formed
 */
export interface CommandValidator {
  validate(command: Command): { valid: boolean; errors: string[] };
}

/**
 * Command middleware - intercept and process commands
 */
export interface CommandMiddleware {
  process(command: Command, next: (cmd: Command) => Promise<AdapterResponse>): Promise<AdapterResponse>;
}

/**
 * Command Bus orchestrates command execution through the adapter
 */
export class CommandBus {
  private adapter: RenderingAdapter;
  private validators: Map<CommandType, CommandValidator> = new Map();
  private middlewares: CommandMiddleware[] = [];
  private commandHistory: Command[] = [];
  private commandIndex: number = -1;
  private isExecuting: boolean = false;

  constructor(adapter: RenderingAdapter) {
    this.adapter = adapter;
  }

  /**
   * Register a validator for a command type
   */
  registerValidator(commandType: CommandType, validator: CommandValidator): void {
    this.validators.set(commandType, validator);
  }

  /**
   * Register a middleware
   */
  use(middleware: CommandMiddleware): void {
    this.middlewares.push(middleware);
  }

  /**
   * Execute a command
   */
  async execute(
    commandType: CommandType,
    payload: Record<string, any>,
  ): Promise<AdapterResponse<any>> {
    if (this.isExecuting) {
      return {
        success: false,
        error: 'Another command is already executing',
      };
    }

    const command: Command = {
      type: commandType,
      payload,
      timestamp: Date.now(),
      id: uuidv4() as UUID,
    };

    // Validate command
    const validator = this.validators.get(commandType);
    if (validator) {
      const validation = validator.validate(command);
      if (!validation.valid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`,
        };
      }
    }

    try {
      this.isExecuting = true;

      // Execute through middleware chain
      const result = await this.executeMiddlewareChain(command, 0);

      if (result.success) {
        // Add to history on success
        // Trim future if we're not at the end
        if (this.commandIndex < this.commandHistory.length - 1) {
          this.commandHistory = this.commandHistory.slice(0, this.commandIndex + 1);
        }

        this.commandHistory.push(command);
        this.commandIndex = this.commandHistory.length - 1;
      }

      return result;
    } finally {
      this.isExecuting = false;
    }
  }

  /**
   * Execute through middleware chain
   */
  private async executeMiddlewareChain(
    command: Command,
    index: number,
  ): Promise<AdapterResponse<any>> {
    if (index >= this.middlewares.length) {
      // All middleware processed, execute command on adapter
      return this.adapter.executeCommand(command);
    }

    const middleware = this.middlewares[index];
    return middleware.process(command, (cmd) =>
      this.executeMiddlewareChain(cmd, index + 1),
    );
  }

  /**
   * Undo last command
   */
  async undo(): Promise<AdapterResponse<HomeDefinition>> {
    if (this.commandIndex < 0) {
      return {
        success: false,
        error: 'Nothing to undo',
      };
    }

    // Re-execute all commands up to commandIndex - 1
    this.commandIndex--;
    return this.replayCommands();
  }

  /**
   * Redo last undone command
   */
  async redo(): Promise<AdapterResponse<HomeDefinition>> {
    if (this.commandIndex >= this.commandHistory.length - 1) {
      return {
        success: false,
        error: 'Nothing to redo',
      };
    }

    this.commandIndex++;
    return this.replayCommands();
  }

  /**
   * Replay commands to rebuild state
   */
  private async replayCommands(): Promise<AdapterResponse<HomeDefinition>> {
    const currentHome = await this.adapter.getHome();
    if (!currentHome.success) {
      return currentHome as any;
    }

    // This is simplified - in production, you'd reset to initial state
    // and replay only relevant commands
    return currentHome as AdapterResponse<HomeDefinition>;
  }

  /**
   * Get command history
   */
  getHistory(): Command[] {
    return [...this.commandHistory];
  }

  /**
   * Get current position in history
   */
  getHistoryIndex(): number {
    return this.commandIndex;
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.commandHistory = [];
    this.commandIndex = -1;
  }

  /**
   * Get number of undo steps available
   */
  getUndoCount(): number {
    return this.commandIndex + 1;
  }

  /**
   * Get number of redo steps available
   */
  getRedoCount(): number {
    return this.commandHistory.length - this.commandIndex - 1;
  }
}

/**
 * Built-in validators
 */
export class Validators {
  static wallValidator: CommandValidator = {
    validate(command: Command) {
      const { startPoint, endPoint, thickness, height } = command.payload;
      const errors: string[] = [];

      if (!startPoint || !startPoint.x || !startPoint.y) {
        errors.push('Invalid startPoint');
      }
      if (!endPoint || !endPoint.x || !endPoint.y) {
        errors.push('Invalid endPoint');
      }
      if (!thickness || thickness <= 0) {
        errors.push('Thickness must be > 0');
      }
      if (!height || height <= 0) {
        errors.push('Height must be > 0');
      }

      return { valid: errors.length === 0, errors };
    },
  };

  static furnitureValidator: CommandValidator = {
    validate(command: Command) {
      const { catalogId, position } = command.payload;
      const errors: string[] = [];

      if (!catalogId) {
        errors.push('catalogId is required');
      }
      if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
        errors.push('Invalid position');
      }

      return { valid: errors.length === 0, errors };
    },
  };

  static roomValidator: CommandValidator = {
    validate(command: Command) {
      const { name, wallIds } = command.payload;
      const errors: string[] = [];

      if (!name || name.trim().length === 0) {
        errors.push('Room name is required');
      }
      if (!Array.isArray(wallIds) || wallIds.length < 3) {
        errors.push('Room must have at least 3 walls');
      }

      return { valid: errors.length === 0, errors };
    },
  };
}
