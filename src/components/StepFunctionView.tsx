import { useState } from 'react';
import { useDragAndDrop } from '@formkit/drag-and-drop/react';
import { Card, Button, Input, Modal, Typography, Space, Tag, message, Select, Dropdown } from 'antd';
import { PlusOutlined, DeleteOutlined, ColumnWidthOutlined, EditOutlined, MoreOutlined, DisconnectOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import type { MockItem } from './MockCard';

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
  onOpenEditModal: (item: MockItem) => void;
  onSelectActive: (id: string) => void;
  onDeleteGlobalItem: (id: string) => void;
}

export const StepFunctionView = ({
  columns,
  items,
  activeId,
  onUpdateColumns,
  onOpenCreateInColumn,
  onOpenEditModal,
  onSelectActive,
  onDeleteGlobalItem,
}: StepFunctionViewProps) => {
  const [newColName, setNewColName] = useState('');
  const [isColModalOpen, setIsColModalOpen] = useState(false);

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

  const handleRemoveFromColumn = (colId: string, cardId: string) => {
    const updated = columns.map(c => {
      if (c.id === colId) {
        return { ...c, cardIds: c.cardIds.filter(id => id !== cardId) };
      }
      return c;
    });
    onUpdateColumns(updated);
    message.info('Respuesta retirada de la columna');
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#0f172a' }}>Tablero Step Function</Title>
          <Text type="secondary">Gestiona, edita y organiza tus respuestas mock directamente desde el flujo.</Text>
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
            allColumns={columns}
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
            onRemoveFromColumn={(cardId) => handleRemoveFromColumn(col.id, cardId)}
            onEditItem={onOpenEditModal}
            onDeleteGlobalItem={onDeleteGlobalItem}
            onUpdateColumns={onUpdateColumns}
          />
        ))}

        {columns.length === 0 && (
          <Card style={{ width: '100%', textAlign: 'center', padding: '40px', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <ColumnWidthOutlined style={{ fontSize: '32px', color: '#94a3b8', marginBottom: '12px' }} />
            <Text type="secondary">No hay columnas creadas. ¡Crea una para comenzar!</Text>
          </Card>
        )}
      </div>

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
  allColumns: Column[];
  items: MockItem[];
  itemsMap: Map<string, MockItem>;
  activeId: string;
  onSelectActive: (id: string) => void;
  onDeleteColumn: (colId: string) => void;
  onEditColumn: () => void;
  onOpenCreate: () => void;
  onAddExisting: (cardId: string) => void;
  onRemoveFromColumn: (cardId: string) => void;
  onEditItem: (item: MockItem) => void;
  onDeleteGlobalItem: (id: string) => void;
  onUpdateColumns: (newColumns: Column[]) => void;
}

const KanbanColumn = ({
  column,
  allColumns,
  items,
  itemsMap,
  activeId,
  onSelectActive,
  onDeleteColumn,
  onEditColumn,
  onOpenCreate,
  onAddExisting,
  onRemoveFromColumn,
  onEditItem,
  onDeleteGlobalItem,
  onUpdateColumns,
}: KanbanColumnProps) => {
  // Configuramos explícitamente el hook asegurando sortable: true y el grupo compartido
  const [parentRef, cards, setValues] = useDragAndDrop<HTMLDivElement, string>(column.cardIds, {
    group: 'kanban-board',
    sortable: true,
  });

  if (JSON.stringify(cards) !== JSON.stringify(column.cardIds)) {
    setValues(column.cardIds);
  }

  const handleCardsChanged = () => {
    if (JSON.stringify(cards) !== JSON.stringify(column.cardIds)) {
      const updated = allColumns.map(col => {
        if (col.id === column.id) {
          return { ...col, cardIds: cards };
        } else {
          return { ...col, cardIds: col.cardIds.filter(id => !cards.includes(id)) };
        }
      });
      onUpdateColumns(updated);
    }
  };

  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleExpand = (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCards(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const availableItemsOptions = items
    .filter(i => !column.cardIds.includes(i.id))
    .map(i => ({ label: `${i.name} (${i.statusCode})`, value: i.id }));

  const columnActionMenu = {
    items: [
      { key: 'edit', label: 'Editar nombre', icon: <EditOutlined />, onClick: onEditColumn },
      { key: 'delete', label: 'Eliminar columna', icon: <DeleteOutlined />, danger: true, onClick: () => onDeleteColumn(column.id) },
    ],
  };

  return (
    <div
      style={{
        background: '#f1f5f9',
        borderRadius: '12px',
        padding: '12px',
        width: '310px',
        minWidth: '310px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '78vh',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <Space size={6}>
          <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '14px' }}>{column.name}</span>
          <Tag color="geekblue" style={{ borderRadius: '10px', margin: 0, fontSize: '11px' }}>{cards.length}</Tag>
        </Space>
        
        <Dropdown menu={columnActionMenu} trigger={['click']} placement="bottomRight">
          <Button type="text" icon={<MoreOutlined style={{ fontSize: '16px' }} />} size="small" style={{ padding: '0 4px' }} />
        </Dropdown>
      </div>

      <div
        ref={parentRef}
        onPointerUp={handleCardsChanged}
        onMouseUp={handleCardsChanged}
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          minHeight: '120px',
          paddingBottom: '4px',
        }}
      >
        {cards.map((cardId) => {
          const item = itemsMap.get(cardId);
          if (!item) return null;
          const isActive = item.id === activeId;
          const isExpanded = !!expandedCards[item.id];

          const cardActionMenu = {
            items: [
              {
                key: 'edit',
                label: 'Editar respuesta',
                icon: <EditOutlined />,
                onClick: () => onEditItem(item),
              },
              {
                key: 'remove',
                label: 'Quitar de esta columna',
                icon: <DisconnectOutlined />,
                onClick: () => onRemoveFromColumn(item.id),
              },
              {
                key: 'delete',
                label: 'Eliminar globalmente',
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => onDeleteGlobalItem(item.id),
              },
            ],
          };

          return (
            <div
              key={cardId}
              style={{
                background: isActive ? '#f0fdf4' : '#ffffff',
                border: isActive ? '2px solid #2563eb' : '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '8px 10px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                cursor: 'grab',
                touchAction: 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div 
                  onClick={() => onSelectActive(item.id)} 
                  style={{ cursor: 'pointer', flex: 1, display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}
                >
                  <Tag color={item.statusCode >= 400 ? 'error' : 'success'} style={{ margin: 0, fontSize: '10px', padding: '0 4px', lineHeight: '18px' }}>
                    {item.statusCode}
                  </Tag>
                  <span style={{ fontWeight: 600, fontSize: '12px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </span>
                </div>

                <Space size={2}>
                  {isActive && <Tag color="success" style={{ fontSize: '9px', borderRadius: '4px', margin: 0, padding: '0 3px' }}>ACTIVA</Tag>}
                  
                  <Button 
                    type="text" 
                    size="small" 
                    icon={isExpanded ? <UpOutlined style={{ fontSize: '10px' }} /> : <DownOutlined style={{ fontSize: '10px' }} />} 
                    onClick={(e) => toggleExpand(item.id, e)}
                    style={{ color: '#64748b', padding: '0 2px', height: '20px' }}
                    title="Ver JSON"
                  />

                  <div onClick={(e) => e.stopPropagation()}>
                    <Dropdown menu={cardActionMenu} trigger={['click']} placement="bottomRight">
                      <Button type="text" icon={<MoreOutlined style={{ fontSize: '14px' }} />} size="small" style={{ padding: '0 2px', height: '20px' }} />
                    </Dropdown>
                  </div>
                </Space>
              </div>

              {isExpanded && (
                <div style={{ background: '#0f172a', borderRadius: '4px', padding: '6px 8px', marginTop: '6px', maxHeight: '100px', overflowY: 'auto' }}>
                  <pre style={{ color: '#ffffff', fontSize: '10px', margin: 0, fontFamily: 'monospace', textAlign: 'left', whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(item.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
        {availableItemsOptions.length > 0 && (
          <Select
            placeholder="Añadir respuesta existente..."
            options={availableItemsOptions}
            onChange={(val) => {
              if (val) onAddExisting(val);
            }}
            value={null}
            style={{ width: '100%' }}
            size="small"
          />
        )}

        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={onOpenCreate}
          size="small"
          style={{ width: '100%', borderRadius: '6px', background: '#fff' }}
        >
          Crear respuesta aquí
        </Button>
      </div>
    </div>
  );
};