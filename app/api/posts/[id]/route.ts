import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";

const prisma = new PrismaClient();

// STEP 2: กำหนด Email ของ Admin (ต้องตรงกับหน้าบ้าน)
const ADMIN_EMAIL = "admin@admin.com";

// 1. แก้ไขกระทู้ (เฉพาะเจ้าของ)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    
    // 🛠️ 1. เพิ่มตัวแปร published มารับค่าจากหน้าบ้าน
    const { title, content, published } = body; 

    // 🛠️ 2. เตรียมข้อมูลที่จะอัปเดต
    const updateData: any = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (published !== undefined) updateData.published = published; // <-- สำคัญมาก: เอาไว้เปลี่ยน Draft เป็น Publish

    // 🛠️ 3. สั่งฐานข้อมูลให้อัปเดต
    const updatedPost = await prisma.post.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    return NextResponse.json({ error: "Error updating post" }, { status: 500 });
  }
}

// 2. ลบกระทู้ (เจ้าของ หรือ Admin)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user?.email! } });
  const post = await prisma.post.findUnique({ where: { id: params.id } });

  const isAdmin = user?.email === ADMIN_EMAIL;
  const isOwner = post?.authorId === user?.id;

  // ถ้าไม่ใช่เจ้าของและไม่ใช่ Admin จะลบไม่ได้
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "No permission" }, { status: 403 });
  }

  await prisma.post.delete({ where: { id: params.id } });
  return NextResponse.json({ message: "Deleted" });
}
