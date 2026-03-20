import { Universe } from "./designer/universe/universe";
import { Root } from "./designer/root/root";
import { Canvas } from "./designer/canvas/canvas";

export default function App() {
    return (
        <main className="w-full h-screen">
            <Root>
                <Universe>
                    <Universe.Viewport>
                        <Universe.HorizontalScrollbarTrack>
                            <Universe.HorizontalScrollbarThumb />
                        </Universe.HorizontalScrollbarTrack>

                        <Universe.VerticalScrollbarTrack>
                            <Universe.VerticalScrollbarThumb />
                        </Universe.VerticalScrollbarTrack>

                        <Universe.Camera>
                            <Canvas />
                        </Universe.Camera>
                    </Universe.Viewport>
                </Universe>
            </Root>
        </main>
    );
}

