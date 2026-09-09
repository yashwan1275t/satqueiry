import os
import shutil
import uuid
from abc import ABC, abstractmethod
from pathlib import Path
from typing import BinaryIO, Optional
from app.config import settings

class StorageProvider(ABC):
    @abstractmethod
    def save_file(self, file_obj: BinaryIO, original_filename: str, subfolder: Optional[str] = None) -> tuple[str, str, int]:
        """Returns (storage_id, relative_path, file_size)"""
        pass

    @abstractmethod
    def get_absolute_path(self, relative_path: str) -> Path:
        pass

    @abstractmethod
    def exists(self, relative_path: str) -> bool:
        pass

    @abstractmethod
    def delete(self, relative_path: str) -> bool:
        pass


class LocalStorageProvider(StorageProvider):
    def __init__(self, base_dir: Path = settings.STORAGE_DIR):
        self.base_dir = base_dir
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def save_file(self, file_obj: BinaryIO, original_filename: str, subfolder: Optional[str] = None) -> tuple[str, str, int]:
        file_id = str(uuid.uuid4())
        ext = Path(original_filename).suffix.lower()
        safe_name = f"{file_id}{ext}"
        
        target_dir = self.base_dir
        if subfolder:
            target_dir = target_dir / subfolder
            target_dir.mkdir(parents=True, exist_ok=True)
            rel_path = f"{subfolder}/{safe_name}"
        else:
            rel_path = safe_name

        dest_path = target_dir / safe_name
        
        size = 0
        file_obj.seek(0)
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file_obj, buffer)
        
        size = dest_path.stat().st_size
        return file_id, rel_path.replace("\\", "/"), size

    def get_absolute_path(self, relative_path: str) -> Path:
        # Prevent path traversal
        clean_rel = Path(relative_path).as_posix().lstrip("/")
        full_path = (self.base_dir / clean_rel).resolve()
        if not str(full_path).startswith(str(self.base_dir.resolve())):
            raise ValueError(f"Path traversal detected: {relative_path}")
        return full_path

    def exists(self, relative_path: str) -> bool:
        try:
            return self.get_absolute_path(relative_path).is_file()
        except Exception:
            return False

    def delete(self, relative_path: str) -> bool:
        try:
            path = self.get_absolute_path(relative_path)
            if path.exists():
                path.unlink()
                return True
        except Exception:
            pass
        return False

storage = LocalStorageProvider()
