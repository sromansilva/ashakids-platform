"""Serialización de pacientes y perfiles sin acceso a la base de datos."""
from datetime import date
from typing import Any, Dict, Optional
from app.models.perfiles import Paciente, Perfil

def calcular_edad(fecha_nacimiento: date) -> int:
    """Calcula la edad en años cumplidos a la fecha actual."""
    today = date.today()
    return today.year - fecha_nacimiento.year - (
        (today.month, today.day) < (fecha_nacimiento.month, fecha_nacimiento.day)
    )


def serializar_perfil(perfil: Optional[Perfil]) -> Optional[Dict[str, Any]]:
    """Serializa el perfil gamificado/formativo 1:1."""
    if not perfil:
        return None
    return {
        "id_perfil": perfil.id_perfil,
        "id_paciente": perfil.id_paciente,
        "progreso": float(perfil.progreso or 0.0),
        "racha_dias": perfil.racha_dias or 0,
        "objetivos_totales": perfil.objetivos_totales or 0,
        "objetivos_completados": perfil.objetivos_completados or 0,
        "actividades_desarrolladas_total": perfil.actividades_desarrolladas_total or 0,
        "sesiones_totales": perfil.sesiones_totales or 0,
        "fecha_ultima_sesion": perfil.fecha_ultima_sesion,
        "experiencia": perfil.experiencia or 0,
        "nivel": perfil.nivel or 1,
    }


def serializar_paciente(paciente: Paciente) -> Dict[str, Any]:
    """Serializa un paciente agregando edad calculada y perfil."""
    return {
        "id_paciente": paciente.id_paciente,
        "id_tutor": paciente.id_tutor,
        "nombres_paciente": paciente.nombres_paciente,
        "apellidos_paciente": paciente.apellidos_paciente,
        "fecha_nacimiento": paciente.fecha_nacimiento,
        "edad": calcular_edad(paciente.fecha_nacimiento),
        "sexo": paciente.sexo,
        "avatar_nombre": paciente.avatar_nombre or "zorro",
        "activo": paciente.activo,
        "fecha_registro": paciente.fecha_registro,
        "perfil": serializar_perfil(paciente.perfil),
    }
