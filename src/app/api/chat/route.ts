import { NextRequest, NextResponse } from "next/server";

const SYSTEM_INSTRUCTION = `
You are Rishii (Hrishikesh Yadav) chatting directly with someone visiting your studio workspace whiteboard.
You are an engineer, roboticist, and AI systems builder based in Delhi NCR, India.
You speak STRICTLY in the first person ("I", "me", "my", "myself").
CRITICAL: You are NOT an AI assistant or a chatbot referring to Rishii. You ARE Rishii himself. Never say "Rishii is...", never say "as an AI...", never use third-person phrasing about yourself.

About you:
- You build autonomous robotics pipelines, factory floor intelligence, spatial 3D web applications with Three.js/WebGL, and AI automations that quietly handle the tedious work nobody wants to do.
- Tech Stack: TypeScript, React, Next.js, Three.js, WebGL, Python, PyTorch, Docker, Model Context Protocol (MCP), Node.js, and agentic workflows.
- Botrishii: Your studio/initiative bridging physical industrial machines with real-time AI automation and interactive digital twins.
- Contact: Email rishiicreates@gmail.com, GitHub @rishiicreates, LinkedIn in/rishiicreates, Phone +91 89605 48709.
- You are open to high-impact engineering roles, AI system contracts, and robotics consulting.

Communication style:
- Casual, authentic developer tone, lowercase energy, confident, sharp, down to earth.
- You are writing with a dry-erase marker on a physical whiteboard in your studio. Keep answers concise: 1 to 3 punchy, conversational sentences.
- No corporate jargon, no buzzwords, no robotic padding ("I hope this helps", "let me know if you need anything else").
- If someone wants to collaborate, hire you, or chat about a project, tell them to drop a note here or email you directly at rishiicreates@gmail.com.
`;

interface ClientMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is not configured");
      return new Response(
        "my signal's a bit patchy right now, but drop your note or email me directly at rishiicreates@gmail.com and i'll get right back to you.",
        { headers: { "Content-Type": "text/plain; charset=utf-8" } }
      );
    }

    const { message, history } = (await req.json()) as {
      message: string;
      history?: ClientMessage[];
    };

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Format previous messages for Gemini contents array
    const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history)) {
      for (const msg of history) {
        if (!msg.text || typeof msg.text !== "string") continue;
        const role = msg.sender === "user" ? "user" : "model";
        contents.push({
          role,
          parts: [{ text: msg.text }],
        });
      }
    }

    // Append the latest user message
    contents.push({
      role: "user",
      parts: [{ text: message.trim() }],
    });

    const bodyPayload = {
      systemInstruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }],
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 250,
        thinkingConfig: { thinkingBudget: 0 },
      },
    };

    // Fast multi-model cascade (Primary: gemini-3.1-flash-lite, Fallback: gemini-2.5-flash)
    const models = ["gemini-3.1-flash-lite", "gemini-2.5-flash"];
    let upstreamRes: Response | null = null;

    for (const model of models) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${encodeURIComponent(
        apiKey
      )}`;
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyPayload),
        });

        if (res.ok && res.body) {
          upstreamRes = res;
          break;
        } else {
          const errText = await res.text();
          console.warn(`Model ${model} stream error ${res.status}:`, errText);
        }
      } catch (err) {
        console.warn(`Fetch error for model ${model}:`, err);
      }
    }

    if (!upstreamRes || !upstreamRes.body) {
      return new Response(
        "my signal's a bit patchy right now, but drop your note or email me directly at rishiicreates@gmail.com and i'll get right back to you.",
        { headers: { "Content-Type": "text/plain; charset=utf-8" } }
      );
    }

    // Transform Gemini's upstream SSE into a direct token stream for sub-500ms time-to-first-token
    const upstreamReader = upstreamRes.body.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    let sseBuffer = "";

    const stream = new ReadableStream({
      async pull(controller) {
        try {
          const { done, value } = await upstreamReader.read();
          if (done) {
            controller.close();
            return;
          }

          sseBuffer += decoder.decode(value, { stream: true });
          const lines = sseBuffer.split("\n");
          sseBuffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("data: ")) {
              const jsonStr = trimmed.slice(6).trim();
              if (jsonStr === "[DONE]") continue;
              try {
                const parsed = JSON.parse(jsonStr);
                const textChunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                if (textChunk) {
                  controller.enqueue(encoder.encode(textChunk));
                }
              } catch {
                // Ignore incomplete SSE json fragments
              }
            }
          }
        } catch (err) {
          console.error("Stream reader error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("API error in /api/chat:", error);
    return new Response(
      "got your note! drop your email or email me at rishiicreates@gmail.com and let's talk.",
      { headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }
}
