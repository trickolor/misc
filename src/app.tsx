import { useRef } from "react";
import { useEventListener } from "./hooks/use-event-listener";

export default function App() {
    const documentRef = useRef<Document>(document);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEventListener({ event: 'scroll', handler: () => console.log('scroll') });
    useEventListener({ event: 'click', handler: () => console.log('click'), target: documentRef });
    useEventListener({ event: 'click', handler: () => console.log('click button'), target: buttonRef });

    return (
        <main className="h-[200vh] w-full">
            <button ref={buttonRef} className="p-4 bg-blue-500 text-white rounded-md">Click me</button>
        </main>
    );
}

