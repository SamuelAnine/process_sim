"use client";

import * as go from "gojs";
import { useEffect, useRef, useState } from "react";
import SimulatorPanel from "./SimulatorPanel";

const FONT = 'bold 13px InterVariable, sans-serif';
const WAVE_WIDTH = 50;
const WAVE_HEIGHT = 10;
const ORIGINAL_WIDTH = 100 * WAVE_WIDTH;

let myAnimation = null;
let myWavesAnimation = null;


const wasteParams = {
  'Cassava Peels': { VS: 0.29, BMP: 0.22 },
  'Fruit and Vegetable': { VS: 0.10, BMP: 0.55 },
  'Cow Dung': { VS: 0.1, BMP: 0.35 },
  'Poultry Droppings': { VS: 0.40, BMP: 0.41 },
  'Mixed Scraps': { VS: 0.28, BMP: 0.42 },
  'Food Waste': { VS: 0.28, BMP: 0.48 },
  'Wastewater Sludge': { VS: 0.03, BMP: 0.20 },
  'Market Waste': { VS: 0.12, BMP: 0.52 },
}

const defaultTemplate = {
  class: 'GraphLinksModel',
  nodeDataArray: [
    { key: 'feedtank', category: 'FeedTank', text: 'Feed Tank', pos: '40 180', height: 100, width: 80, fillLevel: 0.6 },
    { key: 'shredder', category: 'Shredder', text: 'Shredder', pos: '200 195' },
    { key: 'mixingtank', category: 'MixingTank', text: 'Mixing Tank', pos: '340 180', height: 100, width: 80, fillLevel: 0.5 },
    { key: 'pump', category: 'Pump', text: 'Pump', pos: '500 195' },
    { key: 'heatex', category: 'HeatExchanger', text: 'Heat Exchanger', pos: '630 195' },
    { key: 'digester', category: 'Digester', text: 'Digester', pos: '800 165', height: 130, width: 60, fillLevel: 0.7 },
    { key: 'gasholder', category: 'GasHolder', text: 'Gas Holder', pos: '980 180', height: 100, width: 80, fillLevel: 0.4 },
    { key: 'digestatetank', category: 'DigestateTank', text: 'Digestate Tank', pos: '800 380', height: 100, width: 80, fillLevel: 0.3 },
  ],
  linkDataArray: [
    { from: 'feedtank', to: 'shredder', text: 'Solid Waste' },
    { from: 'shredder', to: 'mixingtank', text: 'Shredded Waste' },
    { from: 'mixingtank', to: 'pump', text: 'Slurry' },
    { from: 'pump', to: 'heatex', text: 'Pumped Slurry' },
    { from: 'heatex', to: 'digester', text: 'Heated Slurry' },
    { from: 'digester', to: 'gasholder', text: 'Biogas' },
    { from: 'digester', to: 'digestatetank', text: 'Digestate' },
  ]
}

const defineWaveFigure = () => {
  go.Shape.defineFigureGenerator('LiquidSurface', (shape, w, h) => {
    const p = shape?.parameter1 ?? 0.6 // amplitude, kept always > 0 so it never goes flat
    const geo = new go.Geometry()
    const fig = new go.PathFigure(0, h * 0.5, true)
    geo.add(fig)
    const cycles = 3 // a gentle rolling ripple
    const segW = w / (cycles * 2)
    let x = 0
    let up = true
    for (let i = 0; i < cycles * 2; i++) {
      const nx = x + segW
      const cy = h * 0.5 + (up ? -1 : 1) * p * h * 0.4
      fig.add(new go.PathSegment(go.SegmentType.QuadraticBezier, nx, h * 0.5, x + segW / 2, cy))
      x = nx
      up = !up
    }
    fig.add(new go.PathSegment(go.SegmentType.Line, w, h))
    fig.add(new go.PathSegment(go.SegmentType.Line, 0, h))
    fig.add(new go.PathSegment(go.SegmentType.Line, 0, h * 0.5))
    return geo
  })
}

const defineDigesterBodyFigure = () => {
  go.Shape.defineFigureGenerator('DigesterBody', (shape, w, h) => {
    const r = Math.min(8, w * 0.15)
    const bottomR = w / 2
    const geo = new go.Geometry()
    const fig = new go.PathFigure(r, 0, true)
    geo.add(fig)
    fig.add(new go.PathSegment(go.SegmentType.Line, w - r, 0))
    fig.add(new go.PathSegment(go.SegmentType.QuadraticBezier, w, r, w, 0))
    fig.add(new go.PathSegment(go.SegmentType.Line, w, h - bottomR))
    fig.add(new go.PathSegment(go.SegmentType.Arc, 0, 180, w / 2, h - bottomR, bottomR, bottomR))
    fig.add(new go.PathSegment(go.SegmentType.Line, 0, r))
    fig.add(new go.PathSegment(go.SegmentType.QuadraticBezier, r, 0, 0, 0).close())
    return geo
  })
}

const defineAnimationEffects = () => {
  go.AnimationManager.defineAnimationEffect('waves', (obj, startValue, endValue, easing, currentTime, duration) => {
    obj.parameter1 = easing(currentTime, startValue, endValue - startValue, duration)
  })
  go.AnimationManager.defineAnimationEffect('offset', (obj, startValue, endValue, easing, currentTime, duration) => {
    obj.alignment = new go.Spot(0, 0, easing(currentTime, startValue, endValue - startValue, duration), 0)
  })
}

const makeMetalBrush = (goClass) => {
  const color = '#fff'
  return new goClass.Brush('Linear', {
    0: goClass.Brush.darken(color), 0.2: color, 0.33: goClass.Brush.lighten(color),
    0.5: color, 1: goClass.Brush.darken(color),
    start: goClass.Spot.Left, end: goClass.Spot.Right
  })
}

// const makeWaveBrush = (goClass) => new goClass.Brush('Linear', {
//   0: 'rgba(163, 183, 202, 1)', 0.9: 'rgba(209, 219, 228, 1)', 1: 'rgba(209, 219, 228, 1)',
//   start: goClass.Spot.Top, end: goClass.Spot.Bottom
// })

