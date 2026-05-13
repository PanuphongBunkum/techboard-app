import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

// เรียกใช้งาน Prisma สำหรับคุยกับ Database
const prisma = new PrismaClient();

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "developer@example.com" },
        password: { label: "Password", type: "password" }
      },
      // ฟังก์ชันสำหรับตรวจสอบการ Login
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // ค้นหาผู้ใช้จากฐานข้อมูล
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          return null;
        }

        // ตรวจสอบรหัสผ่าน
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        // ถ้าถูกต้อง ส่งข้อมูล User กลับไป
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login", // เดี๋ยวเราจะสร้างหน้า Login ที่ URL นี้ครับ
  }
});

// บรรทัดนี้สำคัญที่สุด ห้ามลืมเด็ดขาดครับ!
export { handler as GET, handler as POST };