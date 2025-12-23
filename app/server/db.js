import Dexie from "dexie";

export const db = new Dexie("MyProjectDB");

db.version(2).stores({
  queue: '++id, url, method, payload, createdAt',
  cache: 'key, data, updatedAt'
});