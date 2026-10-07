import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Importamos la lógica de rutas compilada o evaluable directamente
// Para independizar del bundle de Vite en este test, importamos o testeamos las funciones directas
import { pathToView, viewToPath, getRequiredRoleForPath } from '../src/routes/paths.ts';

describe('ASHAKids Frontend Routing Tests', () => {

  describe('1. Rutas Públicas', () => {
    const publicPaths = [
      '/',
      '/login',
      '/forgot-password',
      '/onboarding',
      '/especialistas',
      '/especialidades',
      '/recursos',
      '/sobre-nosotros',
      '/nosotros',
      '/planes',
      '/ayuda',
      '/contacto',
      '/trabaja',
      '/ashi',
      '/historias',
    ];

    for (const path of publicPaths) {
      it(`debe reconocer ${path} como ruta pública (sin rol requerido)`, () => {
        const requiredRole = getRequiredRoleForPath(path, null);
        assert.equal(requiredRole, null, `Ruta ${path} debería ser pública`);
      });
    }

    it('debe tratar /mundo-asha como pública cuando el usuario no está logueado como PADRE', () => {
      assert.equal(getRequiredRoleForPath('/mundo-asha', null), null);
      assert.equal(getRequiredRoleForPath('/mundo-asha', 'TERAPEUTA'), null);
      assert.equal(pathToView('/mundo-asha', null), 'public/mundo');
    });
  });

  describe('2. Rutas Protegidas y Determinación de Rol Requerido', () => {
    it('debe requerir rol PADRE para rutas del portal de padres, sesiones y pagos', () => {
      assert.equal(getRequiredRoleForPath('/padre'), 'PADRE');
      assert.equal(getRequiredRoleForPath('/padre/pacientes'), 'PADRE');
      assert.equal(getRequiredRoleForPath('/padre/agenda'), 'PADRE');
      assert.equal(getRequiredRoleForPath('/session/active'), 'PADRE');
      assert.equal(getRequiredRoleForPath('/pay/history'), 'PADRE');
      assert.equal(getRequiredRoleForPath('/mundo-asha', 'PADRE'), 'PADRE');
    });

    it('debe requerir rol TERAPEUTA para rutas de terapeutas', () => {
      assert.equal(getRequiredRoleForPath('/terapeuta'), 'TERAPEUTA');
      assert.equal(getRequiredRoleForPath('/terapeuta/agenda'), 'TERAPEUTA');
      assert.equal(getRequiredRoleForPath('/terapeuta/pacientes'), 'TERAPEUTA');
      assert.equal(getRequiredRoleForPath('/terapeuta/reportes'), 'TERAPEUTA');
    });

    it('debe requerir rol ADMIN para rutas de administración', () => {
      assert.equal(getRequiredRoleForPath('/admin'), 'ADMIN');
      assert.equal(getRequiredRoleForPath('/admin/dashboard'), 'ADMIN');
      assert.equal(getRequiredRoleForPath('/admin/cuentas'), 'ADMIN');
      assert.equal(getRequiredRoleForPath('/admin/ml'), 'ADMIN');
    });
  });

  describe('3. Lógica de Protección de Rutas (Simulación Guardias)', () => {
    function simulateGuard({ pathname, userRole, isAuthenticated }) {
      const requiredRole = getRequiredRoleForPath(pathname, userRole);
      
      // Si la ruta es pública
      if (!requiredRole) {
        return { status: 'ALLOW_PUBLIC', target: pathname };
      }

      // Si requiere rol y no hay sesión
      if (!isAuthenticated) {
        return { status: 'REDIRECT_LOGIN', target: '/login' };
      }

      // Si hay sesión pero el rol no coincide
      if (userRole !== requiredRole) {
        const fallbackHome = userRole === 'ADMIN' ? '/admin' : userRole === 'TERAPEUTA' ? '/terapeuta' : '/padre';
        return { status: 'ACCESS_RESTRICTED', fallbackHome };
      }

      // Rol correcto y autenticado
      return { status: 'ALLOW_PROTECTED', target: pathname };
    }

    it('Ruta pública sin sesión: debe permitir acceso', () => {
      const result = simulateGuard({ pathname: '/especialistas', userRole: null, isAuthenticated: false });
      assert.equal(result.status, 'ALLOW_PUBLIC');
    });

    it('Ruta protegida sin sesión: debe redirigir a /login', () => {
      assert.deepEqual(
        simulateGuard({ pathname: '/padre', userRole: null, isAuthenticated: false }),
        { status: 'REDIRECT_LOGIN', target: '/login' }
      );
      assert.deepEqual(
        simulateGuard({ pathname: '/terapeuta/agenda', userRole: null, isAuthenticated: false }),
        { status: 'REDIRECT_LOGIN', target: '/login' }
      );
      assert.deepEqual(
        simulateGuard({ pathname: '/admin', userRole: null, isAuthenticated: false }),
        { status: 'REDIRECT_LOGIN', target: '/login' }
      );
    });

    it('Rol correcto: debe permitir acceso a su área correspondiente', () => {
      assert.deepEqual(
        simulateGuard({ pathname: '/padre', userRole: 'PADRE', isAuthenticated: true }),
        { status: 'ALLOW_PROTECTED', target: '/padre' }
      );
      assert.deepEqual(
        simulateGuard({ pathname: '/terapeuta', userRole: 'TERAPEUTA', isAuthenticated: true }),
        { status: 'ALLOW_PROTECTED', target: '/terapeuta' }
      );
      assert.deepEqual(
        simulateGuard({ pathname: '/admin', userRole: 'ADMIN', isAuthenticated: true }),
        { status: 'ALLOW_PROTECTED', target: '/admin' }
      );
    });

    it('Rol incorrecto (cruce de accesos): debe restringir y ofrecer su panel legítimo', () => {
      // PADRE intentando entrar a /admin
      assert.deepEqual(
        simulateGuard({ pathname: '/admin', userRole: 'PADRE', isAuthenticated: true }),
        { status: 'ACCESS_RESTRICTED', fallbackHome: '/padre' }
      );
      // PADRE intentando entrar a /terapeuta
      assert.deepEqual(
        simulateGuard({ pathname: '/terapeuta', userRole: 'PADRE', isAuthenticated: true }),
        { status: 'ACCESS_RESTRICTED', fallbackHome: '/padre' }
      );
      // TERAPEUTA intentando entrar a /padre
      assert.deepEqual(
        simulateGuard({ pathname: '/padre', userRole: 'TERAPEUTA', isAuthenticated: true }),
        { status: 'ACCESS_RESTRICTED', fallbackHome: '/terapeuta' }
      );
      // TERAPEUTA intentando entrar a /admin
      assert.deepEqual(
        simulateGuard({ pathname: '/admin', userRole: 'TERAPEUTA', isAuthenticated: true }),
        { status: 'ACCESS_RESTRICTED', fallbackHome: '/terapeuta' }
      );
      // ADMIN intentando entrar a /padre
      assert.deepEqual(
        simulateGuard({ pathname: '/padre', userRole: 'ADMIN', isAuthenticated: true }),
        { status: 'ACCESS_RESTRICTED', fallbackHome: '/admin' }
      );
      // ADMIN intentando entrar a /terapeuta
      assert.deepEqual(
        simulateGuard({ pathname: '/terapeuta', userRole: 'ADMIN', isAuthenticated: true }),
        { status: 'ACCESS_RESTRICTED', fallbackHome: '/admin' }
      );
    });
  });

  describe('4. Mapeo Bidireccional de Vistas y Aliases', () => {
    it('debe mapear correctamente viewToPath', () => {
      assert.equal(viewToPath('landing'), '/');
      assert.equal(viewToPath('login'), '/login');
      assert.equal(viewToPath('public/especialistas'), '/especialistas');
      assert.equal(viewToPath('public/nosotros'), '/sobre-nosotros');
      assert.equal(viewToPath('padre/hijos'), '/padre/hijos');
      assert.equal(viewToPath('terapeuta/agenda'), '/terapeuta/agenda');
      assert.equal(viewToPath('admin/cuentas'), '/admin/cuentas');
    });

    it('debe mapear aliases amigables en pathToView', () => {
      assert.equal(pathToView('/padre/pacientes'), 'padre/hijos');
      assert.equal(pathToView('/padre/dashboard'), 'padre');
      assert.equal(pathToView('/padre/perfil'), 'padre/config');
      assert.equal(pathToView('/admin/dashboard'), 'admin');
    });
  });
});
