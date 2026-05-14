import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";

const prisma = new PrismaClient();

// ดึงกระทู้ทั้งหมด
export async function GET() {
  const session = await getServerSession();
  let whereClause: any = { published: true };

  // ถ้าล็อกอินอยู่ ให้ดึงกระทู้ที่เป็น Draft ของตัวเองมาด้วย
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (user) {
      whereClause = {
        OR: [
          { published: true },
          { authorId: user.id } // ดึงของตัวเอง (รวมถึง Draft)
        ]
      };
    }
  }

  const posts = await prisma.post.findMany({
    where: whereClause,
    include:{
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

  // <-- เพิ่มรับค่า published เข้ามาจากหน้าบ้าน
  const { title, content, category, published } = await req.json(); 
  const user = await prisma.user.findUnique({ where: { email: session.user?.email! } });

  const post = await prisma.post.create({
    data: { 
      title, 
      content, 
      category: category || "ทั่วไป", 
      published: published !== undefined ? published : true, // <-- บันทึกสถานะ Draft/Publish ลงฐานข้อมูล
      authorId: user?.id! 
    }
  });

  return NextResponse.json(post);
}