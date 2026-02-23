#!/usr/bin/env python3
"""
generate_wiki.py - Extract entities from claims and generate wiki entries

Identifies concepts, thinkers, frameworks, and traditions from the analyzed
debate, then generates markdown wiki entries for each using templates.
"""

import json
from pathlib import Path
from datetime import datetime
from collections import defaultdict

# Paths
DATA_DIR = Path(__file__).parent.parent / "data" / "processed"
WIKI_DIR = Path(__file__).parent.parent / "wiki"
TEMPLATE_DIR = Path(__file__).parent.parent / ".opal" / "templates"

# Entity classification rules
THINKERS = {
    "heraclitus": {
        "name": "Heraclitus",
        "era": "Ancient Greek (c. 535–475 BCE)",
        "tradition": "pre_socratic",
        "key_ideas": ["Unity of opposites", "Logos", "Flux and change"],
        "key_works": ["Fragments"]
    },
    "aristotle": {
        "name": "Aristotle",
        "era": "Ancient Greek (384–322 BCE)",
        "tradition": "greek_philosophy",
        "key_ideas": ["Golden mean", "Virtue ethics", "Teleology"],
        "key_works": ["Nicomachean Ethics", "Metaphysics"]
    },
    "epictetus": {
        "name": "Epictetus",
        "era": "Roman (c. 50–135 CE)",
        "tradition": "stoicism",
        "key_ideas": ["Control dichotomy", "Human motivation", "Freedom through acceptance"],
        "key_works": ["Enchiridion", "Discourses"]
    },
    "maimonides": {
        "name": "Moses Maimonides",
        "era": "Medieval (1138–1204 CE)",
        "tradition": "jewish_philosophy",
        "key_ideas": ["Divine omnipresence", "Negative theology", "Integration of faith and reason"],
        "key_works": ["Guide for the Perplexed", "Mishneh Torah"]
    },
    "jung": {
        "name": "Carl Jung",
        "era": "Modern (1875–1961)",
        "tradition": "depth_psychology",
        "key_ideas": ["Shadow", "Projection", "Individuation", "Collective unconscious"],
        "key_works": ["Aion", "Man and His Symbols"]
    },
    "rumi": {
        "name": "Jalāl ad-Dīn Rumi",
        "era": "Medieval (1207–1273 CE)",
        "tradition": "sufism",
        "key_ideas": ["Divine love", "Poetry as spiritual practice", "Unity through love"],
        "key_works": ["Masnavi", "Divan-e Shams-e Tabrizi"]
    },
    "einstein": {
        "name": "Albert Einstein",
        "era": "Modern (1879–1955)",
        "tradition": "physics_philosophy",
        "key_ideas": ["Cosmic religious feeling", "Mystery as source of art and science"],
        "key_works": ["Ideas and Opinions"]
    },
    "montaigne": {
        "name": "Michel de Montaigne",
        "era": "Renaissance (1533–1592)",
        "tradition": "skepticism",
        "key_ideas": ["Cultural relativism", "Self-examination", "Humility about knowledge"],
        "key_works": ["Essays"]
    },
    "libet": {
        "name": "Benjamin Libet",
        "era": "Modern (1916–2007)",
        "tradition": "neuroscience",
        "key_ideas": ["Readiness potential", "Timing of conscious will", "Free will experiments"],
        "key_works": ["Mind Time"]
    },
    "christ": {
        "name": "Jesus of Nazareth",
        "era": "Ancient (c. 4 BCE – 30 CE)",
        "tradition": "christianity",
        "key_ideas": ["Forgiveness", "Divine love", "Redemption"],
        "key_works": ["Gospels (as reported)"]
    },
    "sean_o_laoire": {
        "name": "Father Sean Ó Laoire",
        "era": "Contemporary",
        "tradition": "catholic_mysticism",
        "key_ideas": ["Evil as cosmic conspiracy against love", "Integration of psychology and spirituality"],
        "key_works": ["Souls on Safari"]
    }
}

