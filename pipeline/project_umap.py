#!/usr/bin/env python3
"""
Project embeddings to 3D using UMAP for semantic landscape visualization.
Generates multiple projections with different parameters for comparison.
"""

import json
import numpy as np
from pathlib import Path
from datetime import datetime

try:
    import umap
except ImportError:
    print("Installing umap-learn...")
    import subprocess
    subprocess.check_call(["pip", "install", "umap-learn"])
    import umap

def project_umap(embeddings: np.ndarray, n_neighbors: int = 15, min_dist: float = 0.1) -> np.ndarray:
    """Project embeddings to 3D using UMAP."""
    reducer = umap.UMAP(
        n_components=3,
        n_neighbors=n_neighbors,
        min_dist=min_dist,
        metric="cosine",
        random_state=42,  # For reproducibility
    )
    return reducer.fit_transform(embeddings)

def normalize_coordinates(coords: np.ndarray) -> np.ndarray:
    """Normalize coordinates to [-1, 1] range."""
    coords = coords - coords.mean(axis=0)
    max_range = np.abs(coords).max()
    return coords / max_range if max_range > 0 else coords

def main():
    base_dir = Path(__file__).parent.parent
    embeddings_path = base_dir / "data" / "processed" / "embeddings.npy"
    chunks_path = base_dir / "data" / "processed" / "chunks.json"
    output_path = base_dir / "data" / "processed" / "landscape.json"

    print(f"Loading embeddings from: {embeddings_path}")
    embeddings = np.load(embeddings_path)
    print(f"Embeddings shape: {embeddings.shape}")

    print(f"Loading chunks from: {chunks_path}")
    with open(chunks_path, "r", encoding="utf-8") as f:
        chunks_data = json.load(f)
    chunks = chunks_data["chunks"]

    # UMAP parameters to try
    params = [
        {"n_neighbors": 15, "min_dist": 0.1},   # Default - balanced
        {"n_neighbors": 10, "min_dist": 0.05},  # Tighter clusters
        {"n_neighbors": 20, "min_dist": 0.2},   # More spread
    ]

    # Use first parameter set for main projection
    print(f"\nProjecting with n_neighbors={params[0]['n_neighbors']}, min_dist={params[0]['min_dist']}...")
    coords = project_umap(embeddings, **params[0])
    coords = normalize_coordinates(coords)

    print(f"Projected coordinates shape: {coords.shape}")

    # Build landscape data
    points = []
    for i, (chunk, coord) in enumerate(zip(chunks, coords)):
        points.append({
            "id": chunk["id"],
            "x": float(coord[0]),
            "y": float(coord[1]),
            "z": float(coord[2]),
            "speaker": chunk["speaker"],
            "text": chunk["text"][:200] + "..." if len(chunk["text"]) > 200 else chunk["text"],
            "full_text": chunk["text"],
            "time": chunk["start_time"],
            "time_label": chunk["time_label"],
            "tokens": chunk["token_estimate"],
        })

    # Simple clustering by speaker (we can do k-means later)
    marcus_points = [p for p in points if p["speaker"] == "marcus"]
    demartini_points = [p for p in points if p["speaker"] == "demartini"]

    marcus_centroid = np.mean([[p["x"], p["y"], p["z"]] for p in marcus_points], axis=0) if marcus_points else [0, 0, 0]
    demartini_centroid = np.mean([[p["x"], p["y"], p["z"]] for p in demartini_points], axis=0) if demartini_points else [0, 0, 0]

    clusters = [
        {
            "id": 0,
            "label": "Marcus",
            "centroid": [float(c) for c in marcus_centroid],
            "count": len(marcus_points),
        },
        {
            "id": 1,
            "label": "Demartini",
            "centroid": [float(c) for c in demartini_centroid],
            "count": len(demartini_points),
        },
    ]

    # Build speaker trajectories (paths through time)
    marcus_trajectory = sorted([p for p in points if p["speaker"] == "marcus"], key=lambda p: p["time"])
    demartini_trajectory = sorted([p for p in points if p["speaker"] == "demartini"], key=lambda p: p["time"])

    trajectories = {
        "marcus": [[p["x"], p["y"], p["z"]] for p in marcus_trajectory],
        "demartini": [[p["x"], p["y"], p["z"]] for p in demartini_trajectory],
    }

    # Output
    landscape = {
        "metadata": {
            "created_at": datetime.now().isoformat(),
            "num_points": len(points),
            "umap_params": params[0],
            "embedding_model": "nomic-embed-text",
            "dimensions": 3,
        },
        "points": points,
        "clusters": clusters,
        "trajectories": trajectories,
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(landscape, f, indent=2)

    print(f"\nSaved landscape to: {output_path}")
    print(f"  Points: {len(points)}")
    print(f"  Marcus centroid: {marcus_centroid}")
    print(f"  Demartini centroid: {demartini_centroid}")

    # Also copy to frontend public folder
    frontend_path = base_dir / "frontend" / "public" / "data" / "landscape.json"
    with open(frontend_path, "w", encoding="utf-8") as f:
        json.dump(landscape, f)
    print(f"  Copied to: {frontend_path}")

if __name__ == "__main__":
    main()
