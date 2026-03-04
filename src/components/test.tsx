import { useScrollLock } from "@/hooks/use-scroll-lock";

export function Component() {
    const [isLocked, lock, unlock, toggle] = useScrollLock();

    return (
        <section className="flex flex-col gap-4 w-fit m-4 p-4 pb-[100vh] border border-gray-200 rounded-md">
            <div className="flex gap-4">
                <button onClick={lock} className="px-4 text-sm py-2 text-white bg-blue-700 rounded-md text-center w-fit">
                    Lock
                </button>

                <button onClick={unlock} className="px-4 text-sm py-2 text-white bg-red-700 rounded-md text-center w-fit">
                    Unlock
                </button>

                <button onClick={toggle} className="px-4 text-sm py-2 text-white bg-gray-700 rounded-md text-center w-fit">
                    Toggle
                </button>
            </div>

            <p className="text-sm font medium text-gray-700">
                The scroll is now {isLocked ? 'locked' : 'unlocked'}
            </p>
        </section>
    );
}