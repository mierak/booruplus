import { wrap } from 'comlink';
import { dbWorker } from './worker';

type DbType = typeof dbWorker;

const worker = new Worker('./worker', { name: 'dexie', type: 'module' });

export const db = wrap<DbType>(worker) as unknown as DbType;
