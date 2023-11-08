import { useState, useEffect, useRef } from 'react';
import { Form, Table, Typography, Button } from 'antd';
import { AiFillEdit, AiFillDelete } from "react-icons/ai";
import { EditableCell } from './EditableCell';
import { fetchUsers, removeUser, editUser, addEmptyItem, addNewUser } from '../features/user/userSlice'
import { useDispatch, useSelector } from 'react-redux';

export const UserTable = () => {
  const dispatch = useDispatch()
  const list = useSelector((state) => state.users.list);
  const loading = useSelector((state) => state.users.loading);
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const [current, setCurrent] = useState(1);
  const pageSizeRef = useRef(5);

  const isEditing = (record) => record.key === editingKey;

  const emptyItem = {
    name: '',
    email: '',
    website: '',
    address: '',
  };

  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch]);

  const addUser = () => {
    dispatch(addEmptyItem())
    setCurrent(2)
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

  const remove = (id) => {
    dispatch(removeUser(id));
  }

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (key) => {
    const row = await form.validateFields();
    if (row && key !== 0) {
      dispatch(editUser({ key, row }))
    } else {
      dispatch(addNewUser(row))
    }
    setEditingKey('');
  };

  const similarColumns = ['name', 'address', 'website', 'email'].map(e => ({
    title: e,
    dataIndex: e,
    width: '22%',
    editable: true,
  }))
  similarColumns[3].responsive = ['sm']
  similarColumns[1].responsive = ['md']
  similarColumns[2].responsive = ['lg']

  const columns = [
    ...similarColumns,
    {
      title: 'operation',
      dataIndex: 'operation',
      width: '12%',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link onClick={() => save(record.key)} style={{ marginRight: 8, }}>
              Save
            </Typography.Link>
            <span onClick={cancel} className='cancel-button'>Cancel</span>
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
          className='animated-border'
          components={{ body: { cell: EditableCell, }, }}
          bordered
          loading={loading}
          dataSource={list}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={{
            defaultPageSize: pageSizeRef.current,
            position: ['bottomCenter'],
            current:current,
            onChange:(newCurrent, newPageSize) => {
              const pageSizeChange = pageSizeRef.current !== newPageSize;
              if (pageSizeChange) {
                setCurrent(1);
              } else {
                setCurrent(newCurrent);
              }
              pageSizeRef.current = newPageSize;
            }}
          }
        />
      </Form>
    </>
  );
};
