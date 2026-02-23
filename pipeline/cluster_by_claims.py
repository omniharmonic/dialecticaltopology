#!/usr/bin/env python3
"""
Cluster chunks by semantic similarity to extracted claims.
Creates meaningful, interpretable clusters where each cluster
represents discussion around a specific philosophical claim.
"""

import json
import numpy as np
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Tuple

try:
    import ollama
except ImportError:
    print("Installing ollama...")
    import subprocess
    subprocess.check_call(["pip", "install", "ollama"])
    import ollama

try:
    import umap
except ImportError:
    print("Installing umap-learn...")
    import subprocess
    subprocess.check_call(["pip", "install", "umap-learn"])
    import umap

def get_embedding(text: str, model: str = "nomic-embed-text", max_chars: int = 8000) -> np.ndarray:
    """Get embedding for a text using Ollama. Truncates if too long."""
    # Truncate if too long (nomic-embed-text has ~8k token context)
    if len(text) > max_chars:
        text = text[:max_chars] + "..."
    response = ollama.embeddings(model=model, prompt=text)
    return np.array(response['embedding'])

def embed_texts(texts: List[str], model: str = "nomic-embed-text") -> np.ndarray:
    """Embed multiple texts."""
    embeddings = []
    for i, text in enumerate(texts):
        if (i + 1) % 10 == 0:
            print(f"  Embedded {i + 1}/{len(texts)}")
        embeddings.append(get_embedding(text, model))
    return np.array(embeddings)

