type EmailTask = {
    to: string;
    subject: string;
    body: string;
    idempotencyKey: string;
  };
  
  export class EmailQueue {
    private queue: EmailTask[] = [];
  
    enqueue(task: EmailTask) {
      this.queue.push(task);
    }
  
    dequeue(): EmailTask | undefined {
      return this.queue.shift();
    }
  
    isEmpty(): boolean {
      return this.queue.length === 0;
    }
  }
  