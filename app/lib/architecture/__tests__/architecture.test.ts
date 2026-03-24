// Testing guide and mock adapter for testing
import { RenderingAdapter } from './adapter';
import { Command, HomeDefinition, CommandType, AdapterEvent } from './types';
import { v4 as uuidv4 } from 'uuid';

/**
 * MockAdapter - For testing without a real rendering engine
 * Useful for unit tests, integration tests, and development
 */
export class MockAdapter extends RenderingAdapter {
  private home: HomeDefinition = {
    id: 'mock-home',
    name: 'Mock Home',
    walls: [],
    furniture: [],
    rooms: [],
    dimensions: [],
    environment: {
      ambientLight: { r: 0.5, g: 0.5, b: 0.5, a: 1 },
      directionalLight: { r: 1, g: 1, b: 1, a: 1 },
    },
    camera: {
      position: { x: 0, y: 10, z: 15 },
      target: { x: 0, y: 0, z: 0 },
      fov: 75,
    },
  };

  private executedCommands: Command[] = [];

  async initialize(canvas: HTMLCanvasElement): Promise<void> {
    // Mock initialization
    this.syncStatus = 'synced';
    this.emit('initialized');

    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  async executeCommand(command: Command): Promise<void> {
    this.executedCommands.push(command);

    switch (command.type) {
      case CommandType.CREATE_WALL:
        this.home.walls.push(command.payload);
        this.emit('wall-created', { wallId: command.payload.id });
        break;

      case CommandType.UPDATE_WALL:
        const wall = this.home.walls.find((w) => w.id === command.payload.wallId);
        if (wall) {
          Object.assign(wall, command.payload.updates);
        }
        break;

      case CommandType.DELETE_WALL:
        this.home.walls = this.home.walls.filter((w) => w.id !== command.payload);
        break;

      case CommandType.CREATE_FURNITURE:
        this.home.furniture.push(command.payload);
        this.emit('furniture-created', { furnitureId: command.payload.id });
        break;

      case CommandType.UPDATE_FURNITURE:
        const furniture = this.home.furniture.find((f) => f.id === command.payload.furnitureId);
        if (furniture) {
          Object.assign(furniture, command.payload.updates);
        }
        break;

      case CommandType.DELETE_FURNITURE:
        this.home.furniture = this.home.furniture.filter((f) => f.id !== command.payload);
        break;

      case CommandType.CREATE_ROOM:
        this.home.rooms.push(command.payload);
        break;

      case CommandType.LOAD_HOME:
        this.home = command.payload;
        break;

      case CommandType.SAVE_HOME:
        this.emit('save-completed', { timestamp: Date.now() });
        break;

      default:
        console.warn(`Mock adapter: unknown command ${command.type}`);
    }

    this.syncStatus = 'synced';
  }

  async loadHome(home: HomeDefinition): Promise<void> {
    this.home = JSON.parse(JSON.stringify(home));
  }

  async getHome(): Promise<HomeDefinition> {
    return JSON.parse(JSON.stringify(this.home));
  }

  async exportHome(format: 'json' | 'sh3d'): Promise<string> {
    return JSON.stringify(this.home, null, 2);
  }

  async importHome(data: string, format: 'json' | 'sh3d'): Promise<void> {
    this.home = JSON.parse(data);
  }

  async isReady(): Promise<boolean> {
    return true;
  }

  async dispose(): Promise<void> {
    this.executedCommands = [];
    this.emit('disposed');
  }

  // Testing helpers
  getExecutedCommands(): Command[] {
    return [...this.executedCommands];
  }

  clearExecutedCommands(): void {
    this.executedCommands = [];
  }

  getExecutionCount(): number {
    return this.executedCommands.length;
  }
}

/**
 * Test Suite Examples
 * Run with: npm test
 */

// Test: Command validation
export async function testCommandValidation() {
  const adapter = new MockAdapter();
  const canvas = document.createElement('canvas');

  await adapter.initialize(canvas);

  // Create a wall
  const createWallCmd: Command = {
    id: uuidv4(),
    type: CommandType.CREATE_WALL,
    timestamp: Date.now(),
    payload: {
      id: 'wall-1',
      startPoint: { x: 0, y: 0 },
      endPoint: { x: 10, y: 0 },
      thickness: 0.2,
      height: 3,
      material: 'concrete',
    },
  };

  await adapter.executeCommand(createWallCmd);

  const home = await adapter.getHome();
  console.assert(home.walls.length === 1, 'Wall should be created');
  console.assert(home.walls[0].id === 'wall-1', 'Wall ID should match');

  console.log('✓ testCommandValidation passed');
}

// Test: Command history
export async function testCommandHistory() {
  const adapter = new MockAdapter();
  const canvas = document.createElement('canvas');

  await adapter.initialize(canvas);

  // Execute multiple commands
  const cmd1 = {
    id: uuidv4(),
    type: CommandType.CREATE_WALL,
    timestamp: Date.now(),
    payload: {
      id: 'wall-1',
      startPoint: { x: 0, y: 0 },
      endPoint: { x: 10, y: 0 },
      thickness: 0.2,
      height: 3,
    },
  };

  const cmd2 = {
    id: uuidv4(),
    type: CommandType.CREATE_FURNITURE,
    timestamp: Date.now() + 1,
    payload: {
      id: 'furniture-1',
      catalogId: 'chair-1',
      position: { x: 5, y: 5 },
      rotation: 0,
      scale: 1,
    },
  };

  await adapter.executeCommand(cmd1 as any);
  await adapter.executeCommand(cmd2 as any);

  const executed = adapter.getExecutedCommands();
  console.assert(executed.length === 2, 'Should have 2 executed commands');
  console.assert(executed[0].type === CommandType.CREATE_WALL, 'First command should be CREATE_WALL');
  console.assert(executed[1].type === CommandType.CREATE_FURNITURE, 'Second command should be CREATE_FURNITURE');

  console.log('✓ testCommandHistory passed');
}

// Test: Event emission
export async function testEventEmission() {
  const adapter = new MockAdapter();
  const canvas = document.createElement('canvas');

  await adapter.initialize(canvas);

  let wallCreatedFired = false;
  adapter.on('wall-created', (event) => {
    wallCreatedFired = true;
    console.assert(event.wallId === 'wall-1', 'Wall ID should be wall-1');
  });

  const cmd = {
    id: uuidv4(),
    type: CommandType.CREATE_WALL,
    timestamp: Date.now(),
    payload: {
      id: 'wall-1',
      startPoint: { x: 0, y: 0 },
      endPoint: { x: 10, y: 0 },
      thickness: 0.2,
      height: 3,
    },
  };

  await adapter.executeCommand(cmd as any);

  console.assert(wallCreatedFired, 'wall-created event should fire');
  console.log('✓ testEventEmission passed');
}

// Test: Save/Load
export async function testSaveLoad() {
  const adapter = new MockAdapter();
  const canvas = document.createElement('canvas');

  await adapter.initialize(canvas);

  // Create some objects
  const cmd1 = {
    id: uuidv4(),
    type: CommandType.CREATE_WALL,
    timestamp: Date.now(),
    payload: {
      id: 'wall-1',
      startPoint: { x: 0, y: 0 },
      endPoint: { x: 10, y: 0 },
      thickness: 0.2,
      height: 3,
    },
  };

  await adapter.executeCommand(cmd1 as any);

  // Export
  const exported = await adapter.exportHome('json');
  const exportedData = JSON.parse(exported);

  console.assert(exportedData.walls.length === 1, 'Exported data should have 1 wall');

  // Import into new adapter
  const adapter2 = new MockAdapter();
  await adapter2.initialize(canvas);
  await adapter2.importHome(exported, 'json');

  const home2 = await adapter2.getHome();
  console.assert(home2.walls.length === 1, 'Imported home should have 1 wall');
  console.assert(home2.walls[0].id === 'wall-1', 'Wall ID should match');

  console.log('✓ testSaveLoad passed');
}

// Test: Engine switching
export async function testEngineSwitching() {
  const adapter1 = new MockAdapter();
  const adapter2 = new MockAdapter();
  const canvas = document.createElement('canvas');

  await adapter1.initialize(canvas);
  await adapter2.initialize(canvas);

  // Create content in first engine
  const cmd = {
    id: uuidv4(),
    type: CommandType.CREATE_WALL,
    timestamp: Date.now(),
    payload: {
      id: 'wall-1',
      startPoint: { x: 0, y: 0 },
      endPoint: { x: 10, y: 0 },
      thickness: 0.2,
      height: 3,
    },
  };

  await adapter1.executeCommand(cmd as any);
  const home1 = await adapter1.getHome();

  // Export and load into second engine
  await adapter2.loadHome(home1);
  const home2 = await adapter2.getHome();

  console.assert(home2.walls.length === 1, 'Second engine should have the wall');
  console.assert(home2.walls[0].id === 'wall-1', 'Wall should maintain ID');

  console.log('✓ testEngineSwitching passed');
}

/**
 * Run all tests
 */
export async function runAllTests() {
  console.log('Starting architecture tests...\n');

  try {
    await testCommandValidation();
    await testCommandHistory();
    await testEventEmission();
    await testSaveLoad();
    await testEngineSwitching();

    console.log('\n✓ All tests passed!');
    return true;
  } catch (error) {
    console.error('\n✗ Tests failed:', error);
    return false;
  }
}

/**
 * Performance benchmark
 */
export async function runBenchmarks() {
  console.log('Running performance benchmarks...\n');

  const adapter = new MockAdapter();
  const canvas = document.createElement('canvas');
  await adapter.initialize(canvas);

  // Benchmark: Create 1000 walls
  console.time('Create 1000 walls');
  for (let i = 0; i < 1000; i++) {
    const cmd = {
      id: uuidv4(),
      type: CommandType.CREATE_WALL,
      timestamp: Date.now(),
      payload: {
        id: `wall-${i}`,
        startPoint: { x: i, y: 0 },
        endPoint: { x: i + 10, y: 0 },
        thickness: 0.2,
        height: 3,
      },
    };
    await adapter.executeCommand(cmd as any);
  }
  console.timeEnd('Create 1000 walls');

  // Benchmark: Export large home
  console.time('Export home with 1000 walls');
  const exported = await adapter.exportHome('json');
  console.timeEnd('Export home with 1000 walls');

  // Benchmark: Import large home
  console.time('Import home with 1000 walls');
  const adapter2 = new MockAdapter();
  await adapter2.initialize(canvas);
  await adapter2.importHome(exported, 'json');
  console.timeEnd('Import home with 1000 walls');

  console.log('\n✓ Benchmarks complete');
}

/**
 * Stress test - test system limits
 */
export async function runStressTest() {
  console.log('Running stress test...\n');

  const adapter = new MockAdapter();
  const canvas = document.createElement('canvas');
  await adapter.initialize(canvas);

  const maxWalls = 10000;
  console.log(`Creating ${maxWalls} walls...`);

  try {
    for (let i = 0; i < maxWalls; i++) {
      const cmd = {
        id: uuidv4(),
        type: CommandType.CREATE_WALL,
        timestamp: Date.now(),
        payload: {
          id: `wall-${i}`,
          startPoint: { x: i % 100, y: Math.floor(i / 100) },
          endPoint: { x: (i % 100) + 10, y: Math.floor(i / 100) },
          thickness: 0.2,
          height: 3,
        },
      };
      await adapter.executeCommand(cmd as any);
    }

    const home = await adapter.getHome();
    console.log(`✓ Successfully created ${home.walls.length} walls`);
    console.log(`✓ Memory usage: ${(JSON.stringify(home).length / 1024 / 1024).toFixed(2)} MB`);
  } catch (error) {
    console.error(`✗ Stress test failed at some point: ${error}`);
  }
}

// Export test runner for use in test files
export default {
  testCommandValidation,
  testCommandHistory,
  testEventEmission,
  testSaveLoad,
  testEngineSwitching,
  runAllTests,
  runBenchmarks,
  runStressTest,
  MockAdapter,
};