FRAMEWORKS = {
    "demartini_method": {
        "name": "The Demartini Method",
        "creator": "John Demartini",
        "purpose": "Dissolve emotional charges by finding both sides of any event",
        "key_principles": [
            "Every event has equal benefits and drawbacks",
            "Emotional charge indicates incomplete perception",
            "Gratitude emerges from seeing the hidden order"
        ]
    },
    "ho_oponopono": {
        "name": "Ho'oponopono",
        "creator": "Hawaiian Kahuna tradition",
        "purpose": "Healing through taking responsibility for what we perceive",
        "key_principles": [
            "I'm sorry, Please forgive me, Thank you, I love you",
            "What we perceive in others is in ourselves",
            "Healing the self heals the world"
        ]
    },
    "somatic_epistemology": {
        "name": "Somatic Epistemology",
        "creator": "Phenomenological tradition",
        "purpose": "Knowledge accessed through bodily knowing",
        "key_principles": [
            "The body knows before the mind",
            "Visceral responses carry truth",
            "Embodied cognition grounds abstract concepts"
        ]
    },
    "unity_of_opposites": {
        "name": "Unity of Opposites",
        "creator": "Heraclitus / Dialectical tradition",
        "purpose": "Understanding reality through complementary tensions",
        "key_principles": [
            "Opposites are secretly unified",
            "Conflict generates harmony",
            "What appears contradictory is complementary"
        ]
    },
    "participatory_theology": {
        "name": "Participatory Theology",
        "creator": "Various mystical traditions",
        "purpose": "Understanding humans as co-creators with the divine",
        "key_principles": [
            "We participate in God, not merely observe",
            "Human agency contributes to cosmic unfolding",
            "Divinity is not separate from creation"
        ]
    }
}

TRADITIONS = {
    "stoicism": {
        "name": "Stoicism",
        "period": "Ancient Greek/Roman",
        "core_claim": "Virtue is the sole good; externals are indifferent",
        "key_figures": ["Epictetus", "Marcus Aurelius", "Seneca"]
    },
    "buddhism": {
        "name": "Buddhism",
        "period": "Ancient to present",
        "core_claim": "Suffering arises from attachment; liberation through understanding",
        "key_figures": ["Buddha", "Nagarjuna", "Thich Nhat Hanh"]
    },
    "nonduality": {
        "name": "Nondual Philosophy",
        "period": "Ancient to present",
        "core_claim": "Ultimate reality transcends subject-object duality",
        "key_figures": ["Shankara", "Meister Eckhart", "Nisargadatta Maharaj"]
    },
    "christianity": {
        "name": "Christianity",
        "period": "Ancient to present",
        "core_claim": "God is love; salvation through grace and transformation",
        "key_figures": ["Jesus", "Paul", "Augustine"]
    },
    "greek_philosophy": {
        "name": "Greek Philosophy",
        "period": "Ancient (6th century BCE onwards)",
        "core_claim": "Reason can discern the nature of reality and the good life",
        "key_figures": ["Socrates", "Plato", "Aristotle"]
    },
    "sufism": {
        "name": "Sufism",
        "period": "Medieval to present",
        "core_claim": "Divine love is the path to union with God",
        "key_figures": ["Rumi", "Ibn Arabi", "Al-Ghazali"]
    },
    "zoroastrianism": {
        "name": "Zoroastrianism",
        "period": "Ancient Persian to present",
        "core_claim": "Cosmic struggle between good and evil; humans must choose",
        "key_figures": ["Zoroaster"]
    },
    "depth_psychology": {
        "name": "Depth Psychology",
        "period": "Modern (late 19th century onwards)",
        "core_claim": "The unconscious shapes conscious experience; integration heals",
        "key_figures": ["Freud", "Jung", "Hillman"]
    }
}

