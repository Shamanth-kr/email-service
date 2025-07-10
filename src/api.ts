import express, { Request, Response } from "express";
import { EmailService } from "./EmailService";

const app = express();
app.use(express.json());

const emailService = new EmailService();

app.post("/send-email", async (req: Request, res: Response) => {
  const { to, subject, body, idempotencyKey } = req.body;
  try {
    await emailService.sendEmail({
      to,
      subject,
      body,
      idempotencyKey
    });
    res.json({ status: "SENT" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default app;
