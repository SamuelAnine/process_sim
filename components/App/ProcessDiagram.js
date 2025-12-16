"use client";

import * as go from "gojs";
import { useEffect, useRef, useState } from "react";


// --- Constants and Global Animation Variables ---
const FONT = 'bold 13px InterVariable, sans-serif';
const WAVE_WIDTH = 50;
const WAVE_HEIGHT = 10;
const ORIGINAL_WIDTH = 100 * WAVE_WIDTH;

let myAnimation = null; // For pipe flow
let myWavesAnimation = null; // For wave height/shape
let myWavesOffsetAnimation = null; // For wave movement

const initialModel = {
  class: 'GraphLinksModel',
  nodeDataArray: [],
  linkDataArray: []
};


const defineWaveFigure = () => {
  go.Shape.defineFigureGenerator('Wave', (shape, w, h) => {
    const geo = new go.Geometry();
    const fig = new go.PathFigure(0, 0, true);
    const param1 = shape?.parameter1 ?? 0;
    geo.add(fig);
    fig.add(new go.PathSegment(go.SegmentType.Line, w, 0));
    fig.add(new go.PathSegment(go.SegmentType.Line, w, h * 3 / 4));
    fig.add(new go.PathSegment(go.SegmentType.QuadraticBezier, 0, h * 3 / 4, w / 2, h / 4 + h * param1));
    fig.add(new go.PathSegment(go.SegmentType.Line, 0, 0));
    return geo;
  });
};

const defineAnimationEffects = () => {
  go.AnimationManager.defineAnimationEffect('waves', (obj, startValue, endValue, easing, currentTime, duration) => {
    let value = easing(currentTime, startValue, endValue - startValue, duration);
    obj.parameter1 = value;
  });
  go.AnimationManager.defineAnimationEffect('offset', (obj, startValue, endValue, easing, currentTime, duration) => {
    let value = easing(currentTime, startValue, endValue - startValue, duration);
    obj.alignment = new go.Spot(0, 0, value, 0);
  });
}; 

const makeMetalBrush = (goClass) => {
  const color = '#fff';
  return new goClass.Brush('Linear', {
    0: goClass.Brush.darken(color), 0.2: color, 0.33: goClass.Brush.lighten(color), 0.5: color, 1: goClass.Brush.darken(color),
    start: goClass.Spot.Left, end: goClass.Spot.Right
  });
};

const makeWaveBrush = (goClass) => {
  return new goClass.Brush('Linear', {
    0: 'rgba(163, 183, 202, 1)', 0.9: 'rgba(209, 219, 228, 1)', 1: 'rgba(209, 219, 228, 1)',
    start: goClass.Spot.Top, end: goClass.Spot.Bottom
  });
};

const makeDistillationColumnPlatePanel = (goClass, alignment, side) => {
  const $ = goClass.GraphObject.make;
  return $(goClass.Panel, 'Graduated', {
    alignment: new goClass.Spot(alignment, 0), alignmentFocus: new goClass.Spot(alignment, 0),
  })
    .bind('height', 'height', value => value * 0.85)
    .add(
      $(goClass.Shape, { geometryString: "M0 0 V400", strokeWidth: 0 })
        .bind('geometryString', 'height', value => `M0 0 V${value}`),
      $(goClass.Shape, {
        interval: 1, geometryString: "M0 0 V40",
        graduatedSkip: n => Boolean(n % 20) ^ side,
        stroke: 'black', strokeDashArray: [10, 1]
      })
        .bind('geometryString', 'width', value => `M0 0 V${value * 0.8}`),
    );
};

const makeFluidContent = (goClass) => {
  const $ = goClass.GraphObject.make;
  return $(goClass.Panel, 'Vertical', {
    alignmentFocus: goClass.Spot.BottomCenter, alignment: goClass.Spot.BottomCenter, stretch: goClass.Stretch.Horizontal
  })
    .add(
      $(goClass.Panel, 'Graduated', { name: 'WAVE_GRADUATED_PANEL', width: ORIGINAL_WIDTH, stretch: goClass.Stretch.Horizontal })
        .add(
          $(goClass.Shape, { geometryString: 'M0 0 H-' + ORIGINAL_WIDTH, stroke: 'gray', strokeWidth: 0 }),
          $(goClass.Shape, 'Wave', { interval: 1, parameter1: 0, name: 'WAVE1', fill: makeWaveBrush(goClass), desiredSize: new go.Size(WAVE_WIDTH + 1, WAVE_HEIGHT), graduatedSkip: n => n % 2 }),
          $(goClass.Shape, 'Wave', { interval: 1, parameter1: 1, name: 'WAVE2', graduatedSkip: n => !(n % 2), desiredSize: new go.Size(WAVE_WIDTH + 1, WAVE_HEIGHT), fill: makeWaveBrush(goClass) })
        ),
      $(goClass.Shape, {
        fill: new goClass.Brush('Linear', { 0: 'rgba(163, 183, 202, 1)', 0.75: 'rgba(25, 74, 122, 1)', start: goClass.Spot.Top, end: goClass.Spot.Bottom }),
        margin: new goClass.Margin(-1, 0, 0, 0), strokeWidth: 0, stretch: goClass.Stretch.Horizontal
      })
        .bind('height', 'height', (h, shape) => (shape.part.data.fillLevel * shape.part.data.height) - (WAVE_HEIGHT / 2))
    );
};

