"""Inventario B02 aprobado: aplicación FastAPI, sin pertenencia a otros roles."""
import hashlib
import json
from sqlalchemy import text

ROLE = "ashakids_runtime"
PERMISSIONS = {
    "usuarios": "SELECT INSERT UPDATE DELETE",
    "usuario_roles": "SELECT INSERT DELETE",
    "administradores": "SELECT INSERT DELETE",
    "tutores": "SELECT INSERT UPDATE DELETE",
    "terapeutas": "SELECT INSERT UPDATE DELETE",
    "roles": "SELECT",
    "sesiones_autenticacion": "SELECT INSERT UPDATE DELETE",
    "pacientes": "SELECT INSERT UPDATE DELETE",
    "perfiles": "SELECT INSERT UPDATE DELETE",
    "expedientes": "SELECT INSERT UPDATE",
    "tratamientos": "SELECT INSERT UPDATE",
    "reservas": "SELECT INSERT UPDATE",
    "sesiones": "SELECT INSERT UPDATE",
    "reportes_sesion": "SELECT INSERT UPDATE",
    "conversaciones": "SELECT INSERT UPDATE",
    "mensajes": "SELECT INSERT",
    "auditoria_cambios": "SELECT INSERT",
    "logros": "SELECT",
    "perfil_logros": "SELECT",
    "actividades": "SELECT",
    "resultados_nivel": "SELECT",
    "evaluaciones_ia": "SELECT",
    "turnos_semanales": "SELECT INSERT DELETE",
    "bloqueos_agenda": "SELECT INSERT DELETE",
    "preferencias_notificacion": "SELECT INSERT UPDATE",
    "notificaciones": "SELECT INSERT UPDATE",
}
SEQUENCES = """
SELECT c.relname AS table_name,a.attname AS column_name,
 pg_get_serial_sequence('public.'||quote_ident(c.relname),a.attname) AS sequence_name
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
JOIN pg_attribute a ON a.attrelid=c.oid
WHERE n.nspname='public' AND c.relkind='r' AND a.attnum>0 AND NOT a.attisdropped
AND pg_get_serial_sequence('public.'||quote_ident(c.relname),a.attname) IS NOT NULL
ORDER BY c.relname,a.attname
"""

def identifier(name):
    return '"' + name.replace('"', '""') + '"'

async def rows(db, sql, **parameters):
    return [dict(r) for r in (await db.execute(text(sql), parameters)).mappings()]

async def preservation_snapshot(db):
    """Huellas de roles/ACL existentes; excluir solo entradas del rol nuevo."""
    queries = {
        "roles": "SELECT oid,rolname,rolsuper,rolinherit,rolcreaterole,rolcreatedb,rolcanlogin,rolreplication,rolbypassrls,rolconnlimit,rolvaliduntil,rolconfig FROM pg_roles WHERE rolname<>:role ORDER BY oid",
        "memberships": "SELECT m.* FROM pg_auth_members m WHERE m.roleid NOT IN (SELECT oid FROM pg_roles WHERE rolname=:role) AND m.member NOT IN (SELECT oid FROM pg_roles WHERE rolname=:role) ORDER BY m.roleid,m.member",
        "objects": "SELECT c.oid,c.relowner,c.relname,c.relrowsecurity,c.relforcerowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind IN ('r','S') ORDER BY c.oid",
        "object_acl": "SELECT c.oid,x.* FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace CROSS JOIN LATERAL aclexplode(coalesce(c.relacl,acldefault(CASE WHEN c.relkind='S' THEN 's'::\"char\" ELSE 'r'::\"char\" END,c.relowner))) x WHERE n.nspname='public' AND c.relkind IN ('r','S') AND x.grantee NOT IN (SELECT oid FROM pg_roles WHERE rolname=:role) ORDER BY c.oid,x.grantee,x.privilege_type",
        "namespace_acl": "SELECT n.oid,x.* FROM pg_namespace n CROSS JOIN LATERAL aclexplode(coalesce(n.nspacl,acldefault('n',n.nspowner))) x WHERE x.grantee NOT IN (SELECT oid FROM pg_roles WHERE rolname=:role) ORDER BY n.oid,x.grantee,x.privilege_type",
        "database_acl": "SELECT d.oid,x.* FROM pg_database d CROSS JOIN LATERAL aclexplode(coalesce(d.datacl,acldefault('d',d.datdba))) x WHERE x.grantee NOT IN (SELECT oid FROM pg_roles WHERE rolname=:role) ORDER BY d.oid,x.grantee,x.privilege_type",
        "policies_existing": "SELECT * FROM pg_policies WHERE NOT (:role=ANY(roles::text[])) ORDER BY schemaname,tablename,policyname",
    }
    result = {}
    for name, query in queries.items():
        data = await rows(db, query, role=ROLE)
        serialized = json.dumps(data,sort_keys=True,default=str).encode()
        result[name] = {"count":len(data),"sha256":hashlib.sha256(serialized).hexdigest()}
    return result