CONCEPTS = {
    "nonduality": {
        "definition": "The philosophical position that ultimate reality transcends the distinction between subject and object, self and other, good and evil.",
        "domain": "metaphysics",
        "controversy_level": "high"
    },
    "projection": {
        "definition": "The psychological mechanism whereby we perceive in others what we have not acknowledged in ourselves.",
        "domain": "psychology",
        "controversy_level": "medium"
    },
    "shadow": {
        "definition": "The unconscious aspect of personality that the conscious ego does not identify with, containing repressed weaknesses and undeveloped capacities.",
        "domain": "psychology",
        "controversy_level": "medium"
    },
    "moral_relativism": {
        "definition": "The view that moral judgments are not universally valid but relative to cultural, historical, or personal contexts.",
        "domain": "ethics",
        "controversy_level": "high"
    },
    "therapeutic_dissolution": {
        "definition": "The process of dissolving emotional charge around events by finding their hidden benefits and achieving balanced perception.",
        "domain": "psychology",
        "controversy_level": "medium"
    },
    "sacred_obligation": {
        "definition": "A duty that transcends personal preference—something we ought to do regardless of consequences because it is intrinsically right.",
        "domain": "ethics",
        "controversy_level": "medium"
    },
    "embodied_knowing": {
        "definition": "Knowledge that is accessed through bodily sensation and visceral response rather than abstract reasoning alone.",
        "domain": "epistemology",
        "controversy_level": "low"
    },
    "cosmic_balance": {
        "definition": "The view that the universe maintains an equilibrium of constructive and destructive forces, with neither ultimately dominating.",
        "domain": "metaphysics",
        "controversy_level": "high"
    },
    "intrinsic_value": {
        "definition": "Value that exists in something for its own sake, independent of its usefulness or anyone's attitude toward it.",
        "domain": "axiology",
        "controversy_level": "medium"
    },
    "agency": {
        "definition": "The capacity of an entity to act in the world, to make choices that have real effects.",
        "domain": "metaphysics",
        "controversy_level": "medium"
    },
    "gratitude": {
        "definition": "The attitude of thankfulness; in the debate, positioned as higher than forgiveness because it implies no wrong was done.",
        "domain": "psychology",
        "controversy_level": "medium"
    },
    "forgiveness": {
        "definition": "Releasing resentment toward someone who has wronged you; in the debate, questioned as to whether it's needed if no wrong occurred.",
        "domain": "ethics",
        "controversy_level": "low"
    },
    "hidden_order": {
        "definition": "The Heraclitean concept that apparent chaos conceals an underlying rational structure (logos).",
        "domain": "metaphysics",
        "controversy_level": "medium"
    },
    "logos": {
        "definition": "The rational principle that governs the cosmos; the hidden order underlying apparent flux and conflict.",
        "domain": "metaphysics",
        "controversy_level": "low"
    },
    "amygdala_reactivity": {
        "definition": "The brain's threat-detection system that generates immediate emotional responses before conscious evaluation.",
        "domain": "neuroscience",
        "controversy_level": "low"
    },
    "free_will": {
        "definition": "The capacity to make choices that are not determined by prior causes; debated given neuroscience findings on decision timing.",
        "domain": "metaphysics",
        "controversy_level": "high"
    },
    "moral_evolution": {
        "definition": "The view that moral understanding improves over time—e.g., abolition of slavery represents genuine moral progress.",
        "domain": "ethics",
        "controversy_level": "medium"
    },
    "victim_perspective": {
        "definition": "Ethical analysis centered on those who suffer harm rather than those who benefit from transformation after harm.",
        "domain": "ethics",
        "controversy_level": "medium"
    },
    "domain_confusion": {
        "definition": "Applying frameworks from one context (e.g., therapy after harm) to another context (e.g., preventing ongoing harm) where they don't fit.",
        "domain": "epistemology",
        "controversy_level": "low"
    },
    "dialectic": {
        "definition": "A method of argumentation through thesis, antithesis, and synthesis; productive disagreement that generates new understanding.",
        "domain": "epistemology",
        "controversy_level": "low"
    }
}


def load_claims():
    """Load the extracted claims."""
    with open(DATA_DIR / "claims.json", "r") as f:
        return json.load(f)


def load_ontology():
    """Load the ontological analysis."""
    with open(DATA_DIR / "ontology.json", "r") as f:
        return json.load(f)


def load_flow():
    """Load the flow analysis."""
    with open(DATA_DIR / "flow.json", "r") as f:
        return json.load(f)


def extract_concept_usage(claims_data):
    """Extract which concepts each speaker uses and how."""
    concept_usage = defaultdict(lambda: {"marcus": [], "demartini": []})

    for claim in claims_data["claims"]:
        speaker = claim["speaker"]
        claim_id = claim["id"]

        for concept in claim.get("related_concepts", []):
            text = claim["text"]
            if len(text) > 100:
                text = text[:100] + "..."
            concept_usage[concept][speaker].append({
                "claim_id": claim_id,
                "text": text
            })

    return concept_usage


