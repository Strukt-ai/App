// Two-way synchronization between 2D and 3D views
import {
  HomeDefinition,
  WallDefinition,
  FurnitureDefinition,
  RoomDefinition,
  Point2D,
  Point3D,
  UUID,
} from './types';

/**
 * Synchronizer handles 2D ↔ 3D data conversions
 */
export class Synchronizer {
  /**
   * Convert 2D wall coordinates to 3D space
   */
  static wall2DTo3D(wall: WallDefinition, floorHeight: number = 0): WallDefinition {
    return {
      ...wall,
      // 2D walls are already at correct position
      // Z coordinate is implicit (ground level)
    };
  }

  /**
   * Convert 3D furniture to 2D projection (top-down view)
   */
  static furniture3DTo2D(furniture: FurnitureDefinition): {
    position: Point2D;
    width: number;
    depth: number;
  } {
    return {
      position: {
        x: furniture.position.x,
        y: furniture.position.z, // Z becomes Y in 2D top-down
      },
      width: furniture.width || 0,
      depth: furniture.depth || 0,
    };
  }

  /**
   * Convert 2D room outline to 3D room
   */
  static room2DTo3D(
    room: RoomDefinition,
    walls: Map<UUID, WallDefinition>,
    floorHeight: number = 0,
    ceilingHeight: number = 250,
  ): RoomDefinition {
    // Room is already defined by wall references
    // Just add height information
    return {
      ...room,
    };
  }

  /**
   * Validate consistency between 2D and 3D views
   */
  static validateConsistency(home: HomeDefinition): {
    isConsistent: boolean;
    mismatches: string[];
  } {
    const mismatches: string[] = [];

    // Check furniture positions match walls
    for (const furniture of home.furniture) {
      const isInBounds = this.isFurnitureInBounds(furniture, home.walls);
      if (!isInBounds) {
        mismatches.push(`Furniture ${furniture.id} is outside home bounds`);
      }
    }

    // Check rooms reference valid walls
    const wallIds = new Set(home.walls.map((w) => w.id));
    for (const room of home.rooms) {
      for (const wallId of room.wallIds) {
        if (!wallIds.has(wallId)) {
          mismatches.push(`Room ${room.id} references non-existent wall ${wallId}`);
        }
      }
    }

    return {
      isConsistent: mismatches.length === 0,
      mismatches,
    };
  }

  /**
   * Check if furniture is within home bounds
   */
  private static isFurnitureInBounds(
    furniture: FurnitureDefinition,
    walls: WallDefinition[],
  ): boolean {
    // Simple bounding box check
    const xs = walls.flatMap((w) => [w.startPoint.x, w.endPoint.x]);
    const ys = walls.flatMap((w) => [w.startPoint.y, w.endPoint.y]);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const furnitureX = furniture.position.x;
    const furnitureY = furniture.position.z; // Z in 3D = Y in 2D plan

    return (
      furnitureX >= minX &&
      furnitureX <= maxX &&
      furnitureY >= minY &&
      furnitureY <= maxY
    );
  }

  /**
   * Merge updates from 3D view into home definition
   * (e.g., user moved furniture in 3D, sync back to model)
   */
  static merge3DUpdate(
    home: HomeDefinition,
    furnitureId: UUID,
    position: Point3D,
    rotation?: number,
  ): HomeDefinition {
    return {
      ...home,
      furniture: home.furniture.map((f) =>
        f.id === furnitureId
          ? {
              ...f,
              position,
              rotation: rotation ?? f.rotation,
            }
          : f,
      ),
    };
  }

  /**
   * Merge updates from 2D view into home definition
   */
  static merge2DUpdate(
    home: HomeDefinition,
    wallId: UUID,
    startPoint: Point2D,
    endPoint: Point2D,
  ): HomeDefinition {
    return {
      ...home,
      walls: home.walls.map((w) =>
        w.id === wallId
          ? {
              ...w,
              startPoint,
              endPoint,
            }
          : w,
      ),
    };
  }

  /**
   * Export home to JSON format
   */
  static exportToJSON(home: HomeDefinition): string {
    return JSON.stringify(
      {
        ...home,
        // Ensure UUIDs are strings
        id: home.id,
      },
      null,
      2,
    );
  }

