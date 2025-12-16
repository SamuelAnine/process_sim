import ProcessDiagram from "@/components/App/ProcessDiagram";
import NodePalette from "@/components/App/NodePalette";

export default function SimilatorPage() {
    return (
        <main className="simulator-container">
            <NodePalette />
            <ProcessDiagram />
        </main>
    );
}
