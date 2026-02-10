import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas';

// Link to a reliable free asset or local file
const FALLBACK_AVATAR = 'https://cdn.rive.app/animations/vehicles.riv';

export function Avatar() {
    // Basic implementation: Try to load local, if user hasn't added it, it might fail nicely or show blank.
    // To minimize "Blue Screen", let's render the Vehicle for now, 
    // but give the USER a way to toggle or we just document it.

    // CURRENT STATUS: The 'Hero' link was broken. Restoring 'Vehicle' so it works.
    // INSTRUCTION: Replace 'src' below with '/avatar.riv' once you have the file.

    const { RiveComponent } = useRive({
        src: FALLBACK_AVATAR, // Reverted to valid URL
        layout: new Layout({
            fit: Fit.Cover,
            alignment: Alignment.Center,
        }),
        autoplay: true,
    });

    return (
        <div className="w-full h-full bg-gray-50 dark:bg-slate-800 rounded-3xl overflow-hidden shadow-inner border border-gray-100 dark:border-slate-700 relative transition-colors duration-300">
            <RiveComponent />

            <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                <span className="bg-black/50 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
                    AI Tutor Active
                </span>
            </div>

            {/* Helper Message for User */}
            <div className="absolute top-2 left-2 right-2 text-center pointer-events-none opacity-50 hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-gray-500 bg-white/50 px-2 py-1 rounded">
                    To use Human: Drop 'avatar.riv' in /public and update code.
                </span>
            </div>
        </div>
    );
}