// const makeDistillationColumnPlatePanel = (goClass, alignment, side) => {
//   const $ = goClass.GraphObject.make
//   return $(goClass.Panel, 'Graduated', {
//     alignment: new goClass.Spot(alignment, 0), alignmentFocus: new goClass.Spot(alignment, 0),
//   })
//     .bind('height', 'height', value => value * 0.85)
//     .add(
//       $(goClass.Shape, { geometryString: "M0 0 V400", strokeWidth: 0 })
//         .bind('geometryString', 'height', value => `M0 0 V${value}`),
//       $(goClass.Shape, {
//         interval: 1, geometryString: "M0 0 V40",
//         graduatedSkip: n => Boolean(n % 20) ^ side,
//         stroke: 'black', strokeDashArray: [10, 1]
//       }).bind('geometryString', 'width', value => `M0 0 V${value * 0.8}`)
//     )
// }

// const digesterBodyGeometry = (w, h) => {
//   const r = Math.min(8, w * 0.15)
//   const bottomR = w / 2
//   return `M ${r} 0 L ${w - r} 0 Q ${w} 0 ${w} ${r} L ${w} ${h - bottomR} A ${bottomR} ${bottomR} 0 0 1 0 ${h - bottomR} L 0 ${r} Q 0 0 ${r} 0 Z`
// }

const computeWaveH = (h) => Math.max(6, Math.min(14, (h || 100) * 0.1))
const liquidTop = 'rgba(168, 195, 220, 1)'    // pale near-white blue right at the surface
const liquidMid = 'rgba(58, 102, 148, 1)'
const liquidBottom = 'rgba(10, 32, 70, 1)'    // deep navy at the bottom
const liquidHighlight = 'rgba(230, 240, 248, 1)' // bright sheen at the very crest of the ripple

const makeFluidContent = (goClass) => {
  const $ = goClass.GraphObject.make
  return $(goClass.Panel, 'Vertical', {
    alignmentFocus: goClass.Spot.BottomCenter,
    alignment: goClass.Spot.BottomCenter,
    stretch: goClass.Stretch.Horizontal
  })
    .add(
      $(goClass.Shape, 'LiquidSurface', {
        name: 'WAVE', parameter1: 0.5, strokeWidth: 0,
        stretch: goClass.Stretch.Horizontal,
        pickable: false,
        fill: new goClass.Brush('Linear', {
          0: liquidHighlight, 1: liquidTop,
          start: goClass.Spot.Top, end: goClass.Spot.Bottom
        })
      }).bind('desiredSize', 'height', h => new go.Size(NaN, computeWaveH(h))),
      $(goClass.Shape, {
        pickable: false,
        fill: new goClass.Brush('Linear', {
          0: liquidTop, 0.4: liquidMid, 1: liquidBottom,
          start: goClass.Spot.Top, end: goClass.Spot.Bottom
        }),
        margin: new goClass.Margin(-1, 0, 0, 0), strokeWidth: 0, stretch: goClass.Stretch.Horizontal
      }).bind('height', 'height', (h, shape) => Math.max(0, (shape.part.data.fillLevel * shape.part.data.height) - (computeWaveH(h) / 2)))
    )
}

const glassHighlight = (goClass) => {
  const $ = goClass.GraphObject.make
  return $(goClass.Shape, 'Capsule', {
    strokeWidth: 0,
    alignment: new goClass.Spot(0.22, 0.5),
    alignmentFocus: goClass.Spot.Center,
    fill: new goClass.Brush('Linear', {
      0: 'rgba(255,255,255,0.55)', 0.5: 'rgba(255,255,255,0.08)', 1: 'rgba(255,255,255,0)',
      start: goClass.Spot.Left, end: goClass.Spot.Right
    }),
  })
    .bind('height', 'height', h => h * 0.92)
    .bind('width', 'width', w => w * 0.3)
}

const updateAnimation = (diagram) => {
  if (!diagram) return
  if (myAnimation) myAnimation.stop()
  myAnimation = new go.Animation()
  myAnimation.easing = go.Animation.EaseLinear
  diagram.links.each(link => {
    const pipe = link.findObject("PIPE")
    if (pipe) myAnimation.add(pipe, "strokeDashOffset", 20, 0)
  })
  myAnimation.runCount = Infinity
  myAnimation.start()

  if (myWavesAnimation) myWavesAnimation.stop()
  myWavesAnimation = new go.Animation()
  myWavesAnimation.easing = go.Animation.EaseInOutQuad
  myWavesAnimation.reversible = true
  myWavesAnimation.duration = 700
  diagram.nodes.each(node => {
    const wave = node.findObject('WAVE')
    if (wave) myWavesAnimation.add(wave, 'waves', 0.5, 1.0)
  })
  myWavesAnimation.runCount = Infinity
  myWavesAnimation.start()
}

const applyHoverGlow = (node) => {
  const body = node.findObject('BODY')
  if (!body) return
  if (!body._origStroke) body._origStroke = body.stroke
  body.shadowVisible = true
  body.shadowColor = '#22c55e'
  body.shadowBlur = 12
  body.stroke = '#22c55e'
}
const removeHoverGlow = (node) => {
  const body = node.findObject('BODY')
  if (!body) return
  body.shadowVisible = false
  body.stroke = body._origStroke || 'black'
}

