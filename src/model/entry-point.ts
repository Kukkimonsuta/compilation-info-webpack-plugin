import { Chunk } from './chunk';

export interface EntryPoint {
	name: string;
	chunks: Chunk[];
}
