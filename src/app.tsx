import { Universe } from "./designer/universe/universe";

export default function App() {
    return (
        <main className="w-full h-screen">
            <Universe>
                <Universe.Viewport>
                    <Universe.HorizontalScrollbarTrack>
                        <Universe.HorizontalScrollbarThumb />
                    </Universe.HorizontalScrollbarTrack>

                    <Universe.VerticalScrollbarTrack>
                        <Universe.VerticalScrollbarThumb />
                    </Universe.VerticalScrollbarTrack>

                    <Universe.Camera>
                        <span className="size-5 rounded-full bg-white absolute top-96 left-96 z-10" />
                    </Universe.Camera>
                </Universe.Viewport>
            </Universe>
        </main>
    );
}

