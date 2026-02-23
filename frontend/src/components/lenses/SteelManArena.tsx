'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDialogue } from '@/lib/useData'
import { LensLayout, DetailPanel } from './LensLayout'
import type { DialogueRound, DialogueExchange } from '@/lib/types'

// Speaker avatar component
function SpeakerAvatar({ speaker }: { speaker: string }) {
  const config: Record<string, { color: string; label: string; icon: string }> = {
    demartini_steelmanned: {
      color: 'bg-demartini',
      label: 'Demartini',
      icon: '◈',
    },
    marcus_steelmanned: {
      color: 'bg-marcus',
      label: 'Marcus',
      icon: '◉',
    },
    synthesis: {
      color: 'bg-convergence',
      label: 'Synthesis',
      icon: '⬡',
    },
  }

  const c = config[speaker] || { color: 'bg-ink-tertiary', label: speaker, icon: '?' }

  return (
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-full ${c.color} flex items-center justify-center text-field font-bold`}>
        {c.icon}
      </div>
      <span className="text-sm font-medium text-ink">{c.label}</span>
    </div>
  )
}

// Exchange bubble
function ExchangeBubble({ exchange }: { exchange: DialogueExchange }) {
  const bgColor =
    exchange.speaker === 'demartini_steelmanned'
      ? 'bg-demartini-faint border-demartini/30'
      : exchange.speaker === 'marcus_steelmanned'
      ? 'bg-marcus-faint border-marcus/30'
      : 'bg-convergence-soft border-convergence/30'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-4 ${bgColor}`}
    >
      <SpeakerAvatar speaker={exchange.speaker} />

      <div className="mt-3">
        <p className="text-sm text-ink leading-relaxed">{exchange.content}</p>
      </div>

      {exchange.warrants && exchange.warrants.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <h5 className="text-xs uppercase tracking-wider text-ink-tertiary mb-1">
            Warrants
          </h5>
          <div className="flex flex-wrap gap-1">
            {exchange.warrants.map((w, i) => (
              <span key={i} className="text-xs bg-field-subtle px-2 py-0.5 rounded text-ink-secondary">
                {w}
              </span>
            ))}
          </div>
        </div>
      )}

      {exchange.strength && (
        <div className="mt-2">
          <p className="text-xs text-ink-tertiary italic">
            <span className="font-medium">Strength:</span> {exchange.strength}
          </p>
        </div>
      )}

      {exchange.insight && (
        <div className="mt-3 p-2 bg-insight/20 rounded-lg">
          <p className="text-xs text-insight">
            <span className="font-medium">💡 Insight:</span> {exchange.insight}
          </p>
        </div>
      )}
    </motion.div>
  )
}