// --- Animation Control Function (Called on drops and link changes) ---
const updateAnimation = (diagram) => {
  console.log('start')
  if (!diagram) {
    console.log('none')
    return
  };

  // 1. Pipe Flow Animation
  if (myAnimation) {
    console.log('no animation:', myAnimation)
    myAnimation.stop()
  };

  myAnimation = new go.Animation();
  myAnimation.easing = go.Animation.EaseLinear;
  diagram.links.each(link => {
    const pipe = link.findObject("PIPE");
    if (pipe) {
      myAnimation.add(pipe, "strokeDashOffset", 20, 0);
    }
  });
  myAnimation.runCount = Infinity;
  myAnimation.start();

  // 2. Wave Motion Animation (parameter1)
  if (myWavesAnimation) myWavesAnimation.stop();
  myWavesAnimation = new go.Animation();
  myWavesAnimation.easing = go.Animation.EaseInOutQuad;
  myWavesAnimation.reversible = true;
  myWavesAnimation.duration = 2000;
  diagram.nodes.each(node => {
    const wave1 = node.findObject('WAVE1');
    const wave2 = node.findObject('WAVE2');
    if (wave1) myWavesAnimation.add(wave1, 'waves', 0, 1);
    if (wave2) myWavesAnimation.add(wave2, 'waves', 1, 0);
  });
  myWavesAnimation.runCount = Infinity;
  myWavesAnimation.start();

  // 3. Waves Offset Animation (alignment spot)
  if (myWavesOffsetAnimation) myWavesOffsetAnimation.stop();
  myWavesOffsetAnimation = new go.Animation();
  myWavesOffsetAnimation.easing = go.Animation.EaseInOutQuad;
  myWavesOffsetAnimation.reversible = true;
  myWavesOffsetAnimation.duration = 5000;
  diagram.nodes.each(node => {
    const waveGraduatedPanel = node.findObject('WAVE_GRADUATED_PANEL');
    if (waveGraduatedPanel) myWavesOffsetAnimation.add(waveGraduatedPanel, 'offset', -30, 0);
  });
  myWavesOffsetAnimation.runCount = Infinity;
  myWavesOffsetAnimation.start();
};