def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Compute cosine similarity between two vectors."""
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def assign_chunks_to_claims(
    chunk_embeddings: np.ndarray,
    claim_embeddings: np.ndarray,
    claims: List[Dict],
    similarity_threshold: float = 0.3
) -> List[Dict]:
    """
    Assign each chunk to its most similar claim(s).
    Returns cluster assignments with similarity scores.
    """
    assignments = []

    for i, chunk_emb in enumerate(chunk_embeddings):
        # Compute similarity to all claims
        similarities = [
            (j, cosine_similarity(chunk_emb, claim_emb))
            for j, claim_emb in enumerate(claim_embeddings)
        ]

        # Sort by similarity
        similarities.sort(key=lambda x: x[1], reverse=True)

        # Get primary claim (highest similarity)
        primary_claim_idx, primary_sim = similarities[0]

        # Get related claims (above threshold)
        related_claims = [
            (idx, sim) for idx, sim in similarities[1:5]
            if sim >= similarity_threshold
        ]

        assignments.append({
            'chunk_id': i,
            'primary_claim': claims[primary_claim_idx]['id'],
            'primary_claim_text': claims[primary_claim_idx]['text'][:100] + '...',
            'similarity': float(primary_sim),
            'related_claims': [
                {'claim_id': claims[idx]['id'], 'similarity': float(sim)}
                for idx, sim in related_claims
            ]
        })

    return assignments

def build_claim_clusters(
    assignments: List[Dict],
    claims: List[Dict],
    chunks: List[Dict]
) -> List[Dict]:
    """
    Build cluster objects centered on claims.
    """
    # Group chunks by primary claim
    claim_to_chunks = {}
    for assignment in assignments:
        claim_id = assignment['primary_claim']
        if claim_id not in claim_to_chunks:
            claim_to_chunks[claim_id] = []
        claim_to_chunks[claim_id].append(assignment)

    # Build cluster objects
    clusters = []
    for claim in claims:
        if claim['id'] in claim_to_chunks:
            cluster_chunks = claim_to_chunks[claim['id']]
            avg_similarity = np.mean([c['similarity'] for c in cluster_chunks])

            clusters.append({
                'id': claim['id'],
                'label': claim['text'][:80] + '...' if len(claim['text']) > 80 else claim['text'],
                'full_claim': claim['text'],
                'speaker': claim['speaker'],
                'claim_type': claim['type'],
                'chunk_ids': [c['chunk_id'] for c in cluster_chunks],
                'chunk_count': len(cluster_chunks),
                'avg_similarity': float(avg_similarity),
                'related_concepts': claim.get('related_concepts', [])
            })

    # Sort by chunk count (most discussed claims first)
    clusters.sort(key=lambda x: x['chunk_count'], reverse=True)

    return clusters

def project_umap(embeddings: np.ndarray, n_neighbors: int = 15, min_dist: float = 0.1) -> np.ndarray:
    """Project embeddings to 3D using UMAP."""
    reducer = umap.UMAP(
        n_components=3,
        n_neighbors=n_neighbors,
        min_dist=min_dist,
        metric="cosine",
        random_state=42,
    )
    return reducer.fit_transform(embeddings)

def normalize_coordinates(coords: np.ndarray) -> np.ndarray:
    """Normalize coordinates to [-1, 1] range."""
    coords = coords - coords.mean(axis=0)
    max_range = np.abs(coords).max()
    return coords / max_range if max_range > 0 else coords

def main():
    base_dir = Path(__file__).parent.parent
    chunks_path = base_dir / 'data' / 'processed' / 'chunks_v2.json'
    claims_path = base_dir / 'frontend' / 'public' / 'data' / 'claims.json'
    output_path = base_dir / 'data' / 'processed' / 'landscape_v2.json'
    frontend_output = base_dir / 'frontend' / 'public' / 'data' / 'landscape.json'

    # Load chunks
    print(f"Loading chunks from: {chunks_path}")
    with open(chunks_path, 'r', encoding='utf-8') as f:
        chunks_data = json.load(f)
    chunks = chunks_data['chunks']
    print(f"  Loaded {len(chunks)} chunks")

    # Load claims
    print(f"\nLoading claims from: {claims_path}")
    with open(claims_path, 'r', encoding='utf-8') as f:
        claims_data = json.load(f)
    claims = claims_data['claims']
    print(f"  Loaded {len(claims)} claims")

    # Embed chunks
    print("\nEmbedding chunks...")
    chunk_texts = [c['text'] for c in chunks]
    chunk_embeddings = embed_texts(chunk_texts)
    print(f"  Chunk embeddings shape: {chunk_embeddings.shape}")

    # Embed claims
    print("\nEmbedding claims...")
    claim_texts = [c['text'] for c in claims]
    claim_embeddings = embed_texts(claim_texts)
    print(f"  Claim embeddings shape: {claim_embeddings.shape}")

    # Assign chunks to claims
    print("\nAssigning chunks to claims...")
    assignments = assign_chunks_to_claims(
        chunk_embeddings, claim_embeddings, claims,
        similarity_threshold=0.35
    )

    # Build claim-based clusters
    print("\nBuilding claim-based clusters...")
    clusters = build_claim_clusters(assignments, claims, chunks)
    print(f"  Created {len(clusters)} clusters")

    # Show top clusters
    print("\nTop 10 clusters by discussion volume:")
    for cluster in clusters[:10]:
        print(f"  [{cluster['speaker'][0].upper()}] {cluster['chunk_count']} chunks: {cluster['label'][:60]}...")

    # Project to 3D
    print("\nProjecting to 3D with UMAP...")
    coords = project_umap(chunk_embeddings, n_neighbors=min(15, len(chunks)-1), min_dist=0.1)
    coords = normalize_coordinates(coords)

    # Also project claims to show as landmarks
    print("Projecting claims to 3D...")
    all_embeddings = np.vstack([chunk_embeddings, claim_embeddings])
    all_coords = project_umap(all_embeddings, n_neighbors=min(15, len(all_embeddings)-1), min_dist=0.1)
    all_coords = normalize_coordinates(all_coords)

    chunk_coords = all_coords[:len(chunks)]
    claim_coords = all_coords[len(chunks):]

    # Build points with cluster assignments
    points = []
    for i, (chunk, coord, assignment) in enumerate(zip(chunks, chunk_coords, assignments)):
        points.append({
            'id': chunk['id'],
            'x': float(coord[0]),
            'y': float(coord[1]),
            'z': float(coord[2]),
            'speaker': chunk['primary_speaker'],
            'speakers': chunk['speakers'],
            'text': chunk['text'][:300] + '...' if len(chunk['text']) > 300 else chunk['text'],
            'full_text': chunk['text'],
            'time': chunk['start_time'],
            'time_label': chunk['time_label'],
            'time_range': chunk['time_range'],
            'duration': chunk['duration'],
            'tokens': chunk['token_estimate'],
            'cluster_id': assignment['primary_claim'],
            'cluster_similarity': assignment['similarity'],
            'related_claims': assignment['related_claims']
        })

    # Build claim landmarks (for visualization)
    claim_landmarks = []
    for i, (claim, coord) in enumerate(zip(claims, claim_coords)):
        claim_landmarks.append({
            'id': claim['id'],
            'x': float(coord[0]),
            'y': float(coord[1]),
            'z': float(coord[2]),
            'speaker': claim['speaker'],
            'text': claim['text'],
            'type': claim['type'],
            'chunk_count': next(
                (c['chunk_count'] for c in clusters if c['id'] == claim['id']),
                0
            )
        })

    # Compute cluster centroids from actual chunk positions
    for cluster in clusters:
        cluster_points = [p for p in points if p['cluster_id'] == cluster['id']]
        if cluster_points:
            cluster['centroid'] = [
                float(np.mean([p['x'] for p in cluster_points])),
                float(np.mean([p['y'] for p in cluster_points])),
                float(np.mean([p['z'] for p in cluster_points]))
            ]
        else:
            # Use claim landmark position
            landmark = next((l for l in claim_landmarks if l['id'] == cluster['id']), None)
            cluster['centroid'] = [landmark['x'], landmark['y'], landmark['z']] if landmark else [0, 0, 0]

    # Speaker centroids
    marcus_points = [p for p in points if p['speaker'] == 'marcus']
    demartini_points = [p for p in points if p['speaker'] == 'demartini']

    speaker_centroids = {
        'marcus': [
            float(np.mean([p['x'] for p in marcus_points])) if marcus_points else 0,
            float(np.mean([p['y'] for p in marcus_points])) if marcus_points else 0,
            float(np.mean([p['z'] for p in marcus_points])) if marcus_points else 0,
        ],
        'demartini': [
            float(np.mean([p['x'] for p in demartini_points])) if demartini_points else 0,
            float(np.mean([p['y'] for p in demartini_points])) if demartini_points else 0,
            float(np.mean([p['z'] for p in demartini_points])) if demartini_points else 0,
        ]
    }

    # Build output
    landscape = {
        'metadata': {
            'version': 'v2',
            'created_at': datetime.now().isoformat(),
            'num_points': len(points),
            'num_clusters': len(clusters),
            'num_claims': len(claims),
            'umap_params': {'n_neighbors': 15, 'min_dist': 0.1},
            'embedding_model': 'nomic-embed-text',
            'chunking': chunks_data['metadata']['chunking_params'],
            'statistics': chunks_data['metadata']['statistics']
        },
        'points': points,
        'clusters': clusters,
        'claim_landmarks': claim_landmarks,
        'speaker_centroids': speaker_centroids
    }

    # Save
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(landscape, f, indent=2)
    print(f"\nSaved to: {output_path}")

    with open(frontend_output, 'w', encoding='utf-8') as f:
        json.dump(landscape, f)
    print(f"Copied to: {frontend_output}")

    print(f"\nDone! New landscape has {len(points)} points in {len(clusters)} claim-based clusters")

if __name__ == '__main__':
    main()
