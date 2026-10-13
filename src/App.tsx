import { useState, useEffect } from 'react';
import './App.css';

interface MockItem {
  id: string;
  name: string;
  statusCode: number;
  data: any;
}

interface DbSchema {
  activeId: string;
  items: MockItem[];
}

export default function App() {
  const [db, setDb] = useState<DbSchema>({ activeId: '', items: [] });
  
  const [name, setName] = useState('');
  const [statusCode, setStatusCode] = useState<number>(200);
  // Estado inicial completamente limpio con espacios estándar de teclado
  const [jsonInput, setJsonInput] = useState('{\n  "id": 1234212,\n  "mensaje": "Respuesta correcta"\n}');
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const res = await fetch('http://localhost:3030/admin/data');
      const data = await res.json();
      setDb(data);
    } catch (err) {
      console.error('Error al conectar con el servidor mock:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveDbToBackend = async (updatedDb: DbSchema) => {
    await fetch('http://localhost:3030/admin/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedDb),
    });
    setDb(updatedDb);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Limpiamos caracteres invisibles comunes de copiado por si acaso
      const cleanInput = jsonInput.replace(/[\u200B-\u200D\uFEFF]/g, '');
      const parsedData = JSON.parse(cleanInput);
      setError('');

      const newItem: MockItem = {
        id: Date.now().toString(),
        name,
        statusCode: Number(statusCode),
        data: parsedData,
      };

      const updatedItems = [...db.items, newItem];
      const updatedActiveId = db.activeId || newItem.id;

      await saveDbToBackend({ activeId: updatedActiveId, items: updatedItems });

      setName('');
      setJsonInput('{\n  \n}');
    } catch (err: any) {
      setError(`JSON inválido: ${err.message}`);
    }
  };

  const handleSelectActive = async (id: string) => {
    await saveDbToBackend({ ...db, activeId: id });
  };

  const handleDelete = async (id: string) => {
    const updatedItems = db.items.filter(item => item.id !== id);
    let updatedActiveId = db.activeId;

    if (db.activeId === id) {
      updatedActiveId = updatedItems.length > 0 ? updatedItems[0].id : '';
    }

    await saveDbToBackend({ activeId: updatedActiveId, items: updatedItems });
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif', textAlign: 'left' }}>
      <h1>🎯 Panel de Mocks (Guardado en `responses.json`)</h1>
      <p>Crea, edita y selecciona al instante la respuesta que enviará tu único endpoint de backend.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        
        {/* Formulario de Creación */}
        <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb', color: '#111' }}>
          <h3>Nueva Respuesta Mock</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>Nombre identificador:</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Ej. Usuario No Encontrado" 
                required 
                style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>Código HTTP (Status Code):</label>
              <input 
                type="number" 
                value={statusCode} 
                onChange={e => setStatusCode(Number(e.target.value))} 
                required 
                style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>Cuerpo de Respuesta (JSON):</label>
              <textarea 
                rows={7} 
                value={jsonInput} 
                onChange={e => setJsonInput(e.target.value)} 
                style={{ width: '100%', fontFamily: 'monospace', padding: '0.5rem', boxSizing: 'border-box' }}
              />
              {error && <span style={{ color: 'red', fontSize: '0.75rem', display: 'block', marginTop: '0.2rem' }}>{error}</span>}
            </div>

            <button type="submit" style={{ background: '#2563eb', color: 'white', padding: '0.75rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Guardar en responses.json
            </button>
          </form>
        </div>

        {/* Tarjetas / Listado de Opciones */}
        <div>
          <h3>Respuestas Guardadas</h3>
          <p style={{ fontSize: '0.85rem', color: '#666' }}>Selecciona cuál deseas que responda tu servidor en tiempo real.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '500px', overflowY: 'auto' }}>
            {db.items.length === 0 ? (
              <p style={{ color: '#888', fontStyle: 'italic' }}>No hay respuestas creadas todavía.</p>
            ) : (
              db.items.map(item => {
                const isActive = item.id === db.activeId;
                return (
                  <div 
                    key={item.id} 
                    style={{ 
                      border: isActive ? '2px solid #2563eb' : '1px solid #d1d5db', 
                      background: isActive ? '#eff6ff' : '#fff',
                      color: '#111',
                      padding: '1rem', 
                      borderRadius: '8px',
                      position: 'relative'
                    }}
                  >
                    {isActive && (
                      <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#2563eb', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                        ACTIVA
                      </span>
                    )}
                    
                    <h4 style={{ margin: '0 0 0.4rem 0' }}>{item.name}</h4>
                    <div style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                      Status: <strong>{item.statusCode}</strong>
                    </div>

                    <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: '0.5rem', borderRadius: '4px', fontSize: '0.75rem', overflowX: 'auto', maxHeight: '100px' }}>
                      {JSON.stringify(item.data, null, 2)}
                    </pre>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem' }}>
                      {!isActive && (
                        <button 
                          onClick={() => handleSelectActive(item.id)}
                          style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                        >
                          Elegir como respuesta
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(item.id)}
                        style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}