import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { BlockBuilderBlock, BlockBuilderField, BlockBuilderInput, BlockBuilderScalar } from './block-builder.types';

function isFlatScalar(value: unknown): value is BlockBuilderScalar {
  return (
    value === null ||
    value === undefined ||
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    typeof value === 'string'
  );
}

function extractFlatFields(source: BlockBuilderInput): BlockBuilderField[] {
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    return [];
  }

  const fields: BlockBuilderField[] = [];

  for (const [key, value] of Object.entries(source)) {
    if (isFlatScalar(value)) {
      fields.push({ key, value });
    }
  }

  return fields;
}

function formatValue(value: BlockBuilderScalar): string {
  if (value === null) {
    return 'null';
  }

  if (value === undefined) {
    return 'undefined';
  }

  return String(value);
}

@Component({
  selector: 'app-block-builder',
  imports: [CommonModule, DragDropModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './block-builder.component.html',
  styleUrl: './block-builder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlockBuilderComponent {
  readonly data = input<BlockBuilderInput>(null);

  readonly availableFields = computed(() => extractFlatFields(this.data()));
  readonly availableKeys = computed(() => this.availableFields().map(({ key }) => key));
  readonly canAddBlock = computed(() => this.availableKeys().length > 0);
  readonly blocks = signal<BlockBuilderBlock[]>([]);

  private readonly fieldValues = computed(() => {
    return new Map<string, BlockBuilderScalar>(this.availableFields().map(({ key, value }) => [key, value]));
  });

  private nextBlockId = 0;
  private previousKeysSignature: string | null = null;

  constructor() {
    effect(() => {
      const keys = this.availableKeys();
      const keysSignature = keys.join('|');

      if (keysSignature === this.previousKeysSignature) {
        return;
      }

      this.previousKeysSignature = keysSignature;
      this.blocks.set(keys.map((key) => this.createBlock(key)));
    });
  }

  addBlock(): void {
    const nextKey = this.getDefaultKey();

    if (!nextKey) {
      return;
    }

    this.blocks.update((blocks) => [...blocks, this.createBlock(nextKey)]);
  }

  changeBlockKey(blockId: number, selectedKey: string): void {
    if (!this.availableKeys().includes(selectedKey)) {
      return;
    }

    this.blocks.update((blocks) => blocks.map((block) => (block.id === blockId ? { ...block, selectedKey } : block)));
  }

  removeBlock(blockId: number): void {
    this.blocks.update((blocks) => blocks.filter((block) => block.id !== blockId));
  }

  reorderBlocks(event: CdkDragDrop<BlockBuilderBlock[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }

    this.blocks.update((blocks) => {
      const reorderedBlocks = [...blocks];
      moveItemInArray(reorderedBlocks, event.previousIndex, event.currentIndex);
      return reorderedBlocks;
    });
  }

  displayValue(selectedKey: string): string {
    return formatValue(this.fieldValues().get(selectedKey));
  }

  trackBlock(_index: number, block: BlockBuilderBlock): number {
    return block.id;
  }

  private createBlock(selectedKey: string): BlockBuilderBlock {
    this.nextBlockId += 1;

    return {
      id: this.nextBlockId,
      selectedKey,
    };
  }

  private getDefaultKey(): string | null {
    const availableKeys = this.availableKeys();

    if (!availableKeys.length) {
      return null;
    }

    const usedKeys = new Set(this.blocks().map(({ selectedKey }) => selectedKey));

    return availableKeys.find((key) => !usedKeys.has(key)) ?? availableKeys[0];
  }
}
