#!/usr/bin/env python3
"""
Parse the merged Otter.ai transcript into structured JSON format.
Handles speaker attribution and timestamp extraction.
"""

import json
import re
from pathlib import Path
from datetime import datetime

def parse_timestamp(timestamp_str: str) -> float:
    """Convert timestamp string to seconds."""
    # Handle formats like "0:00", "1:07", "1:29:38"
    parts = timestamp_str.strip().split(':')
    if len(parts) == 2:
        minutes, seconds = int(parts[0]), int(parts[1])
        return minutes * 60 + seconds
    elif len(parts) == 3:
        hours, minutes, seconds = int(parts[0]), int(parts[1]), int(parts[2])
        return hours * 3600 + minutes * 60 + seconds
    return 0.0

def normalize_speaker(speaker: str) -> str:
    """Normalize speaker names to consistent IDs."""
    speaker_lower = speaker.lower().strip()
    if 'aubrey' in speaker_lower or 'marcus' in speaker_lower:
        return 'marcus'
    elif 'demartini' in speaker_lower or 'john' in speaker_lower:
        return 'demartini'
    elif 'speaker' in speaker_lower:
        # "Speaker 1" appears occasionally - likely crosstalk
        return 'unknown'
    return 'unknown'

def parse_transcript(transcript_path: str) -> dict:
    """Parse Otter.ai transcript into structured format."""

    with open(transcript_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split into segments by speaker headers
    # Pattern: "Speaker Name  HH:MM:SS" or "Speaker Name  M:SS"
    segment_pattern = r'^([A-Za-z\.\s]+\d?)\s+(\d+:\d+(?::\d+)?)\s*$'

    lines = content.split('\n')
    segments = []
    current_segment = None
    continuation_offset = 0  # Offset for "Final 15" continuation
    in_continuation = False

    for i, line in enumerate(lines):
        # Check for continuation marker
        if '--- CONTINUATION' in line:
            in_continuation = True
            # Extract offset: timestamps in continuation start from 1:29:38
            continuation_offset = parse_timestamp('1:29:38')
            continue

        # Skip empty lines and transcription footer
        if not line.strip() or 'Transcribed by' in line:
            continue

        # Check if this is a speaker header
        match = re.match(segment_pattern, line.strip())
        if match:
            # Save previous segment
            if current_segment and current_segment['text'].strip():
                segments.append(current_segment)

            speaker_raw = match.group(1).strip()
            timestamp_raw = match.group(2).strip()

            # Calculate actual timestamp
            timestamp_seconds = parse_timestamp(timestamp_raw)
            if in_continuation:
                timestamp_seconds += continuation_offset

            current_segment = {
                'speaker': normalize_speaker(speaker_raw),
                'speaker_raw': speaker_raw,
                'start_time': timestamp_seconds,
                'text': ''
            }
        elif current_segment is not None:
            # Add text to current segment
            current_segment['text'] += line.strip() + ' '

    # Don't forget the last segment
    if current_segment and current_segment['text'].strip():
        segments.append(current_segment)

    # Clean up text and calculate end times
    for i, seg in enumerate(segments):
        seg['text'] = seg['text'].strip()
        # End time is start of next segment, or estimated from text length
        if i < len(segments) - 1:
            seg['end_time'] = segments[i + 1]['start_time']
        else:
            # Estimate last segment duration (~150 words/min speaking rate)
            word_count = len(seg['text'].split())
            seg['end_time'] = seg['start_time'] + (word_count / 150 * 60)

    # Calculate statistics
    marcus_segments = [s for s in segments if s['speaker'] == 'marcus']
    demartini_segments = [s for s in segments if s['speaker'] == 'demartini']

    total_duration = segments[-1]['end_time'] if segments else 0

    result = {
        'metadata': {
            'source': 'Aubrey Marcus Podcast #521',
            'title': 'No Such Thing As Evil - Debate with Dr. John Demartini',
            'parsed_at': datetime.now().isoformat(),
            'total_duration_seconds': total_duration,
            'total_segments': len(segments),
            'speaker_distribution': {
                'marcus': len(marcus_segments),
                'demartini': len(demartini_segments),
                'unknown': len([s for s in segments if s['speaker'] == 'unknown'])
            }
        },
        'segments': segments
    }

    return result

def main():
    # Paths
    base_dir = Path(__file__).parent.parent
    transcript_path = base_dir / '.claude' / 'merged-transcript.txt'
    output_path = base_dir / 'data' / 'processed' / 'transcript_diarized.json'

    print(f"Parsing transcript: {transcript_path}")

    result = parse_transcript(str(transcript_path))

    # Write output
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"Parsed {result['metadata']['total_segments']} segments")
    print(f"Total duration: {result['metadata']['total_duration_seconds'] / 60:.1f} minutes")
    print(f"Speaker distribution: {result['metadata']['speaker_distribution']}")
    print(f"Output: {output_path}")

if __name__ == '__main__':
    main()
