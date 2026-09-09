from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import AnalysisResult

router = APIRouter(prefix="/evidence", tags=["Evidence"])

@router.get("/{job_id}")
def get_job_evidence(job_id: str, db: Session = Depends(get_db)):
    result = db.query(AnalysisResult).filter(AnalysisResult.job_id == job_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Analysis result or evidence not found")

    evidence_items = result.evidence or []
    
    # Generate standard GeoJSON FeatureCollection for mapping
    features = []
    for item in evidence_items:
        coords = item.get("coordinates")
        props = item.get("properties", {})
        props["label"] = item.get("label")
        props["confidence"] = item.get("confidence")
        props["color"] = item.get("color", "#06b6d4")

        # Handle bounding box [min_x, min_y, max_x, max_y] mapped onto synthetic/approximate geographic bounding frame
        if item.get("type") == "bbox" and isinstance(coords, list) and len(coords) == 4:
            min_x, min_y, max_x, max_y = coords
            base_lat = 12.9716
            base_lon = 77.5946
            span = 0.05
            
            geo_min_lon = base_lon + (min_x * span)
            geo_max_lon = base_lon + (max_x * span)
            geo_min_lat = base_lat - (max_y * span)
            geo_max_lat = base_lat - (min_y * span)

            poly_coords = [
                [
                    [geo_min_lon, geo_min_lat],
                    [geo_max_lon, geo_min_lat],
                    [geo_max_lon, geo_max_lat],
                    [geo_min_lon, geo_max_lat],
                    [geo_min_lon, geo_min_lat]
                ]
            ]
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": poly_coords
                },
                "properties": props
            })

    geojson = {
        "type": "FeatureCollection",
        "features": features
    }

    return {
        "job_id": job_id,
        "evidence": evidence_items,
        "geojson": geojson
    }
