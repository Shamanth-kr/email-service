import express, { Request, Response } from "express";
import { EmailService } from "./EmailService";
import { MockProviderA, MockProviderB } from "./EmailProvider";

const app = express();
app.use(express.json());

const emailService = new EmailService([new MockProviderA(), new MockProviderB()]);

app.post("/send-email", async (req: Request, res: Response) => {
  const { to, subject, body, idempotencyKey } = req.body;

  if (!to || !subject || !body || !idempotencyKey) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await emailService.sendEmail(to, subject, body, idempotencyKey);
    res.json({ status: "SENT" });
  } catch (err: any) {
    console.error("Error sending email:", err);
    res.status(500).json({ error: err.message });
  }
});

export default app;
