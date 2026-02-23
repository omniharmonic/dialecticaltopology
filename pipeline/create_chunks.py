#!/usr/bin/env python3
"""
Create semantic chunks from the parsed transcript.
Respects speaker boundaries and targets 200-400 tokens per chunk.
"""

import json
from pathlib import Path
from datetime import datetime
import re

def estimate_tokens(text: str) -> int:
    """Rough token estimate (words * 1.3 for English)."""
    return int(len(text.split()) * 1.3)

def create_chunks(segments: list, min_tokens: int = 200, max_tokens: int = 500, aggressive_merge: bool = True) -> list:
    """
    Create chunks from segments, respecting speaker boundaries.

    Strategy:
    1. Never split mid-segment
    2. Never combine different speakers
    3. Combine adjacent same-speaker segments until we hit target size
    4. If a single segment exceeds max, keep it as-is (preserves semantic unit)
    """

    chunks = []
    current_chunk = None

    for segment in segments:
        seg_tokens = estimate_tokens(segment['text'])

        # Start new chunk if:
        # 1. No current chunk
        # 2. Different speaker
        # 3. Adding this would exceed max and current is already substantial
        if current_chunk is None:
            current_chunk = {
                'id': len(chunks),
                'speaker': segment['speaker'],
                'start_time': segment['start_time'],
                'end_time': segment['end_time'],
                'text': segment['text'],
                'segment_count': 1
            }
        elif segment['speaker'] != current_chunk['speaker']:
            # Speaker change - finalize current chunk and start new
            chunks.append(current_chunk)
            current_chunk = {
                'id': len(chunks),
                'speaker': segment['speaker'],
                'start_time': segment['start_time'],
                'end_time': segment['end_time'],
                'text': segment['text'],
                'segment_count': 1
            }
        else:
            # Same speaker - decide whether to merge or split
            current_tokens = estimate_tokens(current_chunk['text'])

            if current_tokens + seg_tokens <= max_tokens:
                # Merge
                current_chunk['text'] += ' ' + segment['text']
                current_chunk['end_time'] = segment['end_time']
                current_chunk['segment_count'] += 1
            elif current_tokens >= min_tokens:
                # Current chunk is big enough, start new one
                chunks.append(current_chunk)
                current_chunk = {
                    'id': len(chunks),
                    'speaker': segment['speaker'],
                    'start_time': segment['start_time'],
                    'end_time': segment['end_time'],
                    'text': segment['text'],
                    'segment_count': 1
                }
            else:
                # Current chunk is small but adding would exceed max
                # Merge anyway to avoid tiny chunks
                current_chunk['text'] += ' ' + segment['text']
                current_chunk['end_time'] = segment['end_time']
                current_chunk['segment_count'] += 1

    # Don't forget the last chunk
    if current_chunk:
        chunks.append(current_chunk)

    # Add token counts and validate
    for chunk in chunks:
        chunk['token_estimate'] = estimate_tokens(chunk['text'])
        # Format time as MM:SS for readability
        chunk['time_label'] = f"{int(chunk['start_time'] // 60)}:{int(chunk['start_time'] % 60):02d}"

    return chunks

def analyze_chunks(chunks: list) -> dict:
    """Generate statistics about the chunks."""
    token_counts = [c['token_estimate'] for c in chunks]
    marcus_chunks = [c for c in chunks if c['speaker'] == 'marcus']
    demartini_chunks = [c for c in chunks if c['speaker'] == 'demartini']

    return {
        'total_chunks': len(chunks),
        'total_tokens': sum(token_counts),
        'avg_tokens': sum(token_counts) / len(chunks) if chunks else 0,
        'min_tokens': min(token_counts) if token_counts else 0,
        'max_tokens': max(token_counts) if token_counts else 0,
        'speaker_distribution': {
            'marcus': len(marcus_chunks),
            'demartini': len(demartini_chunks)
        },
        'duration_covered': chunks[-1]['end_time'] - chunks[0]['start_time'] if chunks else 0
    }

def main():
    base_dir = Path(__file__).parent.parent
    input_path = base_dir / 'data' / 'processed' / 'transcript_diarized.json'
    output_path = base_dir / 'data' / 'processed' / 'chunks.json'

    print(f"Loading parsed transcript: {input_path}")

    with open(input_path, 'r', encoding='utf-8') as f:
        transcript = json.load(f)

    segments = transcript['segments']
    print(f"Processing {len(segments)} segments...")

    chunks = create_chunks(segments)
    stats = analyze_chunks(chunks)

    result = {
        'metadata': {
            'source': transcript['metadata']['source'],
            'created_at': datetime.now().isoformat(),
            'chunking_params': {
                'min_tokens': 150,
                'max_tokens': 450
            },
            'statistics': stats
        },
        'chunks': chunks
    }

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"\nChunking complete!")
    print(f"  Total chunks: {stats['total_chunks']}")
    print(f"  Token range: {stats['min_tokens']} - {stats['max_tokens']}")
    print(f"  Average tokens: {stats['avg_tokens']:.1f}")
    print(f"  Marcus chunks: {stats['speaker_distribution']['marcus']}")
    print(f"  Demartini chunks: {stats['speaker_distribution']['demartini']}")
    print(f"\nOutput: {output_path}")

if __name__ == '__main__':
    main()
