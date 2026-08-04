export type EntryType = 'cm' | 's' | 'wert';

interface EntryBase {
  id: number;
  name: string;
}

export interface CmEntry extends EntryBase {
  type: 'cm';
  before?: number;
  after?: number;
  absoluteDifference?: number;
  relativeDifference?: number;
}

export interface SEntry extends EntryBase {
  type: 's';
  value?: number;
}

export interface WertEntry extends EntryBase {
  type: 'wert';
  value?: number;
}

export type Entry = CmEntry | SEntry | WertEntry;