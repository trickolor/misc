import { Scene, Viewport, Camera } from "./components/scene";

export default function App() {
    return (
        <main className="w-full h-screen">
            <Scene>
                <Viewport>
                    <Camera>
                        <span className="size-5 rounded-full bg-white absolute top-96 left-96 z-10" />
                    </Camera>
                </Viewport>
            </Scene>
        </main>
    );
}

