"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ส่งข้อมูลไปที่ API register (เดี๋ยวเราจะสร้างในสเตปถัดไป)
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    if (res.ok) {
      alert("สมัครสมาชิกสำเร็จ!");
      router.push("/login"); // สมัครเสร็จให้ไปหน้า Login
    } else {
      alert("เกิดข้อผิดพลาดในการสมัคร");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">สมัครสมาชิก TechBoard</h1>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="ชื่อของคุณ"
            className="w-full p-2 border rounded text-gray-900"
            onChange={(e) => setName(e.target.value)}
            required
          />
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
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
            ลงทะเบียน
          </button>
        </div>
      </form>
    </div>
  );
}