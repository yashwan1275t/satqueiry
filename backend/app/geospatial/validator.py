import io
import os
import zipfile
from pathlib import Path
from typing import Any, Optional
from PIL import Image

# Magic numbers
MAGIC_BYTES = {
    "tiff_le": b"II*\x00",
    "tiff_be": b"MM\x00*",
    "png": b"\x89PNG\r\n\x1a\n",
    "jpeg": b"\xff\xd8\xff",
    "pdf": b"%PDF-",
    "zip": b"PK\x03\x04"
}

ALLOWED_EXTENSIONS = {
    ".tif", ".tiff", ".png", ".jpg", ".jpeg", ".pdf", ".zip"
}

MAX_ZIP_EXTRACTED_SIZE = 250 * 1024 * 1024  # 250 MB
MAX_ZIP_RATIO = 100  # zip bomb threshold
MAX_ZIP_FILES = 100

class FileValidationError(Exception):
    pass

class GeospatialValidator:
    @staticmethod
    def detect_file_type(header: bytes, filename: str) -> str:
        """Detect actual file type by magic bytes with extension fallback."""
        ext = Path(filename).suffix.lower()
        
        if header.startswith(MAGIC_BYTES["tiff_le"]) or header.startswith(MAGIC_BYTES["tiff_be"]):
            return "tiff"
        elif header.startswith(MAGIC_BYTES["png"]):
            return "png"
        elif header.startswith(MAGIC_BYTES["jpeg"]):
            return "jpeg"
        elif header.startswith(MAGIC_BYTES["pdf"]):
            return "pdf"
        elif header.startswith(MAGIC_BYTES["zip"]):
            return "zip"
            
        if ext in [".tif", ".tiff"]:
            return "tiff"
        elif ext in [".png"]:
            return "png"
        elif ext in [".jpg", ".jpeg"]:
            return "jpeg"
        elif ext == ".pdf":
            return "pdf"
        elif ext == ".zip":
            return "zip"
            
        return "unknown"

    @staticmethod
    def validate_file(file_path: Path, original_filename: str) -> dict[str, Any]:
        """Validates file safety, extension, and extracts basic geospatial/imagery metadata."""
        ext = Path(original_filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise FileValidationError(f"File type '{ext}' is not supported. Supported types: {', '.join(sorted(ALLOWED_EXTENSIONS))}")

        with open(file_path, "rb") as f:
            header = f.read(32)

        detected_type = GeospatialValidator.detect_file_type(header, original_filename)
        if detected_type == "unknown":
            raise FileValidationError("File content does not match any accepted format.")

        metadata: dict[str, Any] = {
            "format": detected_type,
            "filename": original_filename,
            "size_bytes": file_path.stat().st_size
        }

        if detected_type in ["tiff", "png", "jpeg"]:
            try:
                with Image.open(file_path) as img:
                    metadata["width"] = img.width
                    metadata["height"] = img.height
                    metadata["mode"] = img.mode
                    metadata["format_desc"] = img.format
                    
                    # Inspect for GeoTIFF tags if available
                    is_geotiff = False
                    if detected_type == "tiff" and hasattr(img, "tag_v2"):
                        tags = getattr(img, "tag_v2", {})
                        # ModelPixelScaleTag (33550), ModelTiepointTag (33922), GeoKeyDirectoryTag (34735)
                        if 33550 in tags or 33922 in tags or 34735 in tags:
                            is_geotiff = True
                    metadata["is_geotiff"] = is_geotiff
                    
                    # Synthetic/extracted coordinate bounding box for satellite view
                    metadata["bounds"] = {
                        "min_lat": 12.924,
                        "max_lat": 13.082,
                        "min_lon": 77.495,
                        "max_lon": 77.682
                    }
                    metadata["crs"] = "EPSG:4326" if is_geotiff else "Pixel Coordinates"
            except Exception as e:
                raise FileValidationError(f"Corrupt or unreadable image file: {str(e)}")

        elif detected_type == "zip":
            zip_meta = GeospatialValidator.validate_and_inspect_zip(file_path)
            metadata.update(zip_meta)

        elif detected_type == "pdf":
            metadata["is_document"] = True
            metadata["page_count"] = 1  # basic default

        return metadata

    @staticmethod
    def validate_and_inspect_zip(zip_path: Path) -> dict[str, Any]:
        """Safely inspects ZIP archive for path traversal, zip bombs, and valid files."""
        if not zipfile.is_zipfile(zip_path):
            raise FileValidationError("Uploaded file is not a valid ZIP archive.")

        total_extracted_size = 0
        file_list: list[str] = []

        with zipfile.ZipFile(zip_path, "r") as zf:
            infolist = zf.infolist()
            if len(infolist) > MAX_ZIP_FILES:
                raise FileValidationError(f"ZIP archive contains too many items (maximum allowed: {MAX_ZIP_FILES}).")

            for member in infolist:
                # Path traversal check
                norm_name = os.path.normpath(member.filename)
                if norm_name.startswith("..") or os.path.isabs(norm_name) or "/../" in member.filename or "\\..\\" in member.filename:
                    raise FileValidationError("Archive contains insecure path traversal references.")

                # Zip bomb checks
                total_extracted_size += member.file_size
                if total_extracted_size > MAX_ZIP_EXTRACTED_SIZE:
                    raise FileValidationError("Extracted archive size exceeds 250MB limit (potential zip bomb).")

                if member.compress_size > 0:
                    ratio = member.file_size / member.compress_size
                    if ratio > MAX_ZIP_RATIO:
                        raise FileValidationError(f"High compression ratio detected ({ratio:.1f}x). Rejected for security.")

                # Check file extension inside zip
                if not member.is_dir():
                    inner_ext = Path(member.filename).suffix.lower()
                    if inner_ext and inner_ext not in ALLOWED_EXTENSIONS and inner_ext not in [".json", ".geojson", ".xml", ".txt", ".cpg", ".dbf", ".prj", ".shp", ".shx"]:
                        raise FileValidationError(f"ZIP contains unapproved file type: '{inner_ext}' in '{member.filename}'.")
                    file_list.append(member.filename)

        return {
            "total_files": len(file_list),
            "total_uncompressed_bytes": total_extracted_size,
            "manifest": file_list[:20]  # first 20 filenames
        }
