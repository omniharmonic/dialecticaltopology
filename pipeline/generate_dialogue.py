#!/usr/bin/env python3
"""
generate_dialogue.py - Create steel-manned generative dialogue

Generates a hypothetical dialogue where each speaker's position is presented
in its strongest possible form, informed by the ontological analysis and
claims extracted from the original conversation.

This produces the Steel Man Arena content for the frontend.

Features:
1. Pre-populated rounds covering key debate dimensions
2. API spec for Google Gemini integration to generate custom dialogues
3. User prompt templates for generating new rounds on custom topics
"""

import json
from pathlib import Path
from datetime import datetime

# Paths
DATA_DIR = Path(__file__).parent.parent / "data" / "processed"
OUTPUT_DIR = Path(__file__).parent.parent / "data" / "processed"


def load_data():
    """Load all analysis data."""
    with open(DATA_DIR / "claims.json", "r") as f:
        claims = json.load(f)
    with open(DATA_DIR / "ontology.json", "r") as f:
        ontology = json.load(f)
    with open(DATA_DIR / "flow.json", "r") as f:
        flow = json.load(f)
    return claims, ontology, flow


def generate_steel_manned_dialogue():
    """
    Generate a dialogue where each position is steel-manned.

    Based on the ontological analysis, this dialogue:
    1. Presents each speaker's strongest arguments
    2. Acknowledges the validity in the other's position
    3. Seeks genuine synthesis where possible
    4. Clarifies domain distinctions (therapeutic vs moral)
    """

    dialogue = {
        "metadata": {
            "type": "steel_manned_dialogue",
            "page_title": "Steel Man Arena",
            "source": "Aubrey Marcus Podcast #521 - Analysis",
            "generated_by": "Claude Code",
            "generated_at": datetime.now().isoformat(),
            "purpose": "Present each position in its strongest form and explore synthesis",
            "description": "A generative space where both philosophical positions are steel-manned—presented in their strongest possible form—and synthesis is attempted. Users can generate custom rounds on any topic using the Gemini API integration."
        },
        "speakers": {
            "demartini_steelmanned": {
                "name": "Demartini (Steel-Manned)",
                "color": "#14b8a6",
                "core_position": "Evil is an epistemological category, not an ontological one. What we call 'evil' reflects incomplete perception. Therapeutic work reveals the hidden order in apparent chaos."
            },
            "marcus_steelmanned": {
                "name": "Marcus (Steel-Manned)",
                "color": "#f59e0b",
                "core_position": "Some acts constitute real harm that demands moral response. While understanding is valuable, action against ongoing harm is a sacred obligation. The victim's perspective cannot be dissolved."
            },
            "synthesis": {
                "name": "Synthesis",
                "color": "#8b5cf6",
                "core_position": "Both frameworks have validity in their proper domains. Therapeutic insight applies after harm; moral action applies during harm. Integration requires temporal awareness."
            }
        },
        "rounds": []
    }

    # Round 1: The Nature of Evil
    dialogue["rounds"].append({
        "id": 1,
        "topic": "The Nature of Evil",
        "dimension": "nature_of_evil",
        "exchanges": [
            {
                "speaker": "demartini_steelmanned",
                "content": "Let me present my position in its strongest form: I'm not claiming that suffering doesn't matter or that harm isn't real. What I'm claiming is that our *labeling* of events as 'evil' reflects our incomplete perception. When I've worked with trauma survivors, those who find the hidden benefits—not denying the pain, but seeing the full picture—achieve genuine liberation. The label 'evil' keeps people trapped as victims. Heraclitus understood this: there's a hidden order in apparent chaos, a logos that our emotional reactions obscure.",
                "warrants": ["Therapeutic outcomes", "Heraclitean philosophy", "Neurological research on perception"],
                "strength": "Empirically grounded in therapeutic outcomes; philosophically coherent with nondual traditions"
            },
            {
                "speaker": "marcus_steelmanned",
                "content": "I want to meet that argument at its strongest. You're right that finding meaning after trauma aids healing—Frankl showed this in the camps. But I'm making a different claim: there exists a category of acts—intentional torture of innocents, abuse of the vulnerable—that ARE harmful regardless of any subsequent meaning-making. When I witness my wife being assaulted, my obligation to intervene doesn't arise from incomplete perception. It arises from a real event causing real harm to a real person. The body knows this before the mind constructs explanations. This somatic knowing isn't primitive—it's foundational.",
                "warrants": ["Somatic epistemology", "Frankl's meaning-making", "Embodied cognition research"],
                "strength": "Grounds moral knowledge in phenomenology; distinguishes meaning-making from moral reality"
            },
            {
                "speaker": "synthesis",
                "content": "These positions are more compatible than they appear when we introduce temporal framing. Demartini's framework excels AFTER harm has occurred—helping survivors integrate experience and avoid permanent victimhood. Marcus's framework excels DURING or BEFORE harm—grounding the obligation to prevent and intervene. The apparent contradiction dissolves when we recognize they're answering different questions: 'How do we heal?' vs 'How do we act?' Both answers can be true in their domains.",
                "insight": "Domain clarification: therapeutic (after) vs moral (during/before)"
            }
        ]
    })

    # Round 2: Moral Relativism
    dialogue["rounds"].append({
        "id": 2,
        "topic": "Cultural Variation and Moral Truth",
        "dimension": "moral_relativism",
        "exchanges": [
            {
                "speaker": "demartini_steelmanned",
                "content": "Montaigne traveled the world seeking universal moral values and found none. What counts as acceptable—age of marriage, treatment of enemies, relation to nature—varies radically across cultures and times. The absolutist position is historically myopic: our current moral intuitions would horrify our ancestors, and ours will likely horrify our descendants. The claim 'this is universally wrong' has been made about countless acts that later cultures found acceptable, and vice versa. Epistemic humility demands situational ethics.",
                "warrants": ["Historical moral variation", "Montaigne's travels", "Epistemic humility"],
                "strength": "Empirically grounded in cultural anthropology; epistemically cautious"
            },
            {
                "speaker": "marcus_steelmanned",
                "content": "You've accurately identified moral variation. But variation doesn't entail arbitrariness. Consider: the Zoroastrians abolished child sacrifice. Was that merely cultural preference, or genuine moral progress? I'd argue the latter. Some moral changes track something real—the expansion of moral circle, the recognition of suffering in previously excluded groups. The fact that we're BETTER at recognizing harm now doesn't mean harm was ever acceptable—it means we were previously blind. Moral evolution is real, and it has a direction: toward less suffering, more flourishing.",
                "warrants": ["Moral evolution evidence", "Expanding moral circle", "Suffering as cross-cultural datum"],
                "strength": "Preserves historical humility while grounding progress; suffering as Schelling point"
            },
            {
                "speaker": "synthesis",
                "content": "Both speakers identify something real. Demartini is right that confident moral pronouncements often reflect cultural bias. Marcus is right that some moral changes constitute genuine progress. The synthesis: moral knowledge is like scientific knowledge—fallible, culturally embedded, but tracking something real. We can be humble about our current views while still recognizing that torture is wrong in a way that food preferences are not. The degree of certainty should match the degree of evident harm.",
                "insight": "Moral knowledge as fallibilist but truth-tracking"
            }
        ]
    })

    # Round 3: Therapeutic vs Moral Priority
    dialogue["rounds"].append({
        "id": 3,
        "topic": "When Understanding and Action Conflict",
        "dimension": "therapeutic_vs_moral",
        "exchanges": [
            {
                "speaker": "demartini_steelmanned",
                "content": "Here's my strongest case: a pedophile came to me for help. Rather than simply condemning him, I asked questions. What emerged was severe childhood abuse that had never been addressed. By understanding the root cause—not condoning the behavior—we prevented future harm. Judgment would have left him trapped in a cycle. The therapeutic approach—asking 'why' rather than declaring 'wrong'—actually prevents more harm than moral condemnation. Understanding IS prevention. The 'evil' frame closes inquiry exactly where it should open.",
                "warrants": ["Prevention through understanding", "Therapeutic outcomes", "Root cause analysis"],
                "strength": "Consequentialist argument for therapeutic approach; understanding as prevention"
            },
            {
                "speaker": "marcus_steelmanned",
                "content": "I can hold two truths simultaneously: understanding root causes is valuable, AND some acts are wrong regardless of cause. The therapeutic work you describe is valuable precisely because the acts are genuinely harmful—not just 'perceived as harmful.' The child victim doesn't benefit from our understanding of the perpetrator's childhood. They needed an adult to intervene, to stop the harm, to declare 'this is wrong' and act accordingly. Ho'oponopono teaches us to locate the reprehensible in ourselves—and I do that work. But internal transformation doesn't replace external obligation. We need both.",
                "warrants": ["Victim-centered ethics", "Ho'oponopono integration", "Both/and framing"],
                "strength": "Integrates therapeutic value with moral priority; victim-centered focus"
            },
            {
                "speaker": "synthesis",
                "content": "The deepest insight emerges here: Demartini and Marcus are both right because they're operating in different temporal frames. The therapeutic frame ('understand to prevent') applies to: past harm needing integration, future harm needing prevention through root cause analysis, perpetrators needing transformation. The moral frame ('act to stop') applies to: ongoing harm requiring intervention, social signals establishing boundaries, victims needing validation. The synthesis isn't 'balance' but 'temporal appropriateness'—knowing which frame fits which moment.",
                "insight": "Temporal framing: therapeutic (past/future) vs moral (present)"
            }
        ]
    })

    # Round 4: The Value of Life
    dialogue["rounds"].append({
        "id": 4,
        "topic": "Is Life Intrinsically Good?",
        "dimension": "value_of_life",
        "exchanges": [
            {
                "speaker": "demartini_steelmanned",
                "content": "Biology reveals a truth we resist: life and death are paired. Your body is simultaneously building and destroying—mitosis and apoptosis in perfect balance. Without cellular death, you'd be a tumor. Evolution requires extinction; new species emerge from the death of old ones. The Buddhist insight is relevant: for some beings, existence is suffering. To declare 'life is good' universally is to ignore those for whom it is torture. Life is neither intrinsically good nor bad—it simply IS, containing both. Our preference for life is understandable but not cosmic.",
                "warrants": ["Biological balance", "Evolutionary necessity", "Buddhist suffering framework"],
                "strength": "Biologically grounded; avoids facile optimism; respects suffering"
            },
            {
                "speaker": "marcus_steelmanned",
                "content": "I grant the biological point about balance. But notice what you're doing: using the structure of life to make claims about its value. That's a category error. The universe has been generating ever-increasing complexity—more life, more consciousness, more capacity for love and beauty. Something is driving toward this. When I say 'life is good,' I don't mean every moment of every life is pleasant. I mean: the cosmic drive toward complexity, consciousness, connection—this has value that transcends individual suffering. We participate in something meaningful.",
                "warrants": ["Cosmic teleology", "Increasing complexity", "Participatory meaning"],
                "strength": "Teleological argument; distinguishes structure from value"
            },
            {
                "speaker": "synthesis",
                "content": "This may be the deepest disagreement—a genuine axiological divide. Demartini's view is more Buddhist (existence contains suffering; attachment to life causes pain). Marcus's view is more theistic (creation is good; we participate in meaningful unfolding). No argument can resolve this without shared metaphysical premises. However, both can agree: reducing unnecessary suffering is good. Both can work toward flourishing without resolving whether flourishing has 'intrinsic' value. Practical convergence despite metaphysical divergence.",
                "insight": "Axiological bedrock; practical convergence despite metaphysical divergence"
            }
        ]
    })

    # Round 5: The Breaking Point Revisited
    dialogue["rounds"].append({
        "id": 5,
        "topic": "Upsides to Tragedy—Can We Go There?",
        "dimension": "response_to_harm",
        "exchanges": [
            {
                "speaker": "demartini_steelmanned",
                "content": "This is where I was most misunderstood. When I said 'there are upsides to the murder of children,' I wasn't celebrating murder. I was reporting what survivors told me. The mother whose child died in Oklahoma City said it was 'one of the greatest things that ever happened'—not the death, but the transformation it catalyzed. She found purpose, depth, connection she never had. I'm not saying her child's death was good. I'm saying human beings have a remarkable capacity to find meaning in devastation. Denying that capacity keeps people trapped.",
                "warrants": ["Survivor testimony", "Meaning-making capacity", "Post-traumatic growth research"],
                "strength": "Empirically grounded in survivor testimony; defends human resilience"
            },
            {
                "speaker": "marcus_steelmanned",
                "content": "And here's where I nearly stopped the conversation. Not because I deny post-traumatic growth—Frankl documented it powerfully. But because there's a voice that must be included: the murdered child's. The child doesn't get to find meaning. The child's life was taken. The family's growth, however real, doesn't redeem the theft of that life. If we speak only of the living's transformation, we erase the victim. A complete ethics must hold both: the surviving family's capacity for meaning AND the irreducible wrong done to the victim. Both are real. Neither cancels the other.",
                "warrants": ["Victim-centered completeness", "Irreversibility of death", "Both/and ethics"],
                "strength": "Includes the victim's voice; refuses false redemption narrative"
            },
            {
                "speaker": "synthesis",
                "content": "This exchange reveals why the conversation nearly collapsed—and why it shouldn't have. Both speakers are making valid claims about different subjects. Demartini speaks of the living: they CAN find meaning; denying this is cruel. Marcus speaks of the dead: their loss is real; claiming 'upsides' erases them. A complete ethics includes both. The mother's growth is real AND her child's death was wrong. The survivor's meaning-making is valuable AND it doesn't make the original harm acceptable. The word 'upside' was the problem—it sounded like moral justification when it was actually psychological observation.",
                "insight": "Language precision: psychological observation vs moral justification"
            }
        ]
    })

    # Gemini API Integration Spec
    dialogue["gemini_integration"] = {
        "description": "Configuration for Google Gemini API to generate custom dialogue rounds",
        "api_endpoint": "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
        "system_prompts": {
            "demartini_voice": """You are presenting Dr. John Demartini's philosophical position in its STRONGEST possible form (steel-manned).

Core tenets:
- Evil is an epistemological category (incomplete perception), not ontological (real force)
- Every event has both upsides and downsides - unity of opposites
- Therapeutic dissolution: finding the hidden order frees people from victimhood
- Moral labels prevent understanding; understanding enables prevention
- Cultural relativism: no universal moral values exist across all times and places
- The highest awareness sees events without emotional charge

When responding to a topic:
1. Present the most intellectually rigorous version of this position
2. Ground arguments in therapeutic experience and philosophical precedent
3. Acknowledge the grain of truth in opposing views
4. Aim for insight, not winning""",

            "marcus_voice": """You are presenting Aubrey Marcus's philosophical position in its STRONGEST possible form (steel-manned).

Core tenets:
- Some acts ARE fundamentally wrong regardless of perspective (torture, abuse)
- Moral knowledge is embodied - we "know in our body" what's wrong
- We have a sacred obligation to act against evil, not just understand it
- The victim's perspective cannot be dissolved through the perpetrator's healing
- Moral evolution is real - ending child sacrifice was progress, not preference
- Both understanding AND moral judgment can coexist (both/and, not either/or)

When responding to a topic:
1. Present the most intellectually rigorous version of this position
2. Ground arguments in somatic epistemology and lived experience
3. Acknowledge the grain of truth in opposing views
4. Aim for insight, not winning""",

            "synthesis_voice": """You are the Synthesis voice, identifying genuine common ground and clarifying the structure of disagreement.

Your role:
- Identify where both positions are correct in different domains or time frames
- Clarify the temporal framing: therapeutic (after harm) vs moral (during harm)
- Note domain confusion when frameworks are misapplied
- Distinguish psychological observations from moral judgments
- Identify irreducible disagreements vs resolvable misunderstandings
- Suggest practical convergence even where metaphysical divergence remains

Be honest about genuine disagreements - don't force false synthesis."""
        },
        "prompt_template": """TOPIC: {user_topic}

Generate a Steel Man Arena round on this topic with three exchanges:

1. DEMARTINI (Steel-Manned): Present the strongest version of Demartini's position on this topic
2. MARCUS (Steel-Manned): Present the strongest version of Marcus's position on this topic
3. SYNTHESIS: Identify common ground, clarify the structure of disagreement, and note what can/cannot be resolved

Format your response as JSON:
{{
  "topic": "{user_topic}",
  "exchanges": [
    {{
      "speaker": "demartini_steelmanned",
      "content": "...",
      "warrants": ["...", "..."],
      "strength": "..."
    }},
    {{
      "speaker": "marcus_steelmanned",
      "content": "...",
      "warrants": ["...", "..."],
      "strength": "..."
    }},
    {{
      "speaker": "synthesis",
      "content": "...",
      "insight": "..."
    }}
  ]
}}""",
        "example_topics": [
            "Is forgiveness always possible or appropriate?",
            "Should we teach children that some things are evil?",
            "How should we respond to systemic injustice?",
            "Can trauma ever be 'good' for someone?",
            "Is moral relativism dangerous?",
            "What's the relationship between understanding and accountability?",
            "Should victims be expected to forgive their abusers?",
            "Is there a cosmic purpose to suffering?"
        ],
        "community_rounds": []  # Populated by user submissions
    }

    # Final Synthesis
    dialogue["final_synthesis"] = {
        "title": "What We Learned",
        "content": """Both speakers arrived at the conversation with coherent, defensible worldviews. The apparent irreconcilability stemmed from:

**1. Domain Confusion**
Demartini operates primarily as a therapist—his framework optimizes for helping people heal AFTER harm. Marcus operates primarily as a moral agent—his framework optimizes for responding DURING harm. Both are valid in their domains; problems arise when either is universalized.

**2. Temporal Framing**
- BEFORE harm: Prevention through understanding (Demartini) AND moral education about wrong (Marcus)
- DURING harm: Intervention, action, stopping harm (Marcus's emphasis)
- AFTER harm: Meaning-making, integration, avoiding victimhood (Demartini's emphasis)

**3. Epistemological Difference**
Demartini grounds knowledge in therapeutic outcomes and nondual philosophy. Marcus grounds knowledge in somatic experience and moral intuition. Both epistemologies have value; neither is complete alone.

**4. The Irreducible Disagreement**
Whether evil has ontological status (is real) or merely epistemological status (is a label we apply) may not be resolvable. However, both can agree: unnecessary suffering should be reduced, understanding aids prevention, victims deserve protection, and survivors can find meaning.

**The conversation's value was not in resolving the disagreement but in clarifying its structure.** Future discourse can build on this map.""",
        "convergence_points": [
            "Understanding root causes helps prevent harm",
            "Survivors can find meaning in tragedy (post-traumatic growth)",
            "Action against ongoing harm is appropriate",
            "Moral intuitions deserve respect even when fallible",
            "Both therapeutic and moral frameworks have valid applications"
        ],
        "irreducible_tensions": [
            "Ontological vs epistemological status of evil",
            "Whether life has intrinsic positive value",
            "Whether any act is absolutely wrong in all contexts"
        ]
    }

    return dialogue


def main():
    print("=" * 60)
    print("  Generative Dialogue - Steel-Manned Debate")
    print("=" * 60)

    # Load analysis data
    print("\nLoading analysis data...")
    claims, ontology, flow = load_data()

    # Generate dialogue
    print("\nGenerating steel-manned dialogue...")
    dialogue = generate_steel_manned_dialogue()

    # Save
    output_path = OUTPUT_DIR / "dialogue.json"
    with open(output_path, "w") as f:
        json.dump(dialogue, f, indent=2)

    print(f"\nDialogue saved to: {output_path}")
    print(f"\n  Rounds: {len(dialogue['rounds'])}")
    print(f"  Speakers: {len(dialogue['speakers'])}")
    print(f"  Convergence points: {len(dialogue['final_synthesis']['convergence_points'])}")
    print(f"  Irreducible tensions: {len(dialogue['final_synthesis']['irreducible_tensions'])}")

    print("\n" + "=" * 60)
    print("  Generative Dialogue Complete")
    print("=" * 60)


if __name__ == "__main__":
    main()
