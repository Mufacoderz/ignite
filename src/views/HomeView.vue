<template>
  <AppLayout>
    <div class="max-w-5xl mx-auto">
      <div class="mb-8">
        <h1 class="font-display text-5xl tracking-wider text-fire-grad leading-none">DASHBOARD</h1>
        <p class="text-stone-500 text-sm mt-1">{{ dateStr }}</p>
      </div>

      <!-- Stat cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6" v-if="stats">
        <div v-for="(card, i) in statCards" :key="i"
          class="bg-stone-900 border border-stone-700/50 rounded-2xl p-4 flex flex-col gap-2">
          <component :is="card.icon" :size="22" class="text-ember-500 opacity-80" />
          <div class="font-display text-4xl tracking-wider text-white leading-none">{{ card.value }}</div>
          <div class="text-xs font-bold text-stone-500 uppercase tracking-wider">{{ card.label }}</div>
        </div>
      </div>
      <!-- Skeleton -->
      <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div v-for="i in 4" :key="i" class="bg-stone-900 border border-stone-700/50 rounded-2xl p-4 h-28 animate-pulse"></div>
      </div>

      <!-- Today progress -->
      <div class="bg-stone-900 border border-stone-700/50 rounded-2xl p-5 mb-6" v-if="today">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-display text-xl tracking-wider text-white">TODAY'S PROGRESS</h2>
          <span class="font-display text-2xl" :class="pct === 100 ? 'text-fire-grad' : 'text-ember-500'">{{ pct }}%</span>
        </div>
        <div class="h-2.5 bg-stone-800 rounded-full overflow-hidden mb-3">
          <div class="h-full bg-fire-grad rounded-full transition-all duration-700" :style="`width:${pct}%`"></div>
        </div>
        <p v-if="pct === 100" class="text-xs font-bold text-amber-400 text-center">WORKOUT COMPLETE!</p>
        <p v-else class="text-xs text-stone-500">{{ today.done }}/{{ today.total }} exercise selesai</p>
      </div>

      <!-- Today list -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-display text-xl tracking-wider text-white">TODAY'S EXERCISES</h2>
          <RouterLink to="/checklist" class="text-xs font-bold text-ember-400 hover:text-ember-300 transition-colors">View All →</RouterLink>
        </div>

        <div v-if="loadingToday" class="space-y-2">
          <div v-for="i in 3" :key="i" class="bg-stone-900 rounded-2xl h-16 animate-pulse"></div>
        </div>
        <div v-else-if="todayItems.length === 0" class="flex flex-col items-center py-12 text-center bg-stone-900 border border-stone-700/50 rounded-2xl">
          <div class="text-4xl mb-3 opacity-30">😴</div>
          <p class="font-display text-xl tracking-wider text-stone-500 mb-2">BELUM ADA EXERCISE</p>
          <RouterLink to="/checklist" class="mt-3 bg-fire-grad text-white text-xs font-black px-4 py-2 rounded-xl shadow-fire">+ TAMBAH SEKARANG</RouterLink>
        </div>
        <div v-else class="space-y-2">
          <div v-for="item in todayItems.slice(0, 5)" :key="item.id"
            class="flex items-center gap-3 p-4 rounded-2xl border transition-all"
            :class="item.is_done ? 'bg-emerald-950/20 border-emerald-800/25' : 'bg-stone-900 border-stone-700/50'">
            <button @click="toggleItem(item.id)"
              class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
              :class="item.is_done ? 'bg-emerald-600' : 'border-2 border-stone-600 hover:border-ember-500'">
              <CheckCircle2 v-if="item.is_done" :size="15" class="text-white" />
            </button>
            <div class="flex-1 min-w-0">
              <div class="font-bold text-sm" :class="item.is_done ? 'line-through text-stone-500' : 'text-white'">{{ item.name }}</div>
              <div class="text-xs text-stone-500">{{ item.sets }} × {{ item.reps }} reps</div>
            </div>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border" :class="tagColor(item.category)">{{ item.category }}</span>
          </div>
          <p v-if="todayItems.length > 5" class="text-xs text-stone-600 text-center pt-1">+{{ todayItems.length - 5 }} more</p>
        </div>
      </div>

      <!-- Quick actions -->
      <div class="grid grid-cols-2 gap-3">
        <RouterLink v-for="qa in quickActions" :key="qa.to" :to="qa.to"
          class="bg-stone-900 border border-stone-700/50 rounded-2xl p-4 flex items-center gap-3 hover:border-ember-600/40 transition-all group no-underline">
          <div class="w-10 h-10 rounded-xl bg-fire-grad flex items-center justify-center shadow-fire flex-shrink-0">
            <component :is="qa.icon" class="text-white" :size="18" />
          </div>
          <div>
            <div class="font-bold text-white text-sm group-hover:text-ember-400 transition-colors">{{ qa.label }}</div>
            <div class="text-xs text-stone-500">{{ qa.sub }}</div>
          </div>
        </RouterLink>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import { api } from '@/services/api'
import { Flame, Dumbbell, Calendar, TrendingUp, CheckCircle2, CalendarCheck, ClipboardList } from 'lucide-vue-next'

const stats       = ref(null)
const todayItems  = ref([])
const loadingToday = ref(true)

const dateStr = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

const today = computed(() => {
  if (!todayItems.value.length) return null
  const done  = todayItems.value.filter(i => i.is_done).length
  const total = todayItems.value.length
  return { done, total }
})
const pct = computed(() => {
  if (!today.value?.total) return 0
  return Math.round((today.value.done / today.value.total) * 100)
})

const statCards = computed(() => [
  { icon: Flame,      value: stats.value?.streak ?? 0,         label: 'Day Streak' },
  { icon: Dumbbell,   value: stats.value?.totalExercises ?? 0,  label: 'Total Exercises' },
  { icon: Calendar,   value: stats.value?.totalWorkoutDays ?? 0,label: 'Workout Days' },
  { icon: TrendingUp, value: (stats.value?.completionRate ?? 0)+'%', label: 'Completion Rate' },
])

const quickActions = [
  { to: '/exercises', icon: Dumbbell,      label: 'Exercises',  sub: 'Kelola daftar exercise' },
  { to: '/plans',     icon: CalendarCheck, label: 'Plans',      sub: 'Workout plan kamu' },
  { to: '/checklist', icon: ClipboardList, label: 'Checklist',  sub: 'Daily exercise hari ini' },
]

const TAG_COLORS = {
  strength:    'bg-red-950/60 text-red-400 border-red-900/40',
  cardio:      'bg-orange-950/60 text-orange-400 border-orange-900/40',
  flexibility: 'bg-emerald-950/60 text-emerald-400 border-emerald-900/40',
  balance:     'bg-blue-950/60 text-blue-400 border-blue-900/40',
}
function tagColor(cat) {
  return TAG_COLORS[cat?.toLowerCase()] || 'bg-stone-800 text-stone-400 border-stone-700/50'
}

async function toggleItem(id) {
  await api.patch(`/checklist/${id}`)
  const data = await api.get('/checklist/today')
  todayItems.value = data.items || []
}

onMounted(async () => {
  const [s, c] = await Promise.all([
    api.get('/stats?type=overview').catch(() => null),
    api.get('/checklist/today').catch(() => ({ items: [] })),
  ])
  stats.value      = s
  todayItems.value = c.items || []
  loadingToday.value = false
})
</script>
