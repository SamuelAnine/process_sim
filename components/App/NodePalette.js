"use client";

import * as go from "gojs";
import { useEffect, useRef } from "react";


// --- Constants and GoJS Helpers ---
// Duplicated here to make this component self-contained, as they rely on the global 'go' object.
const FONT = 'bold 13px InterVariable, sans-serif';
const WAVE_WIDTH = 50;
const WAVE_HEIGHT = 10;
const ORIGINAL_WIDTH = 100 * WAVE_WIDTH;

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

const fluidNodeStructure = (goClass, category, defaultHeight, defaultWidth) => {
    const $ = goClass.GraphObject.make;
    // Note: Plates are omitted here for the palette preview simplicity
    const plates = [];
    const text = category === 'DistillationColumn' ? 'Column' : 'Tank';

    return $(goClass.Node, 'Spot', { locationSpot: goClass.Spot.Center })
        .add(
            $(goClass.Shape, 'Capsule', { fill: makeMetalBrush(goClass), stroke: 'black', strokeWidth: 1, height: defaultHeight, width: defaultWidth }),
            $(goClass.Panel, 'Spot', { isClipping: true })
                .add(
                    $(goClass.Shape, 'Capsule', { strokeWidth: 0, height: defaultHeight, width: defaultWidth, fill: 'white' }),
                    $(goClass.Panel, 'Spot', { height: defaultHeight, width: defaultWidth })
                        .add(
                            $(goClass.Shape, { fill: 'white', strokeWidth: 0 }),
                            makeFluidContent(goClass), // Fluid fill and wave animation
                            ...plates
                        )
                ),
            $(goClass.Panel, 'Auto', { alignment: goClass.Spot.Center, margin: 0 })
                .add(
                    $(goClass.Shape, { fill: 'rgba(255, 255, 255, 0.9)', stroke: 'black' }),
                    $(goClass.TextBlock, text, { stroke: 'black', margin: 2, font: FONT })
                )
        );
};

const simpleNodeStructure = (goClass, shapeName, text) => {
    const $ = goClass.GraphObject.make;
    return $(goClass.Node, 'Vertical')
        .add(
            $(goClass.Panel, 'Vertical')
                .add(
                    // Pump body
                    shapeName === 'Pump' ?
                        $(goClass.Panel, "Vertical").add(
                            $(goClass.Shape, "Circle", {
                                desiredSize: new go.Size(25, 25),
                                fill: makeMetalBrush(goClass),
                                strokeWidth: 1,
                                margin: new goClass.Margin(0, 0, -2, 0),
                            }),
                            $(goClass.Shape, {
                                desiredSize: new go.Size(30, 8),
                                fill: makeMetalBrush(goClass),
                                strokeWidth: 1,
                            })
                        ) :
                        // Valve body
                        shapeName === 'Valve' ?
                            $(goClass.Shape, { geometryString: 'F1 M0 0 L40 20 40 0 0 20z M20 10 L20 30 M12 30 L28 30', strokeWidth: 1, fill: makeMetalBrush(goClass), portId: '' }) :
                            // Condenser body
                            shapeName === 'Condenser' ?
                                $(goClass.Panel, 'Spot')
                                    .add(
                                        $(goClass.Shape, 'Circle', { desiredSize: new go.Size(32, 32), fill: makeMetalBrush(goClass), strokeWidth: 1, portId: '' }),
                                        $(goClass.Shape, { geometryString: 'F M0 36 L0 40 4 40 0 40 20 16 20 24 40 0', desiredSize: new go.Size(35, 35), strokeWidth: 1, fill: makeMetalBrush(goClass) })
                                    ) : null,

                ),
            $(goClass.TextBlock, text, { margin: 3, font: FONT })
        );
};

export default function NodePalette() {
    const paletteRef = useRef(null);

    useEffect(() => {
        if (typeof go === 'undefined') return;

        defineWaveFigure();

        const $ = go.GraphObject.make;

        if (!paletteRef.current) return;

        // Palette
        const palette = $(go.Palette, paletteRef.current, {
            nodeTemplateMap: new go.Map(), // we will inject templates from parent
            layout: $(go.GridLayout, {
                alignment: go.GridAlignment.Position,
                cellSize: new go.Size(120, 140),
                spacing: new go.Size(10, 10),
                wrappingColumn: 2,                 // 2 columns (you can set 3, 4, etc.)
                isViewportSized: false
            })
        });

        // palette.grid =
        //   $(go.Panel, "Grid",
        //     { gridCellSize: new go.Size(120, 140) },
        //     $(go.Shape, "LineH", { stroke: "#e0e0e0" }),
        //     $(go.Shape, "LineV", { stroke: "#e0e0e0" })
        //   );

        // Define your categories here
        palette.nodeTemplateMap.add('DistillationColumn', fluidNodeStructure(go, 'DistillationColumn', 100, 40));

        // 2. Tank Template
        palette.nodeTemplateMap.add('Tank', fluidNodeStructure(go, 'Tank', 100, 80));

        // 3. Pump Template
        palette.nodeTemplateMap.add('Pump', simpleNodeStructure(go, 'Pump', 'Pump'));

        // 4. Valve Template
        palette.nodeTemplateMap.add('Valve', simpleNodeStructure(go, 'Valve', 'Valve'));

        // 5. Condenser Template
        palette.nodeTemplateMap.add('Condenser', simpleNodeStructure(go, 'Condenser', 'Condenser'));



        // Palette model
        palette.model = new go.GraphLinksModel([
            { key: 'tank1', category: 'Tank', text: 'B-102', height: 100, width: 80, fillLevel: 0.6 },
            { key: 'col1', category: 'DistillationColumn', text: 'C-101', height: 100, width: 40, fillLevel: 0.3 },
            { key: 'condenser1', category: 'Condenser', text: 'E-101' },
            { key: 'pump1', category: 'Pump', text: 'P-101' },
            { key: 'valve1', category: 'Valve', text: 'V-101' },
        ]);

        return () => (palette.div = null);
    }, []);

    return (
        <div
            ref={paletteRef}
            style={{
                width: "250px",
                height: "80vh",
                border: "1px solid lightgray",
                background: "white",
            }}
        />
    );
}