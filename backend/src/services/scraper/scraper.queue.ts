// src/services/scraper/scraper.queue.ts
import PQueue from 'p-queue';

export class ScrapeQueue {
  private queue: PQueue;
  
  constructor(options?: { concurrency?: number; interval?: number; intervalCap?: number }) {
    this.queue = new PQueue({
      concurrency: options?.concurrency || 3,      // Max 3 concurrent pages
      interval: options?.interval || 2000,         // 2 second interval
      intervalCap: options?.intervalCap || 1       // 1 request per interval
    });
  }
  
  async add<T>(fn: () => Promise<T>, priority?: number): Promise<T> {
    return this.queue.add(fn, { priority }) as Promise<T>;
  }
  
  async onIdle(): Promise<void> {
    return this.queue.onIdle();
  }
  
  get size(): number {
    return this.queue.size;
  }
  
  get pending(): number {
    return this.queue.pending;
  }
  
  clear(): void {
    this.queue.clear();
  }
  
  pause(): void {
    this.queue.pause();
  }
  
  start(): void {
    this.queue.start();
  }
}