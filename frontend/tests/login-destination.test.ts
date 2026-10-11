import { expect, it } from 'vitest';
import { loginDestination } from '@/routes/paths';
it('preserva el mundo válido para familia y rechaza retorno externo, rol ajeno y mundo inventado',()=>{
 expect(loginDestination('PADRE',{pathname:'/mundo-asha',search:'?world=HABLA'})).toBe('/mundo-asha?world=HABLA');
 expect(loginDestination('TERAPEUTA',{pathname:'/mundo-asha',search:'?world=HABLA'})).toBe('/terapeuta');
 expect(loginDestination('PADRE',{pathname:'//outside.invalid'})).toBe('/padre');
 expect(loginDestination('PADRE',{pathname:'/admin'})).toBe('/padre');
 expect(loginDestination('PADRE',{pathname:'/mundo-asha',search:'?world=FAKE&next=https://outside.invalid'})).toBe('/mundo-asha');
});
