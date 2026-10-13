import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';

const FILE_PATH = './responses.json';

// Utilidad para leer el archivo JSON de forma segura
async function getDb() {
  const file = Bun.file(FILE_PATH);
  if (!(await file.exists())) {
    // Si no existe, creamos uno por defecto
    const initial = { activeId: '', items: [] };
    await Bun.write(FILE_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  return await file.json();
}

const app = new Elysia()
  .use(cors())

  // 1. Endpoint ÚNICO que consume tu app principal
  .all('/api/target', async ({ set }) => {
    const db = await getDb();
    const activeMock = db.items.find((m: any) => m.id === db.activeId);

    if (!activeMock) {
      set.status = 404;
      return { error: 'No hay ninguna respuesta mock activa seleccionada.' };
    }

    set.status = activeMock.statusCode;
    return activeMock.data;
  })

  // --- Endpoints auxiliares para que tu panel frontend administre el JSON ---
  
  // Obtener todo (el listado y cuál está activo)
  .get('/admin/data', async () => {
    return await getDb();
  })

  // Actualizar todo el archivo (ideal para cuando el front guarda, edita, borra o cambia el activo)
  .post('/admin/data', async ({ body }) => {
    await Bun.write(FILE_PATH, JSON.stringify(body, null, 2));
    return { success: true };
  })

  .listen(3030);

console.log(`🚀 Servidor mock listo en http://localhost:${app.server?.port}`);