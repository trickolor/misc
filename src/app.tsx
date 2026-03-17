import { Scene, Viewport, Camera } from "./components/viewport";

export default function App() {
    return (
        <main className="w-full h-screen"> 
            <Scene>
                <Viewport>
                    <Camera>
                        <span className="size-5 rounded-full bg-white absolute bottom-0 right-0 z-10" />
                    </Camera>
                </Viewport>
            </Scene>
        </main>
    );
}

