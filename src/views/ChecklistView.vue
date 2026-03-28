<template>
  <AppLayout>
    <div class="max-w-2xl mx-auto">
      <div class="mb-6">
        <h1 class="font-display text-5xl tracking-wider text-fire-grad leading-none">DAILY CHECKLIST</h1>
        <p class="text-stone-500 text-sm mt-1">Track your exercises day by day</p>
      </div>

      <!-- Date strip -->
      <div class="flex gap-1.5 mb-6 overflow-x-auto pb-1">
        <button v-for="d in days" :key="d.date" @click="selectedDate = d.date"
          class="flex-shrink-0 flex flex-col items-center px-3 py-2.5 rounded-xl border transition-all"
          :class="selectedDate === d.date ? 'bg-fire-grad border-transparent shadow-fire text-white' : 'bg-stone-900 border-stone-700/50 text-stone-500 hover:border-stone-600'">
          <span class="text-[10px] font-black uppercase tracking-wider" :class="selectedDate === d.date ? 'text-white/70' : 'text-stone-600'">{{ d.label }}</span>
          <span class="font-display text-xl" :class="selectedDate === d.date ? 'text-white' : 'text-stone-400'">{{ d.day }}</span>
        </button>
      </div>

      <!-- Progress -->
      <div v-if="total > 0" class="bg-stone-900 border border-stone-700/50 rounded-2xl p-4 mb-5">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <Flame v-if="pct === 100" :size="18" class="text-amber-500" />
            <span class="font-display text-xl tracking-wider text-white">{{ done }}/{{ total }} DONE</span>
          </div>
          <span class="font-display text-2xl" :class="pct === 100 ? 'text-fire-grad' : 'text-ember-500'">{{ pct }}%</span>
        </div>
        <div class="h-2.5 bg-stone-800 rounded-full overflow-hidden">
          <div class="h-full bg-fire-grad rounded-full transition-all duration-600" :style="`width:${pct}%`"></div>
        </div>
        <p v-if="pct === 100" class="text-center text-xs font-bold text-amber-500 mt-2">WORKOUT COMPLETE!</p>
      </div>

      <!-- Actions -->
      <div class="flex gap-2 mb-5">
        <button @click="showAddModal = true" class="flex items-center gap-1.5 bg-fire-grad text-white text-xs font-black px-3 py-2 rounded-xl shadow-fire hover:shadow-fire-lg transition-all">
          <Plus :size="14" /> Add Exercise
        </button>
        <button @click="showPlanModal = true" class="flex items-center gap-1.5 bg-stone-800 border border-stone-700/50 text-white text-xs font-bold px-3 py-2 rounded-xl hover:border-ember-500/40 transition-all">
          <PlayCircle :size="14" /> Load Plan
        </button>
      </div>

      <!-- Checklist -->
      <div v-if="loading" class="space-y-2">
        <div v-for="i in 3" :key="i" class="bg-stone-900 rounded-2xl h-16 animate-pulse"></div>
      </div>
      <div v-else-if="items.length === 0" class="flex flex-col items-center py-16 text-center bg-stone-900 border border-stone-700/50 rounded-2xl">
        <div class="text-5xl mb-4 opacity-30">✅</div>
        <p class="font-display text-2xl tracking-wider text-stone-500 mb-2">EMPTY FOR THIS DAY</p>
        <p class="text-stone-600 text-sm">Add exercises or load a workout plan</p>
      </div>
      <div v-else class="space-y-2">
        <div v-for="item in items" :key="item.id"
          class="flex items-center gap-3 p-4 rounded-2xl border transition-all group"
          :class="item.is_done ? 'bg-emerald-950/20 border-emerald-800/25' : 'bg-stone-900 border-stone-700/50 hover:border-stone-600/70'">
          <button @click="toggleItem(item.id)"
            class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
            :class="item.is_done ? 'bg-emerald-600 shadow-[0_0_12px_rgba(5,150,105,0.4)]' : 'border-2 border-stone-600 hover:border-ember-500'">
            <CheckCircle2 v-if="item.is_done" :size="15" class="text-white" />
          </button>
          <div class="flex-1 min-w-0">
            <div class="font-bold text-sm" :class="item.is_done ? 'line-through text-stone-500' : 'text-white'">{{ item.name }}</div>
            <div class="flex items-center gap-2 mt-1">
              <span v-if="item.category" class="text-[10px] font-bold px-2 py-0.5 rounded-full border" :class="tagColor(item.category)">{{ item.category }}</span>
              <span class="text-xs text-stone-500">{{ item.sets }} × {{ item.reps }}</span>
            </div>
          </div>
          <button @click="removeItem(item.id)" class="opacity-0 group-hover:opacity-100 text-stone-600 hover:text-red-400 transition-all p-1 rounded-lg hover:bg-red-950/30">
            <Trash2 :size="14" />
          </button>
        </div>
      </div>
    </div>

    <!-- Add Exercise Modal -->
    <AppModal :open="showAddModal" title="ADD EXERCISES" @close="showAddModal = false; selectedEx = []">
      <div class="max-h-72 overflow-y-auto space-y-1 mb-4">
        <label v-for="ex in availableExercises" :key="ex.id"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all border"
          :class="selectedEx.includes(ex.id) ? 'bg-ember-600/15 border-ember-600/25' : 'hover:bg-stone-800/60 border-transparent'">
          <input type="checkbox" :value="ex.id" v-model="selectedEx" class="accent-orange-500 w-4 h-4" />
          <span class="text-sm font-semibold text-white flex-1">{{ ex.name }}</span>
          <span class="text-xs text-stone-500">{{ ex.sets }}×{{ ex.reps }}</span>
        </label>
        <p v-if="!allExercises.length" class="text-center text-stone-500 py-4 text-sm">No exercises. Add some first!</p>
      </div>
      <div class="flex justify-end gap-2">
        <button @click="showAddModal = false; selectedEx = []" class="px-4 py-2 rounded-xl text-sm font-bold text-stone-400 hover:text-white hover:bg-stone-800 transition-all">Cancel</button>
        <button @click="addExercises" :disabled="!selectedEx.length" class="bg-fire-grad text-white text-sm font-black px-5 py-2 rounded-xl shadow-fire disabled:opacity-50 flex items-center gap-2">
          Add {{ selectedEx.length > 0 ? `(${selectedEx.length})` : '' }}
        </button>
      </div>
    </AppModal>

    <!-- Load Plan Modal -->
    <AppModal :open="showPlanModal" title="LOAD WORKOUT PLAN" @close="showPlanModal = false">
      <div class="space-y-2">
        <button v-for="p in plans" :key="p.id" @click="loadFromPlan(p.id)"
          class="w-full flex items-center justify-between bg-stone-800/60 border border-stone-700/50 hover:border-ember-600/40 px-4 py-3 rounded-xl transition-all text-left">
          <div>
            <div class="font-bold text-white text-sm">{{ p.name }}</div>
            <div class="text-xs text-stone-500">{{ p.exercises?.length || 0 }} exercises</div>
          </div>
          <PlayCircle :size="18" class="text-ember-500" />
        </button>
        <p v-if="!plans.length" class="text-center text-stone-500 py-4 text-sm">No plans yet. Create a plan first!</p>
      </div>
    </AppModal>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import AppModal  from '@/components/AppModal.vue'
