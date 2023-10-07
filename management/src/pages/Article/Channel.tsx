import React, { useState, useRef, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Form, Modal, Input, InputNumber, message, Menu, Dropdown } from "antd/lib";
import { PlusOutlined, ExclamationCircleOutlined } from "@ant-design/icons/lib";
import { RootDispatch, RootState } from "../../models/store";
import { Channel, ArticleGet } from "../../models/article";
import { sortBy } from "../../public";
import { FormOnFinishStore } from "../../public/types/public";
const { confirm } = Modal;

interface Eprops {
  getArticleList: (params: ArticleGet) => void;
  setCurChannelId: React.Dispatch<React.SetStateAction<string | null>>;
  setPage: (page: number) => void;
  curChannelId: string | null;
}
export default ({ getArticleList, setPage, curChannelId, setCurChannelId }: Eprops): JSX.Element => {
  const dispatch: RootDispatch = useDispatch();
  const { channelList } = useSelector((state: RootState) => ({
    channelList: state.article.channelList
  }));

  /* ---------------------------------------------- 频道编辑 ---------------------------------------------- */
  const [channelShow, setChannelShow] = useState(false);
  const [addEditForm] = Form.useForm();

  // 编辑频道
  const [disabledSort, setDisabledSort] = useState(false);
  const [maxSort, setMaxSort] = useState(0);
  const editId = useRef<null | string>(null);
  const editItem = async (item: Channel): Promise<void> => {
    editId.current = item._id;
    addEditForm.setFieldsValue(item);
    setDisabledSort(false);
    setChannelShow(true);

    // 设置最大值
    const arrTemp = JSON.parse(JSON.stringify(channelList));
    arrTemp.sort(sortBy("sort", true));
    setMaxSort(arrTemp.length > 0 ? arrTemp[arrTemp.length - 1].sort : 0);
  };

  // 删除频道
  const delItem = async (_id: string): Promise<void> => {
    const res = await dispatch.article.channelDel({ _id });
    if (!res) {
      message.info("删除错误");
      return;
    }
    if (res.code !== 1) {
      message.info(res.msg);
      return;
    }
    window.location.reload();
    message.info("删除成功");
  };

  // 确认添加或编辑
  const onFinishChannel = async (values: FormOnFinishStore): Promise<void> => {
    if (!editId.current) {
      // 添加
      const res = await dispatch.article.channelAdd(values);
      if (!res) {
        message.info("添加频道错误");
        return;
      }
      if (res.code !== 1) {
        message.info(res.msg);
        return;
      }
    } else {
      // 编辑
      values._id = editId.current;
      const res = await dispatch.article.channelEdit(values);
      if (!res) {
        message.info("编辑频道错误");
        return;
      }
      if (res.code !== 1) {
        message.info(res.msg);
        return;
      }
    }
    window.location.reload();
  };

  // 获取频道
  const getChannelList = useCallback(async () => {
    const res = await dispatch.article.channelGet();
    if (!res) {
      message.info("获取频道错误");
      return;
    }
    if (res.code !== 1) {
      message.info(res.msg);
      return;
    }
  }, [dispatch.article]);

  // 获取默认频道
  useEffect(() => {
    getChannelList();
  }, [getChannelList]);
  return (
    <div className="page-channel">
      <Button
        style={{ margin: "0 10px 10px 0" }}
        type={curChannelId === null ? "primary" : "default"}
        onClick={(): void => {
          setCurChannelId(null);
          setPage(1);
          getArticleList({ currentPage: 1 });
        }}
      >
        全部
      </Button>
      {Array.isArray(channelList) &&
        channelList.map(function(item: Channel) {
          return (
            <Dropdown
              key={item._id}
              trigger={["contextMenu"]}
              overlay={
                <Menu>
                  <Menu.Item onClick={(): Promise<void> => editItem(item)}>编辑</Menu.Item>
                  <Menu.Item
                    onClick={(): void => {
                      confirm({
                        title: `确认要删除“${item.name}”频道吗?`,
                        icon: <ExclamationCircleOutlined />,
                        content: `${item.name}: 删除后将影响前端显示`,
                        okText: "确认",
                        okType: "danger",
                        cancelText: "取消",
                        onOk() {
                          delItem(item._id);
                        }
                      });
                    }}
                  >
                    删除
                  </Menu.Item>
                </Menu>
              }
            >
              <Button
                style={{ margin: "0 10px 10px 0" }}
                type={curChannelId === item._id ? "primary" : "default"}
                onClick={(): void => {
                  setCurChannelId(item._id);
                  setPage(1);
                  getArticleList({ channelId: item._id, currentPage: 1 });
                }}
              >
                {item.name}
              </Button>
            </Dropdown>
          );
        })}
      <Button
        className="nav-item"
        type="dashed"
        onClick={(): void => {
          addEditForm.resetFields();
          setDisabledSort(true);
          setChannelShow(true);
          editId.current = null;

          // 设置最大值
          const arrTemp = JSON.parse(JSON.stringify(channelList));
          arrTemp.sort(sortBy("sort", true));
          const maxNum = arrTemp.length > 0 ? arrTemp[arrTemp.length - 1].sort + 1 : 0;
          setMaxSort(maxNum);
          addEditForm.setFieldsValue({
            sort: maxNum
          });
        }}
      >
        <PlusOutlined /> 新增导航
      </Button>
      <Form
        form={addEditForm}
        name="firstLevel"
        onFinish={onFinishChannel}
        labelCol={{ span: 3 }}
        wrapperCol={{ span: 21 }}
      >
        <Modal
          title="文章频道"
          visible={channelShow}
          onOk={(): void => addEditForm.submit()}
          onCancel={(): void => setChannelShow(false)}
        >
          <Form.Item label="排序" name="sort" rules={[{ required: true, message: "请输入排序" }]}>
            <InputNumber min={0} max={maxSort} disabled={disabledSort} />
          </Form.Item>
          <Form.Item label="名称" name="name" rules={[{ required: true, message: "请输入频道" }]}>
            <Input />
          </Form.Item>
        </Modal>
      </Form>
    </div>
  );
};
