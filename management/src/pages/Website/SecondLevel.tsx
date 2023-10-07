import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Form, Modal, Input, InputNumber, message, Menu, Dropdown } from "antd/lib";
import { PlusOutlined, ExclamationCircleOutlined } from "@ant-design/icons/lib";
import { RootDispatch, RootState } from "../../models/store";
import { FormOnFinishStore } from "../../public/types/public";
import { SecondLevelPostParams, CurrentLevel } from "../../models/website";
import { AjaxRes, sortBy } from "../../public";
const { confirm } = Modal;

interface Eprops {
  curLevel: CurrentLevel;
  getDefaultData: (params?: CurrentLevel) => Promise<void>;
  getSecondLevelList: (firstLevelId: string) => Promise<AjaxRes<SecondLevelPostParams[]> | undefined>;
}
export default ({ curLevel, getDefaultData, getSecondLevelList }: Eprops): JSX.Element => {
  const dispatch: RootDispatch = useDispatch();
  const { secondLevel } = useSelector((state: RootState) => ({
    secondLevel: state.website.secondLevel
  }));
  const [addEditForm] = Form.useForm();
  const [fistLevelShow, setSecondLevelShow] = useState(false);
  const onFinish = async (values: FormOnFinishStore): Promise<void> => {
    values.firstLevelId = curLevel.firstLevel;
    if (!editId.current) {
      // 添加
      const res = await dispatch.website.secondLevelAdd(values);
      if (!res) {
        message.info("添加二级导航错误");
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
      const res = await dispatch.website.secondLevelEdit(values);
      if (!res) {
        message.info("编辑二级导航错误");
        return;
      }
      if (res.code !== 1) {
        message.info(res.msg);
        return;
      }
    }
    await getSecondLevelList(curLevel.firstLevel as string);
    setSecondLevelShow(false);
  };

  const [disabledSort, setDisabledSort] = useState(false);
  const [maxSort, setMaxSort] = useState(0);
  const editId = useRef<null | string>(null);
  const editItem = async (item: SecondLevelPostParams): Promise<void> => {
    editId.current = item._id;
    addEditForm.setFieldsValue(item);
    setDisabledSort(false);
    setSecondLevelShow(true);

    // 设置最大值
    const arrTemp = JSON.parse(JSON.stringify(secondLevel));
    arrTemp.sort(sortBy("sort", true));
    setMaxSort(arrTemp.length > 0 ? arrTemp[arrTemp.length - 1].sort : 0);
  };

  const delItem = async (_id: string): Promise<void> => {
    const res = await dispatch.website.secondLevelDel(_id);
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
      {secondLevel.map(function(item: SecondLevelPostParams) {
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
                      title: `确认要删除二级导航“${item.name}”吗?`,
                      icon: <ExclamationCircleOutlined />,
                      content: `${item.name}: 删除后其包含的所有网站地址都将全部删除`,
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
              type={curLevel.secondLevel === item._id ? "primary" : "default"}
              onClick={(): void => {
                getDefaultData({ ...curLevel, secondLevel: item._id });
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
          setSecondLevelShow(true);
          editId.current = null;

          // 设置最大值
          const arrTemp = JSON.parse(JSON.stringify(secondLevel));
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
      <Form form={addEditForm} name="secondLevel" onFinish={onFinish} wrapperCol={{ span: 20 }}>
        <Modal
          title="二级导航"
          visible={fistLevelShow}
          onOk={(): void => addEditForm.submit()}
          onCancel={(): void => setSecondLevelShow(false)}
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
        </Modal>
      </Form>
    </>
  );
};
