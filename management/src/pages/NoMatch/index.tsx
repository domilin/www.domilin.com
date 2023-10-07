import React from "react";

import "./index.scss";

export default (): JSX.Element => {
  return (
    <div className="no-match-page">
      <h2>404!</h2>
      <p>
        你要找的页面不存在<a href="/">返回首页</a>
      </p>
    </div>
  );
};
