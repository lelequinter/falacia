import { useState } from 'react';
import { useDragAndDrop } from '@formkit/drag-and-drop/react';
import { Card, Button, Input, Modal, Typography, Space, Tag, message, Select, Dropdown } from 'antd';
import { PlusOutlined, DeleteOutlined, ColumnWidthOutlined, CheckCircleFilled, EditOutlined, MoreOutlined } from '@ant-design/icons';
import type { MockItem } from './MockCard';
// import { MockItem } from './MockCard';

const { Title, Text } = Typography;

export interface Column {
  id: string;
  name: string;
  cardIds: string[];
}

interface StepFunctionViewProps {
  columns: Column[];
  items: MockItem[];
  activeId: string;
  onUpdateColumns: (newColumns: Column[]) => void;
  onOpenCreateInColumn: (columnId: string) => void;
  onSelectActive: (id: string) => void;
}

export const StepFunctionView = ({
  columns,
  items,
  activeId,
  onUpdateColumns,
  onOpenCreateInColumn,
  onSelectActive,
}: StepFunctionViewProps) => {
  const [newColName, setNewColName] = useState('');
  const [isColModalOpen, setIsColModalOpen] = useState(false);

  // Estado para editar columna
  const [editingCol, setEditingCol] = useState<Column | null>(null);
  const [editColName, setEditColName] = useState('');
  const [isEditColModalOpen, setIsEditColModalOpen] = useState(false);

  const itemsMap = new Map(items.map((item) => [item.id, item]));

  const handleCreateColumn = () => {
    if (!newColName.trim()) return;
    const newColumn: Column = {
      id: `col-${Date.now()}`,
      name: newColName.trim(),
      cardIds: [],
    };
    onUpdateColumns([...columns, newColumn]);
    setNewColName('');
    setIsColModalOpen(false);
    message.success('Columna creada con éxito 🗂️');
  };

  const handleUpdateColumnName = () => {
    if (!editingCol || !editColName.trim()) return;
    const updated = columns.map(c => c.id === editingCol.id ? { ...c, name: editColName.trim() } : c);
    onUpdateColumns(updated);
    setIsEditColModalOpen(false);
    setEditingCol(null);
    message.success('Nombre de columna actualizado ✨');
  };

  const handleDeleteColumn = (colId: string) => {
    const updated = columns.filter((c) => c.id !== colId);
    onUpdateColumns(updated);
    message.info('Columna eliminada');
  };

  const handleAddExistingCard = (colId: string, cardId: string) => {
    const targetCol = columns.find(c => c.id === colId);
    if (!targetCol) return;
    if (targetCol.cardIds.includes(cardId)) {
      message.warning('Esta respuesta ya se encuentra en esta columna.');
      return;
    }
    const updated = columns.map(c => c.id === colId ? { ...c, cardIds: [...c.cardIds, cardId] } : c);
    onUpdateColumns(updated);
    message.success('Respuesta añadida a la columna');
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#0f172a' }}>Tablero Step Function (Kanban)</Title>
          <Text type="secondary">Organiza, arrastra verticalmente y transfiere tus respuestas mock entre columnas en tiempo real.</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsColModalOpen(true)}
          style={{ background: '#2563eb', borderRadius: '8px', fontWeight: 600 }}
        >
          Nueva Columna
        </Button>
      </div>

      <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px', minHeight: '600px', alignItems: 'flex-start' }}>
        {columns.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            items={items}
            itemsMap={itemsMap}
            activeId={activeId}
            onSelectActive={onSelectActive}
            onDeleteColumn={handleDeleteColumn}
            onEditColumn={() => {
              setEditingCol(col);
              setEditColName(col.name);
              setIsEditColModalOpen(true);
            }}
            onOpenCreate={() => onOpenCreateInColumn(col.id)}
            onAddExisting={(cardId) => handleAddExistingCard(col.id, cardId)}
            onCardsChange={(newCardIds) => {
              const updated = columns.map((c) => (c.id === col.id ? { ...c, cardIds: newCardIds } : c));
              onUpdateColumns(updated);
            }}
          />
        ))}

        {columns.length === 0 && (
          <Card style={{ width: '100%', textAlign: 'center', padding: '40px', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <ColumnWidthOutlined style={{ fontSize: '32px', color: '#94a3b8', marginBottom: '12px' }} />
            <Text type="secondary">No hay columnas creadas. ¡Crea una para comenzar a organizar tus pasos!</Text>
          </Card>
        )}
      </div>

      {/* Modal para Crear Columna */}
      <Modal
        title="Crear Nueva Columna (Paso)"
        open={isColModalOpen}
        onOk={handleCreateColumn}
        onCancel={() => setIsColModalOpen(false)}
        okText="Crear"
        cancelText="Cancelar"
      >
        <Input
          placeholder="Ej. Paso 3: Validación de Pago"
          value={newColName}
          onChange={(e) => setNewColName(e.target.value)}
          size="large"
          style={{ marginTop: '12px', borderRadius: '8px' }}
          onPressEnter={handleCreateColumn}
        />
      </Modal>

      {/* Modal para Editar Nombre de Columna */}
      <Modal
        title="Editar Nombre de Columna"
        open={isEditColModalOpen}
        onOk={handleUpdateColumnName}
        onCancel={() => setIsEditColModalOpen(false)}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <Input
          placeholder="Nombre de la columna"
          value={editColName}
          onChange={(e) => setEditColName(e.target.value)}
          size="large"
          style={{ marginTop: '12px', borderRadius: '8px' }}
          onPressEnter={handleUpdateColumnName}
        />
      </Modal>
    </div>
  );
};

