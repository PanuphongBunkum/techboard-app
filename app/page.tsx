"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  
  // 👑 STEP 1: กำหนด Email ของ Admin
  const ADMIN_EMAIL = "panuphongoat@gmail.com"; 
  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  // --- ส่วนเก็บข้อมูล (State) ---
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postCategory, setPostCategory] = useState("ทั่วไป");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("ทั้งหมด");
  const [summaries, setSummaries] = useState<any>({});
  const [loadingAI, setLoadingAI] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<any>({});
  const [editingPost, setEditingPost] = useState<any>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const CATEGORIES = ["ทั่วไป", "สอบถาม", "แชร์ความรู้", "โปรเจกต์"];

  // ดึงข้อมูลกระทู้ทั้งหมด
  const fetchPosts = async () => {
    const res = await fetch("/api/posts");
    const data = await res.json();
    setPosts(data);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handlePost = async (e: React.FormEvent, isPublished: boolean) => {
    e.preventDefault();
    if (!title || !content) return alert("กรุณากรอกหัวข้อและเนื้อหาให้ครบถ้วน");
    
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, category: postCategory, published: isPublished }),
    });
    
    setTitle(""); setContent(""); setPostCategory("ทั่วไป");
    fetchPosts();
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("คุณแน่ใจใช่ไหมที่จะลบกระทู้นี้?")) return;
    await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    fetchPosts();
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("ต้องการลบคอมเมนต์นี้ใช่หรือไม่?")) return;
    await fetch(`/api/comment/${commentId}`, { method: "DELETE" });
    fetchPosts();
  };

  const handleSummarize = async (postId: string, content: string) => {
    if (!session) return alert("กรุณาล็อกอินเพื่อใช้ AI สรุปครับ");
    setLoadingAI(postId);
    const res = await fetch("/api/summarize", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }) });
    const data = await res.json();
    setSummaries((prev: any) => ({ ...prev, [postId]: data.summary }));
    setLoadingAI(null);
  };

  const handleLike = async (postId: string) => {
    if (!session) return alert("กรุณาล็อกอินก่อนครับ");
    await fetch("/api/like", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ postId }) });
    fetchPosts();
  };

  const handleComment = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!commentInputs[postId]) return;
    await fetch("/api/comment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ postId, text: commentInputs[postId] }) });
    setCommentInputs({ ...commentInputs, [postId]: "" });
    fetchPosts();
  };

  const handleUpdate = async (e: React.FormEvent, isPublished?: boolean) => {
    e.preventDefault();
    
    const updateData: any = { title: editTitle, content: editContent };
    if (isPublished !== undefined) updateData.published = isPublished;

    await fetch(`/api/posts/${editingPost.id}`, { 
      method: "PATCH", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify(updateData) 
    });
    
    setEditingPost(null);
    fetchPosts();
  };

  const filteredPosts = posts.filter((post: any) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "ทั้งหมด" || post.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="p-8 max-w-4xl mx-auto min-h-screen text-gray-900 bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-blue-600">TechBoard 🚀</h1>
        {session ? (
          <div className="flex items-center gap-4">
            <span className="font-medium">
              สวัสดี, {session.user?.name} {isAdmin && <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full ml-1">Admin</span>}
            </span>
            <button onClick={() => signOut()} className="text-red-500 underline">ออกจากระบบ</button>
          </div>
        ) : (
          <a href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg">เข้าสู่ระบบ</a>
        )}
      </div>

      {session && (
        <form className="mb-12 bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-xl font-bold mb-4">ตั้งกระทู้ใหม่</h2>
          <div className="flex gap-4 mb-4">
            <select value={postCategory} onChange={(e) => setPostCategory(e.target.value)} className="p-3 border rounded-lg bg-white">
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="หัวข้อกระทู้" className="flex-1 p-3 border rounded-lg bg-white" required />
          </div>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="เนื้อหา..." className="w-full p-3 mb-4 border rounded-lg h-32 bg-white" required />
          
          <div className="flex gap-4">
            <button type="button" onClick={(e) => handlePost(e, false)} className="bg-gray-500 text-white px-8 py-2 rounded-lg font-bold hover:bg-gray-600 transition">
              บันทึกฉบับร่าง (Draft)
            </button>
            <button type="button" onClick={(e) => handlePost(e, true)} className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 transition">
              เผยแพร่กระทู้ (Publish)
            </button>
          </div>
        </form>
      )}

      <div className="mb-8 flex gap-4 bg-white p-4 rounded-xl border shadow-sm">
        <input type="text" placeholder="🔍 ค้นหา..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 p-3 border rounded-lg bg-gray-50" />
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="p-3 border rounded-lg bg-gray-50 font-bold">
          <option value="ทั้งหมด">📁 ทั้งหมด</option>
          {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      <div className="space-y-8">
        {filteredPosts.map((post: any) => (
          <div key={post.id} className={`border p-6 rounded-xl bg-white shadow-sm ${post.published === false ? 'opacity-70 border-dashed border-2' : ''}`}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-xs font-bold text-white bg-blue-500 px-2 py-1 rounded-full mr-3">{post.category}</span>
                {post.published === false && (
                  <span className="text-xs font-bold text-gray-800 bg-yellow-300 px-2 py-1 rounded-full mr-3">⚠️ ฉบับร่าง</span>
                )}
                <h3 className="text-2xl font-bold inline-block">{post.title}</h3>
              </div>
              
              {(session?.user?.email === post.author.email || isAdmin) && (
                <div className="flex gap-3 items-center">
                  {session?.user?.email === post.author.email && (
                    <button onClick={() => { setEditingPost(post); setEditTitle(post.title); setEditContent(post.content); }} className="text-sm text-blue-500">แก้ไข</button>
                  )}
                  <button onClick={() => handleDelete(post.id)} className="text-sm text-red-500 font-bold">
                    ลบ {isAdmin && session?.user?.email !== post.author.email ? "(Admin)" : ""}
                  </button>
                </div>
              )}
            </div>
            
            <p className="mt-4 mb-6 whitespace-pre-wrap">{post.content}</p>

            {summaries[post.id] && (
              <div className="bg-purple-50 p-4 rounded-lg mb-6 border-l-4 border-purple-500">
                <p className="italic text-gray-800">✨ {summaries[post.id]}</p>
              </div>
            )}

            {/* 🛠️ ซ่อนแถบทั้งหมดนี้ ถ้ายงเป็นฉบับร่าง */}
            {post.published !== false && (
              <>
                <div className="flex justify-between items-center py-3 border-y mb-4">
                  <div className="flex gap-6">
                    <button onClick={() => handleLike(post.id)} className="text-red-500 font-bold">❤️ {post.likes?.length || 0} ไลก์</button>
                    <span className="text-gray-500">💬 {post.comments?.length || 0} ความเห็น</span>
                  </div>
                  <button onClick={() => handleSummarize(post.id, post.content)} className="text-xs bg-purple-600 text-white px-4 py-2 rounded-full">
                    {loadingAI === post.id ? "กำลังสรุป..." : "🪄 สรุป AI"}
                  </button>
                </div>

                {(post.comments?.length > 0 || session) && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {post.comments.map((c: any) => (
                      <div key={c.id} className="text-sm border-b py-2 flex justify-between">
                        <div><span className="font-bold text-blue-600">{c.author.name}:</span> {c.text}</div>
                        {(session?.user?.email === c.author.email || isAdmin) && (
                          <button onClick={() => handleDeleteComment(c.id)} className="text-xs text-red-400 font-bold">ลบ {isAdmin && session?.user?.email !== c.author.email ? "(Admin)" : ""}</button>
                        )}
                      </div>
                    ))}
                    {session && (
                      <form onSubmit={(e) => handleComment(e, post.id)} className="flex gap-2 mt-3">
                        <input value={commentInputs[post.id] || ""} onChange={(e) => setCommentInputs({...commentInputs, [post.id]: e.target.value})} className="flex-1 p-2 border rounded-lg text-sm" placeholder="คอมเมนต์..." />
                        <button className="bg-blue-600 text-white px-4 py-1 rounded-lg text-sm font-bold">ส่ง</button>
                      </form>
                    )}
                  </div>
                )}
              </>
            )}
            
            <div className="text-xs text-gray-400 mt-4 text-right">โดย: {post.author.name}</div>
          </div>
        ))}
      </div>

      {editingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">แก้ไขกระทู้</h2>
            <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full p-3 border rounded-lg mb-4 text-gray-900 bg-white" />
            <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full p-3 border rounded-lg h-48 mb-6 text-gray-900 bg-white" />
            
            <div className="flex justify-between items-center mt-4">
              <button onClick={() => setEditingPost(null)} className="px-6 py-2 text-gray-600 font-bold">ยกเลิก</button>
              <div className="flex gap-3">
                {editingPost.published === false && (
                  <button onClick={(e) => handleUpdate(e, true)} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold">
                    อัปเดตและเผยแพร่
                  </button>
                )}
                <button onClick={(e) => handleUpdate(e)} className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold">
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}