  /**
   * Import home from JSON format
   */
  static importFromJSON(jsonString: string): { home: HomeDefinition; errors: string[] } {
    const errors: string[] = [];

    try {
      const data = JSON.parse(jsonString);

      // Validate required fields
      if (!data.id) errors.push('Missing home id');
      if (!data.name) errors.push('Missing home name');
      if (!Array.isArray(data.walls)) errors.push('Invalid walls array');
      if (!Array.isArray(data.furniture)) errors.push('Invalid furniture array');
      if (!Array.isArray(data.rooms)) errors.push('Invalid rooms array');

      if (errors.length > 0) {
        return { home: data as HomeDefinition, errors };
      }

      return { home: data as HomeDefinition, errors: [] };
    } catch (error) {
      return {
        home: {} as HomeDefinition,
        errors: [`JSON parse error: ${error}`],
      };
    }
  }

  /**
   * Calculate room area from walls
   */
  static calculateRoomArea(
    room: RoomDefinition,
    walls: Map<UUID, WallDefinition>,
  ): number {
    // Simplified polygon area calculation (shoelace formula)
    const points: Point2D[] = [];

    for (const wallId of room.wallIds) {
      const wall = walls.get(wallId);
      if (wall) {
        points.push(wall.startPoint);
      }
    }

    if (points.length < 3) return 0;

    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % points.length];
      area += p1.x * p2.y - p2.x * p1.y;
    }

    return Math.abs(area / 2) / 10000; // Convert cm² to m²
  }

  /**
   * Get room perimeter from walls
   */
  static calculateRoomPerimeter(
    room: RoomDefinition,
    walls: Map<UUID, WallDefinition>,
  ): number {
    let perimeter = 0;

    for (const wallId of room.wallIds) {
      const wall = walls.get(wallId);
      if (wall) {
        const dx = wall.endPoint.x - wall.startPoint.x;
        const dy = wall.endPoint.y - wall.startPoint.y;
        perimeter += Math.sqrt(dx * dx + dy * dy);
      }
    }

    return perimeter / 100; // Convert cm to meters
  }
}

/**
 * Format converter for different storage formats
 */
export class FormatConverter {
  /**
   * Convert home definition to .sh3d compatible format
   */
  static toSH3DFormat(home: HomeDefinition): any {
    return {
      version: '1.0',
      home: {
        id: home.id,
        name: home.name,
        walls: home.walls.map((wall) => ({
          id: wall.id,
          xStart: wall.startPoint.x,
          yStart: wall.startPoint.y,
          xEnd: wall.endPoint.x,
          yEnd: wall.endPoint.y,
          thickness: wall.thickness,
          height: wall.height,
          material: wall.material,
        })),
        furniture: home.furniture.map((furn) => ({
          id: furn.id,
          catalogId: furn.catalogId,
          x: furn.position.x,
          y: furn.position.y,
          z: furn.position.z,
          angle: furn.rotation || 0,
          scaleXyz: furn.scale || 1,
        })),
        rooms: home.rooms.map((room) => ({
          id: room.id,
          name: room.name,
          wallIds: room.wallIds,
          material: room.floorMaterial,
        })),
        environment: home.environment,
      },
    };
  }

  /**
   * Convert from .sh3d format to home definition
   */
  static fromSH3DFormat(data: any): HomeDefinition {
    const h = data.home;
    return {
      id: h.id as UUID,
      name: h.name,
      walls: h.walls.map((w: any) => ({
        id: w.id as UUID,
        startPoint: { x: w.xStart, y: w.yStart },
        endPoint: { x: w.xEnd, y: w.yEnd },
        thickness: w.thickness,
        height: w.height,
        material: w.material,
      })),
      furniture: h.furniture.map((f: any) => ({
        id: f.id as UUID,
        catalogId: f.catalogId,
        position: { x: f.x, y: f.y, z: f.z },
        rotation: f.angle || 0,
        scale: f.scaleXyz || 1,
      })),
      rooms: h.rooms.map((r: any) => ({
        id: r.id as UUID,
        name: r.name,
        wallIds: r.wallIds,
        floorMaterial: r.material,
      })),
      dimensions: [],
      environment: data.environment,
    };
  }
}
