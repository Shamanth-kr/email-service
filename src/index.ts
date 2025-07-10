import { EmailService } from './EmailService';
import { MockProviderA, MockProviderB } from './EmailProvider';

const service = new EmailService([new MockProviderA(), new MockProviderB()]);

(async () => {
    await service.sendEmail('a@example.com', 'Hello A', 'Msg A', 'id-1');
    await service.sendEmail('b@example.com', 'Hello B', 'Msg B', 'id-2');
    await service.sendEmail('c@example.com', 'Hello C', 'Msg C', 'id-3');
    await service.sendEmail('d@example.com', 'Hello D', 'Msg D', 'id-4');
    await service.sendEmail('e@example.com', 'Hello E', 'Msg E', 'id-5');
    await service.sendEmail('f@example.com', 'Hello F', 'Msg F', 'id-6'); // this one may be rate limited
    await service.processQueue();
    
})();