import { api } from '@/services/api'
import { Plus, PlayCircle, Trash2, CheckCircle2, Flame } from 'lucide-vue-next'

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    return { date: d.toISOString().split('T')[0], label: i === 6 ? 'Today' : d.toLocaleDateString('id',{weekday:'short'}), day: d.getDate() }
  })
}
const days = getLast7Days()

const selectedDate = ref(days[6].date)
const items        = ref([])
const allExercises = ref([])
const plans        = ref([])
const loading      = ref(true)
const showAddModal = ref(false)
const showPlanModal= ref(false)
const selectedEx   = ref([])

const done  = computed(() => items.value.filter(i => i.is_done).length)
const total = computed(() => items.value.length)
const pct   = computed(() => total.value ? Math.round((done.value / total.value) * 100) : 0)

const availableExercises = computed(() => allExercises.value.filter(ex => !items.value.find(i => i.exercise_id === ex.id)))

const TAG_COLORS = {
  strength:'bg-red-950/60 text-red-400 border-red-900/40',
  cardio:'bg-orange-950/60 text-orange-400 border-orange-900/40',
  flexibility:'bg-emerald-950/60 text-emerald-400 border-emerald-900/40',
  balance:'bg-blue-950/60 text-blue-400 border-blue-900/40',
}
function tagColor(c) { return TAG_COLORS[c?.toLowerCase()] || 'bg-stone-800 text-stone-400 border-stone-700/50' }

async function loadChecklist() {
  loading.value = true
  const data = await api.get('/checklist', { date: selectedDate.value }).catch(() => [])
  items.value = Array.isArray(data) ? data : data?.items || []
  loading.value = false
}

async function toggleItem(id) {
  await api.patch(`/checklist/${id}`)
  loadChecklist()
}
async function removeItem(id) {
  await api.delete(`/checklist/${id}`)
  loadChecklist()
}
async function addExercises() {
  for (const exId of selectedEx.value) {
    await api.post('/checklist', { exerciseId: exId, date: selectedDate.value })
  }
  selectedEx.value = []; showAddModal.value = false; loadChecklist()
}
async function loadFromPlan(planId) {
  await api.post('/checklist/from-plan', { planId, date: selectedDate.value })
  showPlanModal.value = false; loadChecklist()
}

watch(selectedDate, loadChecklist)

onMounted(async () => {
  const [e, p] = await Promise.all([api.get('/exercises').catch(()=>[]), api.get('/plans').catch(()=>[])])
  allExercises.value = Array.isArray(e) ? e : []
  plans.value        = Array.isArray(p) ? p : []
  loadChecklist()
})
</script>
