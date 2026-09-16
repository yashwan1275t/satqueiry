# SatQuery AI

**SatQuery AI** is an agentic Vision-Language Assistant for interactive multimodal remote-sensing image analysis through natural-language queries.

## Core Idea

SatQuery AI is designed to do more than simply send an entire satellite image to a VLM and generate an answer.

The system uses the user's question to determine **what part of the satellite image is relevant**, extracts that region at useful resolution, and then selects the most appropriate specialist model for the requested analysis.

### Query-Guided Spatial Intelligence

For a large satellite image, a user can ask a specific question such as:

> "Analyze the mountains in this image and describe their terrain characteristics."

Instead of processing the complete image uniformly, SatQuery AI aims to:

```text
Large Satellite Image
        +
Natural-Language Query
        |
        v
Query / Intent Understanding
        |
        v
Target / Region Localization
        |
        v
Relevant Image Chunk Extraction
        |
        v
Specialist Model Selection
        |
        v
Focused Analysis on Relevant Region
        |
        v
Evidence + Spatial Grounding
        |
        v
Detailed, Query-Specific Report
```

For example, if the query is about **mountains**, the system identifies where the mountain region is located, creates focused high-resolution chunks around the relevant area, and sends those chunks to the model or tools best suited for mountain/terrain analysis.

This allows the system to concentrate computational resources on the region that matters to the user's question rather than treating the whole large satellite image as equally relevant.

## Agentic Analysis Pipeline

The overall SatQuery AI workflow is:

**Upload → Validate → Understand Query → Locate Relevant Region → Smart Chunking → Select Specialist Model → Focused Inference → Generate Evidence → Produce Report**

The model router can consider both the **target object/region** and the **requested task** when selecting the analysis pipeline.

Examples:

| User Query | Target | Analysis Pipeline |
|---|---|---|
| "Where are the mountains?" | Mountain regions | Grounding / localization |
| "Describe the mountain terrain" | Mountain regions | Terrain + VLM analysis |
| "How steep are these mountains?" | Mountain regions | Elevation / slope analysis |
| "Is there snow on the mountains?" | Mountain regions | Spectral snow/ice analysis |
| "Are the mountains changing between these images?" | Same region across dates | Bi-temporal change detection |
| "Is this area flooded?" | Water/flood region | Optical + SAR analysis |
| "What vegetation is present on the mountain?" | Mountain vegetation regions | VLM + vegetation analysis |

## Multimodal & Multitemporal Reasoning

SatQuery AI is designed to work with:

- Single optical imagery
- Optical + SAR imagery
- Bi-temporal imagery
- Remote-sensing documents and metadata

The system can route different queries to specialist capabilities such as:

- Visual Question Answering (VQA)
- Image captioning
- Object/region grounding
- Terrain analysis
- Change detection
- Optical-SAR fusion
- Spatial evidence generation

## Evidence-Grounded Results

The intended output is not just a text answer. SatQuery AI can provide:

- Natural-language analysis
- Spatial evidence
- Bounding regions / masks
- Confidence information
- Model and tool information
- Execution traces
- Warnings and uncertainty information

This makes the result easier to inspect and understand instead of relying on an unsupported VLM response.

## Technical Stack

### Frontend

- React.js
- Vite
- JavaScript
- CSS

### Backend

- Python
- FastAPI
- OpenCV
- NumPy
- GDAL
- Rasterio
- GeoPandas
- PostGIS
- Vision-Language Models (VLMs)

## Architecture

The backend is organized around a modular pipeline containing:

- File upload and validation
- Geospatial validation
- Asynchronous analysis jobs
- AI/model routing
- Custom model adapter
- Evidence generation
- Report generation
- Database persistence

The architecture is intended to remain **model-agnostic**, allowing additional specialist remote-sensing models and tools to be integrated without redesigning the entire application.

## Current AI Integration

SatQuery AI provides a custom-model adapter that supports two integration approaches:

1. **In-process model** — load a local fine-tuned model directly into the Python backend.
2. **External model service** — connect a fine-tuned model or agent through an HTTP endpoint.

This allows the final remote-sensing models to be swapped or upgraded independently from the main application.

## Key Innovation

The central innovation of SatQuery AI is **query-guided, region-focused satellite analysis** combined with agentic model orchestration.

Rather than:

```text
Entire Image → One Model → Answer
```

SatQuery AI is designed around:

```text
Entire Image
     ↓
Understand the Question
     ↓
Find What the Question Is About
     ↓
Extract Relevant High-Resolution Region(s)
     ↓
Choose the Appropriate Specialist Model/Tools
     ↓
Analyze the Focused Region
     ↓
Ground the Result Spatially
     ↓
Generate the Detailed Answer
```

This architecture is particularly useful for very large satellite images where analyzing the complete image at maximum resolution is computationally expensive and unnecessary for a targeted question.

## Problem Statement

**Smart India Hackathon 2026 — Problem Statement ID: 26167**

**SatQuery AI — An Interactive Vision-Language Assistant for Multimodal Remote Sensing Image Analysis through Text Queries**

**Theme:** Space Technology  
**Category:** Software

## Research Direction

The project is being developed around remote-sensing adapted VLMs and related research, including GeoChat, ChangeChat, Qwen2.5-VL, LoRA-based adaptation, and agentic reasoning approaches such as ReAct.

## Project Status

The application architecture and integration layer are being developed toward the complete query-guided satellite analysis pipeline. The next major implementation focus is the **query → target localization → intelligent chunking → specialist model routing → focused inference** layer.
