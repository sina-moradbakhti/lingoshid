/**
 * Activity Module Registry Service
 *
 * Central registry for all activity modules in the system.
 * Modules can be registered dynamically and retrieved by type.
 *
 * This allows developers/supervisors to add new activity types
 * without modifying core application code.
 */

import { Injectable, Type } from '@angular/core';
import {
  ActivityModuleMetadata,
  ActivityModuleConfig,
  ActivityModuleComponent,
  ActivityModuleValidation
} from '../models/activity-module.interface';

@Injectable({
  providedIn: 'root'
})
export class ActivityModuleRegistryService {
  private modules = new Map<string, ActivityModuleMetadata>();
  private initialized = false;

  constructor() {
    // Auto-initialize on first use
    if (!this.initialized) {
      this.initializeDefaultModules();
      this.initialized = true;
    }
  }

  /**
   * Register a new activity module
   * @param metadata Module metadata including type and component
   */
  register(metadata: ActivityModuleMetadata): void {
    const validation = this.validateModule(metadata);

    if (!validation.isValid) {
      console.error(`Failed to register module ${metadata.type}:`, validation.errors);
      throw new Error(`Module validation failed: ${validation.errors.join(', ')}`);
    }

    if (validation.warnings.length > 0) {
      console.warn(`Module ${metadata.type} warnings:`, validation.warnings);
    }

    this.modules.set(metadata.type, metadata);
    console.log(`✅ Activity module registered: ${metadata.type} (${metadata.name})`);
  }

  /**
   * Get a module by type
   * @param type Activity type identifier
   * @returns Module metadata or undefined
   */
  getModule(type: string): ActivityModuleMetadata | undefined {
    return this.modules.get(type);
  }

  /**
   * Check if a module is registered
   * @param type Activity type identifier
   */
  hasModule(type: string): boolean {
    return this.modules.has(type);
  }

  /**
   * Get all registered modules
   */
  getAllModules(): ActivityModuleMetadata[] {
    return Array.from(this.modules.values());
  }

  /**
   * Get module types
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.modules.keys());
  }

  /**
   * Unregister a module (useful for testing or hot-reload)
   */
  unregister(type: string): boolean {
    return this.modules.delete(type);
  }

  /**
   * Clear all modules (use with caution!)
   */
  clearAll(): void {
    this.modules.clear();
    console.warn('⚠️ All activity modules have been cleared from registry');
  }

  /**
   * Get module component class for dynamic loading
   */
  getModuleComponent(type: string): Type<any> | undefined {
    const module = this.getModule(type);
    return module?.component;
  }

  /**
   * Validate module metadata
   */
  private validateModule(metadata: ActivityModuleMetadata): ActivityModuleValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!metadata.type) {
      errors.push('Module type is required');
    }

    if (!metadata.name) {
      errors.push('Module name is required');
    }

    if (!metadata.component) {
      errors.push('Module component is required');
    }

    if (!metadata.version) {
      warnings.push('Module version not specified');
    }

    // Check for duplicates
    if (this.modules.has(metadata.type)) {
      warnings.push(`Module type '${metadata.type}' is already registered and will be overwritten`);
    }

    // Check type naming convention
    if (metadata.type && !metadata.type.match(/^[a-z_]+$/)) {
      warnings.push('Module type should use lowercase with underscores (e.g., "pronunciation_challenge")');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Initialize default modules (existing activity types)
   * These will eventually be migrated to the modular system
   */
  private initializeDefaultModules(): void {
    console.log('📦 Initializing Activity Module Registry...');
    console.log('ℹ️  Default modules will be registered here in the future');
    console.log('ℹ️  For now, the registry is ready to accept new modules');

    // Future: Register migrated modules here
    // Example:
    // this.register({
    //   type: 'pronunciation_challenge',
    //   name: 'Pronunciation Challenge',
    //   description: 'Practice pronunciation with audio feedback',
    //   version: '1.0.0',
    //   component: PronunciationModuleComponent,
    //   processor: PronunciationProcessor,
    //   supportedFeatures: ['audio', 'speech-recognition']
    // });
  }

  /**
   * Get modules filtered by capability
   */
  getModulesByFeature(feature: string): ActivityModuleMetadata[] {
    return this.getAllModules().filter(module =>
      module.supportedFeatures.includes(feature)
    );
  }

  /**
   * Get modules suitable for a student level
   */
  getModulesForLevel(level: number): ActivityModuleMetadata[] {
    return this.getAllModules().filter(module => {
      const minLevel = module.minLevel ?? 0;
      const maxLevel = module.maxLevel ?? Infinity;
      return level >= minLevel && level <= maxLevel;
    });
  }

  /**
   * Debug: Print all registered modules
   */
  debugPrintModules(): void {
    console.log('=== Registered Activity Modules ===');
    if (this.modules.size === 0) {
      console.log('No modules registered yet');
      return;
    }

    this.getAllModules().forEach(module => {
      console.log(`
Type: ${module.type}
Name: ${module.name}
Version: ${module.version}
Features: ${module.supportedFeatures.join(', ')}
Level Range: ${module.minLevel ?? 'any'} - ${module.maxLevel ?? 'any'}
      `);
    });
    console.log('================================');
  }
}
