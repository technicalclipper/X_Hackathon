// app/api/generate-gif/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createCanvas, loadImage } from "@napi-rs/canvas";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const GIFEncoder = require("gif-encoder-2") as new (width: number, height: number) => {
  start(): void;
  setRepeat(repeat: number): void;
  setDelay(delay: number): void;
  setQuality(quality: number): void;
  addFrame(ctx: unknown): void;
  finish(): void;
  out: { getData(): Buffer };
};

export async function POST(request: NextRequest) {
  try {
    const { frames } = await request.json();

    if (!frames || !Array.isArray(frames) || frames.length === 0) {
      return NextResponse.json(
        { error: "No frames provided" },
        { status: 400 }
      );
    }

    console.log(
      `Starting GIF generation with ${frames.length} frames using gifencoder`
    );

    const width = 400;
    const height = 300;

    // Create GIF encoder
    const encoder = new GIFEncoder(width, height);

    // Configure encoder
    encoder.start();
    encoder.setRepeat(0); // 0 for repeat, -1 for no-repeat
    encoder.setDelay(200); // Frame delay in ms
    encoder.setQuality(10); // Image quality (1-30, lower is better)

    // Create canvas for processing
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Process each frame
    for (let i = 0; i < frames.length; i++) {
      try {
        console.log(`Processing frame ${i + 1}/${frames.length}`);

        // Load image from base64 data URL
        const img = await loadImage(frames[i]);

        // Clear canvas and draw image
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "#9ca3af"; // Background color
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Add frame to encoder
        encoder.addFrame(ctx as any);
      } catch (frameError) {
        console.warn(`Error processing frame ${i + 1}:`, frameError);

        // Create fallback frame
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "#9ca3af";
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "#ffffff";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`Frame ${i + 1}`, width / 2, height / 2);

        encoder.addFrame(ctx as any);
      }
    }

    // Finish encoding
    encoder.finish();

    // Get the generated GIF buffer
    const buffer = encoder.out.getData();

    if (!buffer || buffer.length === 0) {
      throw new Error("Failed to generate GIF data");
    }

    console.log(
      `GIF generation completed. Size: ${(buffer.length / 1024).toFixed(2)}KB`
    );

    // Return the GIF as response
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "image/gif",
        "Content-Disposition": 'attachment; filename="psg-kit-360.gif"',
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error generating GIF:", error);
    return NextResponse.json(
      {
        error: "Failed to generate GIF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
