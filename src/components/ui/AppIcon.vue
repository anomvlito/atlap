<script setup lang="ts">
import { computed } from 'vue'
import {
  Activity, Trophy, Award, Zap, Dumbbell, Settings, TrendingUp, TrendingDown, Minus,
  Calendar, Clock, Flame, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Plus, BookOpen, Users, User, BarChart2, BarChart, Heart, Wind, Target, Check, Star,
  Timer, Footprints, Brain, Snowflake, Scissors, NotebookPen, RefreshCw,
  ArrowRight, Shield, AlarmClock, Medal, MessageSquare, CheckCircle, Circle,
  Home, Sun, Moon, Droplets, Utensils, LogOut,
  Sparkles, Flag, MapPin, X
} from 'lucide-vue-next'

const props = defineProps<{
  name: string
  size?: number
  strokeWidth?: number
}>()

const registry: Record<string, object> = {
  Activity, Trophy, Award, Zap, Dumbbell, Settings, TrendingUp, TrendingDown, Minus,
  Calendar, Clock, Flame, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Plus, BookOpen, Users, User, BarChart2, BarChart, Heart, Wind, Target, Check, Star,
  Timer, Footprints, Brain, Snowflake, Scissors, NotebookPen, RefreshCw,
  ArrowRight, Shield, AlarmClock, Medal, MessageSquare, CheckCircle, Circle,
  Home, Sun, Moon, Droplets, Utensils, LogOut,
  Sparkles, Flag, MapPin, X
}

const icon = computed(() => registry[props.name])
</script>

<template>
  <component :is="icon" v-if="icon" :size="size ?? 20" :stroke-width="strokeWidth ?? 2" />
</template>
