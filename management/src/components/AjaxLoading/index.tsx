import React, { Component } from "react";
import { indexOf, remove } from "lodash/ts3.1";
import Loading from "../Loading";

interface EState {
  loading: Array<number>;
}
export default class AjaxLoading extends Component<unknown, EState> {
  state = {
    loading: []
  };
  addLoading = (id: number): void => {
    if (indexOf(this.state.loading, id) > -1) return;
    const addArr: Array<number> = this.state.loading;
    addArr.push(id);
    this.setState({
      loading: addArr
    });
    setTimeout(function() {
      const removeArr: Array<number> = remove(this.state.loading, function(n) {
        return indexOf(this.state.loading, id);
      });
      this.setState({
        loading: removeArr
      });
    }, 3000);
  };
  render(): JSX.Element {
    return (
      <div className="ajax-loading">
        {this.state.loading.map(function(item, index): JSX.Element {
          return <Loading key={item} />;
        })}
      </div>
    );
  }
}
