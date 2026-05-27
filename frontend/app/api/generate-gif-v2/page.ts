// app/api/generate-gif-v2/route.ts
// Alternative implementation using sharp and a more stable approach
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

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
      `Starting GIF generation with ${frames.length} frames using sharp`
    );

    // Convert base64 frames to buffers
    const imageBuffers: Buffer[] = [];

    for (let i = 0; i < frames.length; i++) {
      try {
        console.log(`Converting frame ${i + 1}/${frames.length}`);

        // Remove data URL prefix and convert to buffer
        const base64Data = frames[i].replace(/^data:image\/[a-z]+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");

        // Process with sharp to ensure consistent format and size
        const processedBuffer = await sharp(buffer)
          .resize(400, 300, {
            fit: "contain",
            background: { r: 156, g: 163, b: 175 }, // #9ca3af
          })
          .png()
          .toBuffer();

        imageBuffers.push(processedBuffer);
      } catch (frameError) {
        console.warn(`Error processing frame ${i + 1}:`, frameError);

        // Create a fallback frame using sharp
        const fallbackBuffer = await sharp({
          create: {
            width: 400,
            height: 300,
            channels: 3,
            background: { r: 156, g: 163, b: 175 },
          },
        })
          .png()
          .composite([
            {
              input: Buffer.from(`<svg width="400" height="300">
            <rect width="400" height="300" fill="#9ca3af"/>
            <text x="200" y="150" text-anchor="middle" fill="white" font-family="Arial" font-size="20">
              Frame ${i + 1}
            </text>
          </svg>`),
              top: 0,
              left: 0,
            },
          ])
          .toBuffer();

        imageBuffers.push(fallbackBuffer);
      }
    }

    if (imageBuffers.length === 0) {
      throw new Error("No valid frames to process");
    }

    console.log(`Creating animated GIF from ${imageBuffers.length} frames...`);

    // Create animated GIF using sharp
    const gifBuffer = await sharp(imageBuffers[0], {
      animated: true,
      pages: -1,
    })
      .gif({
        loop: 0, // Infinite loop
        delay: [200], // 200ms delay between frames
        force: true,
      })
      .toBuffer();

    console.log(
      `GIF generation completed. Size: ${(gifBuffer.length / 1024).toFixed(
        2
      )}KB`
    );

    return new NextResponse(gifBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/gif",
        "Content-Disposition": 'attachment; filename="psg-kit-360.gif"',
        "Content-Length": gifBuffer.length.toString(),
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error generating GIF with sharp:", error);
    return NextResponse.json(
      {
        error: "Failed to generate GIF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Fallback method using a different library
export async function generateGifWithImageScript(frames: string[]) {
  // Using image-script library as another alternative
  const { createCanvas } = await import("canvas");
  const GIFEncoder = await import("gifencoder");

  const width = 400;
  const height = 300;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  const encoder = new GIFEncoder.default(width, height);
  encoder.setDelay(200);
  encoder.setRepeat(0);
  encoder.start();

  for (const frame of frames) {
    const img = new Image();
    img.src = frame;

    await new Promise((resolve) => {
      img.onload = () => {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "#9ca3af";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img as unknown as HTMLCanvasElement, 0, 0, width, height);

        encoder.addFrame(ctx);
        resolve(null);
      };
    });
  }

  encoder.finish();
  return Buffer.from(encoder.out.getData());
}
