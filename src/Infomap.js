import React from 'react';
import { Step, Header, Grid, Segment, Form, Input, Checkbox, Message, Image } from 'semantic-ui-react';
import { saveAs } from 'file-saver';
import arg from 'arg';
import produce from 'immer';

export const SAMPLE_NETWORK = `#source target [weight]
1 2
1 3
1 4
2 1
2 3
3 2
3 1
4 1
4 5
4 6
5 4
5 6
6 5
6 4`;

const cli = [
  {
    "desc": "Prints this help message. Use -hh to show advanced options.",
    "short": "-h",
    "long": "--help",
    "type": "Count"
  },
  {
    "desc": "Display program version information.",
    "short": "-V",
    "long": "--version",
    "type": "Boolean"
  },
  {
    "desc": "Set the next (no-argument) option to false.",
    "short": "-n",
    "long": "--negate-next",
    "type": "Boolean"
  },
  {
    "desc": "Specify input format ('pajek', 'link-list', 'states', '3gram', 'multilayer' or 'bipartite') to override format possibly implied by file extension.",
    "short": "-i",
    "long": "--input-format",
    "type": "String"
  },
  {
    "desc": "Use second order Markov dynamics and let nodes be part of different modules. Simulate memory from first-order data if not '3gram' input.",
    "long": "--with-memory",
    "type": "Boolean"
  },
  {
    "desc": "Adjust multilayer network so that the same set of physical nodes exist in all layers.",
    "long": "--multilayer-add-missing-nodes",
    "type": "Boolean"
  },
  {
    "desc": "[Deprecated, use multilayer-add-missing-nodes] Adjust multilayer network so that the same set of physical nodes exist in all layers.",
    "long": "--multiplex-add-missing-nodes",
    "type": "Boolean"
  },
  {
    "desc": "Skip distributing all flow from the bipartite nodes (first column) to the ordinary nodes (second column).",
    "long": "--skip-adjust-bipartite-flow",
    "type": "Boolean"
  },
  {
    "desc": "Let nodes be part of different and overlapping modules. Applies to ordinary networks by first representing the memoryless dynamics with memory nodes.",
    "long": "--overlapping",
    "type": "Boolean"
  },
  {
    "desc": "Don't allow overlapping modules in memory networks by keeping the memory nodes constrained into their physical nodes.",
    "long": "--hard-partitions",
    "type": "Boolean"
  },
  {
    "desc": "Use non-backtracking dynamics and let nodes be part of different and overlapping modules. Applies to ordinary networks by first representing the non-backtracking dynamics with memory nodes.",
    "long": "--non-backtracking",
    "type": "Boolean"
  },
  {
    "desc": "Parse the input network data without the iostream library. Can be a bit faster, but not as robust.",
    "long": "--without-iostream",
    "type": "Boolean"
  },
  {
    "desc": "Assume node numbers start from zero in the input file instead of one.",
    "short": "-z",
    "long": "--zero-based-numbering",
    "type": "Boolean"
  },
  {
    "desc": "Include links with the same source and target node. (Ignored by default.)",
    "short": "-k",
    "long": "--include-self-links",
    "type": "Boolean"
  },
  {
    "desc": "Add first order links to complete dangling memory nodes.",
    "long": "--complete-dangling-memory-nodes",
    "type": "Boolean"
  },
  {
    "desc": "Limit the number of nodes to read from the network. Ignore links connected to ignored nodes. (Default: 0)",
    "short": "-O",
    "long": "--node-limit",
    "type": "Number"
  },
  {
    "desc": "Limit the number of links to read from the network. Ignore links with less weight than the threshold. (Default: 0)",
    "long": "--weight-threshold",
    "type": "Number"
  },
  {
    "desc": "Pre-cluster multiplex networks layer by layer.",
    "long": "--pre-cluster-multiplex",
    "type": "Boolean"
  },
  {
    "desc": "Provide an initial two-level (.clu format) or multi-layer (.tree format) solution.",
    "short": "-c",
    "long": "--cluster-data",
    "type": "String"
  },
  {
    "desc": "Don't run Infomap. Useful if initial cluster data should be preserved or non-modular data printed.",
    "long": "--no-infomap",
    "type": "Boolean"
  },
  {
    "desc": "Use this name for the output files, like [output_directory]/[out-name].tree",
    "long": "--out-name",
    "type": "String"
  },
  {
    "desc": "Don't print any output to file.",
    "short": "-0",
    "long": "--no-file-output",
    "type": "Boolean"
  },
  {
    "desc": "Print the top two-level modular network in the .map format.",
    "long": "--map",
    "type": "Boolean"
  },
  {
    "desc": "Print the top cluster indices for each node.",
    "long": "--clu",
    "type": "Boolean"
  },
  {
    "desc": "Print the hierarchy in .tree format. (default true if no other output with cluster data)",
    "long": "--tree",
    "type": "Boolean"
  },
  {
    "desc": "Print the hierarchy in .tree format and append the hierarchically aggregated network links.",
    "long": "--ftree",
    "type": "Boolean"
  },
  {
    "desc": "Print the tree in a streamable binary format.",
    "long": "--btree",
    "type": "Boolean"
  },
  {
    "desc": "Print the tree including horizontal flow links in a streamable binary format.",
    "long": "--bftree",
    "type": "Boolean"
  },
  {
    "desc": "Print the calculated flow for each node to a file.",
    "long": "--node-ranks",
    "type": "Boolean"
  },
  {
    "desc": "Print the network with calculated flow values.",
    "long": "--flow-network",
    "type": "Boolean"
  },
  {
    "desc": "Print the parsed network in Pajek format.",
    "long": "--pajek",
    "type": "Boolean"
  },
  {
    "desc": "Print the internal state network.",
    "long": "--print-state-network",
    "type": "Boolean"
  },
  {
    "desc": "Print the expanded network of memory nodes if possible.",
    "long": "--expanded",
    "type": "Boolean"
  },
  {
    "desc": "Print result to file for all trials (if more than one), with the trial number in each file.",
    "long": "--print-all-trials",
    "type": "Boolean"
  },
  {
    "desc": "Optimize a two-level partition of the network.",
    "short": "-2",
    "long": "--two-level",
    "type": "Boolean"
  },
  {
    "desc": "Assume undirected links. (default)",
    "short": "-u",
    "long": "--undirected",
    "type": "Boolean"
  },
  {
    "desc": "Assume directed links.",
    "short": "-d",
    "long": "--directed",
    "type": "Boolean"
  },
  {
    "desc": "Two-mode dynamics: Assume undirected links for calculating flow, but directed when minimizing codelength.",
    "short": "-t",
    "long": "--undirdir",
    "type": "Boolean"
  },
  {
    "desc": "Two-mode dynamics: Count only ingoing links when calculating the flow, but all when minimizing codelength.",
    "long": "--outdirdir",
    "type": "Boolean"
  },
  {
    "desc": "Two-mode dynamics: Assume directed links and let the raw link weights be the flow.",
    "short": "-w",
    "long": "--rawdir",
    "type": "Boolean"
  },
  {
    "desc": "If teleportation is used to calculate the flow, also record it when minimizing codelength.",
    "short": "-e",
    "long": "--recorded-teleportation",
    "type": "Boolean"
  },
  {
    "desc": "Teleport to nodes instead of to links, assuming uniform node weights if no such input data.",
    "short": "-o",
    "long": "--to-nodes",
    "type": "Boolean"
  },
  {
    "desc": "The probability of teleporting to a random node or link. (Default: 0.15)",
    "short": "-p",
    "long": "--teleportation-probability",
    "type": "Number"
  },
  {
    "desc": "Additional probability of teleporting to itself. Effectively increasing the code rate, generating more and smaller modules. (Default: -1)",
    "short": "-y",
    "long": "--self-link-teleportation-probability",
    "type": "Number"
  },
  {
    "desc": "Scale link flow with this value to change the cost of moving between modules. Higher for less modules. (Default: 1)",
    "long": "--markov-time",
    "type": "Number"
  },
  {
    "desc": "Scale link flow per node inversely proportional to the node exit entropy to easier split connected hubs and keep long chains together.",
    "long": "--variable-markov-time",
    "type": "Boolean"
  },
  {
    "desc": "Stop merge or split modules if preferred number of modules is reached. (Default: 0)",
    "long": "--preferred-number-of-modules",
    "type": "Number"
  },
  {
    "desc": "The probability to relax the constraint to move only in the current layer and instead move to a random layer where the same physical node is present. If negative, the inter-links have to be provided. (Default: -1)",
    "long": "--multilayer-relax-rate",
    "type": "Number"
  },
  {
    "desc": "The probability to relax the constraint to move only in the current layer and instead move to a random layer where the same physical node is present and proportional to the out-link similarity measured by the Jensen-Shannon divergence. If negative, the inter-links have to be provided. (Default: -1)",
    "long": "--multilayer-js-relax-rate",
    "type": "Number"
  },
  {
    "desc": "The minimum out-link similarity measured by the Jensen-Shannon divergence to relax to other layer. From 0 to 1. No limit if negative. (Default: -1)",
    "long": "--multilayer-js-relax-limit",
    "type": "Number"
  },
  {
    "desc": "The number of neighboring layers in each direction to relax to. If negative, relax to any layer. (Default: -1)",
    "long": "--multilayer-relax-limit",
    "type": "Number"
  },
  {
    "desc": "[Deprecated, use multilayer-relax-rate] The probability to relax the constraint to move only in the current layer and instead move to a random layer where the same physical node is present. If negative, the inter-links have to be provided. (Default: -1)",
    "long": "--multiplex-relax-rate",
    "type": "Number"
  },
  {
    "desc": "[Deprecated, use multilayer-js-relax-rate] The probability to relax the constraint to move only in the current layer and instead move to a random layer where the same physical node is present and proportional to the out-link similarity measured by the Jensen-Shannon divergence. If negative, the inter-links have to be provided. (Default: -1)",
    "long": "--multiplex-js-relax-rate",
    "type": "Number"
  },
  {
    "desc": "[Deprecated, use multilayer-js-relax-limit] The minimum out-link similarity measured by the Jensen-Shannon divergence to relax to other layer. From 0 to 1. No limit if negative. (Default: -1)",
    "long": "--multiplex-js-relax-limit",
    "type": "Number"
  },
  {
    "desc": "[Deprecated, use multilayer-relax-limit] The number of neighboring layers in each direction to relax to. If negative, relax to any layer. (Default: -1)",
    "long": "--multiplex-relax-limit",
    "type": "Number"
  },
  {
    "desc": "Allow undirected multilayer networks (only correct for full multilayer format).",
    "long": "--undirected-multilayer",
    "type": "Boolean"
  },
  {
    "desc": "A seed (integer) to the random number generator.",
    "short": "-s",
    "long": "--seed",
    "type": "Number"
  },
  {
    "desc": "The number of outer-most loops to run before picking the best solution. (Default: 1)",
    "short": "-N",
    "long": "--num-trials",
    "type": "Number"
  },
  {
    "desc": "Minimum codelength threshold for accepting a new solution. (Default: 1e-10)",
    "short": "-m",
    "long": "--min-improvement",
    "type": "Number"
  },
  {
    "desc": "Randomize the core loop limit from 1 to 'core-loop-limit'",
    "short": "-a",
    "long": "--random-loop-limit",
    "type": "Boolean"
  },
  {
    "desc": "Limit the number of loops that tries to move each node into the best possible module (Default: 10)",
    "short": "-M",
    "long": "--core-loop-limit",
    "type": "Number"
  },
  {
    "desc": "Limit the number of times the core loops are reapplied on existing modular network to search bigger structures. (Default: 0)",
    "short": "-L",
    "long": "--core-level-limit",
    "type": "Number"
  },
  {
    "desc": "Limit the number of main iterations in the two-level partition algorithm. 0 means no limit. (Default: 0)",
    "short": "-T",
    "long": "--tune-iteration-limit",
    "type": "Number"
  },
  {
    "desc": "Set a codelength improvement threshold of each new tune iteration to 'f' times the initial two-level codelength. (Default: 1e-05)",
    "short": "-U",
    "long": "--tune-iteration-threshold",
    "type": "Number"
  },
  {
    "desc": "Move nodes to strongest connected module in the first iteration instead of minimizing the map equation.",
    "long": "--fast-first-iteration",
    "type": "Boolean"
  },
  {
    "desc": "Try to find the quickest partition of each module when creating sub-modules for the coarse-tune part.",
    "short": "-C",
    "long": "--fast-coarse-tune",
    "type": "Boolean"
  },
  {
    "desc": "Try to find different levels of sub-modules to move in the coarse-tune part.",
    "short": "-A",
    "long": "--alternate-coarse-tune-level",
    "type": "Boolean"
  },
  {
    "desc": "Set the recursion limit when searching for sub-modules. A level of 1 will find sub-sub-modules. (Default: 1)",
    "short": "-S",
    "long": "--coarse-tune-level",
    "type": "Number"
  },
  {
    "desc": "Find top modules fast. Use -FF to keep all fast levels. Use -FFF to skip recursive part.",
    "short": "-F",
    "long": "--fast-hierarchical-solution",
    "type": "Count"
  },
  {
    "desc": "Prioritize memory efficient algorithms before fast. Use -ll to optimize even more, but this may give approximate results.",
    "short": "-l",
    "long": "--low-memory",
    "type": "Count"
  },
  {
    "desc": "Parallelize the innermost loop for greater speed. Note that this may give some accuracy tradeoff.",
    "long": "--inner-parallelization",
    "type": "Boolean"
  },
  {
    "desc": "Reset options tuning the speed and accuracy before the recursive part.",
    "long": "--reset-options-before-recursion",
    "type": "Boolean"
  },
  {
    "desc": "[Deprecated, see --hide-bipartite-nodes] Include the bipartite nodes in the output (now default).",
    "long": "--show-bipartite-nodes",
    "type": "Boolean"
  },
  {
    "desc": "Hide the bipartite nodes in the output.",
    "long": "--hide-bipartite-nodes",
    "type": "Boolean"
  },
  {
    "desc": "Verbose output on the console. Add additional 'v' flags to increase verbosity up to -vvv.",
    "short": "-v",
    "long": "--verbose",
    "type": "Count"
  },
  {
    "desc": "No output on the console.",
    "long": "--silent",
    "type": "Boolean"
  }
];

