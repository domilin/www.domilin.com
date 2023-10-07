import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Form,
  Modal,
  Input,
  InputNumber,
  Table,
  Tooltip,
  message,
  Switch,
  Upload,
  Select,
  Cascader
} from "antd/lib";
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons/lib";
import { SliderPicker, ColorResult } from "react-color";
import {
  WebsitePostParams,
  CurrentLevel,
  WebsiteGetParams,
  FirstLevelPostParams,
  SecondLevelPostParams
} from "../../models/website";
import { FormOnFinishStore, anyType } from "../../public/types/public";
import { AjaxRes, sortBy, isUrl } from "../../public";
import { RootDispatch, RootState } from "../../models/store";
import TextArea from "antd/lib/input/TextArea";
import { communal } from "../../public/apis";
import { UploadFile, UploadChangeParam } from "antd/lib/upload/interface";
import { fileExtension } from "../../public";
import ColorPicker from "../../components/ColorPicker";
import WebsiteItem from "../../components/WebsiteItem";
const { confirm } = Modal;
const { Option, OptGroup } = Select;

interface MoveOption {
  value: string;
  label: string;
  children?: MoveOption[];
}
interface RecommendItem {
  firstId: string;
  firstName: string;
  secondData: SecondLevelPostParams[];
}
interface Eprops {
  curLevel: CurrentLevel;
  getWebsiteList: (params: WebsiteGetParams) => Promise<AjaxRes<WebsitePostParams[]> | undefined>;
}
export default ({ curLevel, getWebsiteList }: Eprops): JSX.Element => {
  const dispatch: RootDispatch = useDispatch();
  const { websiteList, firstLevel } = useSelector((state: RootState) => ({
    websiteList: state.website.websiteList,
    firstLevel: state.website.firstLevel
  }));
  const [backgroundColor, setBackgroundColor] = useState("rgb(51, 51, 51)");
  const [addEditForm] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [websiteShow, setWebsiteShow] = useState(false);
  const onFinishSearch = useCallback(
    async (values: FormOnFinishStore): Promise<void> => {
      if (values.global && values.keywords) {
        await getWebsiteList({ keywords: values.keywords });
      } else {
        await getWebsiteList({
          secondLevelId: curLevel.secondLevel as string,
          keywords: values.keywords,
          recommend: curLevel.recommend
        });
      }
    },
    [curLevel, getWebsiteList]
  );
  const [iconFileList, setIconFileList] = useState<UploadFile[]>([]);
  const editId = useRef<null | string>(null);
  const onFinish = useCallback(
    async (values: FormOnFinishStore): Promise<void> => {
      delete values.icon;
      values.icon = iconFileList[0].response.data.url;
      values.firstLevelId = curLevel.firstLevel;
      values.secondLevelId = curLevel.secondLevel;
      values.background = backgroundColor;

      if (!editId.current) {
        // 添加
        const res = await dispatch.website.websiteAdd(values);
        if (!res) {
          message.info("添加网站地址错误");
          return;
        }
        if (res.code !== 1) {
          message.info(res.msg);
          return;
        }
      } else {
        // 编辑
        values._id = editId.current;
        const res = await dispatch.website.websiteEdit(values);
        if (!res) {
          message.info("编辑网站地址错误");
          return;
        }
        if (res.code !== 1) {
          message.info(res.msg);
          return;
        }
      }
      await getWebsiteList({ secondLevelId: curLevel.secondLevel as string });
      setWebsiteShow(false);
    },
    [curLevel, editId, iconFileList, backgroundColor, dispatch, getWebsiteList]
  );

  const [disabledSort, setDisabledSort] = useState(false);
  const [maxSort, setMaxSort] = useState(0);
  const editItem = useCallback(
    async (item: WebsitePostParams): Promise<void> => {
      editId.current = item._id;
      const iconFileList = [
        {
          size: 1,
          name: "Icon",
          type: `image/${fileExtension(item.icon)}`,
          uid: `${new Date().getDate()}`,
          url: item.icon,
          response: {
            data: { url: item.icon }
          }
        }
      ];
      setIconFileList(iconFileList);
      addEditForm.setFieldsValue({
        ...item,
        recommendSecondLevelId: item.recommendSecondLevelId || null,
        icon: iconFileList
      });
      setBackgroundColor(item.background);
      setDisabledSort(false);
      setWebsiteShow(true);

      // 设置最大值
      const arrTemp = JSON.parse(JSON.stringify(websiteList));
      arrTemp.sort(sortBy("sort", true));
      setMaxSort(arrTemp.length > 0 ? arrTemp[arrTemp.length - 1].sort : 0);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [websiteList]
  );
  const delItem = useCallback(
    async (_id: string): Promise<void> => {
      const res = await dispatch.website.websiteDel(_id);
      if (!res) {
        message.info("删除错误");
        return;
      }
      if (res.code !== 1) {
        message.info(res.msg);
        return;
      }
      await getWebsiteList({ secondLevelId: curLevel.secondLevel as string });
      message.info("删除成功");
    },
    [curLevel, dispatch, getWebsiteList]
  );
  const recommendCancel = useCallback(
    async (item: WebsitePostParams) => {
      const res = await dispatch.website.websiteEdit({ ...item, recommendSecondLevelId: "" });
      if (!res) {
        message.info("取消推荐错误");
        return;
      }
      if (res.code !== 1) {
        message.info(res.msg);
        return;
      }
      await getWebsiteList({ secondLevelId: curLevel.secondLevel as string, recommend: curLevel.recommend });
      message.info("取消成功");
    },
    [curLevel, dispatch, getWebsiteList]
  );

  // 图标上传
  const normFile = useCallback((event: anyType): anyType => {
    if (Array.isArray(event)) {
      return event;
    }
    return event && event.fileList;
  }, []);

  // 点击图标删除时，不删除远程图标因为，有可能只是删除图标，没有提交编辑。导致重新刷新图标不存在。
  // 后期可通过程序对比数据库中使用的文件名称进行统一删除
  // const onRemove = async (file: UploadFile): Promise<boolean> => {
  //   if (file.response && file.response.data) {
  //     const res = await dispatch.common.uploadDelete(file.response.data.url);
  //     if (res.code === 1) {
  //       return true;
  //     } else {
  //       message.info(res.msg);
  //       return false;
  //     }
  //   } else {
  //     return true;
  //   }
  // };
  const onChange = useCallback(({ fileList }: UploadChangeParam): void => setIconFileList(fileList), []);

  // 移动到其它分类选项获取
  const [moveOptons, setMoveOptions] = useState<MoveOption[]>([]);
  useEffect(() => {
    if (!firstLevel || !Array.isArray(firstLevel) || firstLevel.length === 0) return;

    (async (): Promise<void> => {
      const options: MoveOption[] = [];
      for (const val of firstLevel) {
        if (val.recommend) continue;
        const temp: MoveOption = { value: "", label: "" };
        temp.value = val._id;
        temp.label = val.name;

        const res = await dispatch.website.secondLevelGet(val._id);
        if (!res || res.code !== 1) continue;
        const tempIn: MoveOption[] = [];
        for (const valIn of res.data) {
          tempIn.push({
            value: valIn._id,
            label: valIn.name
          });
        }

        temp.children = tempIn;
        options.push(temp);
      }
      setMoveOptions(options);
    })();
  }, [dispatch.website, firstLevel]);

  // 网站地址表格表头
  const columns = useCallback(() => {
    return [
      {
        key: "sort",
        title: "排序", // 此列名称
        dataIndex: "sort" // 当前item的的key名称: 若有此属性render默认返回对应的render(value, values)，没有则render(values)
      },
      {
        key: "button",
        title: "网址按钮",
        render: (record: WebsitePostParams): JSX.Element => (
          <Tooltip title={record.url}>
            <div style={{ width: "260px" }}>
              <WebsiteItem {...record} />
            </div>
          </Tooltip>
        )
      },
      {
        key: "name",
        title: "名字",
        dataIndex: "name"
      },
      {
        key: "intro",
        title: "简介",
        dataIndex: "intro",
        width: 600
      },
      // {
      //   key: "url",
      //   title: "链接",
      //   width: 300,
      //   render: (record: WebsitePostParams): JSX.Element => (
      //     <a href={record.url} target="_blank" rel="noopener noreferrer">
      //       {record.url}
      //     </a>
      //   )
      // },
      {
        key: "operation",
        title: "操作",
        width: 220,
        render: (record: WebsitePostParams): JSX.Element =>
          curLevel.recommend ? (
            <Button onClick={(): Promise<void> => recommendCancel(record)} icon={<DeleteOutlined />}>
              取消推荐
            </Button>
          ) : (
            <div className="operation">
              <Cascader
                className="move-to-other"
                placeholder="移动到其它分类"
                expandTrigger="hover"
                displayRender={(label): string => label[label.length - 1]}
                options={moveOptons}
                onChange={async (val): Promise<void> => {
                  if (val.length === 1) return;
                  delete record._v;
                  delete record.createdAt;
                  delete record.updatedAt;
                  const res = await dispatch.website.websiteEdit({
                    ...record,
                    secondLevelId: val[1]
                  });
                  if (!res) {
                    message.error("移动错误");
                    return;
                  }
                  if (res.code !== 1) {
                    message.info(res.msg);
                    return;
                  }
                  await getWebsiteList({ secondLevelId: curLevel.secondLevel as string });
                  message.info("移动成功");
                }}
              />
              <Button icon={<EditOutlined />} onClick={(): Promise<void> => editItem(record)}>
                编辑
              </Button>
              <Button
                icon={<DeleteOutlined />}
                onClick={(): void => {
                  confirm({
                    title: "确认要删除吗?",
                    icon: <ExclamationCircleOutlined />,
                    content: `删除网站地址:${record.name}`,
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
  }, [
    curLevel.recommend,
    curLevel.secondLevel,
    moveOptons,
    recommendCancel,
    dispatch.website,
    getWebsiteList,
    editItem,
    delItem
  ]);

  // 获取编辑时推荐到哪里列表
  const [recommendList, setRecomendList] = useState<RecommendItem[]>([]);
  useEffect(() => {
    if (!firstLevel || firstLevel.length === 0) return;
    const arrTemp: RecommendItem[] = [];
    let numTemp = 0;
    async function getAllRecommend(item: FirstLevelPostParams): Promise<void> {
      if (item.recommend) {
        const res = await dispatch.website.secondLevelGet(item._id);
        if (!res) {
          message.info(`获取${item.name}的二级列表错误`);
        }
        if (res.code !== 1) {
          message.info(`${item.name}:${res.msg}`);
          return;
        }
        arrTemp.push({
          firstId: item._id,
          firstName: item.name,
          secondData: res.data
        });
      }
      numTemp++;
      if (numTemp < firstLevel.length) {
        getAllRecommend(firstLevel[numTemp]);
      } else {
        arrTemp.unshift({
          firstId: "recommendCancel",
          firstName: "取消推荐",
          secondData: [
            {
              _id: "",
              sort: 1,
              name: "不推荐",
              icon: "",
              firstLevelId: "recommendCancel"
            }
          ]
        });
        setRecomendList(arrTemp);
      }
    }
    getAllRecommend(firstLevel[0]);
  }, [firstLevel, dispatch]);
  return (
    <>
      {useMemo(
        () => (
          <div className="filter-box">
            <Form className="search" layout="inline" form={searchForm} name="search" onFinish={onFinishSearch}>
              <Form.Item name="keywords" label="搜索">
                <Input.Search placeholder="请输入关键词" onSearch={(): void => searchForm.submit()} enterButton />
              </Form.Item>
              <Form.Item name="global" label="全局搜索" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Form>
            <Button
              className="nav-item"
              type="dashed"
              style={{ display: curLevel.recommend ? "none" : "block" }}
              onClick={(): void => {
                addEditForm.resetFields();
                setDisabledSort(true);
                setWebsiteShow(true);
                setIconFileList([]);
                editId.current = null;

                // 设置最大值
                const arrTemp = JSON.parse(JSON.stringify(websiteList));
                arrTemp.sort(sortBy("sort", true));
                const maxNum = arrTemp.length > 0 ? arrTemp[arrTemp.length - 1].sort + 1 : 0;
                setMaxSort(maxNum);
                addEditForm.setFieldsValue({
                  sort: maxNum
                });
              }}
            >
              <PlusOutlined /> 新增网址
            </Button>
          </div>
        ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [websiteList, curLevel, onFinishSearch]
      )}
      {useMemo(
        () => (
          <Table columns={columns()} dataSource={websiteList} />
        ),
        [websiteList, columns]
      )}

      <Form form={addEditForm} name="website" onFinish={onFinish} labelCol={{ span: 3 }} wrapperCol={{ span: 21 }}>
        <Modal
          title="网站地址"
          visible={websiteShow}
          onOk={(): void => addEditForm.submit()}
          onCancel={(): void => setWebsiteShow(false)}
        >
          <Form.Item label="排序" name="sort" rules={[{ required: true, message: "请输入排序" }]}>
            <InputNumber min={0} max={maxSort} disabled={disabledSort} />
          </Form.Item>
          <Form.Item label="名称" name="name" rules={[{ required: true, message: "请输入名称" }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="icon"
            label="图标"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[{ required: true, message: "请上传图片" }]}
          >
            <Upload
              name="icon"
              accept="image/*"
              action={communal.uploadIcon}
              withCredentials={true}
              onChange={onChange}
              listType="picture-card"
            >
              {iconFileList.length < 1 && (
                <div>
                  <PlusOutlined />
                  <div className="ant-upload-text">点击上传图标</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          <Form.Item label="颜色" name="background">
            <div>
              <div className="color-example">
                <span style={{ backgroundColor: backgroundColor }} />
                <em>{backgroundColor}</em>
              </div>
              <ColorPicker onChange={(value: string): void => setBackgroundColor(value)} />
              <SliderPicker
                color={backgroundColor}
                onChange={(color: ColorResult): void => setBackgroundColor(color.hex)}
              />
            </div>
          </Form.Item>
          <Form.Item label="简介" name="intro" rules={[{ required: true, message: "请输入简介" }]}>
            <TextArea />
          </Form.Item>
          <Form.Item
            label="地址"
            name="url"
            rules={[
              {
                validator: (_, value): Promise<void> => {
                  if (isUrl(value) || value.indexOf("internal://") > -1 || value.indexOf("chrome://") > -1) {
                    return Promise.resolve();
                  } else {
                    return Promise.reject("请输入正确的网址");
                  }
                }
              }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="推荐" name="recommendSecondLevelId">
            <Select>
              {recommendList.map(function(item: RecommendItem, index: number) {
                return (
                  <OptGroup label={item.firstName} key={item.firstId}>
                    {item.secondData.map(function(itemSecond: SecondLevelPostParams, indexSecond: number) {
                      return (
                        <Option
                          value={itemSecond._id}
                          key={itemSecond._id}
                          checked={addEditForm.getFieldValue("recommendSecondLevelId") === itemSecond._id}
                        >
                          {itemSecond.name}
                        </Option>
                      );
                    })}
                  </OptGroup>
                );
              })}
            </Select>
          </Form.Item>
        </Modal>
      </Form>
    </>
  );
};
