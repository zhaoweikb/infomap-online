import Infomap from "@mapequation/infomap";
import localforage from "localforage";
import { observer } from "mobx-react";
import React from "react";
import {
  Button,
  Form,
  Grid,
  Icon,
  Label,
  Menu,
  Message,
  Rail,
  Responsive,
} from "semantic-ui-react";
import "url-search-params-polyfill";
import store from "../../store";
import Console from "./Console";
import DownloadMenu from "./DownloadMenu";
import InputParameters from "./InputParameters";
import InputTextarea from "./InputTextarea";
import LoadButton from "./LoadButton";
import OutputMenu from "./OutputMenu";
import Steps from "./Steps";

export default observer(
  class InfomapOnline extends React.Component {
    state = {
      infomapOutput: [],
      loading: false, // Loading input network
      running: false,
      completed: false,
      infomapError: "",
      hasLocalforageError: false,
    };

    constructor(props) {
      super(props);

      const onData = content =>
        this.setState({
          infomapOutput: [...this.state.infomapOutput, content],
        });

      const onError = content =>
        this.setState({
          infomapError: content.replace(/^Error:\s+/i, ""),
          infomapOutput: [...this.state.infomapOutput, content],
          running: false,
          completed: false,
        });

      const onFinished = content => {
        store.output.setContent(content);
        localforage
          .setItem("ftree", store.output.ftree)
          .then(() => this.setState({ hasLocalforageError: false }))
          .catch(() => this.setState({ hasLocalforageError: true }));
        this.setState({
          running: false,
          completed: true,
        });
      };

      this.infomap = new Infomap()
        .on("data", onData)
        .on("error", onError)
        .on("finished", onFinished);
    }

    componentDidMount = () => {
      localforage.config({ name: "infomap" });

      const urlSearchParams = URLSearchParams || window.URLSearchParams;
      const urlParams = new urlSearchParams(window.location.search);
      const args = urlParams.get("args");

      if (args) {
        store.params.setArgs(args);
      } else {
        store.params.setArgs("--clu --ftree");
      }
    };

    onInputChange = activeInput => (e, { name, value }) => {
      const { params } = store;

      if (activeInput === "network") {
        store.setNetwork({ name, value });
      } else if (activeInput === "cluster data") {
        const param = params.getParam("--cluster-data");
        if (!value) return params.resetFileParam(param);
        params.setFileParam(param, { name, value });
      } else if (activeInput === "meta data") {
        const param = params.getParam("--meta-data");
        if (!value) return params.resetFileParam(param);
        params.setFileParam(param, { name, value });
      }

      store.output.setDownloaded(false);

      this.setState({
        loading: false,
        completed: false,
        infomapError: "",
      });
    };

    onLoad = activeInput => files => {
      if (files.length < 1) return;

      const file = files[0];

      const reader = new FileReader();

      const onInputChange = this.onInputChange(activeInput);

      reader.onloadend = event => onInputChange(event, { name: file.name, value: reader.result });

      this.setState({ loading: true }, () => reader.readAsText(file, "utf-8"));
    };

    run = () => {
      store.output.resetContent();

      this.setState({
        completed: false,
        hasLocalforageError: false,
        infomapOutput: [],
      });

      if (this.runId) {
        this.infomap.cleanup(this.runId);
        this.runId = null;
      }

      try {
        this.runId = this.infomap.run(store.infomapNetwork, store.params.args, store.infomapFiles);
      } catch (e) {
        this.setState({
          running: false,
          infomapError: e.message,
        });
        return;
      }

      this.setState({
        running: true,
        infomapError: "",
      });
    };

    onInputMenuClick = (e, { name }) => store.setActiveInput(name);

    onCopyClusters = () => store.output.setDownloaded(true);

    render() {
      const {
        loading,
        running,
        completed,
        infomapError,
        infomapOutput,
        hasLocalforageError,
      } = this.state;

      const { activeInput, network, clusterData, metaData, output, params } = store;

      const inputOptions = {
        network: network,
        "cluster data": clusterData,
        "meta data": metaData,
      };

      const inputAccept = {
        network: undefined, // FIXME
        "cluster data": params.getParam("--cluster-data").accept,
        "meta data": params.getParam("--meta-data").accept,
      };

      const inputValue = inputOptions[activeInput].value;

      const inputMenuOptions = ["network", "cluster data", "meta data"].map(name => ({
        key: name,
        name,
        active: activeInput === name,
        className: inputOptions[name].value ? "finished" : undefined,
      }));

      const SupportedExtensions = inputAccept[activeInput] ? (
        <span>
          Extensions:{" "}
          {inputAccept[activeInput]
            .map(extension => (
              <a key={extension} href={`#${extension.substring(1)}`}>
                {extension}
              </a>
            ))
            .reduce((prev, curr) => [prev, ", ", curr])}
        </span>
      ) : null;

      const consoleContent = infomapOutput.join("\n");
      const hasInfomapError = !!infomapError;

      const inputMenuProps = {
        vertical: true,
        size: "small",
        onItemClick: this.onInputMenuClick,
        items: inputMenuOptions,
      };

      const outputMenuProps = { vertical: true, disabled: !completed };

      let navigatorLabel = null;

      if (completed && !hasInfomapError) {
        if (!output.ftree) {
          navigatorLabel = (
            <Label basic size="small" pointing="below">
              Network Navigator requires ftree output.{" "}
              {!params.getParam("--ftree").active && (
                <a onClick={() => params.setArgs(params.args + " --ftree")}>Enable.</a>
              )}
            </Label>
          );
        } else if (output.ftree && hasLocalforageError) {
          navigatorLabel = (
            <Label basic size="small" pointing="below">
              Could not store network. Please download ftree and load manually.
            </Label>
          )
        }
      }

      return (
        <Grid container stackable className="infomap">
          <Grid.Column width={16} textAlign="center">
            <Steps
              firstActive={!network.value}
              firstCompleted={!!network.value}
              secondActive={!!network.value && !completed}
              secondCompleted={completed || running}
              thirdActive={completed}
              thirdCompleted={output.downloaded}
            />
            <div ref={store.mainView} />
          </Grid.Column>

          <Grid.Column width={4} className="network">
            <LoadButton
              fluid
              primary
              onDrop={this.onLoad(activeInput)}
              accept={inputAccept[activeInput]}
            >
              <Icon name="file" />
              Load {activeInput}
            </LoadButton>

            <InputTextarea
              onDrop={this.onLoad(activeInput)}
              accept={inputAccept[activeInput]}
              loading={loading}
              onChange={this.onInputChange(activeInput)}
              value={inputValue}
              placeholder={`Input ${activeInput} here`}
              wrap="off"
            >
              <Message attached="bottom" size="mini">
                Load {activeInput} by dragging & dropping.
                <br />
                <a href="#Input">Supported formats.</a> {SupportedExtensions}
              </Message>
            </InputTextarea>
            <Responsive as={Rail} minWidth={1400} close="very" position="left">
              <Menu compact text {...inputMenuProps} />
            </Responsive>
            <Responsive as={Menu} maxWidth={1399} fluid {...inputMenuProps} />
          </Grid.Column>

          <Grid.Column width={8} floated="left" className="run">
            <InputParameters loading={running} onClick={this.run} />

            <Form error={hasInfomapError}>
              <Console
                content={consoleContent}
                placeholder="Infomap output will be printed here"
                attached={hasInfomapError ? "top" : false}
              />
              <Message error size="tiny" attached="bottom" content={infomapError} />
            </Form>
          </Grid.Column>

          <Grid.Column width={4} className="output">
            {navigatorLabel}
            <Button.Group primary fluid>
              <Button
                as="a"
                target="_blank"
                rel="noopener noreferrer"
                href={`//www.mapequation.org/navigator?infomap=${network.name}.ftree`}
                disabled={!output.ftree || running || hasLocalforageError}
              >
                <Responsive minWidth={1200} as={React.Fragment}>
                  Open in Network Navigator
                </Responsive>
                <Responsive maxWidth={1199} minWidth={992} as={React.Fragment}>
                  Open in Navigator
                </Responsive>
                <Responsive maxWidth={991} minWidth={768} as={React.Fragment}>
                  Navigator&#8230;
                </Responsive>
                <Responsive maxWidth={767} as={React.Fragment}>
                  Open in Network Navigator
                </Responsive>
              </Button>
              <DownloadMenu disabled={running} />
            </Button.Group>

            <Form loading={running}>
              <Form.TextArea
                value={output.activeContent}
                placeholder="Cluster output will be printed here"
                onCopy={this.onCopyClusters}
                wrap="off"
              />
            </Form>
            <Responsive as={Rail} minWidth={1400} close="very" position="right">
              <OutputMenu compact text {...outputMenuProps} />
            </Responsive>
            <Responsive as={OutputMenu} maxWidth={1399} fluid {...outputMenuProps} />
          </Grid.Column>
        </Grid>
      );
    }
  },
);
