import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";

const prisma = new PrismaClient();
const ADMIN_EMAIL = "panuphongoat@gmail.com";

// ลบคอมเมนต์ (เจ้าของคอมเมนต์ หรือ Admin)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user?.email! } });
  const comment = await prisma.comment.findUnique({ where: { id: params.id } });

  const isAdmin = user?.email === ADMIN_EMAIL;
  const isOwner = comment?.authorId === user?.id;

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "No permission" }, { status: 403 });
  }

  await prisma.comment.delete({ where: { id: params.id } });
  return NextResponse.json({ message: "Comment Deleted" });
}