def make_link(text):
    """Make a wiki link from a concept key."""
    return "[[" + text.replace("_", " ").title() + "]]"


def generate_concept_entry(concept_key, concept_data, usage_data, claims_data):
    """Generate a wiki entry for a concept."""

    title = concept_key.replace("_", " ").title()

    # Find related claims
    related_claims = []
    for claim in claims_data["claims"]:
        if concept_key in claim.get("related_concepts", []):
            related_claims.append(claim["id"])

    # Build Marcus and Demartini usage sections
    marcus_usage = usage_data.get("marcus", [])
    demartini_usage = usage_data.get("demartini", [])

    marcus_lines = []
    if marcus_usage:
        marcus_lines.append("Marcus invokes this concept in his arguments:")
        marcus_lines.append("")
        for u in marcus_usage[:3]:
            marcus_lines.append(f"- **{u['claim_id']}**: \"{u['text']}\"")
    else:
        marcus_lines.append("Marcus does not directly invoke this concept.")

    demartini_lines = []
    if demartini_usage:
        demartini_lines.append("Demartini invokes this concept in his arguments:")
        demartini_lines.append("")
        for u in demartini_usage[:3]:
            demartini_lines.append(f"- **{u['claim_id']}**: \"{u['text']}\"")
    else:
        demartini_lines.append("Demartini does not directly invoke this concept.")

    # Related concepts
    related_concept_links = []
    for c in list(CONCEPTS.keys())[:5]:
        if c != concept_key:
            related_concept_links.append(f"- {make_link(c)}")

    # Related claim links
    claim_links = [f"- [[{c}]]" for c in related_claims]

    both = "both speakers" if marcus_usage and demartini_usage else "Marcus" if marcus_usage else "Demartini"

    lines = [
        "---",
        "type: concept",
        f'title: "{title}"',
        "aliases: []",
        "tradition:",
        "speaker_usage:",
        f"  marcus: {len(marcus_usage)}",
        f"  demartini: {len(demartini_usage)}",
        f"controversy_level: {concept_data.get('controversy_level', 'medium')}",
        f"domain: {concept_data.get('domain', 'philosophy')}",
        f"related_claims: {json.dumps(related_claims)}",
        "---",
        "",
        f"# {title}",
        "",
        "## Definition",
        "",
        concept_data.get('definition', 'Definition pending analysis.'),
        "",
        "",
        "## In This Debate",
        "",
        f"This concept appears {len(related_claims)} times across the debate, invoked by {both}.",
        "",
        "",
        "## Marcus's Usage",
        "",
    ]
    lines.extend(marcus_lines)
    lines.extend([
        "",
        "",
        "## Demartini's Usage",
        "",
    ])
    lines.extend(demartini_lines)
    lines.extend([
        "",
        "",
        "## Philosophical Context",
        "",
        f"Domain: **{concept_data.get('domain', 'philosophy').title()}**",
        "",
        "This concept has roots in various philosophical traditions and plays a key role in understanding the tension between the speakers' worldviews.",
        "",
        "",
        "## Related Concepts",
        "",
    ])
    lines.extend(related_concept_links[:5])
    lines.extend([
        "",
        "",
        "## Key Claims Involving This Concept",
        "",
    ])
    lines.extend(claim_links)
    lines.extend([
        "",
        "",
        "---",
        "",
        "*Part of the [[Dialectical Topology]] wiki layer.*",
    ])

    return "\n".join(lines)


