import Encoder from './components/Encoder'
import Decoder from './components/Decoder'

export default function Home() {
    return (
        <main className="min-h-screen p-4 sm:p-8 md:p-12 mb-16 max-w-6xl mx-auto flex flex-col gap-16">
            {/* Hero Section */}
            <header className="bg-[#ABF203] brutalist-border p-8 md:p-16 text-center flex flex-col items-center justify-center relative shadow-[8px_8px_0px_#111111] overflow-hidden">
                <h1
                    className="text-6xl md:text-8xl font-black uppercase text-black mb-6 tracking-tighter"
                    style={{ fontFamily: 'var(--font-heading)' }}
                >
                    Art Sheriff
                </h1>
                <p className="text-lg md:text-2xl font-bold max-w-3xl text-black bg-white px-8 py-3 brutalist-border">
                    Secure Your Images with Invisible Watermarks
                </p>
            </header>

            {/* Main Content Areas */}
            <div className="flex flex-col gap-20">
                {/* Encoder Area */}
                <section className="bg-white brutalist-border p-6 sm:p-10 flex flex-col gap-8 shadow-[8px_8px_0px_#111111]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-4 border-black pb-4 gap-4">
                        <h2
                            className="text-4xl md:text-5xl font-black uppercase text-black"
                            style={{ fontFamily: 'var(--font-heading)' }}
                        >
                            1. Embed
                        </h2>
                        <div className="bg-[#EF4444] text-white px-4 py-2 font-bold uppercase text-sm brutalist-border">
                            Protection Phase
                        </div>
                    </div>
                    <p className="text-black font-medium text-lg max-w-2xl leading-relaxed">
                        Upload your main image and a black & white watermark.
                        We will invisibly embed the pattern without altering the visual quality of your artwork.
                    </p>
                    <Encoder />
                </section>

                {/* Decoder Area */}
                <section className="bg-white brutalist-border p-6 sm:p-10 flex flex-col gap-8 shadow-[8px_8px_0px_#111111]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-4 border-black pb-4 gap-4">
                        <h2
                            className="text-4xl md:text-5xl font-black uppercase text-black"
                            style={{ fontFamily: 'var(--font-heading)' }}
                        >
                            2. Detect
                        </h2>
                        <div className="bg-[#1D4ED8] text-white px-4 py-2 font-bold uppercase text-sm brutalist-border">
                            Verification Phase
                        </div>
                    </div>
                    <p className="text-black font-medium text-lg max-w-2xl leading-relaxed">
                        Upload a watermarked PNG to scan and extract the hidden pattern, proving your ownership.
                    </p>
                    <Decoder />
                </section>
            </div>

            <footer className="mt-12 border-t-8 border-black pt-8 text-center font-bold uppercase flex flex-col sm:flex-row justify-between items-center gap-6 pb-8">
                <span className="text-xl">© {new Date().getFullYear()} Art Sheriff</span>
                <span className="bg-black text-[#ABF203] px-6 py-3 text-lg font-black tracking-wider shadow-[4px_4px_0px_#ABF203] border-4 border-black">
                    Don't Steal My Art
                </span>
            </footer>
        </main>
    )
}
