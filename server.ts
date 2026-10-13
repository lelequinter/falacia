import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';

const FILE_PATH = './responses.json';

// Estructura por defecto inicial si no existe el archivo
const DEFAULT_DB = {
  activeId: '',
  items: [],
  columns: [
    { id: 'col-1', name: 'Paso 1: General', cardIds: [] }
  ]
};

async function getDb() {
  const file = Bun.file(FILE_PATH);
  if (!(await file.exists())) {
    await Bun.write(FILE_PATH, JSON.stringify(DEFAULT_DB, null, 2));
    return DEFAULT_DB;
  }
  try {
    const data = await file.json();
    // Asegurarnos de que siempre tenga la propiedad columns
    if (!data.columns) {
      data.columns = DEFAULT_DB.columns;
    }
    return data;
  } catch (e) {
    return DEFAULT_DB;
  }
}

const app = new Elysia()
  .use(cors())

  // Endpoint único que consume tu app principal para obtener el mock activo
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

  // Obtener todo (items, columns y activeId) para el panel administrador
  .get('/admin/data', async () => {
    return await getDb();
  })

  // Guardar la estructura completa (ideal para Kanban y Mocks)
  .post('/admin/data', async ({ body }) => {
    await Bun.write(FILE_PATH, JSON.stringify(body, null, 2));
    return { success: true };
  })

  .listen(3030);

console.log(`🚀 Servidor mock listo en http://localhost:${app.server?.port}`);