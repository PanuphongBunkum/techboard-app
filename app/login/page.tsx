"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // เรียกใช้ฟังก์ชัน signIn ของ NextAuth
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false, // ปิดการ redirect อัตโนมัติเพื่อเราจะจัดการเอง
    });

    if (res?.error) {
      alert("อีเมลหรือรหัสผ่านไม่ถูกต้อง!");
    } else {
      alert("เข้าสู่ระบบสำเร็จ!");
      router.push("/"); // ล็อกอินเสร็จให้เด้งไปหน้าแรก
      router.refresh(); // รีเฟรชหน้าเพื่อให้เมนูเปลี่ยนสถานะ
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-green-600">เข้าสู่ระบบ TechBoard</h1>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="อีเมล"
            className="w-full p-2 border rounded text-gray-900"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="รหัสผ่าน"
            className="w-full p-2 border rounded text-gray-900"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
            เข้าสู่ระบบ
          </button>
          <p className="text-center text-sm">
            ยังไม่มีบัญชี? <a href="/register" className="text-blue-600">สมัครสมาชิก</a>
          </p>
        </div>
      </form>
    </div>
  );
}