export default function ProcessDiagram() {
  const diagramRef = useRef(null);
  const [diagramInstance, setDiagramInstance] = useState(null);

  useEffect(() => {
    if (typeof go === 'undefined' || !diagramRef.current) return;

    defineAnimationEffects();
    defineWaveFigure();

    const $ = go.GraphObject.make;

    const diagram = $(go.Diagram, diagramRef.current, {
      "undoManager.isEnabled": true,
      allowDrop: true, // 💥 critical for drag & drop
      "draggingTool.dragsTree": true,
      'grid.visible': true,
      'grid.gridCellSize': new go.Size(30, 20),
      'draggingTool.isGridSnapEnabled': true,
      'resizingTool.isGridSnapEnabled': true,
      'rotatingTool.snapAngleMultiple': 90,
      'rotatingTool.snapAngleEpsilon': 45,
    });

    // --- Template Setup ---

    // Shared fluid structure for distillation column and tank
    const fluidNodeStructure = (category) => {
      const plates = category === 'DistillationColumn' ? [
        makeDistillationColumnPlatePanel(go, 0, true),
        makeDistillationColumnPlatePanel(go, 1, false)
      ] : [];

      return $(go.Node, 'Spot', { selectionObjectName: 'CAPSULE', resizable: true, resizeObjectName: 'CAPSULE', locationSpot: go.Spot.Center })
        .bindTwoWay('location', 'pos', go.Point.parse, go.Point.stringify)
        .add(
          $(go.Shape, 'Capsule', { fill: makeMetalBrush(go), stroke: 'black', strokeWidth: 1, portId: "", fromLinkable: true, toLinkable: true, }).bind('height', 'height', v => v + 1).bind('width', 'width', v => v + 1),
          $(go.Panel, 'Spot', { isClipping: true })
            .add(
              $(go.Shape, 'Capsule', { name: 'CAPSULE', strokeWidth: 0 }).bindTwoWay('height').bindTwoWay('width'),
              $(go.Panel, 'Spot').bind('height').bind('width').add(
                $(go.Shape, { fill: 'white', strokeWidth: 0 }),
                makeFluidContent(go), // Fluid fill and wave animation
                ...plates // Plates for distillation column
              ),
            ),
          $(go.Panel, 'Auto')
            .add(
              $(go.Shape, { fill: 'rgba(255, 255, 255, 0.9)', stroke: 'black' }),
              $(go.TextBlock, 'test', { stroke: 'black', margin: 3, font: FONT, editable: true }).bindTwoWay('text')
            )
        );
    };

    diagram.nodeTemplateMap.add('DistillationColumn', fluidNodeStructure('DistillationColumn'));
    diagram.nodeTemplateMap.add('Tank', fluidNodeStructure('Tank'));

    // Templates for Pump, Valve, Condenser
    diagram.nodeTemplateMap.add('Pump',
      $(go.Node, 'Vertical', new go.Binding("location", "pos", go.Point.parse).makeTwoWay(
        go.Point.stringify
      ))
        .add(
          $(go.Panel, 'Vertical')
            .add(
              $(go.Shape, 'Circle', { desiredSize: new go.Size(25, 25), fill: makeMetalBrush(go), strokeWidth: 1, margin: new go.Margin(0, 0, -2, 0), portId: "", fromLinkable: true, toLinkable: true, }),
              $(go.Shape, { desiredSize: new go.Size(30, 8), fill: makeMetalBrush(go), strokeWidth: 1 })
            ),
          $(go.TextBlock, { font: FONT, editable: true }).bindTwoWay('text')
        )
    );

    diagram.nodeTemplateMap.add('Valve',
      $(go.Node, 'Vertical', { locationObjectName: 'SHAPE', rotatable: true })
        .bindTwoWay('angle')
        .add(
          $(go.Shape, { name: 'SHAPE', geometryString: 'F1 M0 0 L40 20 40 0 0 20z M20 10 L20 30 M12 30 L28 30', strokeWidth: 1, fill: makeMetalBrush(go), portId: "", fromLinkable: true, toLinkable: true, }),
          $(go.TextBlock, { font: FONT, editable: true }).bindTwoWay('text')
        )
    );

    diagram.nodeTemplateMap.add('Condenser',
      $(go.Node, 'Vertical', { portId: '' })
        .add(
          $(go.Panel, 'Spot')
            .add(
              $(go.Shape, 'Circle', { desiredSize: new go.Size(32, 32), fill: makeMetalBrush(go), strokeWidth: 1, portId: "", fromLinkable: true, toLinkable: true, }),
              $(go.Shape, { geometryString: 'F M0 36 L0 40 4 40 0 40 20 16 20 24 40 0', desiredSize: new go.Size(35, 35), strokeWidth: 1, fill: makeMetalBrush(go) })
            ),
          $(go.TextBlock, { font: FONT, editable: true }).bindTwoWay('text')
        )
    );

    // --- LINKS ---
    diagram.linkTemplate = $(go.Link, {
      routing: go.Routing.AvoidsNodes, curve: go.Curve.JumpGap, corner: 10, reshapable: true, toShortLength: 7
    })
      .bindTwoWay('points')
      .add(
        $(go.Shape, { isPanelMain: true, stroke: 'black', strokeWidth: 5 }),
        $(go.Shape, { isPanelMain: true, stroke: '#aaa', strokeWidth: 3 }).bind('stroke'),
        // The PIPE element is animated via strokeDashArray
        $(go.Shape, { isPanelMain: true, stroke: 'white', strokeWidth: 3, name: 'PIPE', strokeDashArray: [10, 10] }),
        $(go.Shape, { toArrow: 'Triangle', fill: 'white', stroke: 'black' }),
        $(go.Panel, 'Auto', { visible: false }).bind('visible', 'text', value => value && value !== '')
          .add(
            $(go.Shape, { fill: 'rgba(255, 255, 255, 0.9)', stroke: 'black', strokeDashArray: [5, 5] }),
            $(go.TextBlock, { stroke: 'black', margin: 3, font: FONT }).bind('text')
          )
      );

    diagram.addDiagramListener("LinkDrawn", () => {
      updateAnimation(diagram);
    });

    diagram.addDiagramListener("LinkRelinked", () => {
      updateAnimation(diagram);
    });

    // Empty model = waiting for palette items
    diagram.model = go.Model.fromJson(initialModel);

    // --- Cleanup ---
    return () => {
      diagram.div = null;
    };
  }, []);

  return (
    <div
      ref={diagramRef}
      style={{
        width: "100%",
        height: "80vh",
        border: "1px solid lightgray",
        background: "#fafafa",
      }}
    />
  );
}