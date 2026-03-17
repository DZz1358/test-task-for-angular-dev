export type BlockBuilderScalar = boolean | number | string | null | undefined;

export type BlockBuilderInput = Readonly<Record<string, unknown>> | null | undefined;

export interface BlockBuilderField {
  key: string;
  value: BlockBuilderScalar;
}

export interface BlockBuilderBlock {
  id: number;
  selectedKey: string;
}
