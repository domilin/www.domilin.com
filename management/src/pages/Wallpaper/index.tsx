import React, { useCallback, useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, Table, message, Switch, Upload, Form } from "antd/lib";
import { PlusOutlined, DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons/lib";
import { UploadFile, UploadChangeParam } from "antd/lib/upload/interface";
import { communal } from "../../public/apis";
import { RootDispatch, RootState } from "../../models/store";
import { WallpaperItem } from "../../models/wallpaper";
import { FormOnFinishStore, anyType } from "../../public/types/public";
const { confirm } = Modal;

export default (): JSX.Element => {
  const dispatch: RootDispatch = useDispatch();
  const { wallpaperList } = useSelector((state: RootState) => ({
    wallpaperList: state.wallpaper.list
  }));
  const [iconFileList, setIconFileList] = useState<UploadFile[]>([]);
  const normFile = useCallback((event: anyType): anyType => {
    if (Array.isArray(event)) {
      return event;
    }
    return event && event.fileList;
  }, []);
  const onChange = useCallback(({ fileList }: UploadChangeParam): void => setIconFileList(fileList), []);
  const [addForm] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 1
  });
  const curPage = useRef(1);

  // 获取壁纸列表
  const getWallpaperList = useCallback(
    async currentPage => {
      const res = await dispatch.wallpaper.wallpaperGet({ curPage: currentPage });
      if (!res) {
        message.info("设置错误");
        return;
      }
      if (res.code !== 1) {
        message.info(res.msg);
        return;
      }

      setPagination({
        current: res.data.currentPage,
        pageSize: res.data.pageSize,
        total: res.data.totalSize
      });
    },
    [dispatch.wallpaper]
  );

  // 分页更改
  const onChangePage = useCallback(
    (page, pageSize) => {
      curPage.current = page;
      getWallpaperList(page);
    },
    [getWallpaperList]
  );

  // 确认添加壁纸
  const onFinishAdd = useCallback(
    async (values: FormOnFinishStore): Promise<void> => {
      const fileRes = values.wallpaperOfficial[0].response;
      if (fileRes.code !== 1) {
        message.error("壁纸上传错误");
        return;
      }

      const url = values.wallpaperOfficial[0].response.data.url;
      if (!url) return;

      const res = await dispatch.wallpaper.wallpaperAdd({ url });
      if (!res) {
        message.error("添加错误");
        return;
      }
      if (res.code !== 1) {
        message.info(res.msg);
        return;
      }

      getWallpaperList(curPage.current);
    },
    [curPage, dispatch.wallpaper, getWallpaperList]
  );

  // 获取默认壁纸
  useEffect(() => {
    getWallpaperList(curPage.current);
  }, [getWallpaperList, curPage]);

  // 设置为前端展示
  const setMain = useCallback(
    async ({ _id, main }) => {
      const res = await dispatch.wallpaper.setMain({ _id, main });
      if (!res) {
        message.info("设置错误");
        return;
      }
      if (res.code !== 1) {
        message.info(res.msg);
        return;
      }

      getWallpaperList(curPage.current);
    },
    [dispatch.wallpaper, getWallpaperList]
  );

  // 删除壁纸
  const delItem = useCallback(
    async (id: string) => {
      const res = await dispatch.wallpaper.wallpaperDel({ _id: id });
      if (!res) {
        message.info("删除错误");
        return;
      }
      if (res.code !== 1) {
        message.info(res.msg);
        return;
      }

      getWallpaperList(curPage.current);
    },
    [dispatch.wallpaper, getWallpaperList]
  );

  // table colums
  const columns = useCallback(() => {
    return [
      {
        key: "url",
        title: "壁纸",
        render: (record: WallpaperItem): JSX.Element => (
          <img
            onClick={(): void => {
              setPreviewUrl(record.url);
              setPreview(true);
            }}
            style={{ cursor: "pointer" }}
            width="120"
            src={record.url}
            alt="wallpaper"
          />
        )
      },
      {
        key: "main",
        title: "前端展示",
        render: (record: WallpaperItem): JSX.Element => (
          <Switch
            defaultChecked={record.main}
            onChange={(val): void => {
              setMain({ _id: record._id, main: !record.main });
            }}
          />
        )
      },
      {
        key: "operation",
        title: "操作",
        width: 220,
        render: (record: WallpaperItem): JSX.Element => (
          <Button
            icon={<DeleteOutlined />}
            onClick={(): void => {
              confirm({
                title: "确认要删除吗?",
                icon: <ExclamationCircleOutlined />,
                content: `删除壁纸地址:${record.url}`,
                okText: "确认",
                okType: "danger",
                cancelText: "取消",
                onOk() {
                  delItem(record._id);
                }
              });
            }}
          >
            删除
          </Button>
        )
      }
    ];
  }, [delItem, setMain]);

  // 预览
  const [previewUrl, setPreviewUrl] = useState("");
  const [preview, setPreview] = useState(false);
  return (
    <div className="page-wallpaper">
      <Form className="search" layout="inline" form={addForm} name="search" onFinish={onFinishAdd}>
        <Form.Item
          name="wallpaperOfficial"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          rules={[{ required: true, message: "请上传壁纸" }]}
        >
          <Upload
            name="wallpaperOfficial"
            accept="image/*"
            action={communal.wallpaperOfficial}
            withCredentials={true}
            onPreview={(file): void => {
              message.success(file.name);
            }}
            onChange={onChange}
            listType="picture-card"
          >
            {iconFileList.length < 1 && (
              <div>
                <PlusOutlined />
                <div className="ant-upload-text">点击上传壁纸</div>
              </div>
            )}
          </Upload>
        </Form.Item>
      </Form>
      <Button
        style={{ marginBottom: "20px" }}
        type="primary"
        className="nav-item"
        onClick={(): void => addForm.submit()}
      >
        <PlusOutlined /> 确定添加壁纸
      </Button>
      <Modal width="800px" visible={preview} title="壁纸预览" footer={null} onCancel={(): void => setPreview(false)}>
        <img alt="example" style={{ width: "100%" }} src={previewUrl} />
      </Modal>
      <Table pagination={{ ...pagination, onChange: onChangePage }} columns={columns()} dataSource={wallpaperList} />
    </div>
  );
};
