import { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Popconfirm, Table, Typography, Button } from 'antd';
import UserApi from '../api/index';
import { AiFillEdit, AiFillDelete } from "react-icons/ai";

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};
export const UserTable = () => {
  const api = new UserApi('http://localhost:3001/users')
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState('');
  const isEditing = (record) => record.key === editingKey;

  const showModal = () => {
    let NewData = [...data]
    let emptyItem = {
      key: Date.now(),
      name: '',
      email: '',
      website: '',
      address: '',
    }
    NewData.unshift(emptyItem)
    setData(NewData)
    edit(emptyItem)
  };
  const edit = (record) => {
    form.setFieldsValue({
      name: '',
      email: '',
      website: '',
      address: '',
      ...record,
    });
    setEditingKey(record.key);
  };
  const remove = async (id) => {
    const res = await api.deleteUser(id);
    if (res.status === 200) {
      setData(data.filter(e => e.id !== id))
    };
  }
  const cancel = () => {
    setEditingKey('');
  };
  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setData(newData);
        console.log(row);
        await api.updateUser(key, row)
        await api.getUsers()
        setEditingKey('');
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey('');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  useEffect(() => {
    async function fetchUsers() {
      let response = await api.getUsers()
      const data = response.data.map(u => {
        return {
          key: u.id,
          ...u
        }
      })
      setData(data);
    }
    fetchUsers()
  }, []);

  const columns = [
    {
      title: 'name',
      dataIndex: 'name',
      width: '25%',
      editable: true,
    },
    {
      title: 'address',
      dataIndex: 'address',
      width: '25%',
      editable: true,
    },
    {
      title: 'website',
      dataIndex: 'website',
      width: '25%',
      editable: true,
    },
    {
      title: 'email',
      dataIndex: 'email',
      width: '40%',
      editable: true,
    },
    {
      title: 'operation',
      dataIndex: 'operation',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link
              onClick={() => save(record.key)}
              style={{
                marginRight: 8,
              }}
            >
              Save
            </Typography.Link>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a>Cancel</a>
            </Popconfirm>
          </span>
        ) : (
          <>
            <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
              <AiFillEdit size={20} />
            </Typography.Link>
            <Typography.Link disabled={editingKey !== ''} onClick={() => remove(record.key)}>
              <AiFillDelete size={20} />
            </Typography.Link>
          </>
        );
      },
    },
  ];
  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });
  return (
    <>
      <Button onClick={showModal}>Create User</Button>
      <Form form={form} component={false}>
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          dataSource={data}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={false}
        />
      </Form>
    </>
  );
};
