"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Trash2, Edit2, Eye, EyeOff, Plus, LogOut, MessageSquare, Newspaper, Upload, X, Save } from "lucide-react"

type DbReview = {
  id: string
  name: string
  text: string
  rating: number
  status: string
  type: string
  source_url?: string
  image_url?: string
  created_at: string
  review_date?: string
}

type DbNews = {
  id: string
  title: string
  content: string
  image_url: string
  status: string
  created_at: string
}

const statusMap: Record<string, string> = {
  pending: "🟡 На модерации",
  approved: "🟢 Опубликован",
  rejected: "🔴 Отклонён",
  draft: "⚪ Черновик",
  published: "🟢 Опубликован"
}

const typeMap: Record<string, string> = {
  site: "Сайт",
  avito: "Авито",
  social: "Соцсети"
}

export default function AdminPage() {
  const [auth, setAuth] = useState(false)
  const [login, setLogin] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<"reviews" | "news">("reviews")

  const [reviews, setReviews] = useState<DbReview[]>([])
  const [news, setNews] = useState<DbNews[]>([])
  const [loading, setLoading] = useState(false)
  
  // Reviews state
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
  const [editReviewForm, setEditReviewForm] = useState<Partial<DbReview>>({})
  const [isAddingReview, setIsAddingReview] = useState(false)
  const [addReviewForm, setAddReviewForm] = useState<Partial<DbReview>>({
    name: "", text: "", rating: 5, type: "site", status: "approved", review_date: new Date().toISOString().split('T')[0]
  })

  // News state
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null)
  const [editNewsForm, setEditNewsForm] = useState<Partial<DbNews>>({})
  const [isAddingNews, setIsAddingNews] = useState(false)
  const [addNewsForm, setAddNewsForm] = useState<Partial<DbNews>>({
    title: "", content: "", status: "published", image_url: ""
  })
  const [isUploading, setIsUploading] = useState(false)

  const fetchReviews = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false })
    if (!error) setReviews(data || [])
    setLoading(false)
  }

  const fetchNews = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .order("created_at", { ascending: false })
    if (!error) setNews(data || [])
    setLoading(false)
  }

  useEffect(() => {
    if (auth) {
      if (activeTab === "reviews") fetchReviews()
      else fetchNews()
    }
  }, [auth, activeTab])

  useEffect(() => {
    if (localStorage.getItem("admin_auth") === "true") setAuth(true)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (login === "admin" && password === "22764erik") {
      setAuth(true)
      localStorage.setItem("admin_auth", "true")
      setError("")
    } else {
      setError("Неверный логин или пароль")
    }
  }

  const handleLogout = () => {
    setAuth(false)
    localStorage.removeItem("admin_auth")
  }

  // Review handlers
  const handleDeleteReview = async (id: string) => {
    if (!window.confirm("Удалить отзыв?")) return
    await supabase.from("reviews").delete().eq("id", id)
    fetchReviews()
  }

  const handleUpdateReviewStatus = async (id: string, status: string) => {
    await supabase.from("reviews").update({ status }).eq("id", id)
    fetchReviews()
  }

  const saveReviewEdit = async () => {
    if (!editingReviewId) return
    await supabase.from("reviews").update(editReviewForm).eq("id", editingReviewId)
    setEditingReviewId(null)
    fetchReviews()
  }

  const saveNewReview = async () => {
    await supabase.from("reviews").insert([addReviewForm])
    setIsAddingReview(false)
    fetchReviews()
  }

  // News handlers
  const handleDeleteNews = async (id: string) => {
    if (!window.confirm("Удалить новость?")) return
    await supabase.from("news").delete().eq("id", id)
    fetchNews()
  }

  const handleUpdateNewsStatus = async (id: string, status: string) => {
    await supabase.from("news").update({ status }).eq("id", id)
    fetchNews()
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true)
      // Sanitize filename: replace spaces and special chars
      const sanitizedName = file.name.replace(/[^\w.-]/g, '_')
      const fileName = `${Date.now()}-${sanitizedName}`
      
      const { data, error } = await supabase.storage
        .from("news-images")
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error("Supabase upload error:", error)
        alert("Ошибка загрузки в Supabase: " + error.message)
        setIsUploading(false)
        return null
      }

      const { data: publicUrlData } = supabase.storage
        .from("news-images")
        .getPublicUrl(fileName)

      if (!publicUrlData) {
        alert("Не удалось получить публичную ссылку на файл")
        setIsUploading(false)
        return null
      }

      setIsUploading(false)
      return publicUrlData.publicUrl
    } catch (err: any) {
      console.error("Unexpected upload error:", err)
      alert("Непредвиденная ошибка при загрузке: " + err.message)
      setIsUploading(false)
      return null
    }
  }

  const saveNewsEdit = async () => {
    if (!editingNewsId) return
    await supabase.from("news").update(editNewsForm).eq("id", editingNewsId)
    setEditingNewsId(null)
    fetchNews()
  }

  const saveNewNews = async (status: string = "published") => {
    if (!addNewsForm.title) return alert("Заголовок обязателен")
    await supabase.from("news").insert([{ ...addNewsForm, status }])
    setIsAddingNews(false)
    setAddNewsForm({ title: "", content: "", status: "published", image_url: "" })
    fetchNews()
  }

  if (!auth) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-background">
        <form onSubmit={handleLogin} className="w-full max-w-sm rounded-2xl bg-card p-6 border border-border">
          <h1 className="mb-4 text-2xl font-bold text-foreground text-center">🔐 Вход в админку</h1>
          <input
            className="w-full mb-3 rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none"
            placeholder="Логин"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
          />
          <input
            className="w-full mb-4 rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none"
            placeholder="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="mb-4 text-sm text-red-500 text-center">{error}</p>}
          <button type="submit" className="w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground">Войти</button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <header className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
          <div className="flex items-center gap-4 bg-card p-1 rounded-2xl border border-border">
            <button 
              onClick={() => setActiveTab("reviews")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition font-bold ${activeTab === "reviews" ? "bg-primary text-black" : "text-muted-foreground hover:bg-white/5"}`}
            >
              <MessageSquare size={18} /> Отзывы
            </button>
            <button 
              onClick={() => setActiveTab("news")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition font-bold ${activeTab === "news" ? "bg-primary text-black" : "text-muted-foreground hover:bg-white/5"}`}
            >
              <Newspaper size={18} /> Новости
            </button>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 rounded-xl bg-red-500/10 text-red-500 px-6 py-2.5 font-bold hover:bg-red-500/20 transition whitespace-nowrap">
            <LogOut size={18} /> Выйти
          </button>
        </header>

        {activeTab === "reviews" ? (
          <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black">Управление отзывами</h2>
                <button onClick={() => setIsAddingReview(!isAddingReview)} className="flex items-center gap-2 rounded-xl bg-primary/20 text-primary px-4 py-2 font-bold hover:bg-primary/30 transition">
                    {isAddingReview ? <X size={18}/> : <Plus size={18}/>} {isAddingReview ? "Отмена" : "Добавить отзыв"}
                </button>
            </div>

            {isAddingReview && (
              <div className="bg-card border border-border rounded-2xl p-6 mb-8 shadow-2xl">
                <div className="grid gap-4">
                  <input placeholder="Имя" className="bg-input border border-border px-4 py-3 rounded-xl" onChange={e => setAddReviewForm({...addReviewForm, name: e.target.value})} />
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <input type="number" min="1" max="5" placeholder="Рейтинг" className="bg-input border border-border px-4 py-3 rounded-xl" onChange={e => setAddReviewForm({...addReviewForm, rating: Number(e.target.value)})} />
                    <select className="bg-input border border-border px-4 py-3 rounded-xl" onChange={e => setAddReviewForm({...addReviewForm, type: e.target.value})}>
                      <option value="site">Сайт</option>
                      <option value="avito">Авито</option>
                      <option value="social">Соцсети</option>
                    </select>
                    <select className="bg-input border border-border px-4 py-3 rounded-xl" onChange={e => setAddReviewForm({...addReviewForm, status: e.target.value})}>
                      <option value="approved">Опубликован</option>
                      <option value="pending">На модерации</option>
                      <option value="rejected">Отклонён</option>
                    </select>
                    <input type="date" className="bg-input border border-border px-4 py-3 rounded-xl" onChange={e => setAddReviewForm({...addReviewForm, review_date: e.target.value})} />
                  </div>
                  <textarea placeholder="Текст отзыва..." className="bg-input border border-border px-4 py-3 rounded-xl min-h-[100px]" onChange={e => setAddReviewForm({...addReviewForm, text: e.target.value})} />
                  <button onClick={saveNewReview} className="bg-primary text-black font-bold py-3 rounded-xl hover:scale-[1.02] active:scale-95 transition">Сохранить отзыв</button>
                </div>
              </div>
            )}

            <div className="grid gap-4">
              {reviews.map(r => (
                <div key={r.id} className="bg-card border border-border p-4 rounded-2xl flex flex-col md:flex-row justify-between gap-4">
                   <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="font-bold text-lg">{r.name}</span>
                        <span className="text-yellow-500 font-bold">★ {r.rating}</span>
                        <span className="text-xs bg-white/5 px-2 py-1 rounded-lg text-muted-foreground uppercase">{typeMap[r.type] || r.type}</span>
                        <span className={`text-xs px-2 py-1 rounded-lg uppercase font-bold ${r.status === 'approved' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>{statusMap[r.status] || r.status}</span>
                      </div>
                      <p className="text-muted-foreground text-sm">{r.text}</p>
                   </div>
                   <div className="flex items-center gap-2">
                      <button onClick={() => handleUpdateReviewStatus(r.id, r.status === 'approved' ? 'pending' : 'approved')} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition">{r.status === 'approved' ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
                      <button onClick={() => handleDeleteReview(r.id)} className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition"><Trash2 size={18}/></button>
                   </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black">Управление новостями</h2>
                <button onClick={() => setIsAddingNews(!isAddingNews)} className="flex items-center gap-2 rounded-xl bg-primary/20 text-primary px-4 py-2 font-bold hover:bg-primary/30 transition">
                    {isAddingNews ? <X size={18}/> : <Plus size={18}/>} {isAddingNews ? "Отмена" : "Добавить новость"}
                </button>
            </div>

            {isAddingNews && (
              <div className="bg-card border border-border rounded-2xl p-6 mb-8 shadow-2xl">
                <div className="grid gap-5">
                  <input 
                    placeholder="Заголовок новости" 
                    className="bg-input border border-border px-4 py-3 rounded-xl text-lg font-bold" 
                    value={addNewsForm.title}
                    onChange={e => setAddNewsForm({...addNewsForm, title: e.target.value})} 
                  />
                  
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-xs text-muted-foreground mb-2 uppercase tracking-widest font-bold">Изображение</label>
                        <div className="relative group">
                            <input 
                              type="file" 
                              className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  const url = await uploadImage(file)
                                  if (url) setAddNewsForm({...addNewsForm, image_url: url})
                                }
                              }}
                            />
                            <div className="bg-input border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 group-hover:border-primary/50 transition">
                                {addNewsForm.image_url ? (
                                    <img src={addNewsForm.image_url} alt="Preview" className="h-32 w-full object-cover rounded-xl" />
                                ) : (
                                    <>
                                        <Upload className={`text-muted-foreground ${isUploading ? 'animate-bounce' : ''}`} />
                                        <span className="text-sm text-muted-foreground">{isUploading ? 'Загрузка...' : 'Нажмите для выбора фото'}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-4">
                        <label className="block text-xs text-muted-foreground mb-[-8px] uppercase tracking-widest font-bold">Контент</label>
                        <textarea 
                            placeholder="Текст новости..." 
                            className="flex-1 bg-input border border-border px-4 py-3 rounded-xl min-h-[150px]" 
                            value={addNewsForm.content}
                            onChange={e => setAddNewsForm({...addNewsForm, content: e.target.value})} 
                        />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => saveNewNews("published")} className="flex-1 bg-primary text-black font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-95 transition flex items-center justify-center gap-2">
                        <Save size={18}/> Опубликовать
                    </button>
                    <button onClick={() => saveNewNews("draft")} className="flex-1 bg-white/5 text-white font-bold py-4 rounded-xl hover:bg-white/10 transition">
                        Сохранить как черновик
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-4">
              {news.map(n => (
                <div key={n.id} className="bg-card border border-border p-3 rounded-2xl flex items-center gap-4 transition hover:border-white/10">
                   <img src={n.image_url || "/images/placeholder.svg"} alt="" className="h-16 w-24 object-cover rounded-xl shrink-0 bg-white/5" />
                   <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base truncate">{n.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span>{new Date(n.created_at).toLocaleDateString()}</span>
                        <span className={`font-bold px-2 py-0.5 rounded uppercase ${n.status === 'published' ? 'bg-green-500/10 text-green-500' : 'bg-white/10 text-white'}`}>
                            {n.status === 'published' ? 'Опубликовано' : 'Черновик'}
                        </span>
                      </div>
                   </div>
                   <div className="flex items-center gap-1 shrink-0 p-2">
                      <button 
                        onClick={() => handleUpdateNewsStatus(n.id, n.status === 'published' ? 'draft' : 'published')} 
                        className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition"
                        title={n.status === 'published' ? "Скрыть" : "Опубликовать"}
                      >
                        {n.status === 'published' ? <EyeOff size={18}/> : <Eye size={18}/>}
                      </button>
                      <button 
                        onClick={() => { setEditingNewsId(n.id); setEditNewsForm(n); }} 
                        className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition"
                      >
                        <Edit2 size={18}/>
                      </button>
                      <button onClick={() => handleDeleteNews(n.id)} className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition"><Trash2 size={18}/></button>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {editingNewsId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-card border border-border w-full max-w-2xl rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black">Редактировать новость</h3>
                    <button onClick={() => setEditingNewsId(null)} className="p-2 hover:bg-white/5 rounded-full"><X/></button>
                </div>
                <div className="grid gap-6">
                    <input 
                      className="bg-input border border-border px-4 py-3 rounded-xl text-lg font-bold" 
                      value={editNewsForm.title} 
                      onChange={e => setEditNewsForm({...editNewsForm, title: e.target.value})}
                    />
                    <div className="flex flex-col gap-4">
                         <div className="relative group">
                            <input 
                              type="file" 
                              className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  const url = await uploadImage(file)
                                  if (url) setEditNewsForm({...editNewsForm, image_url: url})
                                }
                              }}
                            />
                            <div className="bg-input border border-border rounded-xl p-4 flex items-center gap-4 group-hover:border-primary transition cursor-pointer">
                                <Upload size={20} className="text-muted-foreground" />
                                <span className="text-sm">Сменить изображение</span>
                                {editNewsForm.image_url && <img src={editNewsForm.image_url} alt="" className="h-10 w-16 object-cover ml-auto rounded" />}
                            </div>
                        </div>
                        <textarea 
                            className="bg-input border border-border px-4 py-3 rounded-xl min-h-[200px]" 
                            value={editNewsForm.content}
                            onChange={e => setEditNewsForm({...editNewsForm, content: e.target.value})}
                        />
                    </div>
                    <button onClick={saveNewsEdit} className="bg-primary text-black font-bold py-4 rounded-xl hover:scale-[1.02] transition">Сохранить изменения</button>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}
