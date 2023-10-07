import React, { useState, ChangeEvent } from "react";
import transparentBg from "./images/transparent-background.svg";
import "./index.scss";
const colorArr = [
  "rgb(0, 168, 45)",
  "rgb(238, 59, 59)",
  "rgb(252, 177, 56)",
  "rgb(133, 215, 36)",
  "rgb(22, 217, 196)",
  "rgb(39, 108, 230)",
  "rgb(147, 38, 233)",
  "rgb(51, 51, 51)",
  "transparent"
];
interface Eprops {
  onChange: (value: string) => void;
}
export default ({ onChange }: Eprops): JSX.Element => {
  const [curColor, setCurColor] = useState(colorArr[0]);
  return (
    <div className="color-picker-wapper">
      <div className="color-picker-box">
        {colorArr.map(function(item, index) {
          const bg =
            item === "transparent" ? { backgroundImage: `url("${transparentBg}")` } : { backgroundColor: item };
          return (
            <span
              key={index}
              onClick={(): void => {
                setCurColor(item);
                onChange(item);
              }}
              className={item === curColor ? "active" : ""}
              style={{ ...bg, color: item }}
            />
          );
        })}
      </div>
      <div className="color-picker-input">
        <input
          type="text"
          placeholder="#"
          defaultValue="#fcb138"
          onChange={(event: ChangeEvent<HTMLInputElement>): void => onChange(event.target.value)}
        ></input>
      </div>
    </div>
  );
};
