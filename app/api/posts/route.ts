import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";

const prisma = new PrismaClient();

// ดึงกระทู้ทั้งหมด
export async function GET() {
  const posts = await prisma.post.findMany({
    include: { 
      author: { select: { name: true, email: true } },
      comments: { include: { author: { select: { name: true, email: true } } } },
      likes: true 
    }, 
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(posts);
}

// สร้างกระทู้ใหม่
export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // เพิ่ม category เข้ามารับค่าจากหน้าบ้าน
  const { title, content, category } = await req.json(); 
  const user = await prisma.user.findUnique({ where: { email: session.user?.email! } });

  const post = await prisma.post.create({
    // บันทึก category ลงฐานข้อมูลด้วย
    data: { title, content, category: category || "ทั่วไป", authorId: user?.id! }
  });

  return NextResponse.json(post);
}