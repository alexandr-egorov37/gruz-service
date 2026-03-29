"use client"

import { useState, useEffect } from "react"

// Global cache to avoid fetching multiple times if the hook is used in several components
let globalStatsCache: { averageRating: string; totalReviews: number } | null = null
let fetchPromise: Promise<void> | null = null

export function useReviewsStats() {
  const [stats, setStats] = useState({
    averageRating: globalStatsCache ? globalStatsCache.averageRating : "5.0",
    totalReviews: globalStatsCache ? globalStatsCache.totalReviews : 0,
    isLoading: !globalStatsCache,
  })

  useEffect(() => {
    if (globalStatsCache) {
      return
    }

    const fetchStats = async () => {
      try {
        const { supabase } = await import("@/lib/supabase")
        const { data, error } = await supabase
          .from("reviews")
          .select("rating")
          .eq("status", "approved")

        if (error) throw error

        let avg = "5.0"
        let count = 0

        if (data && data.length > 0) {
          count = data.length
          const sum = data.reduce((acc, r) => acc + (r.rating || 5), 0)
          avg = (sum / count).toFixed(1)
        }

        globalStatsCache = { averageRating: avg, totalReviews: count }
        setStats({ averageRating: avg, totalReviews: count, isLoading: false })
      } catch (e) {
        console.error("Ошибка загрузки статистики отзывов", e)
        // Fallback on error
        const fallback = { averageRating: "5.0", totalReviews: 0 }
        globalStatsCache = fallback
        setStats({ ...fallback, isLoading: false })
      }
    }

    if (!fetchPromise) {
      fetchPromise = fetchStats()
    } else {
      fetchPromise.then(() => {
        if (globalStatsCache) {
          setStats({
            averageRating: globalStatsCache.averageRating,
            totalReviews: globalStatsCache.totalReviews,
            isLoading: false,
          })
        }
      })
    }
  }, [])

  return stats
}
