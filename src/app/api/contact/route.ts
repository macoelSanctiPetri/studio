import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: true, // usamos SSL en 465 según datos de Plesk
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: Request) {
  try {
    const { name, email, type, message, honeypot } = await req.json();

    // honeypot antispam
    if (honeypot) return NextResponse.json({ ok: true });

    if (!name || !email || !message) {
      return NextResponse.json({ ok: false, error: "Faltan campos" }, { status: 400 });
    }

    const body = `
Nombre: ${name}
Email: ${email}
Tipo: ${type || "General"}

Mensaje:
${message}
`.trim();

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.CONTACT_TO,
      replyTo: email,
      subject: `Contacto web - ${type || "General"}`,
      text: body,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error enviando contacto:", err);
    return NextResponse.json({ ok: false, error: "No se pudo enviar" }, { status: 500 });
  }
}