const argSpec = getArgSpec();

function getArgSpec() {
  const spec = {};
  cli.forEach(opt => {
    if (opt.short) {
      spec[opt.short] = opt.long;
    }
    switch (opt.type) {
      case 'Number':
        spec[opt.long] = Number;
        break;
      case 'String':
        spec[opt.long] = String;
        break;
      case 'Count':
        spec[opt.long] = arg.COUNT;
        break;
      case 'Boolean':
      default:
        spec[opt.long] = Boolean;
    }
  });
  return spec;
}

const getShortOptionIfExist = (longOpt) => {
  const opt = cli.find(opt => opt.long === longOpt);
  return opt.short || opt.long;
}

export default class Infomap extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      network: SAMPLE_NETWORK,
      args: '',
      argsError: '',
      output: [],
      name: 'network',
      running: false,
      completed: false,
      clu: '',
      tree: '',
      downloaded: false,
      loading: false, // True while loading input network
      options: {},
      infomapError: '',
    }
  }

  onChangeNetwork = (event, data) => {
    this.setState({
      network: data.value,
      completed: false,
      downloaded: false,
      name: data.name || this.state.name,
      loading: false,
      infomapError: '',
    });
  }

  onLoadNetwork = (event, data) => {
    this.setState({ loading: true });

    const { files } = event.target;
    const file = files[0];
    let nameParts = file.name.split('.');
    if (nameParts.length > 1)
      nameParts.pop();
    const name = nameParts.join('.');
    
    const reader = new FileReader();
    reader.onloadend = (event) => {
      this.onChangeNetwork(event, { value: reader.result, name });
    }
    reader.readAsText(file, 'utf-8');
  }

  onChangeArgs = (event, data) => {
    const argv = data.value.split(/\s/);
    let argsError = '';
    let options = this.state.options;
    try {
      options = arg(argSpec, { argv, permissive: false });
    } catch (err) {
      argsError = err.message;
    }

    this.setState({ args: data.value, argsError, options });
  }

  onChangeOption = (event, data) => {
    const { id: longOption, checked: value } = data;
    // Update options object
    const nextState = produce(this.state, draft => {
      if (!value) {
        delete draft.options[longOption];
      } else {
        draft.options[longOption] = value;
      }
    });

    // Regenerate args string from options
    let argv = [];
    const { options } = nextState;
    for (let key in options) {
      if (key === '_') continue;
      // Use long options if already exist, else short option
      if (this.state.args.includes(key)) {
        argv.push(key);
      } else {
        argv.push(getShortOptionIfExist(key));
      }
      // Add argument for non-flag options
      if (typeof(options[key]) !== 'boolean') {
        argv.push(options[key])
      }
    }
    const args = argv.join(' ');

    this.setState({ options, args });
  }

  onClickRun = () => {
    this.run();
  }

  onClickCancelRun = () => {
    this.clearInfomap(false);
  }

  clearInfomap = (clearOutput = true) => {
    if (this.worker) {
      this.worker.terminate();
      delete this.worker;
    }
    this.setState({
      output: clearOutput ? [] : this.state.output,
      running: false,
    });
  }

  run = () => {
    this.clearInfomap();
    const args = this.state.args.length === 0 ? [] : this.state.args.split(' ');

    const worker = this.worker = new Worker('Infomap-worker.js');
    
    worker.onmessage = this.onInfomapMessage;

    const message = {
      target: 'Infomap',
      inputFilename: 'network.txt',
      inputData: this.state.network,
      arguments: args,
    };

    window.setTimeout(() => {
      worker.postMessage(message);
    }, 20);

    this.setState({
      running: true,
      infomapError: '',
    });
  }

  onInfomapMessage = (event) => {
    const data = event.data;
    switch (data.target) {
      case 'stdout': {
        this.setState({
          output: [...this.state.output, data.content],
        });
        break;
      }
      case 'stderr': {
        this.setState({
          infomapError: data.content,
          output: [...this.state.output, data.content],
          running: false,
        });
        this.worker = null;
        break;
      }
      case 'finished': {
        const { clu, tree } = data.output;
        this.setState({
          clu,
          tree,
          running: false,
          completed: true,
        });
        this.worker.terminate();
        delete this.worker;
        break;
      }
      default:
        throw new Error(`Unknown target on message from worker: ${data}`);
    }
  }

  onClickDownloadTree = () => {
    const blob = new Blob([this.state.tree], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `${this.state.name}.tree`);
    this.setState({ downloaded: true });
  }
  
  onClickDownloadClu = () => {
    const blob = new Blob([this.state.clu], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `${this.state.name}.clu`);
    this.setState({ downloaded: true });
  }

  onCopyClusters = () => {
    this.setState({ downloaded: true });
  }

  render() {
    const { options } = this.state;
    return (
      <Grid container>
        <Grid.Column width={16} textAlign="center">
          <Image src="https://www.mapequation.org/assets/img/schematic-mapgenerator.svg" alt="schematic-mapgenerator" centered style={{ maxWidth: 900 }}/>
        </Grid.Column>
        <Grid.Column width={16} textAlign="center">
          <Step.Group ordered>
            <Step completed={!!this.state.network} active={!this.state.network}>
              <Step.Content>
                <Step.Title>Load network</Step.Title>
                <Step.Description>Edit input field or upload file</Step.Description>
              </Step.Content>
            </Step>

            <Step completed={this.state.completed || this.state.running} active={this.state.network && !this.state.completed}>
              <Step.Content>
                <Step.Title>Run Infomap</Step.Title>
                <Step.Description>Toggle options or add command line arguments</Step.Description>
                </Step.Content>
                </Step>
                
                <Step completed={this.state.downloaded} active={this.state.completed}>
                <Step.Content>
                <Step.Title>Download partition</Step.Title>
                <Step.Description>Copy from text field or download file</Step.Description>
              </Step.Content>
            </Step>
          </Step.Group>
        </Grid.Column>

        <Grid.Column width={3} style={{ minHeight: 500 }}>
          <Header>Input</Header>
          <Segment basic style={{ borderRadius: 5, padding: '10px 0 0 0' }} loading={this.state.loading} color='red'>
            <Form>
              <Form.TextArea value={this.state.network} onChange={this.onChangeNetwork} placeholder='# Paste your network here' style={{ minHeight: 500 }} />
              <Input type="file" onChange={this.onLoadNetwork}></Input>
            </Form>
          </Segment>
        </Grid.Column>
        <Grid.Column width={9} floated="left">
          <Header>Options</Header>
          <Segment basic style={{ borderRadius: 5, padding: '10px 0 0 0' }} color='red'>
            <Form error={!!this.state.argsError} className='attached'>
              <Form.Field>
              <Checkbox toggle id='--two-level' checked={!!options['--two-level']} label='Two-level clustering' onChange={this.onChangeOption}/>
              </Form.Field>
              <Form.Field>
                <Checkbox toggle id='--directed' checked={!!options['--directed']} label='Directed links' onChange={this.onChangeOption}/>
              </Form.Field>
              <Form.Group widths="equal">
                <Form.Input fluid placeholder="Optional command line arguments" value={this.state.args} onChange={this.onChangeArgs}/>
              </Form.Group>
              <div style={{ position: 'relative', margin: '-8px 15px 35px' }}>
                <Header color='red' content={this.state.argsError} style={{ position: 'absolute', fontSize: '1rem', fontWeight: 300 }}/>
              </div>
            </Form>
            <Form error={!!this.state.infomapError}>
              <Form.Group>
                <Form.Button primary disabled={!!this.state.argsError || this.state.running} loading={this.state.running} onClick={this.onClickRun}>Run</Form.Button>
                { this.state.running ? <Form.Button secondary onClick={this.onClickCancelRun}>Cancel</Form.Button> : null }
              </Form.Group>
              <Form.TextArea value={this.state.output.join('\n')} placeholder='Infomap command line output will be printed here' style={{ minHeight: 400 }} />
              <Message error header='Infomap error' content={this.state.infomapError} />
            </Form>
          </Segment>
        </Grid.Column>
        <Grid.Column width={4}>
          <Header>Output</Header>
          <Segment basic style={{ borderRadius: 5, padding: '10px 0 0 0' }} color='red'>
            <Form>
              <Form.TextArea value={this.state.tree || this.state.clu} placeholder='Infomap cluster output will be printed here' style={{ minHeight: 500 }} onCopy={this.onCopyClusters} />
              <Form.Button disabled={!this.state.tree} onClick={this.onClickDownloadTree}>Download .tree file</Form.Button>
              <Form.Button disabled={!this.state.clu} onClick={this.onClickDownloadClu}>Download .clu file</Form.Button>
            </Form>
          </Segment>
        </Grid.Column>
      </Grid>
    )
  }
}
