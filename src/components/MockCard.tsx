import { Card, Tag, Space, Dropdown, Button } from 'antd';
import { CheckCircleFilled, MoreOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

export interface MockItem {
  id: string;
  name: string;
  statusCode: number;
  data: any;
}

interface MockCardProps {
  item: MockItem;
  isActive: boolean;
  onSelect: (id: string) => void;
  onEdit: (item: MockItem) => void;
  onDelete: (id: string) => void;
}

export const MockCard = ({ item, isActive, onSelect, onEdit, onDelete }: MockCardProps) => {
  const getStatusColor = (code: number) => {
    if (code >= 200 && code < 300) return 'success';
    if (code >= 400 && code < 500) return 'warning';
    if (code >= 500) return 'error';
    return 'processing';
  };

  const actionMenu = {
    items: [
      {
        key: 'edit',
        label: 'Editar respuesta',
        icon: <EditOutlined />,
        onClick: () => onEdit(item),
      },
      {
        key: 'delete',
        label: 'Eliminar',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => onDelete(item.id),
      },
    ],
  };

  return (
    <Card
      hoverable
      onClick={() => onSelect(item.id)}
      style={{ 
        borderRadius: '12px',
        border: isActive ? '2px solid #2563eb' : '1px solid #e2e8f0',
        background: isActive ? '#f0fdf4' : '#ffffff',
        boxShadow: isActive ? '0 8px 20px -4px rgba(37, 99, 235, 0.12)' : '0 2px 4px rgba(0,0,0,0.02)',
        transition: 'all 0.2s ease',
        cursor: 'pointer'
      }}
      bodyStyle={{ padding: '16px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          {isActive && (
            <Tag color="success" icon={<CheckCircleFilled />} style={{ marginBottom: '6px', borderRadius: '10px' }}>
              ACTIVA AHORA
            </Tag>
          )}
          <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>{item.name}</div>
        </div>

        <Space size={4}>
          <Tag color={getStatusColor(item.statusCode)} style={{ fontWeight: 'bold', borderRadius: '6px' }}>
            {item.statusCode}
          </Tag>
          <div onClick={(e) => e.stopPropagation()}>
            <Dropdown menu={actionMenu} trigger={['click']} placement="bottomRight">
              <Button type="text" icon={<MoreOutlined style={{ fontSize: '18px' }} />} />
            </Dropdown>
          </div>
        </Space>
      </div>

      {/* JSON con alto contraste (texto blanco y alineado a la izquierda) */}
      <div style={{ background: '#0f172a', borderRadius: '8px', padding: '10px 12px', maxHeight: '130px', overflowY: 'auto' }}>
        <pre style={{ color: '#ffffff', fontSize: '12px', margin: 0, fontFamily: 'monospace', textAlign: 'left', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {JSON.stringify(item.data, null, 2)}
        </pre>
      </div>
    </Card>
  );
};