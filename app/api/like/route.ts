import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { postId } = await req.json();
  const user = await prisma.user.findUnique({ where: { email: session.user?.email! } });

  const existingLike = await prisma.like.findUnique({
    where: { userId_postId: { userId: user?.id!, postId } }
  });

  if (existingLike) {
    await prisma.like.delete({ where: { id: existingLike.id } });
    return NextResponse.json({ message: "Unliked" });
  } else {
    await prisma.like.create({ data: { userId: user?.id!, postId } });
    return NextResponse.json({ message: "Liked" });
  }
}