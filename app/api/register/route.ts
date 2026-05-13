import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    // เข้ารหัสรหัสผ่านก่อนเก็บลง DB เพื่อความปลอดภัย
    const hashedPassword = await bcrypt.hash(password, 10);

    // บันทึกลง SQLite ผ่าน Prisma
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ message: "User created", user }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}