import React from "react";
import "./index.scss";
import { WebsitePostParams } from "../../models/website";
import logoWhite from "../../public/images/logo-white.png";

export default (item: WebsitePostParams): JSX.Element => {
  return (
    <a className="website-item" href={item.url} target="_blank" rel="nofollow noopener noreferrer">
      <div className="website-item-icon" style={{ background: item.background }}>
        {item.icon === "" || item.icon === "null" || item.icon === "official" ? (
          <img style={{ transform: "scale(0.7)" }} src={logoWhite} alt={item.name} />
        ) : (
          <img src={item.icon} alt={item.name} />
        )}
      </div>
      <div className="website-item-info">
        <h5 className="website-item-name">{item.name}</h5>
        <h5 className="website-item-intro" title={item.intro}>
          {item.intro}
        </h5>
      </div>
    </a>
  );
};
