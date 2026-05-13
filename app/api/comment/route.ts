import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { postId, text } = await req.json();
  const user = await prisma.user.findUnique({ where: { email: session.user?.email! } });

  const comment = await prisma.comment.create({
    data: { text, postId, authorId: user?.id! }
  });

  return NextResponse.json(comment);
}