import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { image, imageFormat } = await request.json();

    if (!image || !imageFormat) {
      return NextResponse.json(
        { error: '缺少图片数据或格式' },
        { status: 400 }
      );
    }

    // 调用火山引擎 API
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ARK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'ep-20250921140145-v9tg9',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '请详细描述这张图片的内容，包括：1. 图片的主要内容和场景 2. 图片中的物体、人物或文字 3. 图片的风格和色调。请用中文回答。'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/${imageFormat};base64,${image}`
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('火山引擎 API 错误:', errorData);
      return NextResponse.json(
        { error: `API 错误: ${response.status}`, details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    // 提取 AI 响应内容
    const content = data.choices?.[0]?.message?.content || '无法识别图片内容';

    return NextResponse.json({
      success: true,
      content,
      rawResponse: data
    });

  } catch (error) {
    console.error('图片识别错误:', error);
    return NextResponse.json(
      { error: '图片识别失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
