import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Space, Button, Typography, message } from 'antd';
import { PlusOutlined, EditOutlined, CodeOutlined } from '@ant-design/icons';
import type { MockItem } from './MockCard';

const { Text } = Typography;

const STATUS_OPTIONS = [
  { label: '200 - OK (Éxito)', value: 200 },
  { label: '201 - Created (Creado)', value: 201 },
  { label: '202 - Accepted (Aceptado)', value: 202 },
  { label: '204 - No Content (Sin contenido)', value: 204 },
  { label: '400 - Bad Request (Solicitud incorrecta)', value: 400 },
  { label: '401 - Unauthorized (No autorizado)', value: 401 },
  { label: '403 - Forbidden (Prohibido)', value: 403 },
  { label: '404 - Not Found (No encontrado)', value: 404 },
  { label: '422 - Unprocessable Entity (Error de validación)', value: 422 },
  { label: '500 - Internal Server Error (Error de servidor)', value: 500 },
  { label: '502 - Bad Gateway', value: 502 },
  { label: '503 - Service Unavailable', value: 503 },
];

interface MockFormModalProps {
  isOpen: boolean;
  editingItem: MockItem | null;
  onClose: () => void;
  onSubmit: (values: { name: string; statusCode: number; data: any }) => void;
}

export const MockFormModal = ({ isOpen, editingItem, onClose, onSubmit }: MockFormModalProps) => {
  const [form] = Form.useForm();
  const [jsonInput, setJsonInput] = useState('{\n  "id": 1234212,\n  "mensaje": "Respuesta correcta"\n}');
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        form.setFieldsValue({
          name: editingItem.name,
          statusCode: editingItem.statusCode,
        });
        setJsonInput(JSON.stringify(editingItem.data, null, 2));
      } else {
        form.resetFields();
        form.setFieldsValue({ statusCode: 200 });
        setJsonInput('{\n  "id": 1234212,\n  "mensaje": "Respuesta correcta"\n}');
      }
      setJsonError(null);
    }
  }, [isOpen, editingItem, form]);

  const handleFormatJson = () => {
    try {
      const clean = jsonInput.replace(/[\u200B-\u200D\uFEFF]/g, '');
      const parsed = JSON.parse(clean);
      setJsonInput(JSON.stringify(parsed, null, 2));
      setJsonError(null);
      message.success('JSON formateado correctamente ✨');
    } catch (err: any) {
      setJsonError(`JSON inválido: ${err.message}`);
      message.error('Sintaxis de JSON incorrecta.');
    }
  };

  const handleFinish = (values: any) => {
    try {
      const clean = jsonInput.replace(/[\u200B-\u200D\uFEFF]/g, '');
      const parsedData = JSON.parse(clean);
      onSubmit({
        name: values.name,
        statusCode: values.statusCode,
        data: parsedData,
      });
    } catch (err: any) {
      setJsonError(`Sintaxis inválida: ${err.message}`);
      message.error('Corrige el JSON antes de guardar.');
    }
  };

  return (
    <Modal
      title={
        <Space>
          {editingItem ? <EditOutlined style={{ color: '#2563eb' }} /> : <PlusOutlined style={{ color: '#2563eb' }} />}
          <span>{editingItem ? 'Editar Respuesta Mock' : 'Nueva Respuesta Mock'}</span>
        </Space>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={560}
      style={{ borderRadius: '12px' }}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: '16px' }}>
        <Form.Item
          name="name"
          label="Nombre Identificador"
          rules={[{ required: true, message: 'Ingresa un nombre para la tarjeta' }]}
        >
          <Input placeholder="Ej. Usuario Premium Exitoso" size="large" style={{ borderRadius: '8px' }} />
        </Form.Item>

        <Form.Item
          name="statusCode"
          label="Código de Estado HTTP"
          rules={[{ required: true, message: 'Selecciona un estado HTTP' }]}
        >
          <Select size="large" options={STATUS_OPTIONS} style={{ width: '100%', borderRadius: '8px' }} />
        </Form.Item>

        <Form.Item label="Cuerpo de Respuesta (JSON)">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '6px' }}>
            <Button size="small" icon={<CodeOutlined />} onClick={handleFormatJson} type="dashed">
              Formatear y validar
            </Button>
          </div>
          <Input.TextArea
            rows={8}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            style={{ fontFamily: 'monospace', fontSize: '13px', borderRadius: '8px', background: '#fafafa', textAlign: 'left' }}
          />
          {jsonError && (
            <Text type="danger" style={{ fontSize: '12px', display: 'block', marginTop: '6px' }}>
              {jsonError}
            </Text>
          )}
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button onClick={onClose} size="large" style={{ borderRadius: '8px' }}>
              Cancelar
            </Button>
            <Button type="primary" htmlType="submit" size="large" style={{ background: '#2563eb', borderRadius: '8px', fontWeight: 600 }}>
              {editingItem ? 'Guardar Cambios' : 'Crear Mock'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};