import { Router, Request, Response } from 'express';
import nodemailer from 'nodemailer';
const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'name, email, and message are required' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_TO,
      subject: `New message from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });

    res.json({ success: true, message: 'Message sent successfully' });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
