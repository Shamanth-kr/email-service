import { EmailProvider } from './EmailProvider';
import { CircuitBreaker } from './CircuitBreaker';
import { EmailQueue } from './Queue';

export class EmailService {
  private providers: EmailProvider[];
  private circuitBreakers: Map<EmailProvider, CircuitBreaker>;
  private rateLimitCount = 0;
  private rateLimitWindow = 60000; // 1 minute
  private rateLimitMax = 5;
  private lastReset = Date.now();
  private sentKeys: Set<string> = new Set();
  private queue = new EmailQueue();
  private statusMap: Map<string, string> = new Map();

  constructor(providers: EmailProvider[]) {
    this.providers = providers;
    this.circuitBreakers = new Map();
    providers.forEach(p => this.circuitBreakers.set(p, new CircuitBreaker()));
  }

  async sendEmail(to: string, subject: string, body: string, idempotencyKey: string): Promise<void> {
    if (this.sentKeys.has(idempotencyKey)) {
      console.log(`Duplicate email detected: ${idempotencyKey}`);
      this.statusMap.set(idempotencyKey, 'duplicate');
      return;
    }

    // Rate limiting
    if (Date.now() - this.lastReset > this.rateLimitWindow) {
      this.rateLimitCount = 0;
      this.lastReset = Date.now();
    }
    if (this.rateLimitCount >= this.rateLimitMax) {
      console.log(`Rate limit exceeded. Queuing email ${idempotencyKey}`);
      this.queue.enqueue({ to, subject, body, idempotencyKey });
      this.statusMap.set(idempotencyKey, 'queued');
      return;
    }
    this.rateLimitCount++;

    for (let i = 0; i < this.providers.length; i++) {
      const provider = this.providers[i];
      const breaker = this.circuitBreakers.get(provider)!;
      if (!breaker.canRequest()) {
        console.log(`Provider ${i} circuit breaker OPEN`);
        continue;
      }

      let attempt = 0;
      const maxAttempts = 3;
      let delay = 1000;

      while (attempt < maxAttempts) {
        try {
          await provider.send(to, subject, body, idempotencyKey);
          breaker.success();
          this.sentKeys.add(idempotencyKey);
          this.statusMap.set(idempotencyKey, 'sent');
          console.log(`Email sent via Provider ${i}`);
          return;
        } catch (err) {
          breaker.failure();
          console.log(`Attempt ${attempt + 1} failed: ${err}`);
          await this.sleep(delay);
          delay *= 2; // exponential backoff
          attempt++;
        }
      }
      console.log(`Provider ${i} exhausted retries.`);
    }
    this.statusMap.set(idempotencyKey, 'failed');
    console.log(`All providers failed for email ${idempotencyKey}`);
  }

  async processQueue() {
    while (!this.queue.isEmpty()) {
      const task = this.queue.dequeue()!;
      await this.sendEmail(task.to, task.subject, task.body, task.idempotencyKey);
    }
  }

  getStatus(idempotencyKey: string): string | undefined {
    return this.statusMap.get(idempotencyKey);
  }

  private sleep(ms: number) {
    return new Promise(res => setTimeout(res, ms));
  }
}
