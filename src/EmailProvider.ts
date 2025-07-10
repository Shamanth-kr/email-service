export interface EmailProvider {
    send(to: string, subject: string, body: string, idempotencyKey: string): Promise<void>;
  }
  
  export class MockProviderA implements EmailProvider {
    async send(to: string, subject: string, body: string, idempotencyKey: string): Promise<void> {
      if (Math.random() < 0.3) throw new Error('ProviderA failed');
      console.log(`ProviderA sent email to ${to}`);
    }
  }
  
  export class MockProviderB implements EmailProvider {
    async send(to: string, subject: string, body: string, idempotencyKey: string): Promise<void> {
      if (Math.random() < 0.2) throw new Error('ProviderB failed');
      console.log(`ProviderB sent email to ${to}`);
    }
  }
  