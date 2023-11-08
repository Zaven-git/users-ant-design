import { useState, useEffect } from 'react';
import { Form, Popconfirm, Table, Typography, Button } from 'antd';
import UserApi from '../api/index';
import { AiFillEdit, AiFillDelete } from "react-icons/ai";
import { EditableCell } from './EditableCell';

const API_URL = 'http://localhost:3001/users'

export const UserTable = () => {
  const api = new UserApi(API_URL)
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState('');
  const isEditing = (record) => record.key === editingKey;

  const emptyItem = {
    name: '',
    email: '',
    website: '',
    address: '',
  };

  const addUser = () => {
    let newData = [...data]
    newData.push({ key: 0, ...emptyItem })
    setData(newData)
    setTimeout(() => {
      window.scrollTo(0, document.body.scrollHeight);
    }, 0);
    edit({ key: 0, ...emptyItem })
  };

  const edit = (record) => {
    form.setFieldsValue({
      ...emptyItem,
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
        if (editingKey !== 0) {
          await api.updateUser(key, row)
        } else {
          let res = await api.addNewUser(row)
          if (res.status === 200) {
            newData.push(res.data)
          }
        }
        setData(newData);
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
      const data = response.data.map(u => ({ key: u.id, ...u }))
      setData(data);
    }
    fetchUsers()
  }, []);

  const similarColumns = ['name', 'address', 'website', 'email'].map(e => ({
    title: e,
    dataIndex: e,
    width: '25%',
    editable: true,
  }))

  const columns = [
    ...similarColumns,
    {
      title: 'operation',
      dataIndex: 'operation',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link onClick={() => save(record.key)} style={{ marginRight: 8, }}>
              Save
            </Typography.Link>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}><a>Cancel</a></Popconfirm>
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
      <Button size='large' onClick={addUser}>Create New User</Button>
      <Form form={form} component={false}>
        <Table
          components={{ body: { cell: EditableCell, }, }}
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