interface KanbanColumnProps {
  column: Column;
  items: MockItem[];
  itemsMap: Map<string, MockItem>;
  activeId: string;
  onSelectActive: (id: string) => void;
  onDeleteColumn: (colId: string) => void;
  onEditColumn: () => void;
  onOpenCreate: () => void;
  onAddExisting: (cardId: string) => void;
  onCardsChange: (newCardIds: string[]) => void;
}

const KanbanColumn = ({
  column,
  items,
  itemsMap,
  activeId,
  onSelectActive,
  onDeleteColumn,
  onEditColumn,
  onOpenCreate,
  onAddExisting,
  onCardsChange,
}: KanbanColumnProps) => {
  // Destructuramos setValues para sincronizar FormKit cuando cambien las props del padre
  const [parentRef, cards, setValues] = useDragAndDrop<HTMLDivElement, string>(column.cardIds, {
    group: 'kanban-steps',
  });

  // Sincronización automática si el padre añade una tarjeta nueva a esta columna
  if (JSON.stringify(cards) !== JSON.stringify(column.cardIds)) {
    setValues(column.cardIds);
  }

  // Notificamos al componente principal cuando FormKit reordena las tarjetas mediante drag & drop
  const handleCardsUpdated = (newCards: string[]) => {
    if (JSON.stringify(newCards) !== JSON.stringify(column.cardIds)) {
      onCardsChange(newCards);
    }
  };

  const availableItemsOptions = items
    .filter(i => !column.cardIds.includes(i.id))
    .map(i => ({ label: `${i.name} (${i.statusCode})`, value: i.id }));

  const columnActionMenu = {
    items: [
      {
        key: 'edit',
        label: 'Editar nombre',
        icon: <EditOutlined />,
        onClick: onEditColumn,
      },
      {
        key: 'delete',
        label: 'Eliminar columna',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => onDeleteColumn(column.id),
      },
    ],
  };

  return (
    <div
      style={{
        background: '#f1f5f9',
        borderRadius: '12px',
        padding: '16px',
        width: '320px',
        minWidth: '320px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '75vh',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <Space>
          <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '15px' }}>{column.name}</span>
          <Tag color="geekblue" style={{ borderRadius: '10px' }}>{cards.length}</Tag>
        </Space>
        
        <Dropdown menu={columnActionMenu} trigger={['click']} placement="bottomRight">
          <Button type="text" icon={<MoreOutlined style={{ fontSize: '16px' }} />} size="small" />
        </Dropdown>
      </div>

      <div
        ref={parentRef}
        onMouseUp={() => handleCardsUpdated(cards)}
        onTouchEnd={() => handleCardsUpdated(cards)}
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          minHeight: '100px',
          paddingBottom: '8px',
        }}
      >
        {cards.map((cardId) => {
          const item = itemsMap.get(cardId);
          if (!item) return null;
          const isActive = item.id === activeId;

          return (
            <div
              key={item.id}
              onClick={() => onSelectActive(item.id)}
              style={{
                background: isActive ? '#f0fdf4' : '#ffffff',
                border: isActive ? '2px solid #2563eb' : '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '12px',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'border 0.2s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>{item.name}</span>
                <Tag color={item.statusCode >= 400 ? 'error' : 'success'} style={{ margin: 0, fontSize: '11px' }}>
                  {item.statusCode}
                </Tag>
              </div>
              {isActive && (
                <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircleFilled /> ACTIVA
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
        {availableItemsOptions.length > 0 && (
          <Select
            placeholder="Añadir respuesta existente..."
            options={availableItemsOptions}
            onChange={(val) => {
              if (val) onAddExisting(val);
            }}
            value={null}
            style={{ width: '100%' }}
            size="middle"
          />
        )}

        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={onOpenCreate}
          style={{ width: '100%', borderRadius: '8px', background: '#fff' }}
        >
          Crear respuesta aquí
        </Button>
      </div>
    </div>
  );
};