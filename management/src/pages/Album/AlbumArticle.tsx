import React, { useState, useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Button, Form, Modal, Input, InputNumber, message, Table } from "antd/lib";
import { DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons/lib";
import { RootDispatch, RootState } from "../../models/store";
import { AlbumArticle, AlbumArticleGet } from "../../models/article";
import { FormOnFinishStore } from "../../public/types/public";
import { useForm } from "antd/lib/form/util";
import { domilinDomain } from "../../config";
const { confirm } = Modal;

export default (): JSX.Element => {
  const dispatch: RootDispatch = useDispatch();
  const { albumArticleList } = useSelector((state: RootState) => ({
    albumArticleList: state.article.albumArticleList
  }));

  const { albumId } = useParams();
  const [addEditForm] = Form.useForm();
  const [searchForm] = useForm();

  const [albumShow, setAlbumShow] = useState(false);
  const [maxSort, setMaxSort] = useState(0);
  const [keywords, setKeywords] = useState<string | undefined>();

  const [disabledSort, setDisabledSort] = useState(false);
  const editId = useRef<null | string>(null);
  const editItem = useCallback(
    async (item: AlbumArticle): Promise<void> => {
      editId.current = item._id;
      item.url = `${domilinDomain}/article/${item.articleId}`;
      addEditForm.setFieldsValue(item);
      setDisabledSort(false);
      setAlbumShow(true);
    },
    [addEditForm]
  );

  // 获取专辑文章列表
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    total: 1
  });
  const curPage = useRef(1);

  const getAlbumArticleList = useCallback(
    async (params: AlbumArticleGet) => {
      const res = await dispatch.article.albumArticleGet(params);
      if (!res) {
        message.info("获取专辑文章列表错误");
        return;
      }
      if (res.code !== 1) {
        message.info(res.msg);
        return;
      }

      setPagination({
        currentPage: res.data.currentPage,
        pageSize: res.data.pageSize,
        total: res.data.totalSize
      });

      setMaxSort(res.data.maxSort);
    },
    [dispatch.article]
  );

  const onFinish = async (values: FormOnFinishStore): Promise<void> => {
    if (!editId.current) {
      // 添加
      const res = await dispatch.article.albumArticleAdd({ albumId, ...values });
      if (!res) {
        message.info("添加专辑文章错误");
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
      const res = await dispatch.article.albumArticleEdit({ albumId, ...values });
      if (!res) {
        message.info("编辑专辑文章错误");
        return;
      }
      if (res.code !== 1) {
        message.info(res.msg);
        return;
      }
    }
    await getAlbumArticleList({ ...pagination, albumId: albumId as string });
    setAlbumShow(false);
  };

  // 获取专辑列表
  useEffect(() => {
    getAlbumArticleList({ currentPage: curPage.current, albumId: albumId as string });
  }, [getAlbumArticleList, curPage, albumId]);

  // 分页更改
  const onChangePage = useCallback(
    (page, pageSize) => {
      curPage.current = page;
      setPagination({
        ...pagination,
        currentPage: page
      });
      getAlbumArticleList({ currentPage: page, albumId: albumId as string, keywords });
    },
    [albumId, getAlbumArticleList, keywords, pagination]
  );

  // 搜索
  const onFinishSearch = useCallback(
    async (values: FormOnFinishStore): Promise<void> => {
      const params: { currentPage: number; keywords?: string } = { currentPage: 1 };
      if (values.keywords) params.keywords = values.keywords;
      await getAlbumArticleList({ ...params, albumId: albumId as string, keywords });

      curPage.current = 1;
      setPagination({
        ...pagination,
        currentPage: 1
      });
    },
    [albumId, getAlbumArticleList, keywords, pagination]
  );

  // 删除专辑文章
  const delItem = useCallback(
    async (id: string) => {
      const res = await dispatch.article.albumArticleDel({ _id: id });
      if (!res) {
        message.info("删除错误");
        return;
      }
      if (res.code !== 1) {
        message.info(res.msg);
        return;
      }

      getAlbumArticleList({ currentPage: curPage.current, albumId: albumId as string, keywords });
    },
    [albumId, dispatch.article, getAlbumArticleList, keywords]
  );

  // 文章列表表格表头
  // table colums
  const columns = useCallback(() => {
    return [
      {
        key: "title",
        title: "标题",
        render: (record: AlbumArticle): JSX.Element => (
          <a target="_blank" rel="noopener noreferrer" href={`${domilinDomain}/article/${record.articleId}`}>
            {record.articleTitle}
          </a>
        )
      },
      {
        key: "operation",
        title: "操作",
        width: 200,
        render: (record: AlbumArticle): JSX.Element => (
          <div className="operation">
            <Button onClick={(): Promise<void> => editItem(record)}>编辑</Button>
            <Button
              icon={<DeleteOutlined />}
              onClick={(): void => {
                confirm({
                  title: "确认要删除吗?",
                  icon: <ExclamationCircleOutlined />,
                  content: `删除专辑文章:${record.articleTitle}`,
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
          </div>
        )
      }
    ];
  }, [delItem, editItem]);

  return (
    <div className="page-article">
      <div className="filter-box">
        <Form className="search" layout="inline" form={searchForm} name="search" onFinish={onFinishSearch}>
          <Form.Item name="keywords" label="搜索">
            <Input.Search
              onChange={(event): void => setKeywords(event.target.value)}
              placeholder="请输入关键词"
              onSearch={(): void => searchForm.submit()}
              enterButton
            />
          </Form.Item>
        </Form>
        <Button
          onClick={(): void => {
            addEditForm.resetFields();
            setDisabledSort(true);
            setAlbumShow(true);
            editId.current = null;
            searchForm.resetFields();
            setKeywords(undefined);

            addEditForm.setFieldsValue({
              sort: maxSort
            });
          }}
        >
          添加专辑文章
        </Button>
      </div>
      <Table pagination={{ ...pagination, onChange: onChangePage }} columns={columns()} dataSource={albumArticleList} />
      <Form form={addEditForm} name="firstLevel" onFinish={onFinish} labelCol={{ span: 3 }} wrapperCol={{ span: 21 }}>
        <Modal
          title="专辑"
          visible={albumShow}
          onOk={(): void => addEditForm.submit()}
          onCancel={(): void => setAlbumShow(false)}
        >
          <Form.Item label="排序" name="sort" rules={[{ required: true, message: "请输入排序" }]}>
            <InputNumber min={0} max={editId.current ? maxSort - 1 : maxSort} disabled={disabledSort} />
          </Form.Item>
          <Form.Item label="地址" name="url" rules={[{ required: true, message: "请输入地址" }]}>
            <Input />
          </Form.Item>
        </Modal>
      </Form>
    </div>
  );
};
