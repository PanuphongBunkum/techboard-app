import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";

const prisma = new PrismaClient();

// STEP 2: กำหนด Email ของ Admin (ต้องตรงกับหน้าบ้าน)
const ADMIN_EMAIL = "panuphongoat@gmail.com";

// 1. แก้ไขกระทู้ (เฉพาะเจ้าของ)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, content } = await req.json();
  const user = await prisma.user.findUnique({ where: { email: session.user?.email! } });
  const post = await prisma.post.findUnique({ where: { id: params.id } });

  // แก้ไขได้เฉพาะเจ้าของเท่านั้น (Admin ก็แก้ข้อความคนอื่นไม่ได้ เพื่อความโปร่งใส)
  if (post?.authorId !== user?.id) {
    return NextResponse.json({ error: "No permission" }, { status: 403 });
  }

  const updated = await prisma.post.update({ where: { id: params.id }, data: { title, content } });
  return NextResponse.json(updated);
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