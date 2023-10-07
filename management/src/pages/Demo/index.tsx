import React from "react";
import { Row, Col, Divider } from "antd/lib";

const style = { background: "#0092ff", padding: "8px 0" };
const style2 = { background: "red", padding: "8px 0" };

export default (): JSX.Element => (
  <div>
    <Divider orientation="left">Responsive gutter</Divider>
    <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
      <Col className="gutter-row" span={6}>
        <div style={style}>col-6</div>
      </Col>
      <Col className="gutter-row" span={6}>
        <div style={style}>col-6</div>
      </Col>
      <Col className="gutter-row" span={6}>
        <div style={style}>col-6</div>
      </Col>
      <Col className="gutter-row" span={6}>
        <div style={style}>col-6</div>
      </Col>
    </Row>

    <Divider orientation="left">Responsive layout</Divider>
    <Row>
      <Col xs={2} sm={4} md={6} lg={8} xl={10}>
        <div style={style}>col-Responsive</div>
      </Col>
      <Col xs={20} sm={16} md={12} lg={8} xl={4}>
        <div style={style2}>col-Responsive</div>
      </Col>
      <Col xs={2} sm={4} md={6} lg={8} xl={10}>
        <div style={style}>col-Responsive</div>
      </Col>
    </Row>
  </div>
);
