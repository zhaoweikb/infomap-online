import React from "react";
import { InlineMath } from "react-katex";
import imgBipartite from "../../images/bipartite.svg";
import imgMultilayerNetworkFull from "../../images/multilayer-network-full.svg";
import imgMultilayerNetworkIntraInter from "../../images/multilayer-network-intra-inter.svg";
import imgMultilayerNetworkIntra from "../../images/multilayer-network-intra.svg";
import imgNineTriangles from "../../images/nine-triangles.svg";
import imgPhysicalAndStateNodes from "../../images/physical-and-state-nodes.svg";
import imgStateNetwork from "../../images/state-network.svg";

const FIGURE_NUMBER = [
  "FigureNineTriangles",
  "FigureBipartite",
  "FigureMultilayerNetworkFull",
  "FigureMultilayerNetworkIntraInter",
  "FigureMultilayerNetworkIntra",
  "FigureStateNetwork",
  "FigurePhysicalAndStateNodes",
].reduce((figNumberMap, figId, figIndex) => {
  figNumberMap[figId] = figIndex + 1;
  return figNumberMap;
}, {});

const ASSERT_FIGURE = id => {
  if (!FIGURE_NUMBER.hasOwnProperty(id)) {
    throw new Error(`No figure with id '${id}'.`);
  }
};

export const figNumber = id => {
  ASSERT_FIGURE(id);
  return FIGURE_NUMBER[id];
};

export const FigLink = ({ id }) => {
  return <a href={`#${id}`}>Figure {figNumber(id)}</a>;
};

const Figure = ({ id }) => {
  switch (id) {
    case "FigureNineTriangles":
      return (
        <figure id={id}>
          <img src={imgNineTriangles} alt="Network of nine triangles" />
          <figcaption>
            <strong>Figure {figNumber(id)}.</strong> Network generated from a Sierpinski fractal of
            three levels with nine triangles at the bottom level. Note that the optimal solution is
            not the symmetrical case with three modules in each super module.
          </figcaption>
        </figure>
      );
    case "FigureBipartite":
      return (
        <figure id={id}>
          <img
            src={imgBipartite}
            style={{ width: "40%" }}
            alt="Bipartite network with three round and two square nodes"
          />
          <figcaption>
            <strong>Figure {figNumber(id)}.</strong> Bipartite network with three primary nodes{" "}
            <InlineMath>1, 2, 3</InlineMath> and two feature nodes <InlineMath>4, 5</InlineMath>.
          </figcaption>
        </figure>
      );
    case "FigureMultilayerNetworkFull":
      return (
        <figure id={id}>
          <img src={imgMultilayerNetworkFull} alt="Multilayer network" />
          <figcaption>
            <strong>Figure {figNumber(id)}.</strong> A multilayer network with five physical nodes{" "}
            <InlineMath>i,\dotsc,m</InlineMath> in two layers, <InlineMath>\alpha</InlineMath> and{" "}
            <InlineMath>\beta</InlineMath>. With the <code>*Multilayer</code> heading, links between
            layers are explicitly defined, here visualized to highlight how the same links would be
            automatically generated using inter-layer links (
            <FigLink id="FigureMultilayerNetworkIntraInter" />) or only intra-layer links (
            <FigLink id="FigureMultilayerNetworkIntra" /> using relax rate{" "}
            <InlineMath>r = 0.4</InlineMath>). This multilayer network is also represented as a
            state network in <FigLink id="FigureStateNetwork" />.
          </figcaption>
        </figure>
      );
    case "FigureMultilayerNetworkIntraInter":
      return (
        <figure id={id}>
          <img
            src={imgMultilayerNetworkIntraInter}
            alt="Multilayer network in intra-inter format"
          />
          <figcaption>
            <strong>Figure {figNumber(id)}.</strong> A multilayer network with five physical nodes{" "}
            <InlineMath>i,\dotsc,m</InlineMath> in two layers, <InlineMath>\alpha</InlineMath> and{" "}
            <InlineMath>\beta</InlineMath>, using the
            <code>*Intra</code> and <code>*Inter</code> format. The relative weights of the links
            between layers in this format defines the probability for the random walker to switch
            layer for each node individually. However, the jump between layers are not encoded as
            they occur within the same physical nodes, so each inter-layer link is expanded to the
            next possible steps of the random walker, as visualised in{" "}
            <FigLink id="FigureMultilayerNetworkFull" />. This network also corresponds to the
            multilayer network in <FigLink id="FigureMultilayerNetworkIntra" /> where the links
            between layers are generated automatically using relax rate{" "}
            <InlineMath>r = 0.4</InlineMath>.
          </figcaption>
        </figure>
      );
    case "FigureMultilayerNetworkIntra":
      return (
        <figure id={id}>
          <img
            src={imgMultilayerNetworkIntra}
            alt="Multilayer network using inter-layer relaxation"
          />
          <figcaption>
            <strong>Figure {figNumber(id)}.</strong> A multilayer network with five physical nodes{" "}
            <InlineMath>i,\dotsc,m</InlineMath> in two layers, <InlineMath>\alpha</InlineMath> and{" "}
            <InlineMath>\beta</InlineMath>, with links between layers generated by a relax rate{" "}
            <InlineMath>r</InlineMath>. Without any explicit inter-layer links defined, the flow
            between layers through the common physical nodes can be modelled with a relax rate{" "}
            <InlineMath>r</InlineMath>, which is the probability to relax the constraint to move
            only in the current layer. Using relax rate <InlineMath>r = 0.4</InlineMath>, this
            network is equivalent with both the multilayer networks in{" "}
            <FigLink id="FigureMultilayerNetworkFull" /> and{" "}
            <FigLink id="FigureMultilayerNetworkIntraInter" /> and the state network in{" "}
            <FigLink id="FigureStateNetwork" />.
          </figcaption>
        </figure>
      );
    case "FigureStateNetwork":
      return (
        <figure id={id}>
          <img src={imgStateNetwork} alt="State network" />
          <figcaption>
            <strong>Figure {figNumber(id)}.</strong> A State network with five physical nodes{" "}
            <InlineMath>i,\dotsc,m</InlineMath> and six state nodes{" "}
            <InlineMath math="\tilde{\alpha}_i,\dotsc,\tilde{\zeta}_m" />. It represents the
            multilayer network in <FigLink id="FigureMultilayerNetworkFull" />.
          </figcaption>
        </figure>
      );
    case "FigurePhysicalAndStateNodes":
      return (
        <figure id={id}>
          <img src={imgPhysicalAndStateNodes} alt="Physical and state nodes in output" />
          <figcaption>
            <strong>Figure {figNumber(id)}.</strong> Network flows at different modular levels.
            Large circles represent physical nodes, small circles represent state nodes, and dashed
            areas represent modules. <strong>(a)</strong> Finest modular level with physical nodes
            for first-order network flows; <strong>(b)</strong> Finest modular level with physical
            nodes and state nodes for higher-order network flows; <strong>(c)</strong> Intermediate
            level; <strong>(d)</strong> Coarsest modular level.
          </figcaption>
        </figure>
      );
    default:
      throw new Error(`No figure with id '${id}'.`);
  }
};

export default Figure;
