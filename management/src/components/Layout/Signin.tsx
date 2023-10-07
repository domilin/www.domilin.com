import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import { Form, Input, Button, Modal, message } from "antd/lib";
import { UserOutlined, LockOutlined } from "@ant-design/icons/lib";
import { SigninParams } from "../../models/common";
import { FormOnFinishStore } from "../../public/types/public";
import { RootState, RootDispatch } from "../../models/store";
import { encodePassword } from "../../public";

export default (): JSX.Element => {
  const { signinShow } = useSelector((state: RootState) => ({
    signinShow: state.common.signinShow
  }));
  const dispatch: RootDispatch = useDispatch();
  useEffect(() => {
    if (!Cookies.get("Authorization")) dispatch.common.signinShow(true);
  }, [dispatch]);
  const onFinish = async (values: FormOnFinishStore): Promise<void> => {
    const params: SigninParams = {
      username: values.username,
      password: encodePassword(values.password)
    };
    const res = await dispatch.common.signin(params);
    if (!res) {
      message.info("登录错误");
      return;
    }
    if (res.code !== 1) {
      message.info(res.msg);
      return;
    }
    message.info("登录成功");
    dispatch.common.signinShow(false);
    window.location.reload();
  };
  return (
    <Modal visible={signinShow} title="登录" closable={false} footer={false}>
      <Form name="signin" onFinish={onFinish}>
        <Form.Item name="username" rules={[{ required: true, message: "请输入用户名!" }]}>
          <Input prefix={<UserOutlined />} placeholder="用户名" />
        </Form.Item>
        <Form.Item name="password" rules={[{ required: true, message: "请输入密码!" }]}>
          <Input prefix={<LockOutlined />} type="password" placeholder="密码" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            登录
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