def generate_thinker_entry(thinker_key, thinker_data, claims_data):
    """Generate a wiki entry for a thinker."""

    name = thinker_data["name"]

    # Find which claims reference this thinker (via warrants)
    marcus_refs = []
    demartini_refs = []

    for claim in claims_data["claims"]:
        warrants_text = " ".join(claim.get("warrants", []))
        check_name = thinker_key.replace("_", " ")
        if thinker_key in warrants_text.lower() or check_name in warrants_text.lower():
            if claim["speaker"] == "marcus":
                marcus_refs.append(claim)
            else:
                demartini_refs.append(claim)

    # Key ideas formatted
    key_ideas_lines = []
    for idea in thinker_data.get('key_ideas', []):
        key_ideas_lines.append(f"- **{idea}**")

    # Marcus citations
    marcus_lines = []
    if marcus_refs:
        for c in marcus_refs[:2]:
            text = c['text'][:80]
            marcus_lines.append(f"- **{c['id']}**: Uses {name}'s ideas to argue: \"{text}...\"")
    else:
        marcus_lines.append("Marcus does not directly cite this thinker.")

    # Demartini citations
    demartini_lines = []
    if demartini_refs:
        for c in demartini_refs[:2]:
            text = c['text'][:80]
            demartini_lines.append(f"- **{c['id']}**: Uses {name}'s ideas to argue: \"{text}...\"")
    else:
        demartini_lines.append("Demartini does not directly cite this thinker.")

    # Associated concepts
    concept_links = []
    for idea in thinker_data.get('key_ideas', [])[:3]:
        formatted = idea.replace(' ', '_').lower().replace('_', ' ').title()
        concept_links.append(f"- [[{formatted}]]")

    invoked = []
    if marcus_refs:
        invoked.append("marcus")
    if demartini_refs:
        invoked.append("demartini")

    both_text = "by both speakers" if marcus_refs and demartini_refs else "by Marcus" if marcus_refs else "by Demartini" if demartini_refs else "implicitly"
    key_ideas_short = ', '.join(thinker_data.get('key_ideas', ['philosophy'])[:2])

    tradition_link = make_link(thinker_data.get('tradition', 'philosophy'))

    lines = [
        "---",
        "type: thinker",
        f'name: "{name}"',
        f"tradition: {thinker_data.get('tradition', '')}",
        f'era: "{thinker_data.get("era", "")}"',
        f"key_works: {json.dumps(thinker_data.get('key_works', []))}",
        f"key_ideas: {json.dumps(thinker_data.get('key_ideas', []))}",
        f"invoked_by: {json.dumps(invoked)}",
        "---",
        "",
        f"# {name}",
        "",
        "## Background",
        "",
        f"{name} ({thinker_data.get('era', 'dates unknown')}) is referenced in this debate for their contributions to philosophy and ethics.",
        "",
        "",
        "## Key Ideas",
        "",
    ]
    lines.extend(key_ideas_lines)
    lines.extend([
        "",
        "",
        "## Relevance to This Debate",
        "",
        f"{name} is invoked {both_text} to support arguments about {key_ideas_short}.",
        "",
        "",
        "## How They're Cited",
        "",
        "### Marcus",
        "",
    ])
    lines.extend(marcus_lines)
    lines.extend([
        "",
        "",
        "### Demartini",
        "",
    ])
    lines.extend(demartini_lines)
    lines.extend([
        "",
        "",
        "## Associated Concepts",
        "",
    ])
    lines.extend(concept_links)
    lines.extend([
        "",
        "",
        "## Associated Tradition",
        "",
        f"- {tradition_link}",
        "",
        "",
        "---",
        "",
        "*Part of the [[Dialectical Topology]] wiki layer.*",
    ])

    return "\n".join(lines)


def generate_framework_entry(framework_key, framework_data, claims_data):
    """Generate a wiki entry for a framework."""

    name = framework_data["name"]

    # Principles
    principle_lines = []
    for i, p in enumerate(framework_data.get('key_principles', []), 1):
        principle_lines.append(f"{i}. **{p}**")

    # Related frameworks
    related_lines = []
    for f in list(FRAMEWORKS.keys())[:4]:
        if f != framework_key:
            related_lines.append(f"- {make_link(f)}")

    lines = [
        "---",
        "type: framework",
        f'name: "{name}"',
        f'creator: "{framework_data.get("creator", "Unknown")}"',
        f'purpose: "{framework_data.get("purpose", "")}"',
        "---",
        "",
        f"# {name}",
        "",
        "## Overview",
        "",
        f"**Purpose**: {framework_data.get('purpose', 'To be analyzed.')}",
        "",
        f"**Origin**: {framework_data.get('creator', 'Unknown')}",
        "",
        "",
        "## Core Principles",
        "",
    ]
    lines.extend(principle_lines)
    lines.extend([
        "",
        "",
        "## Role in This Debate",
        "",
        "This framework is central to understanding the methodological differences between the speakers. It represents a specific approach to handling the phenomena under discussion.",
        "",
        "",
        "## Relationship to Other Frameworks",
        "",
    ])
    lines.extend(related_lines)
    lines.extend([
        "",
        "",
        "## Claims That Invoke This Framework",
        "",
        "<!-- Claims that depend on or reference this framework -->",
        "",
        "",
        "---",
        "",
        "*Part of the [[Dialectical Topology]] wiki layer.*",
    ])

    return "\n".join(lines)


