#!/usr/bin/env python3
"""
package_bundle.py - Package all processed data for frontend

Copies all data files to frontend/public/data/ and generates a manifest
for the frontend to load. Also creates a compressed bundle for distribution.
"""

import json
import shutil
from pathlib import Path
from datetime import datetime
import hashlib

# Paths
PROJECT_DIR = Path(__file__).parent.parent
DATA_DIR = PROJECT_DIR / "data" / "processed"
WIKI_DIR = PROJECT_DIR / "wiki"
FRONTEND_DATA_DIR = PROJECT_DIR / "frontend" / "public" / "data"
BUNDLE_DIR = PROJECT_DIR / "data" / "bundle"


def compute_hash(filepath):
    """Compute MD5 hash of a file for cache busting."""
    with open(filepath, "rb") as f:
        return hashlib.md5(f.read()).hexdigest()[:8]


def copy_with_stats(src, dst):
    """Copy a file and return size stats."""
    shutil.copy2(src, dst)
    size = dst.stat().st_size
    return size


def main():
    print("=" * 60)
    print("  Bundle Packaging - Dialectical Topology")
    print("=" * 60)

    # Ensure output directories exist
    FRONTEND_DATA_DIR.mkdir(parents=True, exist_ok=True)
    BUNDLE_DIR.mkdir(parents=True, exist_ok=True)

    # Files to package
    data_files = {
        # Core analysis data
        "transcript_diarized.json": "Parsed transcript with speaker attribution",
        "chunks.json": "Semantic chunks for embedding",
        "embeddings_meta.json": "Embedding metadata (vectors stored separately)",
        "landscape.json": "3D UMAP projection with clusters",
        "claims.json": "42 extracted philosophical claims",
        "ontology.json": "8-dimension philosophical analysis",
        "flow.json": "Conversation flow with inflection points",
        "dialogue.json": "Steel Man Arena content"
    }

    stats = {
        "files_copied": 0,
        "total_bytes": 0,
        "file_details": {}
    }

    print("\nCopying data files to frontend...")
    for filename, description in data_files.items():
        src = DATA_DIR / filename
        if src.exists():
            dst = FRONTEND_DATA_DIR / filename
            size = copy_with_stats(src, dst)
            file_hash = compute_hash(dst)
            stats["files_copied"] += 1
            stats["total_bytes"] += size
            stats["file_details"][filename] = {
                "size": size,
                "hash": file_hash,
                "description": description
            }
            print(f"  ✓ {filename} ({size:,} bytes)")
        else:
            print(f"  ✗ {filename} (not found)")

    # Copy wiki index
    print("\nCopying wiki index...")
    wiki_index_src = WIKI_DIR / "index.json"
    if wiki_index_src.exists():
        dst = FRONTEND_DATA_DIR / "wiki_index.json"
        size = copy_with_stats(wiki_index_src, dst)
        stats["files_copied"] += 1
        stats["total_bytes"] += size
        stats["file_details"]["wiki_index.json"] = {
            "size": size,
            "hash": compute_hash(dst),
            "description": "Wiki entity index"
        }
        print(f"  ✓ wiki_index.json ({size:,} bytes)")

    # Generate frontend manifest
    print("\nGenerating frontend manifest...")
    manifest = {
        "version": "1.0.0",
        "generated_at": datetime.now().isoformat(),
        "source": {
            "title": "Aubrey Marcus Podcast #521",
            "subtitle": "No Such Thing As Evil? - with Dr. John Demartini",
            "duration_seconds": 6330,
            "speakers": [
                {
                    "id": "marcus",
                    "name": "Aubrey Marcus",
                    "color": "#f59e0b",
                    "role": "Host"
                },
                {
                    "id": "demartini",
                    "name": "Dr. John Demartini",
                    "color": "#14b8a6",
                    "role": "Guest"
                }
            ]
        },
        "lenses": [
            {
                "id": "landscape",
                "name": "Semantic Landscape",
                "description": "3D terrain of meaning - explore the conversation's conceptual topology",
                "data_file": "landscape.json",
                "component": "SemanticLandscape"
            },
            {
                "id": "claims",
                "name": "Claim Atlas",
                "description": "Interactive map of philosophical claims and their relationships",
                "data_file": "claims.json",
                "component": "ClaimAtlas"
            },
            {
                "id": "flow",
                "name": "Dialectical Flow",
                "description": "Timeline showing the conversation's emotional and intellectual arc",
                "data_file": "flow.json",
                "component": "DialecticalFlow"
            },
            {
                "id": "worldview",
                "name": "Worldview Map",
                "description": "8-dimensional visualization of where speakers agree and diverge",
                "data_file": "ontology.json",
                "component": "WorldviewMap"
            },
            {
                "id": "arena",
                "name": "Steel Man Arena",
                "description": "Generative space where positions are steel-manned and synthesis explored",
                "data_file": "dialogue.json",
                "component": "SteelManArena"
            }
        ],
        "statistics": {
            "total_segments": 270,
            "total_chunks": 270,
            "total_claims": 42,
            "total_wiki_entities": 84,
            "dimensions_analyzed": 8,
            "inflection_points": 8,
            "arena_rounds": 5
        },
        "files": stats["file_details"],
        "total_size_bytes": stats["total_bytes"]
    }

    manifest_path = FRONTEND_DATA_DIR / "manifest.json"
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"  ✓ manifest.json")

    # Also save to bundle directory
    shutil.copy2(manifest_path, BUNDLE_DIR / "manifest.json")

    # Copy all data to bundle directory
    print("\nCreating distribution bundle...")
    for filename in stats["file_details"].keys():
        src = FRONTEND_DATA_DIR / filename
        if src.exists():
            shutil.copy2(src, BUNDLE_DIR / filename)

    # Summary
    print("\n" + "=" * 60)
    print("  Bundle Packaging Complete")
    print("=" * 60)
    print(f"\n  Frontend data: {FRONTEND_DATA_DIR}")
    print(f"  Distribution bundle: {BUNDLE_DIR}")
    print(f"\n  Files packaged: {stats['files_copied']}")
    print(f"  Total size: {stats['total_bytes']:,} bytes ({stats['total_bytes']/1024:.1f} KB)")

    print("\n  Lens data files:")
    for lens in manifest["lenses"]:
        file_info = stats["file_details"].get(lens["data_file"], {})
        size = file_info.get("size", 0)
        print(f"    - {lens['name']}: {lens['data_file']} ({size:,} bytes)")

    print("\n  Ready for frontend build!")


if __name__ == "__main__":
    main()
