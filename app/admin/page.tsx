"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type DbReview = {
  id: string
  name: string
  text: string
  rating: number
  status: string
  created_at: string
}

export default function AdminPage() {
  const [auth, setAuth] = useState(false)
  const [login, setLogin] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const [reviews, setReviews] = useState<DbReview[]>([])
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all")
  const [loading, setLoading] = useState(false)
  
  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editText, setEditText] = useState("")
  const [editRating, setEditRating] = useState(5)

  const fetchReviews = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false })
      
    if (error) {
      console.error(error)
      alert("Ошибка загрузки")
    } else {
      setReviews(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (auth) {
      fetchReviews()
    }
  }, [auth])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (login === "admin" && password === "123456") {
      setAuth(true)
      localStorage.setItem("admin_auth", "true")
      setError("")
    } else {
      setError("Неверный логин или пароль")
    }
  }

  useEffect(() => {
    if (localStorage.getItem("admin_auth") === "true") {
      setAuth(true)
    }
  }, [])

  const handleLogout = () => {
    setAuth(false)
    localStorage.removeItem("admin_auth")
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Удалить отзыв?")) return
    const { error } = await supabase.from("reviews").delete().eq("id", id)
    if (error) alert(error.message)
    else setReviews(reviews.filter(r => r.id !== id))
  }

  const handlePublish = async (id: string) => {
    const { error } = await supabase.from("reviews").update({ status: "approved" }).eq("id", id)
    if (error) alert(error.message)
    else setReviews(reviews.map(r => r.id === id ? { ...r, status: "approved" } : r))
  }

  const handleHide = async (id: string) => {
    const { error } = await supabase.from("reviews").update({ status: "pending" }).eq("id", id)
    if (error) alert(error.message)
    else setReviews(reviews.map(r => r.id === id ? { ...r, status: "pending" } : r))
  }

  const startEdit = (r: DbReview) => {
    setEditingId(r.id)
    setEditName(r.name)
    setEditText(r.text)
    setEditRating(r.rating)
  }

  const saveEdit = async () => {
    if (!editingId) return
    const { error } = await supabase.from("reviews").update({
      name: editName,
      text: editText,
      rating: editRating
    }).eq("id", editingId)

    if (error) {
      alert(error.message)
    } else {
      setReviews(reviews.map(r => r.id === editingId ? { ...r, name: editName, text: editText, rating: editRating } : r))
      setEditingId(null)
    }
  }

  if (!auth) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-background">
        <form onSubmit={handleLogin} className="w-full max-w-sm rounded-2xl bg-card p-6 border border-border">
          <h1 className="mb-4 text-2xl font-bold text-foreground text-center">🔐 Вход в админку</h1>
          
          <input
            className="w-full mb-3 rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none"
            placeholder="Логин (admin)"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
          />
          <input
            className="w-full mb-4 rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none"
            placeholder="Пароль (123456)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          {error && <p className="mb-4 text-sm text-red-500 text-center">{error}</p>}
          
          <button type="submit" className="w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground">
            Войти
          </button>
        </form>
      </div>
    )
  }

  const filtered = reviews.filter(r => filter === "all" || r.status === filter)

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold text-foreground">Управление отзывами</h1>
          <div className="flex gap-4">
            <button onClick={handleLogout} className="rounded-lg bg-red-500/10 text-red-500 px-4 py-2 font-semibold hover:bg-red-500/20">
              Выйти
            </button>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-2xl overflow-hidden p-6">
          <div className="flex gap-2 mb-6 border-b border-border pb-4">
            <button 
              className={`px-4 py-2 rounded-lg font-semibold ${filter === 'all' ? 'bg-primary text-black' : 'bg-transparent text-muted-foreground'}`}
              onClick={() => setFilter('all')}
            >
              Все
            </button>
            <button 
              className={`px-4 py-2 rounded-lg font-semibold ${filter === 'pending' ? 'bg-orange-500 text-white' : 'bg-transparent text-muted-foreground'}`}
              onClick={() => setFilter('pending')}
            >
              На модерации
            </button>
            <button 
              className={`px-4 py-2 rounded-lg font-semibold ${filter === 'approved' ? 'bg-green-500 text-white' : 'bg-transparent text-muted-foreground'}`}
              onClick={() => setFilter('approved')}
            >
              Опубликованные
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
            ) : filtered.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center">Отзывов не найдено</div>
            ) : (
              filtered.map((r) => (
                <div key={r.id} className="flex flex-col lg:flex-row gap-4 justify-between border border-border bg-background p-4 rounded-xl">
                  {editingId === r.id ? (
                    <div className="flex-1 flex flex-col gap-2">
                       <input value={editName} onChange={e => setEditName(e.target.value)} className="bg-input border border-border p-2 rounded text-foreground" />
                       <input type="number" min="1" max="5" value={editRating} onChange={e => setEditRating(Number(e.target.value))} className="bg-input border border-border p-2 rounded text-foreground" />
                       <textarea value={editText} onChange={e => setEditText(e.target.value)} className="bg-input border border-border p-2 rounded text-foreground min-h-[100px]" />
                       <div className="flex gap-2 mt-2">
                         <button onClick={saveEdit} className="bg-green-500 text-white px-3 py-1 rounded">Сохранить</button>
                         <button onClick={() => setEditingId(null)} className="bg-gray-500 text-white px-3 py-1 rounded">Отмена</button>
                       </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <div className="font-bold text-foreground flex items-center gap-2">
                          {r.name} <span className="text-yellow-500">★ {r.rating}</span>
                          {r.status === 'approved' ? 
                            <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs uppercase tracking-wider">Опубликован</span> : 
                            <span className="bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded text-xs uppercase tracking-wider">На модерации</span>
                          }
                        </div>
                        <div className="text-muted-foreground text-sm mt-2">{r.text}</div>
                        <div className="text-muted-foreground text-xs mt-3 opacity-50">
                          {new Date(r.created_at).toLocaleString("ru-RU")}
                        </div>
                      </div>
                      <div className="flex flex-row lg:flex-col gap-2 shrink-0">
                        {r.status === 'pending' ? (
                          <button
                            onClick={() => handlePublish(r.id)}
                            className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-green-500/20 text-green-400"
                          >
                            ✔ Опубликовать
                          </button>
                        ) : (
                          <button
                            onClick={() => handleHide(r.id)}
                            className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-orange-500/20 text-orange-400"
                          >
                            Скрыть
                          </button>
                        )}
                        <button
                          onClick={() => startEdit(r)}
                          className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-blue-500/20 text-blue-400"
                        >
                          ✏️ Редактировать
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        >
                          ❌ Удалить
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
