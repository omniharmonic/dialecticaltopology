#!/usr/bin/env python3
"""
Create larger semantic chunks from the parsed transcript.
V2: Targets 600-1200 tokens per chunk (~2-3 minutes of speech)
for more meaningful, readable content.
"""

import json
from pathlib import Path
from datetime import datetime

def estimate_tokens(text: str) -> int:
    """Rough token estimate (words * 1.3 for English)."""
    return int(len(text.split()) * 1.3)

def create_chunks_v2(
    segments: list,
    min_tokens: int = 600,
    max_tokens: int = 1200,
    allow_cross_speaker: bool = True
) -> list:
    """
    Create larger, more meaningful chunks from segments.

    V2 Strategy:
    1. Target 2-3 minutes of content per chunk
    2. Allow cross-speaker merging for conversational flow
    3. Prefer splitting at natural topic boundaries (pauses, questions)
    4. Keep dialogue exchanges together when they form a coherent unit
    """

    chunks = []
    current_chunk = None

    for segment in segments:
        seg_tokens = estimate_tokens(segment['text'])

        if current_chunk is None:
            # Start first chunk
            current_chunk = {
                'id': len(chunks),
                'speakers': [segment['speaker']],
                'primary_speaker': segment['speaker'],
                'start_time': segment['start_time'],
                'end_time': segment['end_time'],
                'segments': [segment],
                'text': segment['text'],
                'segment_count': 1
            }
        else:
            current_tokens = estimate_tokens(current_chunk['text'])
            same_speaker = segment['speaker'] == current_chunk['segments'][-1]['speaker']

            # Decision: merge or split?
            should_merge = False

            if current_tokens + seg_tokens <= max_tokens:
                # Room to merge
                if same_speaker:
                    should_merge = True
                elif allow_cross_speaker and current_tokens < min_tokens:
                    # Include cross-speaker dialogue to hit minimum
                    should_merge = True
                elif allow_cross_speaker and current_tokens + seg_tokens <= max_tokens * 0.8:
                    # Still well under max, include for context
                    should_merge = True
            elif current_tokens < min_tokens and current_tokens + seg_tokens <= max_tokens * 1.5:
                # Force merge to hit minimum, but not beyond 1.5x max
                should_merge = True

            if should_merge:
                # Merge segment into current chunk
                if segment['speaker'] not in current_chunk['speakers']:
                    current_chunk['speakers'].append(segment['speaker'])
                current_chunk['text'] += '\n\n' + f"[{segment['speaker'].upper()}]: " + segment['text']
                current_chunk['end_time'] = segment['end_time']
                current_chunk['segments'].append(segment)
                current_chunk['segment_count'] += 1
            else:
                # Finalize current chunk and start new one
                chunks.append(finalize_chunk(current_chunk))
                current_chunk = {
                    'id': len(chunks),
                    'speakers': [segment['speaker']],
                    'primary_speaker': segment['speaker'],
                    'start_time': segment['start_time'],
                    'end_time': segment['end_time'],
                    'segments': [segment],
                    'text': segment['text'],
                    'segment_count': 1
                }

    # Don't forget the last chunk
    if current_chunk:
        chunks.append(finalize_chunk(current_chunk))

    return chunks

def finalize_chunk(chunk: dict) -> dict:
    """Finalize a chunk with computed metadata."""
    # Determine primary speaker (who spoke most)
    speaker_counts = {}
    for seg in chunk['segments']:
        speaker_counts[seg['speaker']] = speaker_counts.get(seg['speaker'], 0) + len(seg['text'])
    chunk['primary_speaker'] = max(speaker_counts, key=speaker_counts.get)

    # Compute duration
    chunk['duration'] = chunk['end_time'] - chunk['start_time']

    # Token estimate
    chunk['token_estimate'] = estimate_tokens(chunk['text'])

    # Time labels
    chunk['time_label'] = f"{int(chunk['start_time'] // 60)}:{int(chunk['start_time'] % 60):02d}"
    chunk['time_range'] = f"{chunk['time_label']} - {int(chunk['end_time'] // 60)}:{int(chunk['end_time'] % 60):02d}"

    # Clean up - remove raw segments to reduce file size
    del chunk['segments']

    return chunk

def analyze_chunks(chunks: list) -> dict:
    """Generate statistics about the chunks."""
    token_counts = [c['token_estimate'] for c in chunks]
    durations = [c['duration'] for c in chunks]

    return {
        'total_chunks': len(chunks),
        'total_tokens': sum(token_counts),
        'avg_tokens': sum(token_counts) / len(chunks) if chunks else 0,
        'min_tokens': min(token_counts) if token_counts else 0,
        'max_tokens': max(token_counts) if token_counts else 0,
        'avg_duration_seconds': sum(durations) / len(durations) if durations else 0,
        'total_duration': chunks[-1]['end_time'] - chunks[0]['start_time'] if chunks else 0
    }

def main():
    base_dir = Path(__file__).parent.parent
    input_path = base_dir / 'data' / 'processed' / 'transcript_diarized.json'
    output_path = base_dir / 'data' / 'processed' / 'chunks_v2.json'

    print(f"Loading parsed transcript: {input_path}")

    with open(input_path, 'r', encoding='utf-8') as f:
        transcript = json.load(f)

    segments = transcript['segments']
    print(f"Processing {len(segments)} segments...")

    # Create medium-sized chunks (targeting 60-80 chunks)
    chunks = create_chunks_v2(
        segments,
        min_tokens=300,
        max_tokens=600,
        allow_cross_speaker=True
    )
    stats = analyze_chunks(chunks)

    result = {
        'metadata': {
            'source': transcript['metadata']['source'],
            'created_at': datetime.now().isoformat(),
            'version': 'v2',
            'chunking_params': {
                'min_tokens': 300,
                'max_tokens': 600,
                'allow_cross_speaker': True
            },
            'statistics': stats
        },
        'chunks': chunks
    }

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"\nChunking complete!")
    print(f"  Total chunks: {stats['total_chunks']} (was 270 in v1)")
    print(f"  Token range: {stats['min_tokens']} - {stats['max_tokens']}")
    print(f"  Average tokens: {stats['avg_tokens']:.1f}")
    print(f"  Average duration: {stats['avg_duration_seconds']:.1f} seconds ({stats['avg_duration_seconds']/60:.1f} minutes)")
    print(f"\nOutput: {output_path}")

if __name__ == '__main__':
    main()