// Round component
function RoundSection({
  round,
  isExpanded,
  onToggle,
}: {
  round: DialogueRound
  isExpanded: boolean
  onToggle: () => void
}) {
  return (
    <div className="card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 text-left flex items-center justify-between hover:bg-field-deep transition-colors"
      >
        <div>
          <span className="text-xs text-ink-tertiary uppercase tracking-wider">
            Round {round.id}
          </span>
          <h3 className="font-display font-semibold text-lg text-ink">{round.topic}</h3>
        </div>
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          className="text-ink-tertiary"
        >
          ▼
        </motion.span>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-4">
              {round.exchanges.map((exchange, i) => (
                <ExchangeBubble key={i} exchange={exchange} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Generate dialog form
function GenerateDialog({ topics }: { topics: string[] }) {
  const [customTopic, setCustomTopic] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [apiKey, setApiKey] = useState('')

  const handleGenerate = async () => {
    if (!customTopic.trim() || !apiKey.trim()) return

    setIsGenerating(true)
    // In production, this would call the Gemini API
    // For now, we'll show a placeholder
    setTimeout(() => {
      setIsGenerating(false)
      alert(
        'Gemini API integration coming soon! Your topic: ' + customTopic
      )
    }, 1500)
  }

  return (
    <div className="card">
      <h3 className="font-display font-semibold text-ink mb-4">Generate Custom Round</h3>

      <div className="space-y-4">
        <div>
          <label className="text-xs uppercase tracking-wider text-ink-tertiary block mb-2">
            Your Topic
          </label>
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="e.g., Is forgiveness always possible?"
            className="w-full bg-field-subtle rounded-lg px-4 py-2 text-sm text-ink border border-border focus:border-marcus focus:ring-1 focus:ring-marcus/30 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-wider text-ink-tertiary block mb-2">
            Or Choose a Suggested Topic
          </label>
          <div className="flex flex-wrap gap-2">
            {topics.slice(0, 4).map((topic) => (
              <button
                key={topic}
                onClick={() => setCustomTopic(topic)}
                className="text-xs bg-field-subtle hover:bg-field-deep px-3 py-1.5 rounded-lg transition-colors text-ink-secondary"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wider text-ink-tertiary block mb-2">
            Gemini API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Your API key (not stored)"
            className="w-full bg-field-subtle rounded-lg px-4 py-2 text-sm text-ink border border-border focus:border-marcus focus:ring-1 focus:ring-marcus/30 focus:outline-none"
          />
          <p className="text-xs text-ink-tertiary mt-1">
            Get a key at{' '}
            <a
              href="https://makersuite.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-marcus hover:underline"
            >
              Google AI Studio
            </a>
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!customTopic.trim() || !apiKey.trim() || isGenerating}
          className={`
            w-full py-2 rounded-lg font-medium transition-all
            ${
              customTopic.trim() && apiKey.trim() && !isGenerating
                ? 'bg-gradient-to-r from-marcus to-demartini text-field hover:opacity-90'
                : 'bg-field-subtle text-ink-tertiary cursor-not-allowed'
            }
          `}
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-field/30 border-t-field rounded-full animate-spin" />
              Generating...
            </span>
          ) : (
            'Generate Steel Man Dialogue'
          )}
        </button>
      </div>
    </div>
  )
}

// Final synthesis component
function FinalSynthesis({
  synthesis,
}: {
  synthesis: {
    title: string
    content: string
    convergence_points: string[]
    irreducible_tensions: string[]
  }
}) {
  return (
    <div className="card">
      <h3 className="font-display font-semibold text-xl text-ink mb-4">{synthesis.title}</h3>

      <div className="prose prose-sm max-w-none">
        <div className="whitespace-pre-line text-ink-secondary text-sm">
          {synthesis.content}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <div>
          <h4 className="text-sm font-semibold text-convergence mb-2">
            ✓ Points of Convergence
          </h4>
          <ul className="space-y-2">
            {synthesis.convergence_points.map((point, i) => (
              <li key={i} className="text-sm text-ink-secondary flex items-start gap-2">
                <span className="text-convergence mt-0.5">•</span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-marcus mb-2">
            ✗ Irreducible Tensions
          </h4>
          <ul className="space-y-2">
            {synthesis.irreducible_tensions.map((tension, i) => (
              <li key={i} className="text-sm text-ink-secondary flex items-start gap-2">
                <span className="text-marcus mt-0.5">•</span>
                {tension}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export function SteelManArena() {
  const { data, loading, error } = useDialogue()
  const [expandedRound, setExpandedRound] = useState<number | null>(1)
  const [showGenerator, setShowGenerator] = useState(false)

  const sidebar = (
    <div className="space-y-4 sticky top-24">
      <div className="card">
        <h3 className="font-display font-semibold text-ink mb-4">About Steel Man Arena</h3>
        <p className="text-sm text-ink-secondary mb-4">
          In this arena, both positions are presented in their{' '}
          <span className="text-ink font-medium">strongest possible form</span>—a technique
          called "steel-manning" (the opposite of straw-manning).
        </p>
        <p className="text-sm text-ink-secondary">
          Each round explores a key dimension of disagreement, with a synthesis
          that identifies genuine common ground and irreducible differences.
        </p>
      </div>

      <div className="card">
        <h4 className="text-sm font-semibold text-ink mb-3">Speakers</h4>
        <div className="space-y-3">
          {data?.speakers &&
            Object.entries(data.speakers).map(([key, speaker]) => (
              <div key={key} className="flex items-start gap-2">
                <SpeakerAvatar speaker={key} />
              </div>
            ))}
        </div>
      </div>

      <button
        onClick={() => setShowGenerator(!showGenerator)}
        className="w-full card text-left hover:bg-field-deep transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="font-semibold text-ink">Generate Custom Round</span>
          <span className="text-marcus">✦</span>
        </div>
        <p className="text-xs text-ink-tertiary mt-1">
          Use Gemini AI to explore your own topics
        </p>
      </button>
    </div>
  )

  return (
    <LensLayout
      title="Steel Man Arena"
      subtitle="Where both positions are presented in their strongest form"
      loading={loading}
      error={error}
      sidebar={sidebar}
    >
      {data && (
        <div className="space-y-6">
          {/* Generator (collapsible) */}
          <AnimatePresence>
            {showGenerator && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <GenerateDialog
                  topics={data.gemini_integration?.example_topics || []}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Introduction */}
          <div className="card">
            <p className="text-sm text-ink-secondary">{data.metadata.description}</p>
          </div>

          {/* Rounds */}
          <div className="space-y-4">
            <h2 className="font-display font-semibold text-lg text-ink">
              Pre-Populated Rounds ({data.rounds.length})
            </h2>
            {data.rounds.map((round) => (
              <RoundSection
                key={round.id}
                round={round}
                isExpanded={expandedRound === round.id}
                onToggle={() =>
                  setExpandedRound(expandedRound === round.id ? null : round.id)
                }
              />
            ))}
          </div>

          {/* Final Synthesis */}
          {data.final_synthesis && (
            <FinalSynthesis synthesis={data.final_synthesis} />
          )}
        </div>
      )}
    </LensLayout>
  )
}
