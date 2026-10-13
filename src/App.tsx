import { useState, useEffect } from 'react';
import { Layout, Menu, Button, Typography, Tag, Space, message, App as AntApp } from 'antd';
import {
  ApiOutlined,
  AppstoreOutlined,
  SwapOutlined,
  PlusOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined
} from '@ant-design/icons';

import { MockCard, type MockItem } from './components/MockCard';
import { MockFormModal } from './components/MockFormModal';
import { StepFunctionView, type Column } from './components/StepFunctionView';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

interface DbSchema {
  activeId: string;
  items: MockItem[];
  columns: Column[];
}

function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<'mocks' | 'step2'>('mocks');

  const [db, setDb] = useState<DbSchema>({ activeId: '', items: [], columns: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MockItem | null>(null);

  // Estado para saber si estamos creando una tarjeta dentro de una columna específica del Kanban
  const [targetColumnId, setTargetColumnId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch('http://localhost:3030/admin/data');
      const data = await res.json();
      setDb({
        activeId: data.activeId || '',
        items: data.items || [],
        columns: data.columns || [{ id: 'col-1', name: 'Paso 1: General', cardIds: [] }]
      });
    } catch (err) {
      console.error('Error al conectar con el servidor:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveDbToBackend = async (updatedDb: DbSchema, successMsg?: string) => {
    await fetch('http://localhost:3030/admin/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedDb),
    });
    setDb(updatedDb);
    if (successMsg) message.success(successMsg);
  };

  const handleCreateOrUpdate = async (values: { name: string; statusCode: number; data: any }) => {
    if (editingItem) {
      const updatedItems = db.items.map(i =>
        i.id === editingItem.id ? { ...i, ...values } : i
      );
      await saveDbToBackend({ ...db, items: updatedItems }, '¡Mock actualizado correctamente!');
    } else {
      const newItem: MockItem = {
        id: Date.now().toString(),
        ...values
      };
      const updatedItems = [...db.items, newItem];
      const updatedActiveId = db.activeId || newItem.id;

      // Creamos una copia profunda limpia de las columnas
      let updatedColumns = db.columns.map(col => ({
        ...col,
        cardIds: [...col.cardIds]
      }));

      if (targetColumnId) {
        updatedColumns = updatedColumns.map(col => {
          if (col.id === targetColumnId) {
            return { ...col, cardIds: [...col.cardIds, newItem.id] };
          }
          return col;
        });
      } else if (updatedColumns.length > 0) {
        updatedColumns[0] = {
          ...updatedColumns[0],
          cardIds: [...updatedColumns[0].cardIds, newItem.id]
        };
      }

      const newDbState = {
        activeId: updatedActiveId,
        items: updatedItems,
        columns: updatedColumns
      };

      // Actualizamos estado local y backend de forma sincronizada
      setDb(newDbState);
      await fetch('http://localhost:3030/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDbState),
      });

      message.success('¡Mock creado y asignado con éxito!');
    }

    setIsModalOpen(false);
    setTargetColumnId(null);
  };

  const handleSelectActive = async (id: string) => {
    if (id === db.activeId) return;
    await saveDbToBackend({ ...db, activeId: id }, '¡Respuesta activa actualizada!');
  };

  const handleDelete = async (id: string) => {
    const updatedItems = db.items.filter(item => item.id !== id);
    let updatedActiveId = db.activeId;
    if (db.activeId === id) {
      updatedActiveId = updatedItems.length > 0 ? updatedItems[0].id : '';
    }

    // Remover también el ID de las tarjetas de cualquier columna en el tablero Kanban
    const updatedColumns = db.columns.map(col => ({
      ...col,
      cardIds: col.cardIds.filter(cardId => cardId !== id)
    }));

    await saveDbToBackend({ activeId: updatedActiveId, items: updatedItems, columns: updatedColumns }, 'Mock eliminado');
  };

  // Actualizar columnas (cuando se reordenan tarjetas vertical/horizontalmente o se crean/eliminan columnas)
  // Actualizar todo el arreglo de columnas de golpe al arrastrar y soltar
  const handleUpdateColumns = async (newColumns: Column[]) => {
    const updatedDb = { ...db, columns: newColumns };
    setDb(updatedDb);
    await fetch('http://localhost:3030/admin/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedDb),
    });
  };

  const routeTitles = {
    mocks: 'Gestor de Respuestas Mock',
    step2: 'Tablero Step Function',
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        style={{ borderRight: '1px solid #e2e8f0' }}
      >
        <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#2563eb', padding: '8px', borderRadius: '8px', color: '#fff', display: 'flex' }}>
            <ApiOutlined style={{ fontSize: '20px' }} />
          </div>
          {!collapsed && <span style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>MockStudio</span>}
        </div>

        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[currentRoute]}
          onClick={({ key }) => setCurrentRoute(key as 'mocks' | 'step2')}
          items={[
            {
              key: 'mocks',
              icon: <AppstoreOutlined />,
              label: 'Respuestas',
            },
            {
              key: 'step2',
              icon: <SwapOutlined />,
              label: 'Step Function',
            },
          ]}
        />
      </Sider>

      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0' }}>
          <Space size="middle">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px' }}
            />
            <Title level={4} style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>
              {routeTitles[currentRoute]}
            </Title>
          </Space>

          {currentRoute === 'mocks' && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => { setEditingItem(null); setTargetColumnId(null); setIsModalOpen(true); }}
              style={{ background: '#2563eb', borderRadius: '8px', fontWeight: 600 }}
            >
              Crear Respuesta
            </Button>
          )}
        </Header>

        <Content style={{ padding: '24px', background: '#f8fafc', minHeight: '280px' }}>
          {currentRoute === 'mocks' ? (
            <div>
              <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text type="secondary">Selecciona con un clic la respuesta que responderá tu servidor.</Text>
                <Tag color="blue">Total: {db.items.length}</Tag>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', width: '100%' }}>
                {db.items.map(item => (
                  <MockCard
                    key={item.id}
                    item={item}
                    isActive={item.id === db.activeId}
                    onSelect={handleSelectActive}
                    onEdit={(itemToEdit) => { setEditingItem(itemToEdit); setTargetColumnId(null); setIsModalOpen(true); }}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          ) : (
            <StepFunctionView
              columns={db.columns}
              items={db.items}
              activeId={db.activeId}
              onUpdateColumns={handleUpdateColumns}
              onOpenCreateInColumn={(colId) => {
                setEditingItem(null);
                setTargetColumnId(colId);
                setIsModalOpen(true);
              }}
              onOpenEditModal={(itemToEdit) => {
                setEditingItem(itemToEdit);
                setTargetColumnId(null);
                setIsModalOpen(true);
              }}
              onSelectActive={handleSelectActive}
              onDeleteGlobalItem={handleDelete}
            />
          )}
        </Content>
      </Layout>

      <MockFormModal
        isOpen={isModalOpen}
        editingItem={editingItem}
        onClose={() => { setIsModalOpen(false); setTargetColumnId(null); }}
        onSubmit={handleCreateOrUpdate}
      />
    </Layout>
  );
}

export default function App() {
  return (
    <AntApp>
      <MainLayout />
    </AntApp>
  );
}