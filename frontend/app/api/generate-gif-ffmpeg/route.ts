// app/api/generate-gif-ffmpeg/route.ts
// Most reliable implementation using FFmpeg
import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { writeFileSync, unlinkSync, readFileSync, mkdirSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

export async function POST(request: NextRequest) {
  const tempDir = join(tmpdir(), `gif-${Date.now()}`);
  const tempFiles: string[] = [];

  try {
    const { frames, options = {} } = await request.json();

    if (!frames || !Array.isArray(frames) || frames.length === 0) {
      return NextResponse.json(
        { error: "No frames provided" },
        { status: 400 }
      );
    }

    console.log(`Starting FFmpeg GIF generation with ${frames.length} frames`);

    // Create temporary directory
    mkdirSync(tempDir, { recursive: true });

    // Write frames as temporary PNG files
    for (let i = 0; i < frames.length; i++) {
      const frameFile = join(
        tempDir,
        `frame_${i.toString().padStart(4, "0")}.png`
      );
      const base64Data = frames[i].replace(/^data:image\/[a-z]+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      writeFileSync(frameFile, buffer);
      tempFiles.push(frameFile);

      console.log(`Saved frame ${i + 1}/${frames.length}`);
    }

    const outputFile = join(tempDir, "output.gif");

    // Configure FFmpeg options
    const {
      fps = 5, // 5 fps for smooth viewing
      width = 400,
      height = 300,
      quality = "medium", // low, medium, high
    } = options;

    // FFmpeg command arguments
    const ffmpegArgs = [
      "-y", // Overwrite output file
      "-framerate",
      fps.toString(), // Input framerate
      "-i",
      join(tempDir, "frame_%04d.png"), // Input pattern
      "-vf",
      [
        `scale=${width}:${height}:flags=lanczos`, // High-quality scaling
        "split[s0][s1]", // Split for palette generation
        "[s0]palettegen=max_colors=256[p]", // Generate optimized palette
        "[s1][p]paletteuse=dither=bayer", // Apply palette with dithering
      ].join(";"),
      "-loop",
      "0", // Infinite loop
      outputFile,
    ];

    console.log("Running FFmpeg with args:", ffmpegArgs.join(" "));

    // Run FFmpeg
    await new Promise<void>((resolve, reject) => {
      const ffmpeg = spawn("ffmpeg", ffmpegArgs);

      let stderr = "";

      ffmpeg.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      ffmpeg.on("close", (code) => {
        if (code === 0) {
          console.log("FFmpeg completed successfully");
          resolve();
        } else {
          console.error("FFmpeg stderr:", stderr);
          reject(new Error(`FFmpeg failed with code ${code}`));
        }
      });

      ffmpeg.on("error", (err) => {
        reject(new Error(`FFmpeg spawn error: ${err.message}`));
      });
    });

    // Read the generated GIF
    const gifBuffer = readFileSync(outputFile);

    if (gifBuffer.length === 0) {
      throw new Error("Generated GIF is empty");
    }

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
    console.error("Error generating GIF with FFmpeg:", error);

    // Check if FFmpeg is available
    if (error instanceof Error && error.message.includes("spawn")) {
      return NextResponse.json(
        {
          error: "FFmpeg not available",
          details:
            "FFmpeg is required for GIF generation. Please install FFmpeg on the server.",
          suggestion: "Try the alternative GIF generation endpoints.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to generate GIF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    // Cleanup temporary files
    try {
      tempFiles.forEach((file) => {
        try {
          unlinkSync(file);
        } catch (e) {
          console.warn("Failed to delete temp file:", file);
        }
      });

      // Try to remove temp directory
      try {
        const outputFile = join(tempDir, "output.gif");
        unlinkSync(outputFile);
      } catch (e) {
        // Ignore
      }
    } catch (cleanupError) {
      console.warn("Cleanup error:", cleanupError);
    }
  }
}
