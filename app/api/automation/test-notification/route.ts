import { Buffer } from "buffer";
import { randomUUID } from "crypto";
import net from "net";
import tls from "tls";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin, unauthorized } from "@/lib/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TestChannel = "telegram" | "email" | "all";

type DeliveryResult = {
  ok: boolean;
  channel: "telegram" | "email";
  message: string;
};

function stripControl(value: string) {
  return value.replace(/[\r\n]/g, " ").trim();
}

async function recordNotification(title: string, message: string, channel: string, status: string, details: Record<string, unknown>) {
  const id = randomUUID();
  await query(
    `INSERT INTO automation_notifications (id, title, message, channel, status, job_id)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, title, message, channel, status, "manual_notification_test"],
  );

  await query(
    `INSERT INTO automation_logs (id, job_id, job_title, level, message, details)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
    [
      randomUUID(),
      "manual_notification_test",
      "Manual Notification Test",
      status === "success" ? "success" : "warning",
      message,
      JSON.stringify(details),
    ],
  );
}

async function sendTelegramTest(): Promise<DeliveryResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN || "";
  const chatId = process.env.TELEGRAM_CHAT_ID || "";

  if (!token || !chatId) {
    return {
      ok: false,
      channel: "telegram",
      message: "TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing in .env.local / GitHub Secrets.",
    };
  }

  const text = `✅ My Plan Automation Telegram test\n\nTime: ${new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" })}\nIf you see this, Telegram notification is connected.`;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  const body = (await response.json().catch(() => null)) as { description?: string } | null;

  if (!response.ok) {
    return {
      ok: false,
      channel: "telegram",
      message: body?.description || `Telegram API failed with HTTP ${response.status}.`,
    };
  }

  return { ok: true, channel: "telegram", message: "Telegram test message sent successfully." };
}

function readSmtpLine(socket: net.Socket | tls.TLSSocket): Promise<string> {
  return new Promise((resolve, reject) => {
    let buffer = "";
    const onData = (chunk: Buffer) => {
      buffer += chunk.toString("utf8");
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      const lastLine = lines[lines.length - 1] || "";
      // SMTP multi-line responses continue with 250- and finish with 250 space.
      if (/^\d{3} /.test(lastLine) || /^\d{3}$/.test(lastLine)) {
        cleanup();
        resolve(buffer);
      }
    };
    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };
    const onTimeout = () => {
      cleanup();
      reject(new Error("SMTP response timeout."));
    };
    const cleanup = () => {
      socket.off("data", onData);
      socket.off("error", onError);
      socket.off("timeout", onTimeout);
    };
    socket.on("data", onData);
    socket.on("error", onError);
    socket.on("timeout", onTimeout);
  });
}

async function smtpCommand(socket: net.Socket | tls.TLSSocket, command: string, expected: number[]) {
  socket.write(`${command}\r\n`);
  const response = await readSmtpLine(socket);
  const code = Number(response.slice(0, 3));
  if (!expected.includes(code)) {
    throw new Error(`SMTP command failed (${command.split(" ")[0]}): ${response.trim()}`);
  }
  return response;
}

function connectSocket(host: string, port: number, secure: boolean): Promise<net.Socket | tls.TLSSocket> {
  return new Promise((resolve, reject) => {
    const socket = secure ? tls.connect({ host, port, servername: host }) : net.connect({ host, port });
    socket.setTimeout(20000);
    socket.once("connect", () => resolve(socket));
    socket.once("secureConnect", () => resolve(socket));
    socket.once("error", reject);
    socket.once("timeout", () => reject(new Error("SMTP connection timeout.")));
  });
}

function upgradeToTls(socket: net.Socket, host: string): Promise<tls.TLSSocket> {
  return new Promise((resolve, reject) => {
    const secureSocket = tls.connect({ socket, servername: host }, () => resolve(secureSocket));
    secureSocket.setTimeout(20000);
    secureSocket.once("error", reject);
    secureSocket.once("timeout", () => reject(new Error("SMTP TLS upgrade timeout.")));
  });
}

async function sendEmailTest(): Promise<DeliveryResult> {
  const host = process.env.EMAIL_HOST || "";
  const port = Number(process.env.EMAIL_PORT || "587");
  const user = process.env.EMAIL_USER || "";
  const pass = process.env.EMAIL_PASS || "";
  const to = process.env.EMAIL_TO || user;

  if (!host || !user || !pass || !to) {
    return {
      ok: false,
      channel: "email",
      message: "EMAIL_HOST, EMAIL_USER, EMAIL_PASS, or EMAIL_TO is missing in .env.local / GitHub Secrets.",
    };
  }

  let socket = await connectSocket(host, port, port === 465);
  try {
    const greeting = await readSmtpLine(socket);
    if (!greeting.startsWith("220")) throw new Error(`SMTP greeting failed: ${greeting.trim()}`);

    await smtpCommand(socket, "EHLO myplan.local", [250]);

    if (port !== 465) {
      await smtpCommand(socket, "STARTTLS", [220]);
      socket = await upgradeToTls(socket as net.Socket, host);
      await smtpCommand(socket, "EHLO myplan.local", [250]);
    }

    await smtpCommand(socket, "AUTH LOGIN", [334]);
    await smtpCommand(socket, Buffer.from(user).toString("base64"), [334]);
    await smtpCommand(socket, Buffer.from(pass).toString("base64"), [235]);

    await smtpCommand(socket, `MAIL FROM:<${stripControl(user)}>`, [250]);
    await smtpCommand(socket, `RCPT TO:<${stripControl(to)}>`, [250, 251]);
    await smtpCommand(socket, "DATA", [354]);

    const subject = "My Plan Automation email test";
    const text = `✅ My Plan Automation email test\n\nTime: ${new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" })}\nIf you see this, email SMTP notification is connected.`;
    const message = [
      `From: ${stripControl(user)}`,
      `To: ${stripControl(to)}`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=UTF-8",
      "",
      text.replace(/^\./gm, ".."),
      ".",
      "",
    ].join("\r\n");

    socket.write(message);
    const dataResponse = await readSmtpLine(socket);
    if (!dataResponse.startsWith("250")) throw new Error(`SMTP DATA failed: ${dataResponse.trim()}`);
    await smtpCommand(socket, "QUIT", [221]);

    return { ok: true, channel: "email", message: "Email test message sent successfully." };
  } catch (error) {
    socket.destroy();
    return {
      ok: false,
      channel: "email",
      message: error instanceof Error ? error.message : "Email test failed.",
    };
  }
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const body = (await request.json().catch(() => null)) as { channel?: TestChannel } | null;
  const channel: TestChannel = body?.channel === "email" || body?.channel === "telegram" || body?.channel === "all" ? body.channel : "all";

  const results: DeliveryResult[] = [];
  if (channel === "telegram" || channel === "all") results.push(await sendTelegramTest());
  if (channel === "email" || channel === "all") results.push(await sendEmailTest());

  const ok = results.every((item) => item.ok);
  await recordNotification(
    "Manual notification test",
    results.map((item) => `${item.channel}: ${item.message}`).join(" | "),
    channel,
    ok ? "success" : "pending",
    { results },
  );

  return NextResponse.json({ ok, results });
}
