#!/usr/bin/env python3
"""
Generate embeddings for chunks using Ollama's nomic-embed-text model.
Outputs embeddings.npy for UMAP projection.
"""

import json
import subprocess
import numpy as np
from pathlib import Path
from datetime import datetime
import sys

EMBED_DIM = 768  # nomic-embed-text dimension
MAX_CHARS = 8000  # Truncate texts longer than this

def get_embedding(text: str, model: str = "nomic-embed-text") -> list[float]:
    """Get embedding from Ollama."""
    import requests

    # Truncate if too long
    if len(text) > MAX_CHARS:
        text = text[:MAX_CHARS]

    response = requests.post(
        "http://localhost:11434/api/embeddings",
        json={
            "model": model,
            "prompt": text
        }
    )

    if response.status_code != 200:
        raise Exception(f"Ollama API error: {response.text}")

    embedding = response.json()["embedding"]

    # Verify dimension
    if len(embedding) != EMBED_DIM:
        raise Exception(f"Unexpected embedding dimension: {len(embedding)}")

    return embedding

def main():
    base_dir = Path(__file__).parent.parent
    chunks_path = base_dir / "data" / "processed" / "chunks.json"
    embeddings_path = base_dir / "data" / "processed" / "embeddings.npy"
    metadata_path = base_dir / "data" / "processed" / "embeddings_meta.json"

    print(f"Loading chunks from: {chunks_path}")

    with open(chunks_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    chunks = data["chunks"]
    print(f"Generating embeddings for {len(chunks)} chunks...")

    embeddings = []
    for i, chunk in enumerate(chunks):
        if (i + 1) % 10 == 0 or i == 0:
            print(f"  Processing chunk {i + 1}/{len(chunks)}...")

        try:
            embedding = get_embedding(chunk["text"])
            embeddings.append(embedding)
        except Exception as e:
            print(f"  Error on chunk {i}: {e}")
            # Use zero vector as fallback
            embeddings.append([0.0] * EMBED_DIM)

    # Convert to numpy array
    embeddings_array = np.array(embeddings, dtype=np.float32)

    print(f"\nEmbeddings shape: {embeddings_array.shape}")

    # Save embeddings
    np.save(embeddings_path, embeddings_array)
    print(f"Saved embeddings to: {embeddings_path}")

    # Save metadata
    meta = {
        "model": "nomic-embed-text",
        "dimensions": embeddings_array.shape[1],
        "num_chunks": len(chunks),
        "created_at": datetime.now().isoformat(),
    }
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)

    print(f"Saved metadata to: {metadata_path}")

if __name__ == "__main__":
    main()
