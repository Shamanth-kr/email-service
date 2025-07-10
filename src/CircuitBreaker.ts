export class CircuitBreaker {
    private failureCount = 0;
    private successThreshold: number;
    private failureThreshold: number;
    private timeout: number;
    private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
    private nextAttempt = Date.now();
  
    constructor(failureThreshold = 3, successThreshold = 2, timeout = 5000) {
      this.failureThreshold = failureThreshold;
      this.successThreshold = successThreshold;
      this.timeout = timeout;
    }
  
    canRequest(): boolean {
      if (this.state === 'OPEN') {
        if (Date.now() > this.nextAttempt) {
          this.state = 'HALF_OPEN';
          return true;
        }
        return false;
      }
      return true;
    }
  
    success() {
      if (this.state === 'HALF_OPEN') {
        this.failureCount++;
        if (this.failureCount >= this.successThreshold) {
          this.state = 'CLOSED';
          this.failureCount = 0;
        }
      }
    }
  
    failure() {
      this.failureCount++;
      if (this.failureCount >= this.failureThreshold) {
        this.state = 'OPEN';
        this.nextAttempt = Date.now() + this.timeout;
      }
    }
  }
  