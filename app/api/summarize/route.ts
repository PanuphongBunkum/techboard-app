import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { content } = await req.json();

    // เช็คว่ามี API KEY ไหม
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Missing GEMINI_API_KEY in .env file");
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

   const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });
    const prompt = `ช่วยสรุปเนื้อหาต่อไปนี้ให้สั้นและเข้าใจง่ายภายใน 3 บรรทัด: \n\n ${content}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return NextResponse.json({ summary: text });
  } catch (error: any) {
    console.error("AI API Error Detail:", error); // ดู Error ที่นี่ใน Terminal
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}