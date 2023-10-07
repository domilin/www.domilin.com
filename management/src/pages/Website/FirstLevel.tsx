import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Form, Modal, Input, InputNumber, message, Menu, Dropdown, Switch } from "antd/lib";
import { PlusOutlined, ExclamationCircleOutlined } from "@ant-design/icons/lib";
import { RootDispatch, RootState } from "../../models/store";
import { FormOnFinishStore } from "../../public/types/public";
import { FirstLevelPostParams, CurrentLevel } from "../../models/website";
import { AjaxRes, sortBy } from "../../public";
const { confirm } = Modal;

interface Eprops {
  curLevel: CurrentLevel;
  getDefaultData: (params?: CurrentLevel) => Promise<void>;
  getFirstLevelList: () => Promise<AjaxRes<FirstLevelPostParams[]> | undefined>;
}
export default ({ curLevel, getDefaultData, getFirstLevelList }: Eprops): JSX.Element => {
  const dispatch: RootDispatch = useDispatch();
  const { firstLevel } = useSelector((state: RootState) => ({
    firstLevel: state.website.firstLevel
  }));
  const [addEditForm] = Form.useForm();
  const [fistLevelShow, setFirstLevelShow] = useState(false);
  const onFinish = async (values: FormOnFinishStore): Promise<void> => {
    if (!editId.current) {
      // 添加
      const res = await dispatch.website.firstLevelAdd(values);
      if (!res) {
        message.info("添加一级导航错误");
        return;
      }
      if (res.code !== 1) {
        message.info(res.msg);
        return;
      }
      window.location.reload();
    } else {
      // 编辑
      values._id = editId.current;
      const res = await dispatch.website.firstLevelEdit(values);
      if (!res) {
        message.info("编辑一级导航错误");
        return;
      }
      if (res.code !== 1) {
        message.info(res.msg);
        return;
      }
    }
    await getFirstLevelList();
    setFirstLevelShow(false);
  };

  const [disabledSort, setDisabledSort] = useState(false);
  const [maxSort, setMaxSort] = useState(0);
  const editId = useRef<null | string>(null);
  const editItem = async (item: FirstLevelPostParams): Promise<void> => {
    editId.current = item._id;
    addEditForm.setFieldsValue(item);
    setDisabledSort(false);
    setFirstLevelShow(true);

    // 设置最大值
    const arrTemp = JSON.parse(JSON.stringify(firstLevel));
    arrTemp.sort(sortBy("sort", true));
    setMaxSort(arrTemp.length > 0 ? arrTemp[arrTemp.length - 1].sort : 0);
  };

  const delItem = async (_id: string): Promise<void> => {
    const res = await dispatch.website.firstLevelDel(_id);
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

  return (
    <>
      {firstLevel.map(function(item: FirstLevelPostParams) {
        return (
          <Dropdown
            key={item._id}
            trigger={["contextMenu"]}
            overlay={
              <Menu>
                {item.recommend && (
                  <Menu.Item>
                    <Input value={item._id} style={{ width: "240px" }} />
                  </Menu.Item>
                )}
                <Menu.Item onClick={(): Promise<void> => editItem(item)}>编辑</Menu.Item>
                <Menu.Item
                  onClick={(): void => {
                    confirm({
                      title: `确认要删除一级导航“${item.name}”吗?`,
                      icon: <ExclamationCircleOutlined />,
                      content: `${item.name}: 删除后其包含的二级导航，其包含的所有网站地址都将全部删除`,
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
              className="nav-item"
              shape={item.recommend ? "round" : undefined}
              type={curLevel.firstLevel === item._id ? "primary" : "default"}
              onClick={(): void => {
                getDefaultData({ firstLevel: item._id, recommend: item.recommend });
              }}
            >
              <span className="iconfont" dangerouslySetInnerHTML={{ __html: item.icon }}></span>
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
          setFirstLevelShow(true);
          editId.current = null;

          // 设置最大值
          const arrTemp = JSON.parse(JSON.stringify(firstLevel));
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
      <Form form={addEditForm} name="firstLevel" onFinish={onFinish} labelCol={{ span: 3 }} wrapperCol={{ span: 21 }}>
        <Modal
          title="一级导航"
          visible={fistLevelShow}
          onOk={(): void => addEditForm.submit()}
          onCancel={(): void => setFirstLevelShow(false)}
        >
          <Form.Item label="排序" name="sort" rules={[{ required: true, message: "请输入排序" }]}>
            <InputNumber min={0} max={maxSort} disabled={disabledSort} />
          </Form.Item>
          <Form.Item label="图标" name="icon" rules={[{ required: true, message: "请输入图标IconFontCode" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="标题" name="name" rules={[{ required: true, message: "请输入标题" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="推荐" name="recommend" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Modal>
      </Form>
    </>
  );
};