export default function ProcessDiagram() {
  const diagramRef = useRef(null)
  const [diagramInstance, setDiagramInstance] = useState(null)
  const [isCanvasEmpty, setIsCanvasEmpty] = useState(false)
  const [selectedNode, setSelectedNode] = useState(null)
  const [panelResults, setPanelResults] = useState(null)
  const [simulationError, setSimulationError] = useState(null)
  const [simulatedComponents, setSimulatedComponents] = useState([])
  const selectedNodeRef = useRef(null)
  const [toolbarMsg, setToolbarMsg] = useState('')

  // sharedRef — immediate reads, no async timing issues
  const sharedRef = useRef({
    wastes: [],
    wasteType: '',
    wasteQuantity: 0,
    // Shredder
    particleSize: 10,
    particleFactor: 1.0,
    // Mixing Tank
    waterRatio: 2,
    dilutionFactor: 1.0,
    // Heat Exchanger
    outletTemp: 35,
    tempFactor: 1.0,
    // Digester outputs
    biogasYield: 0,
    methaneYield: 0,
    fertilizerOutput: 0,
    cookingHours: 0,
    costSavings: 0,
    digesterVolume: 0,
    digesterSimulated: false,
  })

  // sharedState — for display/reactivity only
  const [sharedState, setSharedState] = useState({ ...sharedRef.current })

  const syncState = (updates) => {
    sharedRef.current = { ...sharedRef.current, ...updates }
    setSharedState(prev => ({ ...prev, ...updates }))
  }

  useEffect(() => {
    if (typeof go === 'undefined' || !diagramRef.current) return
    defineAnimationEffects()
    defineWaveFigure()
    defineDigesterBodyFigure()
    const $ = go.GraphObject.make

    const diagram = $(go.Diagram, diagramRef.current, {
      "undoManager.isEnabled": true,
      allowDrop: true,
      "draggingTool.dragsTree": true,
      "linkingTool.portGravity": 100,
      'grid.visible': false,
      'grid.gridCellSize': new go.Size(40, 30),
      'draggingTool.isGridSnapEnabled': true,
      'resizingTool.isGridSnapEnabled': true,
      'rotatingTool.snapAngleMultiple': 90,
      'rotatingTool.snapAngleEpsilon': 45,
      padding: new go.Margin(40, 40, 40, 40),
      'resizingTool.minSize': new go.Size(40, 70),
    })

    const fluidNodeStructure = (category) => {
      return $(go.Node, 'Spot', { selectionObjectName: 'CAPSULE', resizable: true, resizeObjectName: 'CAPSULE', locationSpot: go.Spot.Center, cursor: 'pointer', mouseEnter: (e, node) => applyHoverGlow(node), mouseLeave: (e, node) => removeHoverGlow(node) })
        .bindTwoWay('location', 'pos', go.Point.parse, go.Point.stringify)
        .add(
          category === 'Digester'
            ? $(go.Shape, 'DigesterBody', { name: 'BODY', fill: makeMetalBrush(go), stroke: 'black', strokeWidth: 1, portId: "", fromLinkable: true, toLinkable: true })
              .bind('height', 'height', v => v + 1).bind('width', 'width', v => v + 1)
            : $(go.Shape, 'Capsule', { name: 'BODY', fill: makeMetalBrush(go), stroke: 'black', strokeWidth: 1, portId: "", fromLinkable: true, toLinkable: true })
              .bind('height', 'height', v => v + 1).bind('width', 'width', v => v + 1),
          $(go.Panel, 'Spot', { isClipping: true })
            .add(
              category === 'Digester'
                ? $(go.Shape, 'DigesterBody', { name: 'CAPSULE', strokeWidth: 0, pickable: false }).bindTwoWay('height').bindTwoWay('width')
                : $(go.Shape, 'Capsule', { name: 'CAPSULE', strokeWidth: 0, pickable: false }).bindTwoWay('height').bindTwoWay('width'),
              $(go.Panel, 'Spot').bind('height').bind('width').add(
                $(go.Shape, { fill: makeMetalBrush(go), strokeWidth: 0, pickable: false }),
                makeFluidContent(go),
                ...(category === 'Digester' ? [
                  $(go.Shape, { geometryString: 'M0 0 H100', stroke: '#334', strokeWidth: 1.8, strokeDashArray: [4, 3], alignment: new go.Spot(0.5, 0, 0, 22), alignmentFocus: go.Spot.Center })
                    .bind('geometryString', 'width', w => `M0 0 H${w}`)
                ] : []),
              )
            ),
          ...(category === 'Digester' ? [
            $(go.Shape, 'RoundedRectangle', { parameter1: 1.5, desiredSize: new go.Size(16, 14), fill: makeMetalBrush(go), stroke: '#556', strokeWidth: 1, alignment: new go.Spot(0.5, 0, 0, 6), alignmentFocus: go.Spot.Bottom })
          ] : []),
          ...(category === 'MixingTank' ? [
            $(go.Shape, { geometryString: 'M0 0 V88', stroke: '#222', strokeWidth: 2, alignment: new go.Spot(0.5, 0, 0, -18), alignmentFocus: go.Spot.TopCenter }),
            $(go.Shape, {
              geometryString: 'M0,0 Q-15,-12 -30,0 Q-15,12 0,0 Z M0,0 Q15,-12 30,0 Q15,12 0,0 Z',
              stroke: '#222', strokeWidth: 2, fill: null,
              alignment: new go.Spot(0.5, 0, 0, 70), alignmentFocus: go.Spot.Center
            }),
          ] : []),
          $(go.Panel, 'Auto')
            .add(
              $(go.Shape, { fill: 'rgba(255, 255, 255, 0.9)', stroke: '#8b9a93' }),
              $(go.TextBlock, 'test', { stroke: 'black', margin: 3, font: FONT, editable: true }).bindTwoWay('text')
            )
        )
    }

    diagram.nodeTemplateMap.add('FeedTank', fluidNodeStructure('FeedTank'))
    diagram.nodeTemplateMap.add('MixingTank', fluidNodeStructure('MixingTank'))
    diagram.nodeTemplateMap.add('GasHolder', fluidNodeStructure('GasHolder'))
    diagram.nodeTemplateMap.add('DigestateTank', fluidNodeStructure('DigestateTank'))
    diagram.nodeTemplateMap.add('Digester', fluidNodeStructure('Digester'))

    diagram.nodeTemplateMap.add('Pump',
      $(go.Node, 'Vertical',
        { locationSpot: go.Spot.Center, cursor: 'pointer', mouseEnter: (e, node) => applyHoverGlow(node), mouseLeave: (e, node) => removeHoverGlow(node) },
        new go.Binding("location", "pos", go.Point.parse).makeTwoWay(go.Point.stringify))
        .add(
          $(go.Panel, 'Vertical').add(
            $(go.Shape, 'Circle', { name: 'BODY', desiredSize: new go.Size(25, 25), fill: makeMetalBrush(go), strokeWidth: 1, margin: new go.Margin(0, 0, -2, 0), portId: "", fromLinkable: true, toLinkable: true }),
            $(go.Shape, { desiredSize: new go.Size(30, 8), fill: makeMetalBrush(go), strokeWidth: 1 })
          ),
          $(go.TextBlock, { font: FONT, editable: true }).bindTwoWay('text')
        )
    )

    diagram.nodeTemplateMap.add('Valve',
      $(go.Node, 'Vertical', { locationObjectName: 'BODY', rotatable: true, cursor: 'pointer', mouseEnter: (e, node) => applyHoverGlow(node), mouseLeave: (e, node) => removeHoverGlow(node) })
        .bindTwoWay('angle')
        .add(
          $(go.Shape, { name: 'BODY', geometryString: 'F1 M0 0 L40 20 40 0 0 20z M20 10 L20 30 M12 30 L28 30', strokeWidth: 1, fill: makeMetalBrush(go), portId: "", fromLinkable: true, toLinkable: true }),
          $(go.TextBlock, { font: FONT, editable: true }).bindTwoWay('text')
        )
    )

    diagram.nodeTemplateMap.add('HeatExchanger',
      $(go.Node, 'Vertical',
        { locationSpot: go.Spot.Center, cursor: 'pointer', mouseEnter: (e, node) => applyHoverGlow(node), mouseLeave: (e, node) => removeHoverGlow(node) },
        new go.Binding("location", "pos", go.Point.parse).makeTwoWay(go.Point.stringify))
        .add(
          $(go.Panel, 'Spot').add(
            $(go.Shape, 'Circle', { name: 'BODY', desiredSize: new go.Size(32, 32), fill: makeMetalBrush(go), strokeWidth: 1, portId: "", fromLinkable: true, toLinkable: true }),
            $(go.Shape, { geometryString: 'F M0 36 L0 40 4 40 0 40 20 16 20 24 40 0', desiredSize: new go.Size(35, 35), strokeWidth: 1, fill: makeMetalBrush(go) })
          ),
          $(go.TextBlock, { font: FONT, editable: true }).bindTwoWay('text')
        )
    )

    diagram.nodeTemplateMap.add('Shredder',
      $(go.Node, 'Vertical',
        { locationSpot: go.Spot.Center, cursor: 'pointer', mouseEnter: (e, node) => applyHoverGlow(node), mouseLeave: (e, node) => removeHoverGlow(node) },
        new go.Binding("location", "pos", go.Point.parse).makeTwoWay(go.Point.stringify))
        .add(
          $(go.Panel, 'Spot').add(
            $(go.Shape, { name: 'BODY', geometryString: 'F1 M0 0 L47 0 L37 36 L10 36 Z', fill: makeMetalBrush(go), stroke: '#556', strokeWidth: 1.5, portId: "", fromLinkable: true, toLinkable: true }),
            $(go.Shape, { geometryString: 'M14 7 L33 29 M33 7 L14 29', stroke: '#374840', strokeWidth: 1.6, fill: null })
          ),
          $(go.TextBlock, { font: FONT, editable: true }).bindTwoWay('text')
        )
    )

    diagram.nodeTemplateMap.add('Separator',
      $(go.Node, 'Spot', { locationSpot: go.Spot.Center, cursor: 'pointer', mouseEnter: (e, node) => applyHoverGlow(node), mouseLeave: (e, node) => removeHoverGlow(node) })
        .bindTwoWay('location', 'pos', go.Point.parse, go.Point.stringify)
        .add(
          $(go.Shape, 'Capsule', { name: 'BODY', desiredSize: new go.Size(46, 100), fill: makeMetalBrush(go), stroke: '#556', strokeWidth: 1.5, portId: '', fromLinkable: true, toLinkable: true }),
          $(go.Panel, 'Spot', { desiredSize: new go.Size(46, 100), isClipping: true }).add(
            $(go.Shape, 'Capsule', { desiredSize: new go.Size(46, 100), strokeWidth: 0, fill: 'white', pickable: false }),
            $(go.Shape, {
              geometryString: 'M0 62 Q11 57 23 62 T46 62 V100 H0 Z',
              alignment: go.Spot.TopLeft, alignmentFocus: go.Spot.TopLeft,
              fill: new go.Brush('Linear', { 0: 'rgba(168,195,220,1)', 0.4: 'rgba(58,102,148,1)', 1: 'rgba(10,32,70,1)', start: go.Spot.Top, end: go.Spot.Bottom }),
              strokeWidth: 0, pickable: false
            }),
            $(go.Shape, { geometryString: 'M2 26 H44', alignment: go.Spot.TopLeft, alignmentFocus: go.Spot.TopLeft, stroke: '#334', strokeWidth: 1.8, strokeDashArray: [3, 2.5], pickable: false })
          ),
          $(go.Shape, 'RoundedRectangle', { parameter1: 1.5, desiredSize: new go.Size(9, 15), fill: makeMetalBrush(go), stroke: '#556', strokeWidth: 1.2, alignment: new go.Spot(0.5, 0, 0, 6), alignmentFocus: go.Spot.Bottom }),
          $(go.Shape, 'RoundedRectangle', { parameter1: 1.5, desiredSize: new go.Size(9, 15), fill: makeMetalBrush(go), stroke: '#556', strokeWidth: 1.2, alignment: new go.Spot(0.5, 1, 0, -6), alignmentFocus: go.Spot.Top }),
          $(go.Panel, 'Auto')
            .add(
              $(go.Shape, { fill: 'rgba(255, 255, 255, 0.9)', stroke: '#8b9a93' }),
              $(go.TextBlock, 'SP-101', { stroke: '#111', margin: 3, font: FONT, editable: true }).bindTwoWay('text')
            )
        )
    )

    diagram.linkTemplate = $(go.Link, {
      routing: go.Routing.AvoidsNodes, curve: go.Curve.JumpGap, corner: 10, reshapable: true, toShortLength: 7
    })
      .bindTwoWay('points')
      .add(
        $(go.Shape, { isPanelMain: true, stroke: 'black', strokeWidth: 5 }),
        $(go.Shape, { isPanelMain: true, stroke: '#aaa', strokeWidth: 3 }).bind('stroke'),
        $(go.Shape, { isPanelMain: true, stroke: 'white', strokeWidth: 3, name: 'PIPE', strokeDashArray: [10, 10] }),
        $(go.Shape, { toArrow: 'Triangle', fill: 'white', stroke: 'black' }),
        $(go.Panel, 'Auto', { visible: false })
          .bind('visible', 'text', value => value && value !== '')
          .add(
            $(go.Shape, { fill: 'rgba(255, 255, 255, 0.9)', stroke: '#8b9a93', strokeDashArray: [5, 5] }),
            $(go.TextBlock, { stroke: 'black', margin: 3, font: FONT }).bind('text')
          )
      )

    diagram.addDiagramListener('LinkDrawn', (e) => {
      updateAnimation(diagram)
    })
    diagram.addDiagramListener("LinkRelinked", () => updateAnimation(diagram))
    diagram.addDiagramListener("ObjectSingleClicked", (e) => {
      const node = e.subject.part
      if (node instanceof go.Node) {
        const nodeData = {
          category: node.data.category,
          text: node.data.text,
          key: node.data.key
        }
        setSelectedNode(nodeData)
        selectedNodeRef.current = nodeData
        setPanelResults(null)
        setSimulationError(null)
        setDiagramInstance(diagram)
      }
    })

    diagram.model = go.Model.fromJson(defaultTemplate)
    setIsCanvasEmpty(diagram.nodes.count === 0)

    diagram.addModelChangedListener((e) => {
      if (e.isTransactionFinished) setIsCanvasEmpty(diagram.nodes.count === 0)
    })

    diagramRef.current.addEventListener('dragover', (e) => e.preventDefault())
    diagramRef.current.addEventListener('drop', (e) => {
      e.preventDefault()
      const raw = e.dataTransfer.getData('application/json')
      if (!raw) return
      const def = JSON.parse(raw)
      const rect = diagramRef.current.getBoundingClientRect()
      const localPt = new go.Point(e.clientX - rect.left, e.clientY - rect.top)
      const docPt = diagram.transformViewToDoc(localPt)
      const newData = { key: 'n' + Date.now(), category: def.category, text: def.label, pos: go.Point.stringify(docPt) }
      if (def.height) { newData.height = def.height; newData.width = def.width; newData.fillLevel = def.fillLevel }
      diagram.model.startTransaction('drop node')
      diagram.model.addNodeData(newData)
      diagram.model.commitTransaction('drop node')
      updateAnimation(diagram)
    })

    return () => { diagram.div = null }
  }, [])

  // === Validation ===

  const validateSimulation = (category) => {
    if (category !== 'FeedTank' && diagramInstance) {
      const node = diagramInstance.findNodeForKey(selectedNode?.key)
      if (node) {
        const hasIncomingLink = node.findLinksInto().count > 0
        if (!hasIncomingLink) return {
          valid: false,
          error: `No upstream pipe connected to this component. Connect it first.`
        }
      }
    }
    // Check if waste is liquid - Wastewater Sludge bypasses Shredder
    const isLiquidWaste = sharedRef.current.wasteType === 'Wastewater Sludge'

    const upstream = {
      Shredder: ['FeedTank'],
      MixingTank: isLiquidWaste ? ['FeedTank'] : ['FeedTank', 'Shredder'],
      Pump: ['FeedTank', 'MixingTank'],
      HeatExchanger: ['FeedTank', 'MixingTank'],
      Digester: ['FeedTank', 'HeatExchanger'],
      GasHolder: ['FeedTank', 'Digester'],
      DigestateTank: ['FeedTank', 'Digester'],
      Separator: ['FeedTank', 'Digester'],
      Valve: [],
    }

    const names = { FeedTank: 'Feed Tank', Shredder: 'Shredder', MixingTank: 'Mixing Tank', HeatExchanger: 'Heat Exchanger', Digester: 'Digester' }
    for (const req of (upstream[category] || [])) {
      if (!simulatedComponents.includes(req)) {
        return { valid: false, error: `Simulate ${names[req] || req} first before running this component.` }
      }
    }
    return { valid: true, error: null }
  }

  const validateInputs = (category, inputs) => {
    if (category === 'FeedTank') {
      const wastes = inputs.wastes || []
      if (wastes.length === 0) return 'Please add at least one waste type.'
      for (const w of wastes) {
        if (!w.type) return 'Please select a waste type for all entries.'
        const qty = parseFloat(w.quantity)
        if (!qty || qty < 1) return 'Each waste quantity must be at least 1 kg.'
        if (qty > 100000) return 'Waste quantity cannot exceed 100,000 kg.'
      }
    }
    if (category === 'Shredder') {
      const size = parseFloat(inputs.particleSize)
      if (!size || size < 5) return 'Particle size below 5mm - equipment limitation.'
      if (size > 50) return 'Particle size above 50mm - hydrolysis efficiency will be reduced.'
      if (sharedRef.current.wasteType === 'Wastewater Sludge') return 'Wastewater Sludge is liquid - shredding not applicable. Component bypassed automatically.'
    }
    if (category === 'MixingTank') {
      const ratio = parseFloat(inputs.waterRatio)
      if (!ratio || ratio < 0.5) return 'Water ratio too low — minimum 0.5 L/kg. Bacteria need moisture to survive.'
      if (ratio > 10) return 'Water ratio above 10 L/kg causes severe over-dilution — bacterial activity will be greatly reduced.'
    }
    if (category === 'HeatExchanger') {
      const inlet = parseFloat(inputs.inletTemp)
      const outlet = parseFloat(inputs.outletTemp)
      if (!inlet || !outlet) return 'Please enter both inlet and outlet temperatures.'
      if (outlet < inlet) return 'Outlet temperature cannot be lower than inlet - the Heat Exchanger heats the slurry, it does not cool it.'
      if (outlet > 60) return 'Outlet temperature above 60°C will kill anaerobic bacteria - digestion will fail completely.'
      if (outlet < 15) return 'Outlet temperature below 15°C - bacterial activity ceases. Increase to at least 20°C.'
    }
    if (category === 'Digester') {
      const hrt = parseFloat(inputs.retentionTime)
      const T = sharedRef.current.outletTemp
      if (!sharedRef.current.wasteQuantity || sharedRef.current.wasteQuantity < 1) return 'No waste quantity found — simulate Feed Tank first.'
      if (!sharedRef.current.wasteType && (!sharedRef.current.wastes || sharedRef.current.wastes.length === 0)) return 'No waste type defined — simulate Feed Tank first.'
      if (!hrt || hrt < 10) return 'Retention time below 10 days - digestion is incomplete and biologically impossible.'
      if (hrt > 60) return 'Retention time above 60 days - no additional biogas benefit beyond 60 days. Recommended: 20-30 days.'
      if (T > 60) return 'Digester temperature above 60°C - bacteria cannot survive. Adjust Heat Exchanger outlet temperature.'
      if (T < 15) return 'Digester temperature below 15°C - bacterial activity ceases. Increase Heat Exchanger outlet temperature.'
    }
    if (category === 'GasHolder') {
      const cap = parseFloat(inputs.volumeCapacity)
      if (!cap || cap < 1) return 'Storage capacity must be at least 1 m³.'
      if (cap > 10000) return 'Storage capacity above 10,000 m³ - verify industrial design requirements.'
      if (!sharedRef.current.digesterSimulated) return 'No biogas data available — simulate Digester first.'
    }
    if (category === 'Pump') {
      const flow = parseFloat(inputs.flowRate)
      if (!flow || flow < 0.1) return 'Flow rate too low — minimum 0.1 m³/day.'
      if (flow > 10000) return 'Flow rate above 10,000 m³/day - verify industrial pump specifications.'
    }
    return null
  }

  // === Main Simulation Handler ===

  const handleSimulate = (category, inputs) => {
    setSimulationError(null)

    const validation = validateSimulation(category)
    if (!validation.valid) {
      setSimulationError(validation.error)
      setPanelResults(null)
      return
    }

    const inputError = validateInputs(category, inputs)
    if (inputError) {
      setSimulationError(inputError)
      setPanelResults(null)
      return
    }

    setSimulatedComponents(prev => prev.includes(category) ? prev : [...prev, category])

    let results = {}

    // == Feed Tank ===
    if (category === 'FeedTank') {
      const wastes = inputs.wastes || []
      const totalM = wastes.reduce((sum, w) => sum + (parseFloat(w.quantity) || 0), 0)
      const blendVS = wastes.reduce((sum, w) => sum + ((wasteParams[w.type]?.VS || 0.80) * (parseFloat(w.quantity) || 0)), 0) / totalM
      const blendBMP = wastes.reduce((sum, w) => sum + ((wasteParams[w.type]?.BMP || 0.30) * (parseFloat(w.quantity) || 0)), 0) / totalM

      syncState({
        wastes: wastes.map(w => ({ type: w.type, quantity: parseFloat(w.quantity) || 0, VS: wasteParams[w.type]?.VS || 0.80, BMP: wasteParams[w.type]?.BMP || 0.30 })),
        wasteType: wastes.length === 1 ? wastes[0].type : 'Co-digestion blend',
        wasteQuantity: totalM,
      })

      results = {
        'Waste Type': wastes.length === 1 ? wastes[0].type : `${wastes.length} waste types (co-digestion)`,
        'Total Quantity': `${totalM} kg`,
        'Blended VS': blendVS.toFixed(3),
        'Blended BMP': `${blendBMP.toFixed(3)} m³/kg VS`,
        'Status': 'Feed defined - proceed to Shredder',
      }
    }

    // == Shredder ===
    else if (category === 'Shredder') {
      const isLiquid = sharedRef.current.wasteType === 'Wastewater Sludge'

      if (isLiquid) {
        syncState({ particleSize: 0, particleFactor: 1.0 })
        results = {
          'Status': 'Liquid substrate — shredding bypassed',
          'Particle Size': 'N/A',
          'Yield Impact': '100% (no reduction)',
          'Note': 'Wastewater Sludge proceeds directly to Mixing Tank',
        }
      } else {
        const size = parseFloat(inputs.particleSize) || 10
        let particleFactor = 1.0
        let efficiency = ''
        if (size <= 10) { particleFactor = 1.00; efficiency = 'Excellent - maximum surface area' }
        else if (size <= 20) { particleFactor = 0.95; efficiency = 'Good - high surface area' }
        else if (size <= 35) { particleFactor = 0.85; efficiency = 'Moderate - acceptable' }
        else { particleFactor = 0.70; efficiency = 'Poor - large particles reduce hydrolysis' }

        syncState({ particleSize: size, particleFactor })

        results = {
          'Particle Size': `${size} mm`,
          'Hydrolysis Quality': efficiency,
          'Yield Impact': `${(particleFactor * 100).toFixed(0)}% of maximum`,
          'Status': 'Shredding complete - proceed to Mixing Tank',
        }
      }
    }

    // == Mixing Tank ===
    else if (category === 'MixingTank') {
      const waterRatio = parseFloat(inputs.waterRatio) || 2
      const wasteQty = sharedRef.current.wasteQuantity
      let dilutionFactor = 1.0
      let dilutionStatus = ''

      if (waterRatio < 1) { dilutionFactor = 0.30; dilutionStatus = 'Too dry - low bacterial mobility' }
      else if (waterRatio < 2) { dilutionFactor = 0.80; dilutionStatus = 'Slightly dry - reduced efficiency' }
      else if (waterRatio <= 3) { dilutionFactor = 1.00; dilutionStatus = 'Optimal range (2-3 L/kg)' }
      else if (waterRatio <= 5) { dilutionFactor = 0.90; dilutionStatus = 'Slightly dilute - minor reduction' }
      else { dilutionFactor = 0.60; dilutionStatus = 'Over-diluted - significant reduction' }

      const totalWaterLitres = waterRatio * wasteQty
      const totalWaterM3 = totalWaterLitres / 1000

      syncState({ waterRatio, dilutionFactor })

      results = {
        'Water Ratio': `${waterRatio} L/kg`,
        'Total Water Needed': `${totalWaterLitres.toFixed(0)} L (${totalWaterM3.toFixed(2)} m³)`,
        'Mixing Status': dilutionStatus,
        'Yield Impact': `${(dilutionFactor * 100).toFixed(0)}% of maximum`,
        'Status': 'Slurry prepared - proceed to Pump → Heat Exchanger',
      }
    }

    // == Pump ===
    else if (category === 'Pump') {
      const flowRate = parseFloat(inputs.flowRate) || 0
      const wasteQty = sharedRef.current.wasteQuantity
      const dailyWasteVol = wasteQty / 1000
      const adequate = flowRate >= dailyWasteVol

      results = {
        'Flow Rate': `${flowRate} m³/day`,
        'Waste Volume': `${dailyWasteVol.toFixed(3)} m³/day`,
        'Capacity Status': adequate ? 'Flow rate adequate' : 'Flow rate may be low for waste volume',
        'Status': flowRate > 0 ? 'Pump running' : 'Pump idle',
      }
    }

    // == Heat Exchanger ====
    else if (category === 'HeatExchanger') {
      const rawInlet = parseFloat(inputs.inletTemp) || 25
      const rawOutlet = parseFloat(inputs.outletTemp) || 35

      // Apply engineering bounds
      const appliedOutlet = Math.min(Math.max(rawOutlet, 15), 60)
      const deltaT = appliedOutlet - rawInlet

      // Temperature factor for the Digester
      let tempFactor = 1.0
      let tempZone = ''
      if (appliedOutlet >= 30 && appliedOutlet <= 40) { tempFactor = 1.00; tempZone = 'Mesophilic — optimal' }
      else if (appliedOutlet > 40 && appliedOutlet <= 55) { tempFactor = 0.95; tempZone = 'Thermophilic — good' }
      else if (appliedOutlet >= 20 && appliedOutlet < 30) { tempFactor = 0.85; tempZone = 'Sub-optimal mesophilic' }
      else { tempFactor = 0.70; tempZone = 'Too cold - poor activity' }

      syncState({ outletTemp: appliedOutlet, tempFactor })

      const cappedWarning = rawOutlet !== appliedOutlet
        ? `Your input (${rawOutlet}°C) was outside safe range - capped at ${appliedOutlet}°C`
        : null

      results = {
        'Inlet Temp': `${rawInlet} °C`,
        'Outlet Temp': `${appliedOutlet} °C`,
        'Temperature Rise': `${deltaT} °C`,
        'Digester Receives': `${appliedOutlet} °C`,
        'Temperature Zone': tempZone,
        'Temp Efficiency': `${(tempFactor * 100).toFixed(0)}%`,
        'Status': deltaT > 0 ? 'Heating active' : 'No heating needed',
        ...(cappedWarning ? { 'Warning': cappedWarning } : {})
      }
    }

    // == Digester ===
    else if (category === 'Digester') {
      const s = sharedRef.current
      const M = s.wasteQuantity
      const T = s.outletTemp
      const HRT = Math.min(Math.max(parseFloat(inputs.retentionTime) || 20, 10), 60)

      // Get VS and BMP — support co-digestion
      let VS, BMP
      if (s.wastes && s.wastes.length > 0) {
        const totalM = s.wastes.reduce((sum, w) => sum + w.quantity, 0)
        VS = s.wastes.reduce((sum, w) => sum + (w.VS * w.quantity), 0) / totalM
        BMP = s.wastes.reduce((sum, w) => sum + (w.BMP * w.quantity), 0) / totalM
      } else {
        VS = wasteParams[s.wasteType]?.VS || 0.82
        BMP = wasteParams[s.wasteType]?.BMP || 0.31
      }

      // All four factors
      const tempFactor = s.tempFactor || 1.0
      const dilutionFactor = s.dilutionFactor || 1.0
      const particleFactor = s.particleFactor || 1.0
      const hrtFactor = Math.min(HRT / 30, 1.0)

      // Final biogas yield calculation
      const biogasYield = M * VS * BMP * tempFactor * hrtFactor * dilutionFactor * particleFactor
      const methaneYield = 0.6 * biogasYield
      const digesterVolume = (M / 1000) * HRT
      const fertilizerOutput = 0.4 * M
      const cookingHours = methaneYield * 2
      const costSavings = methaneYield * 0.45 * 1400

      // Scale classification
      let scaleNote = ''
      if (digesterVolume < 1) scaleNote = 'Household scale'
      else if (digesterVolume < 10) scaleNote = 'Small commercial scale'
      else if (digesterVolume < 50) scaleNote = 'Community scale'
      else if (digesterVolume < 500) scaleNote = 'Large commercial scale'
      else scaleNote = 'Industrial scale'

      syncState({ biogasYield, methaneYield, fertilizerOutput, cookingHours, costSavings, digesterVolume, digesterSimulated: true })

      const tempZone = T >= 30 && T <= 40 ? 'Mesophilic (Optimal)'
        : T > 40 && T <= 55 ? 'Thermophilic'
          : T >= 20 ? 'Sub-optimal Mesophilic'
            : 'Psychrophilic (Too Cold)'

      results = {
        'Waste Type': s.wasteType || 'Co-digestion blend',
        'Waste Quantity': `${M} kg`,
        'Temperature': `${T}°C — ${tempZone}`,
        'Retention Time': `${HRT} days`,
        '── Efficiency Factors ──': '──────────',
        'Temp Factor': `${(tempFactor * 100).toFixed(0)}%`,
        'HRT Factor': `${(hrtFactor * 100).toFixed(0)}%`,
        'Dilution Factor': `${(dilutionFactor * 100).toFixed(0)}%`,
        'Particle Factor': `${(particleFactor * 100).toFixed(0)}%`,
        '── Outputs ──': '──────────',
        'Biogas Yield': `${biogasYield.toFixed(2)} m³`,
        'Methane Content': `${methaneYield.toFixed(2)} m³`,
        'Digester Volume': `${digesterVolume.toFixed(2)} m³`,
        'Fertilizer Output': `${fertilizerOutput.toFixed(2)} kg`,
        'System Scale': scaleNote,
      }
    }

    // == Gas Holder ===
    else if (category === 'GasHolder') {
      const s = sharedRef.current
      const capacity = Math.min(Math.max(parseFloat(inputs.volumeCapacity) || 0, 1), 10000)
      const biogas = s.biogasYield || 0
      const methane = s.methaneYield || 0
      const cooking = s.cookingHours || 0
      const savings = s.costSavings || 0

      const storageStatus = biogas === 0 ? 'Run Digester first'
        : biogas <= capacity ? 'Within storage capacity'
          : 'Biogas exceeds capacity - increase storage size'

      results = {
        'Storage Capacity': `${capacity} m³`,
        'Biogas Received': `${biogas.toFixed(2)} m³`,
        'Methane Content': `${methane.toFixed(2)} m³`,
        'Cooking Hours': `${cooking.toFixed(1)} hrs`,
        'Cost Savings': `₦${Number(savings.toFixed(0)).toLocaleString()}`,
        'Storage Status': storageStatus,
      }
    }

    // == Digestate Tank ===
    else if (category === 'DigestateTank') {
      const fertilizer = sharedRef.current.fertilizerOutput || 0

      results = {
        'Fertilizer Output': fertilizer > 0 ? `${fertilizer.toFixed(2)} kg` : 'Run Digester first',
        'Nutrient Content': 'Rich in Nitrogen, Phosphorus and Potassium',
        'Recommended Use': 'Organic fertilizer for farming and agriculture',
        'Collection Status': fertilizer > 0 ? 'Ready for collection' : 'Awaiting digestion',
      }
    }

    // == Separator ===
    else if (category === 'Separator') {
      const efficiency = Math.min(Math.max(parseFloat(inputs.separationEfficiency) || 85, 50), 99)
      const rawBiogas = sharedRef.current.biogasYield || 0
      const methane = sharedRef.current.methaneYield || 0
      const co2Removed = rawBiogas * 0.4 * (efficiency / 100)
      const purifiedMethane = methane * (efficiency / 100)

      results = {
        'Raw Biogas In': `${rawBiogas.toFixed(2)} m³`,
        'CO₂ Removed': `${co2Removed.toFixed(2)} m³`,
        'Purified Methane': `${purifiedMethane.toFixed(2)} m³`,
        'Separation Efficiency': `${efficiency}%`,
        'Status': rawBiogas > 0 ? 'Separator operating' : 'Run Digester first',
      }
    }

    // == Valve ===
    else if (category === 'Valve') {
      results = {
        'Status': inputs.status || 'Unknown',
        'Flow': inputs.status === 'Open' ? 'Flowing' : 'Blocked',
      }
    }

    setPanelResults(results)
    showMsg(`${selectedNodeRef.current?.text || category} simulated`)

    // Update pipe labels
    if (diagramInstance) {
      diagramInstance.startTransaction('update labels')
      diagramInstance.links.each(link => {
        if (link.fromNode?.data.key === selectedNodeRef.current?.key || link.toNode?.data.key === selectedNodeRef.current?.key) {
          const label = results['Biogas Yield'] || results['Flow Rate'] || results['Methane Content'] || ''
          diagramInstance.model.setDataProperty(link.data, 'text', label)
        }
      })
      diagramInstance.commitTransaction('update labels')
    }
  }

  // == Reset / Clear ===

  const showMsg = (msg) => {
    setToolbarMsg(msg)
    setTimeout(() => setToolbarMsg(''), 2500)
  }

  const loadDemo = () => {
    if (diagramInstance) {
      diagramInstance.model = go.Model.fromJson(defaultTemplate)
      resetSimState()
      showMsg('Demo template loaded')
    }
  }

  const clearCanvas = () => {
    if (!window.confirm('Are you sure? All components and connections will be removed.')) return
    if (diagramInstance) {
      diagramInstance.model = go.Model.fromJson({ class: 'GraphLinksModel', nodeDataArray: [], linkDataArray: [] })
      resetSimState()
      showMsg('Canvas cleared')
    }
  }

  const resetSimState = () => {
    const fresh = { wastes: [], wasteType: '', wasteQuantity: 0, particleSize: 10, particleFactor: 1.0, waterRatio: 2, dilutionFactor: 1.0, outletTemp: 35, tempFactor: 1.0, biogasYield: 0, methaneYield: 0, fertilizerOutput: 0, cookingHours: 0, costSavings: 0, digesterVolume: 0, digesterSimulated: false }
    sharedRef.current = fresh
    setSharedState(fresh)
    setSimulatedComponents([])
    setSelectedNode(null)
    setPanelResults(null)
    setSimulationError(null)
  }

  // == Render ===

  return (
    <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="simulator-toolbar">
        <span className="ew-title"><span className="ew-title-dot"></span>Engineering Workspace</span>
        <button className="btn btn-green toolbar-btn" onClick={loadDemo}>Load Demo</button>
        <button className="btn btn-outline toolbar-btn" onClick={clearCanvas}>Clear Canvas</button>
        {toolbarMsg
          ? <span className="toolbar-status">{toolbarMsg}</span>
          : <span className="toolbar-hint">Click any component on the canvas to simulate</span>
        }
      </div>

      <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 160px)' }}>
        <div
          ref={diagramRef}
          className="ew-canvas-dotgrid"
          style={{ width: "100%", height: "100%", border: "1px solid #e4ebe7" }}
        />
        {isCanvasEmpty && (
          <div className="ew-empty-state">
            <div className="ew-empty-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
            </div>
            <div className="ew-empty-title">Canvas is empty</div>
            <div className="ew-empty-sub">Drag components from the left panel to build your Process Flow Diagram, or click Load Demo to see an example.</div>
          </div>
        )}
      </div>

      <SimulatorPanel
        selectedNode={selectedNode}
        onClose={() => { setSelectedNode(null); setPanelResults(null); setSimulationError(null) }}
        onSimulate={handleSimulate}
        results={panelResults}
        error={simulationError}
      />
    </div>
  )
}