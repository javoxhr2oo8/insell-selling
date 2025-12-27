import Dexie from "dexie";

export const db = new Dexie("LocalDataBase");

db.version(1).stores({
  products: 'id',
  orders: 'id',
  categories: 'id',
  get_all_products: 'id'
});