def generate_tradition_entry(tradition_key, tradition_data, claims_data):
    """Generate a wiki entry for a tradition."""

    name = tradition_data["name"]

    # Key figures
    figure_lines = [f"- [[{fig}]]" for fig in tradition_data.get('key_figures', [])]

    lines = [
        "---",
        "type: tradition",
        f'name: "{name}"',
        f'period: "{tradition_data.get("period", "Unknown")}"',
        f'core_claim: "{tradition_data.get("core_claim", "")}"',
        "---",
        "",
        f"# {name}",
        "",
        "## Overview",
        "",
        f"**Period**: {tradition_data.get('period', 'Unknown')}",
        "",
        f"**Core Claim**: {tradition_data.get('core_claim', 'To be articulated.')}",
        "",
        "",
        "## Key Figures",
        "",
    ]
    lines.extend(figure_lines)
    lines.extend([
        "",
        "",
        "## Relevance to This Debate",
        "",
        "This tradition provides conceptual resources and historical precedents that inform the positions taken in the Marcus–Demartini debate.",
        "",
        "",
        "## Concepts from This Tradition",
        "",
        "<!-- Concepts in our wiki that originate from or connect to this tradition -->",
        "",
        "",
        "## Thinkers in This Tradition",
        "",
    ])
    lines.extend(figure_lines)
    lines.extend([
        "",
        "",
        "---",
        "",
        "*Part of the [[Dialectical Topology]] wiki layer.*",
    ])

    return "\n".join(lines)


def generate_claim_entry(claim):
    """Generate a wiki entry for a claim."""

    # Warrants
    warrant_lines = [f"- {w}" for w in claim.get('warrants', [])]

    # Evidence
    evidence_lines = [f"- {e}" for e in claim.get('evidence', [])]

    # Related concepts
    concept_lines = [f"- {make_link(c)}" for c in claim.get('related_concepts', [])]

    lines = [
        "---",
        "type: claim",
        f'id: "{claim["id"]}"',
        f'speaker: "{claim["speaker"]}"',
        f'claim_type: "{claim["type"]}"',
        f"timestamp: {claim['timestamp']}",
        f'engagement_level: "{claim.get("engagement_level", "supporting")}"',
        "---",
        "",
        f"# {claim['id']}: {claim['speaker'].title()}",
        "",
        "## The Claim",
        "",
        f'> "{claim["text"]}"',
        "",
        "",
        "## Context",
        "",
        f"**Speaker**: {claim['speaker'].title()}",
        f"**Timestamp**: {claim['timestamp']} seconds",
        f"**Engagement Level**: {claim.get('engagement_level', 'supporting')}",
        f"**Claim Type**: {claim['type'].title()}",
        "",
        "",
        "## Supporting Warrants",
        "",
    ]
    lines.extend(warrant_lines if warrant_lines else ["- None cited"])
    lines.extend([
        "",
        "",
        "## Evidence Cited",
        "",
    ])
    lines.extend(evidence_lines if evidence_lines else ["- None cited"])
    lines.extend([
        "",
        "",
        "## Related Concepts",
        "",
    ])
    lines.extend(concept_lines if concept_lines else ["- None linked"])
    lines.extend([
        "",
        "",
        "## Responses to This Claim",
        "",
        "<!-- Claims that directly respond to or counter this claim -->",
        "",
        "",
        "---",
        "",
        "*Part of the [[Dialectical Topology]] wiki layer.*",
    ])

    return "\n".join(lines)


