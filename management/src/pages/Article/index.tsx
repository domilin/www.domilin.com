import React, { useState, useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Divider, Button, Form, Modal, Input, message, Switch, Table } from "antd/lib";
import { DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons/lib";
import { RootDispatch, RootState } from "../../models/store";
import { Article, ArticleGet } from "../../models/article";
import { FormOnFinishStore } from "../../public/types/public";
import Channel from "./Channel";
import { useForm } from "antd/lib/form/util";
import { domilinDomain } from "../../config";
const { confirm } = Modal;

export default (): JSX.Element => {
  const dispatch: RootDispatch = useDispatch();
  const { articleList, channelList } = useSelector((state: RootState) => ({
    articleList: state.article.articleList,
    channelList: state.article.channelList
  }));
  const [searchForm] = useForm();
  const [curChannelId, setCurChannelId] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<string | undefined>();

  // channelId更改时，把搜索框情况，因频道更改时获取文章列表跟搜索关键词无关
  useEffect(() => {
    searchForm.resetFields();
    setKeywords(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curChannelId]);

  // 获取文章列表
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 1
  });
  const curPage = useRef(1);

  const getArticleList = useCallback(
    async (params: ArticleGet) => {
      const res = await dispatch.article.articleGet(params);
      if (!res) {
        message.info("获取频道错误");
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
    [dispatch.article]
  );

  // 获取文章列表
  useEffect(() => {
    getArticleList({ currentPage: curPage.current });
  }, [getArticleList, curPage]);

  // 分页更改
  const onChangePage = useCallback(
    (page, pageSize) => {
      curPage.current = page;
      setPagination({
        ...pagination,
        current: page
      });

      getArticleList({
        currentPage: page,
        channelId: curChannelId as string,
        keywords
      });
    },
    [pagination, getArticleList, curChannelId, keywords]
  );

  // 搜索
  const onFinishSearch = useCallback(
    async (values: FormOnFinishStore): Promise<void> => {
      const params: { currentPage: number; keywords?: string } = { currentPage: 1 };
      if (values.keywords) params.keywords = values.keywords;

      await getArticleList(params);

      curPage.current = 1;
      setPagination({
        ...pagination,
        current: 1
      });
      setCurChannelId(null);
    },
    [getArticleList, pagination]
  );

  // 审核通过
  const setAudit = useCallback(
    async ({ _id, audit }) => {
      const res = await dispatch.article.articleAudit({ _id, audit });
      if (!res) {
        message.info("审核错误");
        return;
      }
      if (res.code !== 1) {
        message.info(res.msg);
        return;
      }

      getArticleList({ currentPage: curPage.current });
    },
    [curPage, dispatch.article, getArticleList]
  );

  // 删除文章
  const delItem = useCallback(
    async (id: string) => {
      const res = await dispatch.article.articleDel({ articleId: id });
      if (!res) {
        message.info("删除错误");
        return;
      }
      if (res.code !== 1) {
        message.info(res.msg);
        return;
      }

      getArticleList({ currentPage: curPage.current });
    },
    [curPage, dispatch.article, getArticleList]
  );

  // 文章列表表格表头
  // table colums
  const columns = useCallback(() => {
    return [
      {
        key: "title",
        title: "标题",
        render: (record: Article): JSX.Element => (
          <a target="_blank" rel="noopener noreferrer" href={`${domilinDomain}/submit/${record._id}`}>
            {record.title}
          </a>
        )
      },
      {
        key: "channelId",
        title: "所属频道",
        dataIndex: "channelId",
        render: (channelId: string): JSX.Element => {
          let channelName = "暂未分类";
          for (const val of channelList) {
            if (val._id === channelId) {
              channelName = val.name;
              break;
            }
          }
          return <span>{channelName}</span>;
        }
      },
      {
        key: "delete",
        title: "删除状态",
        render: (record: Article): JSX.Element => <span>{record.delete ? "是" : "否"}</span>
      },
      {
        key: "audit",
        title: "前端展示",
        render: (record: Article): JSX.Element => (
          <Switch
            defaultChecked={record.audit}
            onChange={(val): void => {
              setAudit({ _id: record._id, audit: !record.audit });
            }}
          />
        )
      },
      {
        key: "operation",
        title: "操作",
        width: 120,
        render: (record: Article): JSX.Element => (
          <Button
            icon={<DeleteOutlined />}
            onClick={(): void => {
              confirm({
                title: "确认要删除吗?",
                icon: <ExclamationCircleOutlined />,
                content: `删除文章:${record.title}`,
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
  }, [delItem, setAudit, channelList]);
  return (
    <div className="page-article">
      <Divider orientation="left">频道</Divider>
      <Channel
        {...{
          getArticleList,
          curChannelId,
          setCurChannelId,
          setPage: (page: number): void => {
            curPage.current = page;
            setPagination({
              ...pagination,
              current: page
            });
          }
        }}
      />
      <Divider orientation="left">文章列表</Divider>
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
      </div>
      <Table pagination={{ ...pagination, onChange: onChangePage }} columns={columns()} dataSource={articleList} />
    </div>
  );
};
