"""Dependencias HTTP compartidas; commit antes de enviar la respuesta."""
from typing import Annotated
from fastapi import Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user
from app.core.database import get_db

DB = Annotated[AsyncSession, Depends(get_db, scope="function")]
Identity = Annotated[tuple, Depends(get_current_user)]
Limit = Annotated[int, Query(ge=1, le=100)]
Offset = Annotated[int, Query(ge=0)]