def main():
    print("=" * 60)
    print("  Wiki Generation - Dialectical Topology")
    print("=" * 60)

    # Load data
    print("\nLoading source data...")
    claims_data = load_claims()
    ontology_data = load_ontology()
    flow_data = load_flow()

    # Extract concept usage patterns
    concept_usage = extract_concept_usage(claims_data)

    # Ensure wiki directories exist
    for entity_type in ["concepts", "thinkers", "frameworks", "traditions", "claims"]:
        (WIKI_DIR / entity_type).mkdir(parents=True, exist_ok=True)

    # Track generated entities
    generated = {
        "concepts": 0,
        "thinkers": 0,
        "frameworks": 0,
        "traditions": 0,
        "claims": 0
    }

    # Generate concept entries
    print("\nGenerating concept entries...")
    for concept_key, concept_data in CONCEPTS.items():
        entry = generate_concept_entry(
            concept_key,
            concept_data,
            concept_usage.get(concept_key, {}),
            claims_data
        )
        filename = concept_key.replace("_", "-") + ".md"
        with open(WIKI_DIR / "concepts" / filename, "w") as f:
            f.write(entry)
        generated["concepts"] += 1
    print(f"  Generated {generated['concepts']} concept entries")

    # Generate thinker entries
    print("\nGenerating thinker entries...")
    for thinker_key, thinker_data in THINKERS.items():
        entry = generate_thinker_entry(thinker_key, thinker_data, claims_data)
        filename = thinker_key.replace("_", "-") + ".md"
        with open(WIKI_DIR / "thinkers" / filename, "w") as f:
            f.write(entry)
        generated["thinkers"] += 1
    print(f"  Generated {generated['thinkers']} thinker entries")

    # Generate framework entries
    print("\nGenerating framework entries...")
    for framework_key, framework_data in FRAMEWORKS.items():
        entry = generate_framework_entry(framework_key, framework_data, claims_data)
        filename = framework_key.replace("_", "-") + ".md"
        with open(WIKI_DIR / "frameworks" / filename, "w") as f:
            f.write(entry)
        generated["frameworks"] += 1
    print(f"  Generated {generated['frameworks']} framework entries")

    # Generate tradition entries
    print("\nGenerating tradition entries...")
    for tradition_key, tradition_data in TRADITIONS.items():
        entry = generate_tradition_entry(tradition_key, tradition_data, claims_data)
        filename = tradition_key.replace("_", "-") + ".md"
        with open(WIKI_DIR / "traditions" / filename, "w") as f:
            f.write(entry)
        generated["traditions"] += 1
    print(f"  Generated {generated['traditions']} tradition entries")

    # Generate claim entries
    print("\nGenerating claim entries...")
    for claim in claims_data["claims"]:
        entry = generate_claim_entry(claim)
        filename = claim["id"].lower() + ".md"
        with open(WIKI_DIR / "claims" / filename, "w") as f:
            f.write(entry)
        generated["claims"] += 1
    print(f"  Generated {generated['claims']} claim entries")

    # Generate index
    print("\nGenerating wiki index...")
    index = {
        "generated_at": datetime.now().isoformat(),
        "source": "Aubrey Marcus Podcast #521",
        "entities": {
            "concepts": list(CONCEPTS.keys()),
            "thinkers": list(THINKERS.keys()),
            "frameworks": list(FRAMEWORKS.keys()),
            "traditions": list(TRADITIONS.keys()),
            "claims": [c["id"] for c in claims_data["claims"]]
        },
        "counts": generated
    }

    with open(WIKI_DIR / "index.json", "w") as f:
        json.dump(index, f, indent=2)

    # Summary
    total = sum(generated.values())
    print("\n" + "=" * 60)
    print("  Wiki Generation Complete")
    print("=" * 60)
    print(f"\n  Total entities generated: {total}")
    print(f"    - Concepts: {generated['concepts']}")
    print(f"    - Thinkers: {generated['thinkers']}")
    print(f"    - Frameworks: {generated['frameworks']}")
    print(f"    - Traditions: {generated['traditions']}")
    print(f"    - Claims: {generated['claims']}")
    print(f"\n  Output: {WIKI_DIR}")


if __name__ == "__main__":
    main()
