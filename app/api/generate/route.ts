import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { prompt, size = "2K" } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "提示词不能为空" },
        { status: 400 }
      );
    }

    // 从环境变量获取 API Key
    const apiKey = process.env.ARK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "未配置 ARK_API_KEY" },
        { status: 500 }
      );
    }

    // 调用火山引擎 API
    const response = await fetch(
      "https://ark.cn-beijing.volces.com/api/v3/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "ep-20251027095925-88gps",
          prompt: prompt,
          sequential_image_generation: "disabled",
          response_format: "url",
          size: size,
          stream: false,
          watermark: true,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("火山引擎 API 错误:", errorData);

      // 提供更友好的错误信息
      let errorMessage = `API 调用失败: ${response.status}`;
      if (errorData.error?.code === "InvalidParameter" && errorData.error?.message?.includes("image generation is only supported by certain models")) {
        errorMessage = "当前配置的模型不支持图片生成。请在火山引擎控制台创建一个支持图片生成的推理接入点（如 doubao-diffusion 或其他图像生成模型），并更新代码中的 model 参数。";
      } else if (errorData.error?.message) {
        errorMessage = errorData.error.message;
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("生图失败:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "生图失败" },
      { status: 500 }
    );
  }
}
