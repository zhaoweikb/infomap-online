import React from "react";
import { Segment } from "semantic-ui-react";
import "./Console.css";


class Console extends React.Component {
  keepScrolling = true;

  componentDidUpdate() {
    if (this.keepScrolling) {
      const { scrollHeight, clientHeight } = this.container;
      this.container.scrollTop = scrollHeight - clientHeight;
    }
  }

  onScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = this.container;
    const diff = scrollHeight - clientHeight;
    const isAtBottom = scrollTop === diff;
    return this.keepScrolling = isAtBottom;
  };

  render() {
    const { content, placeholder } = this.props;

    const styles = {
      segment: {
        boxShadow: "none",
        height: "500px",
        padding: "0 0 0 0.8em",
      },
    };

    return (
      <Segment style={styles.segment} className="console">
        <div
          className="container"
          ref={el => this.container = el}
          onScroll={this.onScroll}
        >
          <div>
            {content
              ? <code>{content}</code>
              : <div className="placeholder">{placeholder}</div>
            }
          </div>
        </div>
      </Segment>
    );
  }
}


export default Console;
