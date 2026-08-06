/**
 * 生成 Workflow 持久化仓库。
 * IndexedDB 提供事务化检查点；MemoryStore 仅供自动化测试。
 */
(function initPackWorkflowStore(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PackWorkflowStore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildStoreApi() {
  const DB_NAME = 'zhijing-pack-workflows';
  const DB_VERSION = 1;
  const STORE_NAME = 'jobs';

  function requestResult(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('IndexedDB 请求失败'));
    });
  }

  function transactionDone(transaction) {
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onabort = () =>
        reject(transaction.error || new Error('Workflow 检查点事务已中止'));
      transaction.onerror = () =>
        reject(transaction.error || new Error('Workflow 检查点写入失败'));
    });
  }

  class IndexedDbStore {
    constructor(indexedDb = globalThis.indexedDB) {
      if (!indexedDb) throw new Error('当前环境不支持 IndexedDB');
      this.indexedDb = indexedDb;
      this.dbPromise = null;
    }

    open() {
      if (this.dbPromise) return this.dbPromise;
      this.dbPromise = new Promise((resolve, reject) => {
        const request = this.indexedDb.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (db.objectStoreNames.contains(STORE_NAME)) return;
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'jobId' });
          store.createIndex('projectId', 'projectId', { unique: false });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error('Workflow 数据库打开失败'));
        request.onblocked = () => reject(new Error('Workflow 数据库升级被其他窗口阻塞'));
      });
      return this.dbPromise;
    }

    async save(record) {
      const db = await this.open();
      const tx = db.transaction(STORE_NAME, 'readwrite', { durability: 'strict' });
      tx.objectStore(STORE_NAME).put(structuredClone(record));
      await transactionDone(tx);
      return record;
    }

    async get(jobId) {
      const db = await this.open();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const value = await requestResult(tx.objectStore(STORE_NAME).get(jobId));
      await transactionDone(tx);
      return value || null;
    }

    async list() {
      const db = await this.open();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const values = await requestResult(tx.objectStore(STORE_NAME).getAll());
      await transactionDone(tx);
      return values || [];
    }

    async latestForProject(projectId) {
      const all = await this.list();
      return (
        all
          .filter((item) => item.projectId === projectId)
          .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))[0] || null
      );
    }

    async remove(jobId) {
      const db = await this.open();
      const tx = db.transaction(STORE_NAME, 'readwrite', { durability: 'strict' });
      tx.objectStore(STORE_NAME).delete(jobId);
      await transactionDone(tx);
    }
  }

  class MemoryStore {
    constructor(seed = []) {
      this.records = new Map(seed.map((item) => [item.jobId, structuredClone(item)]));
    }

    async save(record) {
      this.records.set(record.jobId, structuredClone(record));
      return record;
    }

    async get(jobId) {
      const value = this.records.get(jobId);
      return value ? structuredClone(value) : null;
    }

    async list() {
      return [...this.records.values()].map((item) => structuredClone(item));
    }

    async latestForProject(projectId) {
      const all = await this.list();
      return (
        all
          .filter((item) => item.projectId === projectId)
          .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))[0] || null
      );
    }

    async remove(jobId) {
      this.records.delete(jobId);
    }
  }

  return {
    IndexedDbStore,
    MemoryStore,
    constants: { DB_NAME, DB_VERSION, STORE_NAME },
  };
});
